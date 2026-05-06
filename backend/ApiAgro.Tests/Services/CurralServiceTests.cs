using ApiAgro.DTOs;
using ApiAgro.Models;
using ApiAgro.Models.Enums;
using ApiAgro.Services;
using ApiAgro.Tests.Helpers;

namespace ApiAgro.Tests.Services;

public class CurralServiceTests
{
    [Fact]
    public async Task GetAnimaisAsync_DeveRetornarSomenteAnimaisDoCurral()
    {
        using var context = TestDbContextFactory.Create();
        context.Currais.Add(new Curral { Id = 20, FazendaId = 1, Nome = "Curral B" });
        context.Animais.AddRange(
            new Animal
            {
                FazendaId = 1,
                Nome = "Boi 1",
                TipoAnimal = TipoAnimal.Boi,
                TipoLocalAtual = TipoLocal.Curral,
                LocalAtualId = 20
            },
            new Animal
            {
                FazendaId = 1,
                Nome = "Boi 2",
                TipoAnimal = TipoAnimal.Boi,
                TipoLocalAtual = TipoLocal.Pasto,
                LocalAtualId = 10
            });
        await context.SaveChangesAsync();

        var service = new CurralService(context);

        var result = await service.GetAnimaisAsync(20, 1);

        Assert.True(result.Success);
        var animais = Assert.Single(result.Data!);
        Assert.Equal("Boi 1", animais.Nome);
    }

    [Fact]
    public async Task DeleteAsync_ComAnimaisVinculados_DeveBloquearExclusao()
    {
        using var context = TestDbContextFactory.Create();
        context.Currais.Add(new Curral { Id = 20, FazendaId = 1, Nome = "Curral B" });
        context.Animais.Add(new Animal
        {
            FazendaId = 1,
            Nome = "Boi 1",
            TipoAnimal = TipoAnimal.Boi,
            TipoLocalAtual = TipoLocal.Curral,
            LocalAtualId = 20
        });
        await context.SaveChangesAsync();

        var service = new CurralService(context);

        var result = await service.DeleteAsync(20, 1);

        Assert.False(result.Success);
        Assert.Equal(ServiceErrorType.Validation, result.ErrorType);
        Assert.Equal(
            "Nao e possivel excluir este curral porque existem animais vinculados a ele. Movimente os animais antes de excluir.",
            result.ErrorMessage);
        Assert.Single(context.Currais);
    }

    [Fact]
    public async Task CreateAsync_DeveCriarCurral()
    {
        using var context = TestDbContextFactory.Create();
        var service = new CurralService(context);

        var result = await service.CreateAsync(1, new CurralCreateDto(1, "Curral Novo", 50, null));

        Assert.True(result.Success);
        var curral = Assert.Single(context.Currais);
        Assert.Equal("Curral Novo", curral.Nome);
        Assert.Equal(50, curral.CapacidadeMaxima);
    }
}
