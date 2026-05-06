using ApiAgro.Models.Enums;

namespace ApiAgro.DTOs;

public record MovimentacaoAnimalCreateDto(
    int FazendaId,
    int AnimalId,
    TipoLocal? OrigemTipoLocal,
    int? OrigemLocalId,
    TipoLocal DestinoTipoLocal,
    int DestinoLocalId,
    DateTime DataMovimentacao,
    string? Observacao);

public record MovimentacaoAnimalUpdateDto(
    int FazendaId,
    int AnimalId,
    TipoLocal? OrigemTipoLocal,
    int? OrigemLocalId,
    TipoLocal DestinoTipoLocal,
    int DestinoLocalId,
    DateTime DataMovimentacao,
    string? Observacao);
