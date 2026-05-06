namespace ApiAgro.Models;

public class Remedio
{
    public int Id { get; set; }
    public int FazendaId { get; set; }
    public string Nome { get; set; } = string.Empty;
    public DateTime DataCadastro { get; set; } = DateTime.UtcNow;
    public string? Descricao { get; set; }
    public decimal? DosePadrao { get; set; }
    public bool Ativo { get; set; } = true;

    public Fazenda? Fazenda { get; set; }
    public ICollection<AplicacaoRemedio> Aplicacoes { get; set; } = new List<AplicacaoRemedio>();
}
