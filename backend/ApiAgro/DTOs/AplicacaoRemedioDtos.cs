namespace ApiAgro.DTOs;

public record AplicacaoRemedioCreateDto(
    int FazendaId,
    int AnimalId,
    int RemedioId,
    decimal DoseAplicada,
    DateTime DataAplicacao,
    string? Observacao,
    bool Ativo);

public record AplicacaoRemedioUpdateDto(
    int FazendaId,
    int AnimalId,
    int RemedioId,
    decimal DoseAplicada,
    DateTime DataAplicacao,
    string? Observacao,
    bool Ativo);
