using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using ApiAgro.Models;
using ApiAgro.Services;
using ApiAgro.Tests.Helpers;
using Microsoft.Extensions.Configuration;

namespace ApiAgro.Tests.Services;

public class TokenServiceTests
{
    [Fact]
    public void GenerateToken_DeveGerarJwtComClaimsDoUsuario()
    {
        var service = new TokenService(TestConfigurationFactory.Create());

        var token = service.GenerateToken(new Usuario
        {
            Id = 7,
            Nome = "Maria do Campo",
            Email = "maria@agro.com"
        });

        var jwt = new JwtSecurityTokenHandler().ReadJwtToken(token);

        Assert.Equal("AgroControl.Tests", jwt.Issuer);
        Assert.Contains(jwt.Claims, x => x.Type == ClaimTypes.NameIdentifier && x.Value == "7");
        Assert.Contains(jwt.Claims, x => x.Type == ClaimTypes.Name && x.Value == "Maria do Campo");
        Assert.Contains(jwt.Claims, x => x.Type == ClaimTypes.Email && x.Value == "maria@agro.com");
    }

    [Fact]
    public void GenerateToken_SemChaveConfigurada_DeveLancarExcecao()
    {
        var configuration = new ConfigurationBuilder()
            .AddInMemoryCollection(new Dictionary<string, string?>
            {
                ["Jwt:Issuer"] = "AgroControl.Tests",
                ["Jwt:Audience"] = "AgroControl.Tests.Client"
            })
            .Build();

        var service = new TokenService(configuration);

        var exception = Assert.Throws<InvalidOperationException>(() => service.GenerateToken(new Usuario
        {
            Id = 1,
            Nome = "Teste",
            Email = "teste@agro.com"
        }));

        Assert.Equal("JWT key was not configured. Set JWT_KEY or Jwt:Key.", exception.Message);
    }
}
