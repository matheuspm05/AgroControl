namespace ApiAgro.DTOs;

public record RemedioCreateDto(
    int FazendaId,
    string Nome,
    DateTime? DataCadastro,
    string? Descricao,
    decimal? DosePadrao,
    bool Ativo);

public record RemedioUpdateDto(
    int FazendaId,
    string Nome,
    DateTime? DataCadastro,
    string? Descricao,
    decimal? DosePadrao,
    bool Ativo);
