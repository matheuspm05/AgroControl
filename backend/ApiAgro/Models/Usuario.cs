namespace ApiAgro.Models;

public class Usuario
{
    public int Id { get; set; }
    public string Nome { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public string SenhaHash { get; set; } = string.Empty;
    public string? Contato { get; set; }
    public DateTime DataCriacao { get; set; } = DateTime.UtcNow;

    public Fazenda? Fazenda { get; set; }
    public ICollection<RefreshToken> RefreshTokens { get; set; } = new List<RefreshToken>();
}
