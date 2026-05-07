using ApiAgro.Data;
using ApiAgro.Services;
using System.Text;
using System.Text.Json.Serialization;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.HttpOverrides;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using Microsoft.OpenApi;
using Npgsql;

var builder = WebApplication.CreateBuilder(args);

var corsPolicyName = "DefaultCors";

var connectionString = RequireConnectionString(builder.Configuration, builder.Environment);
var jwtKey = RequireConfiguration(builder.Configuration, "Jwt:Key", "Configure a variável de ambiente Jwt__Key.");
var jwtIssuer = RequireConfiguration(builder.Configuration, "Jwt:Issuer", "Configure Jwt__Issuer.");
var jwtAudience = RequireConfiguration(builder.Configuration, "Jwt:Audience", "Configure Jwt__Audience.");
ValidateJwtKey(jwtKey);

var allowedOrigins = GetAllowedOrigins(builder.Configuration);
ValidateCorsConfiguration(builder.Environment, allowedOrigins);
ValidateRefreshTokenConfiguration(builder.Environment, builder.Configuration);

builder.Services.Configure<ForwardedHeadersOptions>(options =>
{
    options.ForwardedHeaders = ForwardedHeaders.XForwardedFor | ForwardedHeaders.XForwardedProto;
    options.KnownNetworks.Clear();
    options.KnownProxies.Clear();
});

builder.Services.AddControllers()
    .AddJsonOptions(options =>
    {
        options.JsonSerializerOptions.Converters.Add(new JsonStringEnumConverter());
        options.JsonSerializerOptions.ReferenceHandler = ReferenceHandler.IgnoreCycles;
    });

builder.Services.AddEndpointsApiExplorer();

builder.Services.AddSwaggerGen(options =>
{
    options.AddSecurityDefinition("Bearer", new OpenApiSecurityScheme
    {
        Name = "Authorization",
        Type = SecuritySchemeType.ApiKey,
        In = ParameterLocation.Header,
        Description = "Informe o token JWT no formato: Bearer {token}"
    });

    options.AddSecurityRequirement(_ => new OpenApiSecurityRequirement
    {
        {
            new OpenApiSecuritySchemeReference("Bearer", null, null),
            new List<string>()
        }
    });
});

builder.Services
    .AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
    .AddJwtBearer(options =>
    {
        options.TokenValidationParameters = new TokenValidationParameters
        {
            ValidateIssuer = true,
            ValidateAudience = true,
            ValidateLifetime = true,
            ValidateIssuerSigningKey = true,

            ValidIssuer = jwtIssuer,
            ValidAudience = jwtAudience,
            IssuerSigningKey = new SymmetricSecurityKey(
                Encoding.UTF8.GetBytes(jwtKey)
            ),

            ClockSkew = TimeSpan.Zero
        };
    });

builder.Services.AddAuthorization();

builder.Services.AddDbContext<AppDbContext>(options =>
    options.UseNpgsql(connectionString));

builder.Services.AddScoped<AnimalService>();
builder.Services.AddScoped<AplicacaoRemedioService>();
builder.Services.AddScoped<CampeiroService>();
builder.Services.AddScoped<CurralService>();
builder.Services.AddScoped<FazendaService>();
builder.Services.AddScoped<MovimentacaoAnimalService>();
builder.Services.AddScoped<PastoService>();
builder.Services.AddScoped<RemedioService>();
builder.Services.AddScoped<TokenService>();
builder.Services.AddScoped<RefreshTokenService>();

builder.Services.AddCors(options =>
{
    options.AddPolicy(corsPolicyName, policy =>
    {
        if (allowedOrigins.Length > 0)
        {
            policy.WithOrigins(allowedOrigins)
                .AllowAnyHeader()
                .AllowAnyMethod()
                .AllowCredentials();

            return;
        }

        if (builder.Environment.IsDevelopment())
        {
            policy.WithOrigins(
                    "http://localhost:3000",
                    "http://localhost:3001",
                    "http://localhost:4200",
                    "http://localhost:5173",
                    "https://localhost:3000",
                    "https://localhost:3001",
                    "https://localhost:4200",
                    "https://localhost:5173"
                )
                .AllowAnyHeader()
                .AllowAnyMethod()
                .AllowCredentials();
        }
    });
});

var app = builder.Build();

app.UseForwardedHeaders();

if (app.Configuration.GetValue<bool>("Database:ApplyMigrationsOnStartup"))
{
    using var scope = app.Services.CreateScope();
    var dbContext = scope.ServiceProvider.GetRequiredService<AppDbContext>();
    dbContext.Database.Migrate();
}

if (app.Environment.IsDevelopment() || app.Environment.IsEnvironment("Testing"))
{
    app.UseSwagger();
    app.UseSwaggerUI();
}
else
{
    app.UseHsts();
}

app.UseHttpsRedirection();

app.UseCors(corsPolicyName);

app.UseAuthentication();
app.UseAuthorization();

app.MapGet("/health", () => Results.Ok(new
{
    status = "ok",
    environment = app.Environment.EnvironmentName,
    timestamp = DateTime.UtcNow
})).AllowAnonymous();

app.MapControllers();

app.Run();

static string RequireConnectionString(IConfiguration configuration, IWebHostEnvironment environment)
{
    var value = configuration.GetConnectionString("DefaultConnection");
    if (!string.IsNullOrWhiteSpace(value))
    {
        return NormalizeConnectionString(value);
    }

    if (environment.IsProduction())
    {
        var databaseUrl = configuration["DATABASE_URL"];
        if (!string.IsNullOrWhiteSpace(databaseUrl))
        {
            return NormalizeConnectionString(databaseUrl);
        }
    }

    throw new InvalidOperationException(
        environment.IsProduction()
            ? "Banco de dados não configurado. Em produção, configure ConnectionStrings__DefaultConnection ou DATABASE_URL."
            : "Banco de dados não configurado. Configure ConnectionStrings__DefaultConnection para o ambiente local."
    );
}

static string NormalizeConnectionString(string value)
{
    if (!Uri.TryCreate(value, UriKind.Absolute, out var uri) ||
        (uri.Scheme != "postgres" && uri.Scheme != "postgresql"))
    {
        return value;
    }

    var userInfoParts = uri.UserInfo.Split(':', 2);
    if (userInfoParts.Length != 2 ||
        string.IsNullOrWhiteSpace(userInfoParts[0]) ||
        string.IsNullOrWhiteSpace(userInfoParts[1]))
    {
        throw new InvalidOperationException(
            "DATABASE_URL inválida. Use o formato postgresql://usuario:senha@host:5432/banco."
        );
    }

    var database = uri.AbsolutePath.Trim('/');
    if (string.IsNullOrWhiteSpace(database))
    {
        throw new InvalidOperationException(
            "DATABASE_URL inválida. Informe o nome do banco na URL."
        );
    }

    var builder = new NpgsqlConnectionStringBuilder
    {
        Host = uri.Host,
        Port = uri.IsDefaultPort ? 5432 : uri.Port,
        Database = Uri.UnescapeDataString(database),
        Username = Uri.UnescapeDataString(userInfoParts[0]),
        Password = Uri.UnescapeDataString(userInfoParts[1]),
        SslMode = SslMode.Disable
    };

    if (!string.IsNullOrWhiteSpace(uri.Query))
    {
        var query = uri.Query.TrimStart('?')
            .Split('&', StringSplitOptions.RemoveEmptyEntries | StringSplitOptions.TrimEntries);

        foreach (var pair in query)
        {
            var parts = pair.Split('=', 2);
            var key = Uri.UnescapeDataString(parts[0]);
            var queryValue = parts.Length > 1 ? Uri.UnescapeDataString(parts[1]) : string.Empty;

            if (key.Equals("sslmode", StringComparison.OrdinalIgnoreCase) &&
                Enum.TryParse<SslMode>(queryValue, true, out var sslMode))
            {
                builder.SslMode = sslMode;
            }
        }
    }

    return builder.ConnectionString;
}

static string[] GetAllowedOrigins(IConfiguration configuration)
{
    var origins = configuration
        .GetSection("Cors:AllowedOrigins")
        .Get<string[]>() ?? [];

    if (origins.Length > 0)
    {
        return origins
            .Select(x => x.Trim().TrimEnd('/'))
            .Where(x => !string.IsNullOrWhiteSpace(x))
            .Distinct(StringComparer.OrdinalIgnoreCase)
            .ToArray();
    }

    var singleValue = configuration["Cors:AllowedOrigins"];
    if (string.IsNullOrWhiteSpace(singleValue))
    {
        return [];
    }

    return singleValue
        .Split(',', StringSplitOptions.RemoveEmptyEntries | StringSplitOptions.TrimEntries)
        .Select(x => x.TrimEnd('/'))
        .Where(x => !string.IsNullOrWhiteSpace(x))
        .Distinct(StringComparer.OrdinalIgnoreCase)
        .ToArray();
}

static string RequireConfiguration(IConfiguration configuration, string key, string helpText)
{
    var value = configuration[key];
    if (string.IsNullOrWhiteSpace(value))
    {
        throw new InvalidOperationException($"{key} não configurada. {helpText}");
    }

    return value;
}

static void ValidateJwtKey(string jwtKey)
{
    if (Encoding.UTF8.GetByteCount(jwtKey) < 32)
    {
        throw new InvalidOperationException("Jwt:Key deve ter pelo menos 32 bytes para assinar tokens em produção com segurança.");
    }
}

static void ValidateCorsConfiguration(IWebHostEnvironment environment, string[] allowedOrigins)
{
    if (environment.IsDevelopment())
    {
        return;
    }

    if (allowedOrigins.Length == 0)
    {
        throw new InvalidOperationException(
            "Cors:AllowedOrigins não configurado. Configure Cors__AllowedOrigins__0 com a URL exata do frontend."
        );
    }

    foreach (var origin in allowedOrigins)
    {
        if (origin == "*" || !Uri.TryCreate(origin, UriKind.Absolute, out var uri) ||
            (uri.Scheme != Uri.UriSchemeHttp && uri.Scheme != Uri.UriSchemeHttps))
        {
            throw new InvalidOperationException(
                $"Origem CORS inválida: '{origin}'. Use uma URL absoluta, como https://app.seudominio.com."
            );
        }
    }
}

static void ValidateRefreshTokenConfiguration(IWebHostEnvironment environment, IConfiguration configuration)
{
    var cookieSameSite = configuration["RefreshToken:CookieSameSite"];
    var cookieSecure = configuration.GetValue<bool?>("RefreshToken:CookieSecure") ?? !environment.IsDevelopment();

    if (environment.IsProduction() && !cookieSecure)
    {
        throw new InvalidOperationException("RefreshToken:CookieSecure deve ser true em produção.");
    }

    if (string.Equals(cookieSameSite, "None", StringComparison.OrdinalIgnoreCase) && !cookieSecure)
    {
        throw new InvalidOperationException("RefreshToken:CookieSameSite=None exige RefreshToken:CookieSecure=true.");
    }
}
