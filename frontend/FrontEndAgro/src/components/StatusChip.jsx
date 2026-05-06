function StatusChip({ active, activeLabel = "Ativo", inactiveLabel = "Inativo" }) {
  const classes = active
    ? "bg-[var(--color-success-bg)] text-[var(--color-success)]"
    : "bg-[var(--color-surface-muted)] text-[var(--color-text-muted)]";

  return (
    <span
      className={`inline-flex items-center rounded-lg px-3 py-1 text-sm font-semibold ${classes}`}
    >
      {active ? activeLabel : inactiveLabel}
    </span>
  );
}

export default StatusChip;
