namespace ApiAgro.DTOs;

public record FazendaCreateDto(
    string Nome,
    DateTime? DataCriacao,
    string? Localizacao,
    decimal? TamanhoPropriedade,
    string? Descricao);

public record FazendaUpdateDto(
    string Nome,
    DateTime? DataCriacao,
    string? Localizacao,
    decimal? TamanhoPropriedade,
    string? Descricao);
