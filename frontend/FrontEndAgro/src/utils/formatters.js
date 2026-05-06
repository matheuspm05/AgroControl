export function formatDate(value) {
  if (!value) return "—";

  const date = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(date.getTime())) {
    return "—";
  }

  return new Intl.DateTimeFormat("pt-BR", {
    timeZone: "UTC",
  }).format(date);
}

export function formatCurrency(value) {
  if (value === null || value === undefined || value === "") {
    return "Não informado";
  }

  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(value);
}

export function formatWeight(value) {
  if (value === null || value === undefined || value === "") {
    return "Não informado";
  }

  return `${new Intl.NumberFormat("pt-BR", {
    maximumFractionDigits: 2,
  }).format(value)} kg`;
}

export function formatArea(value) {
  if (value === null || value === undefined || value === "") {
    return "Não informado";
  }

  return `${new Intl.NumberFormat("pt-BR", {
    maximumFractionDigits: 2,
  }).format(value)} ha`;
}

export function formatDateInput(value) {
  if (!value) {
    return "";
  }

  if (typeof value === "string") {
    const matchedDate = value.match(/^(\d{4})-(\d{2})-(\d{2})/);
    if (matchedDate) {
      return `${matchedDate[1]}-${matchedDate[2]}-${matchedDate[3]}`;
    }
  }

  const date = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(date.getTime())) {
    return "";
  }

  const year = String(date.getUTCFullYear());
  const month = String(date.getUTCMonth() + 1).padStart(2, "0");
  const day = String(date.getUTCDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}
