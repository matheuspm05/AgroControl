function Input({
  label,
  icon: Icon,
  rightElement,
  multiline = false,
  rows = 4,
  className = "",
  inputClassName = "",
  ...props
}) {
  const sharedInputClassName = `ag-field w-full rounded-lg border px-4 text-base outline-none transition focus-visible:outline-none ${
    Icon ? "pl-13" : ""
  } ${rightElement ? "pr-13" : ""} ${multiline ? "min-h-32 py-3.5" : "h-15"} ${inputClassName}`;

  return (
    <label className={`block ${className}`}>
      {label ? (
        <span className="mb-3 block text-base font-semibold text-[var(--color-text)]">
          {label}
        </span>
      ) : null}

      <div className="relative">
        {Icon ? (
          <span className="pointer-events-none absolute inset-y-0 left-4 flex items-center text-[var(--color-primary)] opacity-90">
            <Icon />
          </span>
        ) : null}

        {multiline ? (
          <textarea className={sharedInputClassName} rows={rows} {...props} />
        ) : (
          <input className={sharedInputClassName} {...props} />
        )}

        {rightElement ? (
          <div className="absolute inset-y-0 right-4 flex items-center">
            {rightElement}
          </div>
        ) : null}
      </div>
    </label>
  );
}

export default Input;
