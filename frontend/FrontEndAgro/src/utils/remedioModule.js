export function buildRemedioPayload(remedio, overrides = {}) {
  return {
    fazendaId: remedio.fazendaId,
    nome: remedio.nome,
    dataCadastro: remedio.dataCadastro,
    descricao: remedio.descricao ?? null,
    dosePadrao:
      remedio.dosePadrao === undefined ? null : remedio.dosePadrao,
    ativo: remedio.ativo ?? true,
    ...overrides,
  };
}
