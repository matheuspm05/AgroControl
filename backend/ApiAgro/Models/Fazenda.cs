namespace ApiAgro.Models;

public class Fazenda
{
    public int Id { get; set; }
    public int? UsuarioId { get; set; }
    public string Nome { get; set; } = string.Empty;
    public DateTime DataCriacao { get; set; } = DateTime.UtcNow;
    public decimal? TamanhoPropriedade { get; set; }
    public string? Localizacao { get; set; }
    public string? Descricao { get; set; }

    public Usuario? Usuario { get; set; }
    public ICollection<Animal> Animais { get; set; } = new List<Animal>();
    public ICollection<Pasto> Pastos { get; set; } = new List<Pasto>();
    public ICollection<Curral> Currais { get; set; } = new List<Curral>();
    public ICollection<Remedio> Remedios { get; set; } = new List<Remedio>();
    public ICollection<Campeiro> Campeiros { get; set; } = new List<Campeiro>();
    public ICollection<AplicacaoRemedio> AplicacoesRemedio { get; set; } = new List<AplicacaoRemedio>();
    public ICollection<MovimentacaoAnimal> MovimentacoesAnimais { get; set; } = new List<MovimentacaoAnimal>();
}
