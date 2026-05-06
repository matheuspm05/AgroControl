using ApiAgro.Models.Enums;

namespace ApiAgro.DTOs;

public record AnimalCreateDto(
    int FazendaId,
    string Nome,
    TipoAnimal TipoAnimal,
    DateTime? DataNascimento,
    decimal? Peso,
    DateTime? DataCadastro,
    TipoLocal TipoLocalAtual,
    int LocalAtualId);

public record AnimalUpdateDto(
    int FazendaId,
    string Nome,
    TipoAnimal TipoAnimal,
    DateTime? DataNascimento,
    decimal? Peso,
    DateTime? DataCadastro,
    TipoLocal TipoLocalAtual,
    int LocalAtualId);
