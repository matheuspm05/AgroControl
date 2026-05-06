namespace ApiAgro.Models;

public class Campeiro
{
    public int Id { get; set; }
    public int FazendaId { get; set; }
    public string Nome { get; set; } = string.Empty;
    public DateTime? DataAdmissao { get; set; }
    public decimal? Salario { get; set; }
    public string? EstadoCivil { get; set; }
    public string? Telefone { get; set; }
    public string? Cpf { get; set; }
    public string? Observacoes { get; set; }

    public Fazenda? Fazenda { get; set; }
}
