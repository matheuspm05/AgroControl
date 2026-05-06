namespace ApiAgro.Models;

public class Curral
{
    public int Id { get; set; }
    public int FazendaId { get; set; }
    public string Nome { get; set; } = string.Empty;
    public int? CapacidadeMaxima { get; set; }
    public DateTime DataCadastro { get; set; } = DateTime.UtcNow;

    public Fazenda? Fazenda { get; set; }
}
