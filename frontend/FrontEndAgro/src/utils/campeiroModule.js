export const ESTADO_CIVIL_OPTIONS = [
  { value: "Solteiro", label: "Solteiro" },
  { value: "Casado", label: "Casado" },
  { value: "Divorciado", label: "Divorciado" },
  { value: "Viúvo", label: "Viúvo" },
  { value: "União estável", label: "União estável" },
];

export function buildCampeiroPayload(campeiro, overrides = {}) {
  return {
    fazendaId: campeiro.fazendaId,
    nome: campeiro.nome,
    dataAdmissao: campeiro.dataAdmissao,
    salario: campeiro.salario,
    estadoCivil: campeiro.estadoCivil,
    telefone: campeiro.telefone,
    cpf: campeiro.cpf,
    observacoes: campeiro.observacoes,
    ...overrides,
  };
}

export function formatServiceTime(value) {
  if (!value) {
    return "Não informado";
  }

  const startDate = new Date(value);
  if (Number.isNaN(startDate.getTime())) {
    return "Não informado";
  }

  const today = new Date();
  let months =
    (today.getFullYear() - startDate.getUTCFullYear()) * 12 +
    (today.getMonth() - startDate.getUTCMonth());

  if (today.getDate() < startDate.getUTCDate()) {
    months -= 1;
  }

  if (months < 0) {
    return "Admissão futura";
  }

  const years = Math.floor(months / 12);
  const remainingMonths = months % 12;

  if (years === 0 && remainingMonths === 0) {
    return "Menos de 1 mês";
  }

  const parts = [];
  if (years > 0) {
    parts.push(`${years} ${years === 1 ? "ano" : "anos"}`);
  }

  if (remainingMonths > 0) {
    parts.push(
      `${remainingMonths} ${remainingMonths === 1 ? "mês" : "meses"}`,
    );
  }

  return parts.join(" e ");
}
