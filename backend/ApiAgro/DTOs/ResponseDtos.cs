using ApiAgro.Models;
using ApiAgro.Models.Enums;

namespace ApiAgro.DTOs;

public record AnimalResponseDto(
    int Id,
    int FazendaId,
    string Nome,
    TipoAnimal TipoAnimal,
    DateTime? DataNascimento,
    decimal? Peso,
    DateTime DataCadastro,
    TipoLocal TipoLocalAtual,
    int LocalAtualId);

public record MovimentacaoAnimalResponseDto(
    int Id,
    int FazendaId,
    int AnimalId,
    TipoLocal? OrigemTipoLocal,
    int? OrigemLocalId,
    TipoLocal DestinoTipoLocal,
    int DestinoLocalId,
    DateTime DataMovimentacao,
    string? Observacao);

public record AplicacaoRemedioResponseDto(
    int Id,
    int FazendaId,
    int AnimalId,
    int RemedioId,
    decimal DoseAplicada,
    DateTime DataAplicacao,
    string? Observacao,
    bool Ativo);

public record FazendaResponseDto(
    int Id,
    string Nome,
    DateTime DataCriacao,
    string? Localizacao,
    decimal? TamanhoPropriedade,
    string? Descricao);

public record PastoResponseDto(
    int Id,
    int FazendaId,
    string Nome,
    decimal? Tamanho,
    string? TipoVegetacao,
    DateTime DataCadastro);

public record CurralResponseDto(
    int Id,
    int FazendaId,
    string Nome,
    int? CapacidadeMaxima,
    DateTime DataCadastro);

public record RemedioResponseDto(
    int Id,
    int FazendaId,
    string Nome,
    DateTime DataCadastro,
    string? Descricao,
    decimal? DosePadrao,
    bool Ativo);

public record CampeiroResponseDto(
    int Id,
    int FazendaId,
    string Nome,
    DateTime? DataAdmissao,
    decimal? Salario,
    string? EstadoCivil,
    string? Telefone,
    string? Cpf,
    string? Observacoes);

public static class ResponseDtoMappings
{
    public static AnimalResponseDto ToResponseDto(this Animal entity) =>
        new(
            entity.Id,
            entity.FazendaId,
            entity.Nome,
            entity.TipoAnimal,
            entity.DataNascimento,
            entity.Peso,
            entity.DataCadastro,
            entity.TipoLocalAtual,
            entity.LocalAtualId);

    public static MovimentacaoAnimalResponseDto ToResponseDto(this MovimentacaoAnimal entity) =>
        new(
            entity.Id,
            entity.FazendaId,
            entity.AnimalId,
            entity.OrigemTipoLocal,
            entity.OrigemLocalId,
            entity.DestinoTipoLocal,
            entity.DestinoLocalId,
            entity.DataMovimentacao,
            entity.Observacao);

    public static AplicacaoRemedioResponseDto ToResponseDto(this AplicacaoRemedio entity) =>
        new(
            entity.Id,
            entity.FazendaId,
            entity.AnimalId,
            entity.RemedioId,
            entity.DoseAplicada,
            entity.DataAplicacao,
            entity.Observacao,
            entity.Ativo);

    public static FazendaResponseDto ToResponseDto(this Fazenda entity) =>
        new(
            entity.Id,
            entity.Nome,
            entity.DataCriacao,
            entity.Localizacao,
            entity.TamanhoPropriedade,
            entity.Descricao);

    public static PastoResponseDto ToResponseDto(this Pasto entity) =>
        new(
            entity.Id,
            entity.FazendaId,
            entity.Nome,
            entity.Tamanho,
            entity.TipoVegetacao,
            entity.DataCadastro);

    public static CurralResponseDto ToResponseDto(this Curral entity) =>
        new(
            entity.Id,
            entity.FazendaId,
            entity.Nome,
            entity.CapacidadeMaxima,
            entity.DataCadastro);

    public static RemedioResponseDto ToResponseDto(this Remedio entity) =>
        new(
            entity.Id,
            entity.FazendaId,
            entity.Nome,
            entity.DataCadastro,
            entity.Descricao,
            entity.DosePadrao,
            entity.Ativo);

    public static CampeiroResponseDto ToResponseDto(this Campeiro entity) =>
        new(
            entity.Id,
            entity.FazendaId,
            entity.Nome,
            entity.DataAdmissao,
            entity.Salario,
            entity.EstadoCivil,
            entity.Telefone,
            entity.Cpf,
            entity.Observacoes);
}
