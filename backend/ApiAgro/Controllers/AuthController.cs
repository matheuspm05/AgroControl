using ApiAgro.Data;
using ApiAgro.DTOs;
using ApiAgro.Models;
using ApiAgro.Services;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace ApiAgro.Controllers;

[ApiController]
[Route("auth")]
public class AuthController : ApiControllerBase
{
    private const string InvalidLoginMessage = "Email ou senha inválidos.";
    private readonly AppDbContext _context;
    private readonly TokenService _tokenService;
    private readonly RefreshTokenService _refreshTokenService;
    private readonly IConfiguration _configuration;
    private readonly IWebHostEnvironment _environment;

    public AuthController(
        AppDbContext context,
        TokenService tokenService,
        RefreshTokenService refreshTokenService,
        IConfiguration configuration,
        IWebHostEnvironment environment)
    {
        _context = context;
        _tokenService = tokenService;
        _refreshTokenService = refreshTokenService;
        _configuration = configuration;
        _environment = environment;
    }

    [HttpPost("register")]
    public async Task<ActionResult<AuthResponseDto>> Register(RegisterRequestDto dto)
    {
        var email = NormalizeEmail(dto.Email);
        if (string.IsNullOrWhiteSpace(dto.Nome) || string.IsNullOrWhiteSpace(email))
        {
            return ValidationError("Nome e email sao obrigatorios.");
        }

        if (string.IsNullOrWhiteSpace(dto.Senha) || dto.Senha.Length < 6)
        {
            return ValidationError("A senha deve ter pelo menos 6 caracteres.");
        }

        if (dto.Senha != dto.ConfirmarSenha)
        {
            return ValidationError("Senha e confirmacao de senha nao conferem.");
        }

        var emailAlreadyExists = await _context.Usuarios
            .AsNoTracking()
            .AnyAsync(x => x.Email == email);

        if (emailAlreadyExists)
        {
            return ValidationError("Email ja cadastrado.");
        }

        var usuario = new Usuario
        {
            Nome = dto.Nome.Trim(),
            Email = email,
            SenhaHash = BCrypt.Net.BCrypt.HashPassword(dto.Senha),
            Contato = string.IsNullOrWhiteSpace(dto.Contato) ? null : dto.Contato.Trim(),
            DataCriacao = DateTime.UtcNow
        };

        _context.Usuarios.Add(usuario);
        await _context.SaveChangesAsync();

        return Ok(await CreateSessionResponseAsync(usuario));
    }

    [HttpPost("login")]
    public async Task<ActionResult<AuthResponseDto>> Login(LoginRequestDto dto)
    {
        var email = NormalizeEmail(dto.Email);
        var usuario = await _context.Usuarios.FirstOrDefaultAsync(x => x.Email == email);

        if (usuario is null || !BCrypt.Net.BCrypt.Verify(dto.Senha, usuario.SenhaHash))
        {
            return Unauthorized(new ApiErrorResponse("invalid_credentials", InvalidLoginMessage));
        }

        return Ok(await CreateSessionResponseAsync(usuario));
    }

    [HttpPost("refresh")]
    public async Task<ActionResult<AuthResponseDto>> Refresh()
    {
        var refreshToken = Request.Cookies[GetRefreshCookieName()];
        if (string.IsNullOrWhiteSpace(refreshToken))
        {
            ClearRefreshCookie();
            return Unauthorized(new ApiErrorResponse("invalid_refresh_token", "Sessao expirada. Faça login novamente."));
        }

        var session = await _refreshTokenService.RotateAsync(refreshToken, GetClientIp());
        if (session is null)
        {
            ClearRefreshCookie();
            return Unauthorized(new ApiErrorResponse("invalid_refresh_token", "Sessao expirada. Faça login novamente."));
        }

        SetRefreshCookie(session.RefreshToken, session.ExpiresAt);
        return Ok(ToAuthResponse(session.Usuario));
    }

    [HttpPost("logout")]
    public async Task<IActionResult> Logout()
    {
        var refreshToken = Request.Cookies[GetRefreshCookieName()];
        if (!string.IsNullOrWhiteSpace(refreshToken))
        {
            await _refreshTokenService.RevokeAsync(refreshToken, GetClientIp());
        }

        ClearRefreshCookie();
        return NoContent();
    }

    private async Task<AuthResponseDto> CreateSessionResponseAsync(Usuario usuario)
    {
        var session = await _refreshTokenService.CreateSessionAsync(usuario, GetClientIp());
        SetRefreshCookie(session.RefreshToken, session.ExpiresAt);
        return ToAuthResponse(usuario);
    }

    private AuthResponseDto ToAuthResponse(Usuario usuario) =>
        new(
            _tokenService.GenerateToken(usuario),
            usuario.Id,
            usuario.Nome,
            usuario.Email);

    private static string NormalizeEmail(string? email) =>
        (email ?? string.Empty).Trim().ToLowerInvariant();

    private void SetRefreshCookie(string refreshToken, DateTime expiresAt)
    {
        Response.Cookies.Append(GetRefreshCookieName(), refreshToken, CreateRefreshCookieOptions(expiresAt));
    }

    private void ClearRefreshCookie()
    {
        Response.Cookies.Delete(GetRefreshCookieName(), CreateRefreshCookieOptions(DateTime.UtcNow.AddDays(-1)));
    }

    private CookieOptions CreateRefreshCookieOptions(DateTime expiresAt)
    {
        return new CookieOptions
        {
            HttpOnly = true,
            Secure = GetRefreshCookieSecure(),
            SameSite = GetRefreshCookieSameSite(),
            Expires = expiresAt,
            Path = "/auth"
        };
    }

    private string GetRefreshCookieName() =>
        _configuration["RefreshToken:CookieName"] ?? "agrocontrol.refreshToken";

    private bool GetRefreshCookieSecure() =>
        _configuration.GetValue<bool?>("RefreshToken:CookieSecure") ?? !_environment.IsDevelopment();

    private SameSiteMode GetRefreshCookieSameSite()
    {
        var value = _configuration["RefreshToken:CookieSameSite"];
        return string.Equals(value, "None", StringComparison.OrdinalIgnoreCase)
            ? SameSiteMode.None
            : string.Equals(value, "Strict", StringComparison.OrdinalIgnoreCase)
                ? SameSiteMode.Strict
                : SameSiteMode.Lax;
    }

    private string? GetClientIp() =>
        HttpContext.Connection.RemoteIpAddress?.ToString();
}
