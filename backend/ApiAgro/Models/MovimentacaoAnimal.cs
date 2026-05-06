using ApiAgro.Models.Enums;

namespace ApiAgro.Models;

public class MovimentacaoAnimal
{
    public int Id { get; set; }
    public int FazendaId { get; set; }
    public int AnimalId { get; set; }
    public TipoLocal? OrigemTipoLocal { get; set; }
    public int? OrigemLocalId { get; set; }
    public TipoLocal DestinoTipoLocal { get; set; }
    public int DestinoLocalId { get; set; }
    public DateTime DataMovimentacao { get; set; }
    public string? Observacao { get; set; }

    public Fazenda? Fazenda { get; set; }
    public Animal? Animal { get; set; }
}
