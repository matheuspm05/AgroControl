export function buildOccupancySummary(capacidadeMaxima, ocupacaoAtual) {
  const capacity = Number(capacidadeMaxima);
  const occupancy = Number(ocupacaoAtual);

  if (!Number.isFinite(capacity) || capacity <= 0) {
    return {
      label: ocupacaoAtual > 0 ? `${occupancy} ocupados` : "Capacidade não informada",
      badge: "Sem capacidade",
      percent: null,
      tone: "neutral",
    };
  }

  const safeOccupancy = Math.max(0, occupancy);
  const rawPercent = Math.round((safeOccupancy / capacity) * 100);
  const percent = Math.min(rawPercent, 999);

  let tone = "success";
  if (percent >= 100) {
    tone = "danger";
  } else if (percent >= 75) {
    tone = "warning";
  } else if (percent === 0) {
    tone = "neutral";
  }

  return {
    label: `${safeOccupancy} / ${capacity}`,
    badge: percent === 0 ? "Vazio" : `${percent}%`,
    percent,
    tone,
  };
}
