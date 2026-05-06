using ApiAgro.DTOs;
using ApiAgro.Models;
using ApiAgro.Models.Enums;
using ApiAgro.Services;
using ApiAgro.Tests.Helpers;

namespace ApiAgro.Tests.Services;

public class AnimalServiceTests
{
    [Fact]
    public async Task CreateAsync_ComLocalValido_DeveCriarAnimal()
    {
        using var context = TestDbContextFactory.Create();
        context.Pastos.Add(new Pasto { Id = 10, FazendaId = 1, Nome = "Pasto A" });
        await context.SaveChangesAsync();

        var service = new AnimalService(context);

        var result = await service.CreateAsync(1, new AnimalCreateDto(
            1,
            "Boi Bravo",
            TipoAnimal.Boi,
            new DateTime(2024, 1, 10),
            420.5m,
            null,
            TipoLocal.Pasto,
            10));

        Assert.True(result.Success);
        Assert.NotNull(result.Data);
        var animal = Assert.Single(context.Animais);
        Assert.Equal("Boi Bravo", animal.Nome);
        Assert.Equal(TipoLocal.Pasto, animal.TipoLocalAtual);
        Assert.Equal(10, animal.LocalAtualId);
    }

    [Fact]
    public async Task CreateAsync_ComLocalInvalido_DeveRetornarErroDeValidacao()
    {
        using var context = TestDbContextFactory.Create();
        var service = new AnimalService(context);

        var result = await service.CreateAsync(1, new AnimalCreateDto(
            1,
            "Boi Bravo",
            TipoAnimal.Boi,
            null,
            null,
            null,
            TipoLocal.Curral,
            999));

        Assert.False(result.Success);
        Assert.Equal(ServiceErrorType.Validation, result.ErrorType);
        Assert.Equal("LocalAtualId informado nao existe para o tipo e fazenda selecionados.", result.ErrorMessage);
        Assert.Empty(context.Animais);
    }

    [Fact]
    public async Task GetAllAsync_DeveRetornarSomenteAnimaisDaFazendaInformada()
    {
        using var context = TestDbContextFactory.Create();
        context.Animais.AddRange(
            new Animal
            {
                FazendaId = 1,
                Nome = "Animal 1",
                TipoAnimal = TipoAnimal.Boi,
                TipoLocalAtual = TipoLocal.Pasto,
                LocalAtualId = 10
            },
            new Animal
            {
                FazendaId = 2,
                Nome = "Animal 2",
                TipoAnimal = TipoAnimal.Boi,
                TipoLocalAtual = TipoLocal.Curral,
                LocalAtualId = 20
            });
        await context.SaveChangesAsync();

        var service = new AnimalService(context);

        var result = (await service.GetAllAsync(1)).ToList();

        Assert.Single(result);
        Assert.Equal("Animal 1", result[0].Nome);
    }
}
