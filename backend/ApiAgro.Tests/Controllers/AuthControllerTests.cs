using ApiAgro.Controllers;
using ApiAgro.DTOs;
using ApiAgro.Models;
using ApiAgro.Services;
using ApiAgro.Tests.Helpers;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;

namespace ApiAgro.Tests.Controllers;

public class AuthControllerTests
{
    [Fact]
    public async Task Register_DeveCriarUsuarioERetornarToken()
    {
        using var context = TestDbContextFactory.Create();
        var controller = CreateController(context);

        var dto = new RegisterRequestDto(
            "Maria do Campo",
            "maria@agro.com",
            "Senha123",
            "Senha123",
            null);

        var response = await controller.Register(dto);

        var ok = Assert.IsType<OkObjectResult>(response.Result);
        var payload = Assert.IsType<AuthResponseDto>(ok.Value);

        Assert.False(string.IsNullOrWhiteSpace(payload.Token));
        Assert.Equal(dto.Nome, payload.Nome);
        Assert.Equal(dto.Email, payload.Email);

        var usuario = Assert.Single(context.Usuarios);
        Assert.Equal(dto.Email.ToLowerInvariant(), usuario.Email);
        Assert.NotEqual(dto.Senha, usuario.SenhaHash);
        Assert.True(BCrypt.Net.BCrypt.Verify(dto.Senha, usuario.SenhaHash));
        Assert.Single(context.RefreshTokens);
    }

    [Fact]
    public async Task Login_ComSenhaInvalida_DeveRetornarUnauthorized()
    {
        using var context = TestDbContextFactory.Create();
        context.Usuarios.Add(new Usuario
        {
            Nome = "Maria do Campo",
            Email = "maria@agro.com",
            SenhaHash = BCrypt.Net.BCrypt.HashPassword("Senha123")
        });
        await context.SaveChangesAsync();

        var controller = CreateController(context);

        var response = await controller.Login(new LoginRequestDto("maria@agro.com", "SenhaErrada"));

        Assert.IsType<UnauthorizedObjectResult>(response.Result);
    }

    [Fact]
    public async Task Register_ComSenhaDiferenteDaConfirmacao_DeveRetornarBadRequest()
    {
        using var context = TestDbContextFactory.Create();
        var controller = CreateController(context);

        var response = await controller.Register(new RegisterRequestDto(
            "Maria do Campo",
            "maria@agro.com",
            "Senha123",
            "Senha456",
            null));

        Assert.IsType<BadRequestObjectResult>(response.Result);
    }

    [Fact]
    public async Task Register_ComEmailDuplicadoDeveRetornarBadRequest()
    {
        using var context = TestDbContextFactory.Create();
        context.Usuarios.Add(new Usuario
        {
            Nome = "Maria",
            Email = "maria@agro.com",
            SenhaHash = BCrypt.Net.BCrypt.HashPassword("Senha123")
        });
        await context.SaveChangesAsync();

        var controller = CreateController(context);

        var response = await controller.Register(new RegisterRequestDto(
            "Outra Maria",
            "maria@agro.com",
            "Senha123",
            "Senha123",
            null));

        Assert.IsType<BadRequestObjectResult>(response.Result);
    }

    [Fact]
    public async Task Login_ComEmailNormalizado_DeveRetornarOk()
    {
        using var context = TestDbContextFactory.Create();
        context.Usuarios.Add(new Usuario
        {
            Nome = "Maria do Campo",
            Email = "maria@agro.com",
            SenhaHash = BCrypt.Net.BCrypt.HashPassword("Senha123")
        });
        await context.SaveChangesAsync();

        var controller = CreateController(context);

        var response = await controller.Login(new LoginRequestDto("  MARIA@AGRO.COM ", "Senha123"));

        var ok = Assert.IsType<OkObjectResult>(response.Result);
        var payload = Assert.IsType<AuthResponseDto>(ok.Value);
        Assert.Equal("maria@agro.com", payload.Email);
    }

    private static AuthController CreateController(ApiAgro.Data.AppDbContext context)
    {
        var configuration = TestConfigurationFactory.Create();
        return new AuthController(
            context,
            new TokenService(configuration),
            new RefreshTokenService(context, configuration),
            configuration,
            new TestWebHostEnvironment())
        {
            ControllerContext = new ControllerContext
            {
                HttpContext = new DefaultHttpContext()
            }
        };
    }
}
