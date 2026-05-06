function StatusBanner({
  title,
  message,
  variant = "error",
  actions = null,
}) {
  const variants = {
    error: "border-[var(--color-danger-border)] bg-[var(--color-danger-bg)] text-[var(--color-danger)]",
    warning: "border-[var(--color-warning-border)] bg-[var(--color-warning-bg)] text-[var(--color-warning)]",
    success: "border-emerald-200 bg-[var(--color-success-bg)] text-[var(--color-success)]",
    info: "border-sky-200 bg-[var(--color-info-bg)] text-[var(--color-info)]",
  };

  return (
    <div className={`rounded-lg border px-5 py-4 shadow-sm ${variants[variant]}`}>
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div>
          <p className="text-sm font-semibold uppercase tracking-wide">{title}</p>
          {message ? <p className="mt-2 text-base">{message}</p> : null}
        </div>

        {actions ? <div className="shrink-0">{actions}</div> : null}
      </div>
    </div>
  );
}

export default StatusBanner;
