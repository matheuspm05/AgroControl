function SelectField({
  label,
  options,
  placeholder = "Selecione uma opção",
  className = "",
  selectClassName = "",
  ...props
}) {
  return (
    <label className={`block ${className}`}>
      {label ? (
        <span className="mb-3 block text-base font-semibold text-[var(--color-text)]">
          {label}
        </span>
      ) : null}

      <select
        className={`ag-field h-15 w-full rounded-lg border px-4 text-base outline-none transition focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-65 ${selectClassName}`}
        {...props}
      >
        <option value="">{placeholder}</option>
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </label>
  );
}

export default SelectField;
