namespace ApiAgro.Models;

public class AplicacaoRemedio
{
    public int Id { get; set; }
    public int FazendaId { get; set; }
    public int AnimalId { get; set; }
    public int RemedioId { get; set; }
    public decimal DoseAplicada { get; set; }
    public DateTime DataAplicacao { get; set; }
    public string? Observacao { get; set; }
    public bool Ativo { get; set; } = true;

    public Fazenda? Fazenda { get; set; }
    public Animal? Animal { get; set; }
    public Remedio? Remedio { get; set; }
}
