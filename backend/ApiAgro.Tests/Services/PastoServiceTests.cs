using ApiAgro.DTOs;
using ApiAgro.Models;
using ApiAgro.Models.Enums;
using ApiAgro.Services;
using ApiAgro.Tests.Helpers;

namespace ApiAgro.Tests.Services;

public class PastoServiceTests
{
    [Fact]
    public async Task GetAnimaisAsync_DeveRetornarSomenteAnimaisDoPasto()
    {
        using var context = TestDbContextFactory.Create();
        context.Pastos.Add(new Pasto { Id = 10, FazendaId = 1, Nome = "Pasto A" });
        context.Animais.AddRange(
            new Animal
            {
                FazendaId = 1,
                Nome = "Boi 1",
                TipoAnimal = TipoAnimal.Boi,
                TipoLocalAtual = TipoLocal.Pasto,
                LocalAtualId = 10
            },
            new Animal
            {
                FazendaId = 1,
                Nome = "Boi 2",
                TipoAnimal = TipoAnimal.Boi,
                TipoLocalAtual = TipoLocal.Curral,
                LocalAtualId = 20
            });
        await context.SaveChangesAsync();

        var service = new PastoService(context);

        var result = await service.GetAnimaisAsync(10, 1);

        Assert.True(result.Success);
        var animais = Assert.Single(result.Data!);
        Assert.Equal("Boi 1", animais.Nome);
    }

    [Fact]
    public async Task DeleteAsync_ComAnimaisVinculados_DeveBloquearExclusao()
    {
        using var context = TestDbContextFactory.Create();
        context.Pastos.Add(new Pasto { Id = 10, FazendaId = 1, Nome = "Pasto A" });
        context.Animais.Add(new Animal
        {
            FazendaId = 1,
            Nome = "Boi 1",
            TipoAnimal = TipoAnimal.Boi,
            TipoLocalAtual = TipoLocal.Pasto,
            LocalAtualId = 10
        });
        await context.SaveChangesAsync();

        var service = new PastoService(context);

        var result = await service.DeleteAsync(10, 1);

        Assert.False(result.Success);
        Assert.Equal(ServiceErrorType.Validation, result.ErrorType);
        Assert.Equal(
            "Nao e possivel excluir este pasto porque existem animais vinculados a ele. Movimente os animais antes de excluir.",
            result.ErrorMessage);
        Assert.Single(context.Pastos);
    }

    [Fact]
    public async Task CreateAsync_DeveCriarPasto()
    {
        using var context = TestDbContextFactory.Create();
        var service = new PastoService(context);

        var result = await service.CreateAsync(1, new PastoCreateDto(1, "Pasto Novo", 12.5m, "Brachiaria", null));

        Assert.True(result.Success);
        var pasto = Assert.Single(context.Pastos);
        Assert.Equal("Pasto Novo", pasto.Nome);
        Assert.Equal(12.5m, pasto.Tamanho);
    }
}
