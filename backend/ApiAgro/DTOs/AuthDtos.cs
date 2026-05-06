namespace ApiAgro.DTOs;

public record RegisterRequestDto(
    string Nome,
    string Email,
    string Senha,
    string ConfirmarSenha,
    string? Contato);

public record LoginRequestDto(
    string Email,
    string Senha);

public record AuthResponseDto(
    string Token,
    int UsuarioId,
    string Nome,
    string Email);
