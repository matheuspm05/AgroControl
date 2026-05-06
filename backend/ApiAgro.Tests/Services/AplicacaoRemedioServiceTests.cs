using ApiAgro.DTOs;
using ApiAgro.Models;
using ApiAgro.Models.Enums;
using ApiAgro.Services;
using ApiAgro.Tests.Helpers;

namespace ApiAgro.Tests.Services;

public class AplicacaoRemedioServiceTests
{
    [Fact]
    public async Task CreateAsync_ComAnimalERemedioValidos_DeveCriarAplicacao()
    {
        using var context = TestDbContextFactory.Create();
        context.Animais.Add(new Animal
        {
            Id = 100,
            FazendaId = 1,
            Nome = "Boi Valente",
            TipoAnimal = TipoAnimal.Boi,
            TipoLocalAtual = TipoLocal.Pasto,
            LocalAtualId = 10
        });
        context.Remedios.Add(new Remedio
        {
            Id = 200,
            FazendaId = 1,
            Nome = "Vermifugo",
            Ativo = true
        });
        await context.SaveChangesAsync();

        var service = new AplicacaoRemedioService(context);

        var result = await service.CreateAsync(1, new AplicacaoRemedioCreateDto(
            1,
            100,
            200,
            4.5m,
            DateTime.UtcNow,
            "Aplicacao preventiva",
            true));

        Assert.True(result.Success);
        Assert.NotNull(result.Data);
        var aplicacao = Assert.Single(context.AplicacoesRemedio);
        Assert.Equal(100, aplicacao.AnimalId);
        Assert.Equal(200, aplicacao.RemedioId);
    }

    [Fact]
    public async Task CreateAsync_ComRemedioInativo_DeveFalhar()
    {
        using var context = TestDbContextFactory.Create();
        context.Animais.Add(new Animal
        {
            Id = 100,
            FazendaId = 1,
            Nome = "Boi Valente",
            TipoAnimal = TipoAnimal.Boi,
            TipoLocalAtual = TipoLocal.Pasto,
            LocalAtualId = 10
        });
        context.Remedios.Add(new Remedio
        {
            Id = 200,
            FazendaId = 1,
            Nome = "Vermifugo",
            Ativo = false
        });
        await context.SaveChangesAsync();

        var service = new AplicacaoRemedioService(context);

        var result = await service.CreateAsync(1, new AplicacaoRemedioCreateDto(
            1,
            100,
            200,
            4.5m,
            DateTime.UtcNow,
            null,
            true));

        Assert.False(result.Success);
        Assert.Equal(ServiceErrorType.Validation, result.ErrorType);
        Assert.Equal("Remedio informado esta inativo.", result.ErrorMessage);
        Assert.Empty(context.AplicacoesRemedio);
    }

    [Fact]
    public async Task UpdateAsync_ComRelacionamentosDeOutraFazenda_DeveFalhar()
    {
        using var context = TestDbContextFactory.Create();
        context.AplicacoesRemedio.Add(new AplicacaoRemedio
        {
            Id = 1,
            FazendaId = 1,
            AnimalId = 100,
            RemedioId = 200,
            DoseAplicada = 2,
            DataAplicacao = DateTime.UtcNow
        });
        context.Animais.Add(new Animal
        {
            Id = 100,
            FazendaId = 2,
            Nome = "Boi Externo",
            TipoAnimal = TipoAnimal.Boi,
            TipoLocalAtual = TipoLocal.Pasto,
            LocalAtualId = 10
        });
        context.Remedios.Add(new Remedio
        {
            Id = 200,
            FazendaId = 1,
            Nome = "Vermifugo",
            Ativo = true
        });
        await context.SaveChangesAsync();

        var service = new AplicacaoRemedioService(context);

        var result = await service.UpdateAsync(1, 1, new AplicacaoRemedioUpdateDto(
            1,
            100,
            200,
            3,
            DateTime.UtcNow,
            null,
            true));

        Assert.False(result.Success);
        Assert.Equal(ServiceErrorType.Validation, result.ErrorType);
        Assert.Equal("Animal, remedio e fazenda precisam pertencer a mesma fazenda.", result.ErrorMessage);
    }
}
