namespace ApiAgro.DTOs;

public record PastoCreateDto(
    int FazendaId,
    string Nome,
    decimal? Tamanho,
    string? TipoVegetacao,
    DateTime? DataCadastro);

public record PastoUpdateDto(
    int FazendaId,
    string Nome,
    decimal? Tamanho,
    string? TipoVegetacao,
    DateTime? DataCadastro);
