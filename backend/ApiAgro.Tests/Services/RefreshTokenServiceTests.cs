using ApiAgro.Models;
using ApiAgro.Services;
using ApiAgro.Tests.Helpers;

namespace ApiAgro.Tests.Services;

public class RefreshTokenServiceTests
{
    [Fact]
    public async Task CreateSessionAsync_DeveSalvarHashENaoTokenPuro()
    {
        using var context = TestDbContextFactory.Create();
        var usuario = new Usuario
        {
            Id = 1,
            Nome = "Maria",
            Email = "maria@agro.com",
            SenhaHash = "hash"
        };
        context.Usuarios.Add(usuario);
        await context.SaveChangesAsync();

        var service = new RefreshTokenService(context, TestConfigurationFactory.Create());

        var session = await service.CreateSessionAsync(usuario, "127.0.0.1");

        Assert.False(string.IsNullOrWhiteSpace(session.RefreshToken));
        var storedToken = Assert.Single(context.RefreshTokens);
        Assert.NotEqual(session.RefreshToken, storedToken.TokenHash);
        Assert.True(storedToken.IsActive);
        Assert.Equal("127.0.0.1", storedToken.CreatedByIp);
    }

    [Fact]
    public async Task RotateAsync_DeveRevogarTokenAnteriorECriarNovo()
    {
        using var context = TestDbContextFactory.Create();
        var usuario = new Usuario
        {
            Id = 1,
            Nome = "Maria",
            Email = "maria@agro.com",
            SenhaHash = "hash"
        };
        context.Usuarios.Add(usuario);
        await context.SaveChangesAsync();

        var service = new RefreshTokenService(context, TestConfigurationFactory.Create());
        var session = await service.CreateSessionAsync(usuario, "127.0.0.1");

        var rotated = await service.RotateAsync(session.RefreshToken, "127.0.0.2");

        Assert.NotNull(rotated);
        Assert.NotEqual(session.RefreshToken, rotated!.RefreshToken);
        Assert.Equal(2, context.RefreshTokens.Count());
        var tokens = context.RefreshTokens.AsEnumerable().ToList();
        Assert.Single(tokens, x => x.IsActive);
        Assert.Single(tokens, x => x.IsRevoked);
    }

    [Fact]
    public async Task RevokeAsync_DeveRevogarTokenAtivo()
    {
        using var context = TestDbContextFactory.Create();
        var usuario = new Usuario
        {
            Id = 1,
            Nome = "Maria",
            Email = "maria@agro.com",
            SenhaHash = "hash"
        };
        context.Usuarios.Add(usuario);
        await context.SaveChangesAsync();

        var service = new RefreshTokenService(context, TestConfigurationFactory.Create());
        var session = await service.CreateSessionAsync(usuario, "127.0.0.1");

        var revoked = await service.RevokeAsync(session.RefreshToken, "127.0.0.2");

        Assert.True(revoked);
        Assert.False(context.RefreshTokens.Single().IsActive);
        Assert.Equal("127.0.0.2", context.RefreshTokens.Single().RevokedByIp);
    }
}
