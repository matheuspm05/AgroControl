namespace ApiAgro.Models;

public class Pasto
{
    public int Id { get; set; }
    public int FazendaId { get; set; }
    public string Nome { get; set; } = string.Empty;
    public decimal? Tamanho { get; set; }
    public string? TipoVegetacao { get; set; }
    public DateTime DataCadastro { get; set; } = DateTime.UtcNow;

    public Fazenda? Fazenda { get; set; }
}
