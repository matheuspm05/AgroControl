function DataTable({
  title,
  description,
  columns,
  rows,
  loading,
  error,
  actionLabel = "Cadastrar",
  onAction,
  emptyMessage = "Nenhum registro encontrado.",
}) {
  const hasAction = typeof onAction === "function";

  return (
    <section className="ag-surface overflow-hidden rounded-lg border">
      <div className="flex flex-col gap-4 border-b border-[var(--color-border)] px-5 py-5 sm:px-6 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h2 className="text-2xl font-bold text-[var(--color-text-strong)]">
            {title}
          </h2>
          <p className="mt-2 text-sm leading-6 text-[var(--color-text-muted)]">{description}</p>
        </div>

        <button
          type="button"
          onClick={onAction}
          disabled={!hasAction}
          className="ag-button-primary inline-flex w-full items-center justify-center rounded-lg border px-5 py-3 text-sm font-semibold shadow-sm transition disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto"
          title={hasAction ? undefined : "Cadastro disponível na próxima etapa"}
        >
          {hasAction ? actionLabel : `${actionLabel} em breve`}
        </button>
      </div>

      {loading ? (
        <LoadingTable />
      ) : error ? (
        <div className="px-5 py-12 sm:px-6">
          <div className="rounded-lg border border-[var(--color-danger-border)] bg-[var(--color-danger-bg)] px-5 py-4 text-[var(--color-danger)]">
            <p className="text-sm font-semibold uppercase tracking-wide">
              Erro ao carregar
            </p>
            <p className="mt-2 text-base">{error}</p>
          </div>
        </div>
      ) : rows.length === 0 ? (
        <div className="px-5 py-14 text-center sm:px-6">
          <p className="text-lg font-semibold text-[var(--color-text-strong)]">{emptyMessage}</p>
          <p className="mt-2 text-sm text-[var(--color-text-muted)]">
            Quando houver dados cadastrados, eles vão aparecer aqui.
          </p>
        </div>
      ) : (
        <>
          <div className="hidden overflow-x-auto lg:block">
            <table className="min-w-full divide-y divide-emerald-950/8">
              <thead className="bg-[var(--color-surface-muted)]">
                <tr>
                  {columns.map((column) => (
                    <th
                      key={column.key}
                      className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wide text-[var(--color-text-muted)]"
                    >
                      {column.header}
                    </th>
                  ))}
                </tr>
              </thead>

              <tbody className="divide-y divide-emerald-950/6">
                {rows.map((row, index) => (
                  <tr key={row.id ?? index} className="transition hover:bg-[var(--color-surface-hover)]">
                    {columns.map((column) => (
                      <td
                        key={column.key}
                        className="px-6 py-4 align-top text-sm text-[var(--color-text)]"
                      >
                        {renderCell(column, row)}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="grid gap-4 px-5 py-5 lg:hidden">
            {rows.map((row, index) => (
              <article
                key={row.id ?? index}
                className="ag-surface rounded-lg border p-4"
              >
                <div className="space-y-3">
                  {columns.map((column) => (
                    <div key={column.key}>
                      <p className="text-[0.68rem] font-semibold uppercase tracking-wide text-[var(--color-text-muted)]">
                        {column.header}
                      </p>
                      <div className="mt-1 text-sm text-[var(--color-text)]">
                        {renderCell(column, row)}
                      </div>
                    </div>
                  ))}
                </div>
              </article>
            ))}
          </div>
        </>
      )}
    </section>
  );
}

function renderCell(column, row) {
  if (typeof column.render === "function") {
    return column.render(row);
  }

  return row[column.key] ?? "—";
}

function LoadingTable() {
  return (
    <div className="px-5 py-5 sm:px-6">
      <div className="space-y-3">
        {Array.from({ length: 6 }).map((_, index) => (
          <div
            key={index}
            className="ag-skeleton h-16 animate-pulse rounded-lg"
          />
        ))}
      </div>
    </div>
  );
}

export default DataTable;
