export const tipoAnimalOptions = [
  { value: "Boi", label: "Boi" },
  { value: "Vaca", label: "Vaca" },
  { value: "Cavalo", label: "Cavalo" },
];

export function buildLocalOptions(pastos = [], currais = [], fazendaId) {
  const pastoOptions = pastos
    .filter((item) => item.fazendaId === fazendaId)
    .map((item) => ({
      value: `Pasto:${item.id}`,
      label: `${item.nome} · Pasto`,
      tipoLocal: "Pasto",
      localId: item.id,
    }));

  const curralOptions = currais
    .filter((item) => item.fazendaId === fazendaId)
    .map((item) => ({
      value: `Curral:${item.id}`,
      label: `${item.nome} · Curral`,
      tipoLocal: "Curral",
      localId: item.id,
    }));

  return [...pastoOptions, ...curralOptions];
}

export function parseLocalOption(value) {
  if (!value) {
    return null;
  }

  const [tipoLocal, localId] = String(value).split(":");
  const parsedLocalId = Number(localId);

  if (!tipoLocal || Number.isNaN(parsedLocalId)) {
    return null;
  }

  return {
    tipoLocal,
    localId: parsedLocalId,
  };
}

export function getLocalName(tipoLocal, localId, pastos = [], currais = []) {
  if (!tipoLocal || localId === null || localId === undefined) {
    return "Não informado";
  }

  const parsedLocalId = Number(localId);
  const source =
    tipoLocal === "Pasto" ? pastos : tipoLocal === "Curral" ? currais : [];
  const found = source.find((item) => item.id === parsedLocalId);

  return found?.nome || `${tipoLocal} #${parsedLocalId}`;
}

export function getLocalDisplay(tipoLocal, localId, pastos = [], currais = []) {
  if (!tipoLocal || localId === null || localId === undefined) {
    return "Não informado";
  }

  return `${tipoLocal} · ${getLocalName(tipoLocal, localId, pastos, currais)}`;
}

export function isSameLocal(
  firstTipoLocal,
  firstLocalId,
  secondTipoLocal,
  secondLocalId,
) {
  return (
    firstTipoLocal === secondTipoLocal &&
    Number(firstLocalId) === Number(secondLocalId)
  );
}

export function getTodayInputValue() {
  const now = new Date();
  const local = new Date(now.getTime() - now.getTimezoneOffset() * 60000);
  return local.toISOString().slice(0, 10);
}
