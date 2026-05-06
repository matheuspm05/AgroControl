function Button({
  children,
  variant = "primary",
  fullWidth = false,
  size = "md",
  className = "",
  type = "button",
  ...props
}) {
  const variants = {
    primary: "ag-button-primary border shadow-sm",
    secondary: "ag-button-secondary border shadow-sm",
    danger: "ag-button-danger border shadow-sm",
    text: "ag-link bg-transparent hover:bg-emerald-950/5 dark:hover:bg-white/6",
  };

  const sizes = {
    sm: "min-h-10 px-4 py-2 text-sm",
    md: "min-h-12 px-5 py-3 text-base",
    lg: "min-h-14 px-6 py-3.5 text-base sm:text-lg",
  };

  return (
    <button
      type={type}
      className={`inline-flex items-center justify-center rounded-lg font-semibold transition focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[var(--color-focus)] disabled:cursor-not-allowed disabled:opacity-60 ${sizes[size] ?? sizes.md} ${variants[variant] ?? variants.primary} ${
        fullWidth ? "w-full" : ""
      } ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}

export default Button;
