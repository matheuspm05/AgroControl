using ApiAgro.Models.Enums;

namespace ApiAgro.Models;

public class Animal
{
    public int Id { get; set; }
    public int FazendaId { get; set; }
    public string Nome { get; set; } = string.Empty;
    public TipoAnimal TipoAnimal { get; set; }
    public DateTime? DataNascimento { get; set; }
    public decimal? Peso { get; set; }
    public DateTime DataCadastro { get; set; } = DateTime.UtcNow;
    public TipoLocal TipoLocalAtual { get; set; }
    public int LocalAtualId { get; set; }

    public Fazenda? Fazenda { get; set; }
    public ICollection<AplicacaoRemedio> AplicacoesRemedio { get; set; } = new List<AplicacaoRemedio>();
    public ICollection<MovimentacaoAnimal> Movimentacoes { get; set; } = new List<MovimentacaoAnimal>();
}
