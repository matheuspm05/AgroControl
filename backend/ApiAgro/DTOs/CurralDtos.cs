namespace ApiAgro.DTOs;

public record CurralCreateDto(
    int FazendaId,
    string Nome,
    int? CapacidadeMaxima,
    DateTime? DataCadastro);

public record CurralUpdateDto(
    int FazendaId,
    string Nome,
    int? CapacidadeMaxima,
    DateTime? DataCadastro);
