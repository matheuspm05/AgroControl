function AuthCard({ title, subtitle, children, className = "" }) {
  return (
    <section
      className={`ag-surface rounded-2xl border p-5 backdrop-blur sm:p-8 ${className}`}
    >
      {title ? (
        <div className="mb-6 text-center">
          <h1 className="text-3xl font-bold text-[var(--color-text-strong)] sm:text-4xl">
            {title}
          </h1>
          {subtitle ? (
            <p className="mt-3 text-base leading-7 text-[var(--color-text-muted)]">{subtitle}</p>
          ) : null}
        </div>
      ) : null}

      {children}
    </section>
  );
}

export default AuthCard;
