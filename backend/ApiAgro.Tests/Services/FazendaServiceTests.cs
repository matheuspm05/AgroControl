using ApiAgro.DTOs;
using ApiAgro.Models;
using ApiAgro.Services;
using ApiAgro.Tests.Helpers;

namespace ApiAgro.Tests.Services;

public class FazendaServiceTests
{
    [Fact]
    public async Task CreateAsync_DeveCriarFazendaParaUsuarioValido()
    {
        using var context = TestDbContextFactory.Create();
        context.Usuarios.Add(new Usuario
        {
            Id = 1,
            Nome = "Joao",
            Email = "joao@agro.com",
            SenhaHash = "hash"
        });
        await context.SaveChangesAsync();

        var service = new FazendaService(context);

        var result = await service.CreateAsync(1, new FazendaCreateDto(
            "Fazenda Boa Vista",
            null,
            "Minas Gerais",
            125.50m,
            "Fazenda de corte"));

        Assert.True(result.Success);
        Assert.NotNull(result.Data);
        Assert.Equal("Fazenda Boa Vista", result.Data!.Nome);

        var fazenda = Assert.Single(context.Fazendas);
        Assert.Equal(1, fazenda.UsuarioId);
    }

    [Fact]
    public async Task CreateAsync_DeveBloquearSegundaFazendaDoMesmoUsuario()
    {
        using var context = TestDbContextFactory.Create();
        context.Usuarios.Add(new Usuario
        {
            Id = 1,
            Nome = "Joao",
            Email = "joao@agro.com",
            SenhaHash = "hash"
        });
        context.Fazendas.Add(new Fazenda
        {
            UsuarioId = 1,
            Nome = "Fazenda Existente"
        });
        await context.SaveChangesAsync();

        var service = new FazendaService(context);

        var result = await service.CreateAsync(1, new FazendaCreateDto(
            "Nova Fazenda",
            null,
            null,
            null,
            null));

        Assert.False(result.Success);
        Assert.Equal(ServiceErrorType.Validation, result.ErrorType);
        Assert.Equal("Este usuario ja possui uma fazenda cadastrada.", result.ErrorMessage);
        Assert.Single(context.Fazendas);
    }
}
