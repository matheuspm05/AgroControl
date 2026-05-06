import { Link } from "react-router-dom";
import Button from "./Button";
import useFazenda from "../hooks/useFazenda";
import StatusBanner from "./StatusBanner";

function FazendaGate({ children }) {
  const { loading, error, activeFazenda, refreshFazendas } = useFazenda();

  if (loading) {
    return (
      <section className="ag-surface rounded-lg border p-6">
        <div className="space-y-3">
          <div className="ag-skeleton h-6 w-52 animate-pulse rounded" />
          <div className="ag-skeleton h-16 animate-pulse rounded-lg" />
          <div className="ag-skeleton h-16 animate-pulse rounded-lg" />
        </div>
      </section>
    );
  }

  if (error) {
    return (
      <StatusBanner
        title="Não foi possível carregar a fazenda ativa"
        message={error}
        actions={
          <Button variant="secondary" onClick={() => void refreshFazendas()}>
            Tentar novamente
          </Button>
        }
      />
    );
  }

  if (!activeFazenda) {
    return (
      <section className="ag-surface rounded-lg border p-6">
        <div className="max-w-2xl">
          <p className="text-sm font-semibold uppercase tracking-wide text-emerald-700">
            Fazenda ativa
          </p>
          <h2 className="mt-2 text-2xl font-bold text-emerald-950">
            Cadastre uma fazenda para liberar este módulo
          </h2>
          <p className="mt-3 text-base leading-7 text-slate-600">
            As rotas de animais dependem do vínculo com uma fazenda e com locais
            como pastos ou currais. Assim que a primeira fazenda for criada, o
            fluxo passa a funcionar normalmente no ambiente de desenvolvimento.
          </p>

          <div className="mt-5">
            <Link
              to="/setup-fazenda"
              className="ag-button-primary inline-flex min-h-12 items-center justify-center rounded-lg border px-5 py-3 text-base font-semibold shadow-sm transition focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[var(--color-focus)]"
            >
              Cadastrar fazenda
            </Link>
          </div>
        </div>
      </section>
    );
  }

  return typeof children === "function" ? children(activeFazenda) : children;
}

export default FazendaGate;
