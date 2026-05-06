namespace ApiAgro.DTOs;

public record CampeiroCreateDto(
    int FazendaId,
    string Nome,
    DateTime? DataAdmissao,
    decimal? Salario,
    string? EstadoCivil,
    string? Telefone,
    string? Cpf,
    string? Observacoes);

public record CampeiroUpdateDto(
    int FazendaId,
    string Nome,
    DateTime? DataAdmissao,
    decimal? Salario,
    string? EstadoCivil,
    string? Telefone,
    string? Cpf,
    string? Observacoes);
