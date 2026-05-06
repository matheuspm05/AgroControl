using ApiAgro.DTOs;
using ApiAgro.Models;
using ApiAgro.Models.Enums;
using ApiAgro.Services;
using ApiAgro.Tests.Helpers;

namespace ApiAgro.Tests.Services;

public class RemedioServiceTests
{
    [Fact]
    public async Task DeleteAsync_ComAplicacoesRegistradas_DeveBloquearExclusao()
    {
        using var context = TestDbContextFactory.Create();
        context.Fazendas.Add(new Fazenda { Id = 1, Nome = "Fazenda 1" });
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
        context.AplicacoesRemedio.Add(new AplicacaoRemedio
        {
            FazendaId = 1,
            AnimalId = 100,
            RemedioId = 200,
            DoseAplicada = 5,
            DataAplicacao = DateTime.UtcNow
        });
        await context.SaveChangesAsync();

        var service = new RemedioService(context);

        var result = await service.DeleteAsync(200, 1);

        Assert.False(result.Success);
        Assert.Equal(ServiceErrorType.Validation, result.ErrorType);
        Assert.Equal(
            "Nao e possivel excluir este remedio porque ele ja possui aplicacoes registradas. Desative o remedio em vez de excluir.",
            result.ErrorMessage);
        Assert.Single(context.Remedios);
    }

    [Fact]
    public async Task DeleteAsync_SemAplicacoes_DeveExcluirRemedio()
    {
        using var context = TestDbContextFactory.Create();
        context.Remedios.Add(new Remedio
        {
            Id = 200,
            FazendaId = 1,
            Nome = "Vermifugo",
            Ativo = true
        });
        await context.SaveChangesAsync();

        var service = new RemedioService(context);

        var result = await service.DeleteAsync(200, 1);

        Assert.True(result.Success);
        Assert.Empty(context.Remedios);
    }
}
