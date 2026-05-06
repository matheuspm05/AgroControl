import { buildOccupancySummary } from "../utils/curralModule";

function OccupancyPill({
  capacidadeMaxima,
  ocupacaoAtual,
  compact = false,
}) {
  const summary = buildOccupancySummary(capacidadeMaxima, ocupacaoAtual);

  const tones = {
    success: {
      base: "bg-[var(--color-success-bg)] text-[var(--color-success)]",
      accent: "bg-[var(--color-surface-muted)] text-[var(--color-success)]",
    },
    warning: {
      base: "bg-[var(--color-warning-bg)] text-[var(--color-warning)]",
      accent: "bg-[var(--color-surface-muted)] text-[var(--color-warning)]",
    },
    danger: {
      base: "bg-[var(--color-danger-bg)] text-[var(--color-danger)]",
      accent: "bg-[var(--color-danger)] text-[var(--color-bg)]",
    },
    neutral: {
      base: "bg-[var(--color-surface-muted)] text-[var(--color-text)]",
      accent: "bg-[var(--color-surface-hover)] text-[var(--color-text)]",
    },
  };

  const tone = tones[summary.tone];
  const sizeClasses = compact ? "px-2.5 py-1 text-xs" : "px-3 py-1.5 text-sm";

  return (
    <div className="flex flex-wrap items-center gap-1.5">
      <span
        className={`inline-flex items-center rounded-lg font-semibold ${sizeClasses} ${tone.base}`}
      >
        {summary.label}
      </span>
      <span
        className={`inline-flex items-center rounded-lg font-semibold ${sizeClasses} ${tone.accent}`}
      >
        {summary.badge}
      </span>
    </div>
  );
}

export default OccupancyPill;
