using ApiAgro.DTOs;
using ApiAgro.Models;
using ApiAgro.Models.Enums;
using ApiAgro.Services;
using ApiAgro.Tests.Helpers;

namespace ApiAgro.Tests.Services;

public class MovimentacaoAnimalServiceTests
{
    [Fact]
    public async Task CreateAsync_DeveRegistrarMovimentacaoEAtualizarLocalDoAnimal()
    {
        using var context = TestDbContextFactory.Create();
        context.Fazendas.Add(new Fazenda { Id = 1, Nome = "Fazenda 1" });
        context.Pastos.Add(new Pasto { Id = 10, FazendaId = 1, Nome = "Pasto A" });
        context.Currais.Add(new Curral { Id = 20, FazendaId = 1, Nome = "Curral B" });
        context.Animais.Add(new Animal
        {
            Id = 100,
            FazendaId = 1,
            Nome = "Boi Valente",
            TipoAnimal = TipoAnimal.Boi,
            TipoLocalAtual = TipoLocal.Pasto,
            LocalAtualId = 10
        });
        await context.SaveChangesAsync();

        var service = new MovimentacaoAnimalService(context);

        var result = await service.CreateAsync(1, new MovimentacaoAnimalCreateDto(
            1,
            100,
            TipoLocal.Pasto,
            10,
            TipoLocal.Curral,
            20,
            DateTime.UtcNow,
            "Mudanca para manejo"));

        Assert.True(result.Success);
        Assert.NotNull(result.Data);

        var movimentacao = Assert.Single(context.MovimentacoesAnimais);
        Assert.Equal(TipoLocal.Curral, movimentacao.DestinoTipoLocal);
        Assert.Equal(20, movimentacao.DestinoLocalId);

        var animal = Assert.Single(context.Animais);
        Assert.Equal(TipoLocal.Curral, animal.TipoLocalAtual);
        Assert.Equal(20, animal.LocalAtualId);
    }

    [Fact]
    public async Task CreateAsync_ComDestinoInvalido_DeveRetornarErroDeValidacao()
    {
        using var context = TestDbContextFactory.Create();
        context.Fazendas.Add(new Fazenda { Id = 1, Nome = "Fazenda 1" });
        context.Pastos.Add(new Pasto { Id = 10, FazendaId = 1, Nome = "Pasto A" });
        context.Animais.Add(new Animal
        {
            Id = 100,
            FazendaId = 1,
            Nome = "Boi Valente",
            TipoAnimal = TipoAnimal.Boi,
            TipoLocalAtual = TipoLocal.Pasto,
            LocalAtualId = 10
        });
        await context.SaveChangesAsync();

        var service = new MovimentacaoAnimalService(context);

        var result = await service.CreateAsync(1, new MovimentacaoAnimalCreateDto(
            1,
            100,
            TipoLocal.Pasto,
            10,
            TipoLocal.Curral,
            999,
            DateTime.UtcNow,
            null));

        Assert.False(result.Success);
        Assert.Equal(ServiceErrorType.Validation, result.ErrorType);
        Assert.Equal("Destino informado nao existe para a fazenda selecionada.", result.ErrorMessage);
        Assert.Empty(context.MovimentacoesAnimais);
    }
}
