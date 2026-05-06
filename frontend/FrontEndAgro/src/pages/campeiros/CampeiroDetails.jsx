import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import FazendaGate from "../../components/FazendaGate";
import StatusBanner from "../../components/StatusBanner";
import { agroApi } from "../../services/api";
import { getApiErrorMessage } from "../../utils/apiError";
import { formatServiceTime } from "../../utils/campeiroModule";
import { formatCurrency, formatDate } from "../../utils/formatters";

function CampeiroDetails() {
  return (
    <FazendaGate>
      {(activeFazenda) => (
        <CampeiroDetailsContent activeFazenda={activeFazenda} />
      )}
    </FazendaGate>
  );
}

function CampeiroDetailsContent({ activeFazenda }) {
  const navigate = useNavigate();
  const { campeiroId } = useParams();
  const [campeiro, setCampeiro] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    let isMounted = true;

    async function loadData() {
      try {
        setLoading(true);
        setError("");

        const campeiroData = await agroApi.getCampeiro(campeiroId);
        if (!isMounted) {
          return;
        }

        setCampeiro(campeiroData);
      } catch (err) {
        if (isMounted) {
          setError(
            getApiErrorMessage(
              err,
              "Não foi possível carregar os detalhes do campeiro.",
            ),
          );
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    }

    loadData();

    return () => {
      isMounted = false;
    };
  }, [campeiroId]);

  async function handleDelete() {
    if (!campeiro) {
      return;
    }

    const confirmed = window.confirm(
      `Deseja excluir o campeiro "${campeiro.nome}"? Essa ação não pode ser desfeita.`,
    );

    if (!confirmed) {
      return;
    }

    try {
      setDeleting(true);
      setError("");
      await agroApi.deleteCampeiro(campeiro.id);
      navigate("/campeiros");
    } catch (err) {
      setError(
        getApiErrorMessage(
          err,
          "Não foi possível excluir o campeiro agora.",
        ),
      );
    } finally {
      setDeleting(false);
    }
  }

  return (
    <div className="space-y-5">
      {error ? (
        <StatusBanner
          title="Não foi possível carregar o campeiro"
          message={error}
        />
      ) : null}

      {campeiro && campeiro.fazendaId !== activeFazenda.id ? (
        <StatusBanner
          variant="info"
          title="Registro fora da fazenda ativa"
          message="O detalhe foi aberto com sucesso, mas o layout continua apontando para outra fazenda ativa no ambiente."
        />
      ) : null}

      {loading ? (
        <DetailLoading />
      ) : campeiro ? (
        <section className="overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm">
          <div className="flex flex-col gap-5 border-b border-emerald-950/8 px-5 py-5 sm:px-6 xl:flex-row xl:items-start xl:justify-between">
            <div>
              <p className="text-sm font-semibold uppercase tracking-wide text-emerald-700">
                Campeiro
              </p>
              <h2 className="mt-2 text-3xl font-bold text-emerald-950">
                {campeiro.nome}
              </h2>
              <p className="mt-3 text-base text-slate-600">
                {formatServiceTime(campeiro.dataAdmissao)} de serviço
              </p>
            </div>

            <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
              <ActionLink to="/campeiros" variant="secondary">
                Voltar para campeiros
              </ActionLink>
              <ActionLink
                to={`/campeiros/${campeiro.id}/editar`}
                variant="primary"
              >
                Editar
              </ActionLink>
              <button
                type="button"
                onClick={() => void handleDelete()}
                disabled={deleting}
                className="inline-flex items-center justify-center rounded-lg border border-rose-200 bg-rose-50 px-5 py-3 text-base font-semibold text-rose-700 transition hover:bg-rose-100 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {deleting ? "Excluindo..." : "Excluir"}
              </button>
            </div>
          </div>

          <div className="grid gap-5 px-5 py-5 sm:px-6 xl:grid-cols-[18rem_1fr]">
            <div className="flex min-h-64 flex-col items-center justify-center rounded-lg border border-slate-200 bg-slate-50 px-5 py-6 text-center">
              <div className="flex h-28 w-28 items-center justify-center rounded-full bg-slate-200 text-5xl font-bold text-slate-400">
                {campeiro.nome.charAt(0).toUpperCase()}
              </div>
              <p className="mt-4 text-sm font-medium text-slate-600">
                Sem foto cadastrada
              </p>
            </div>

            <div className="overflow-hidden rounded-lg border border-slate-200 bg-white">
              <div className="border-b border-slate-100 px-5 py-4">
                <h3 className="text-2xl font-bold text-emerald-950">
                  {campeiro.nome}
                </h3>
              </div>

              <div className="grid gap-0 sm:grid-cols-2">
                <InfoRow label="Nome" value={campeiro.nome} />
                <InfoRow label="CPF" value={campeiro.cpf || "Não informado"} />
                <InfoRow
                  label="Telefone"
                  value={campeiro.telefone || "Não informado"}
                />
                <InfoRow
                  label="Estado civil"
                  value={campeiro.estadoCivil || "Não informado"}
                />
                <InfoRow
                  label="Data de admissão"
                  value={formatDate(campeiro.dataAdmissao)}
                />
                <InfoRow
                  label="Salário"
                  value={formatCurrency(campeiro.salario)}
                />
              </div>

              <div className="border-t border-slate-100 px-5 py-4">
                <p className="text-sm font-semibold uppercase tracking-wide text-slate-500">
                  Observações
                </p>
                <p className="mt-2 whitespace-pre-line text-sm leading-6 text-slate-700">
                  {campeiro.observacoes || "Nenhuma observação cadastrada."}
                </p>
              </div>
            </div>
          </div>
        </section>
      ) : (
        <section className="rounded-lg border border-slate-200 bg-white px-5 py-10 shadow-sm sm:px-6">
          <p className="text-base text-slate-600">
            O campeiro solicitado não foi encontrado.
          </p>
        </section>
      )}
    </div>
  );
}

function ActionLink({ to, variant = "secondary", children }) {
  const variants = {
    primary: "bg-emerald-800 text-white shadow-sm hover:bg-emerald-700",
    secondary:
      "border border-emerald-950/15 bg-white text-emerald-950 hover:bg-emerald-50",
  };

  return (
    <Link
      to={to}
      className={`inline-flex items-center justify-center rounded-lg px-5 py-3 text-base font-semibold transition ${variants[variant]}`}
    >
      {children}
    </Link>
  );
}

function InfoRow({ label, value }) {
  return (
    <div className="border-b border-slate-100 px-5 py-4 even:border-l even:border-l-slate-100">
      <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
        {label}
      </p>
      <p className="mt-2 text-base font-semibold text-emerald-950">{value}</p>
    </div>
  );
}

function DetailLoading() {
  return (
    <section className="rounded-lg border border-slate-200 bg-white px-5 py-5 shadow-sm sm:px-6">
      <div className="ag-skeleton h-72 animate-pulse rounded-lg" />
    </section>
  );
}

export default CampeiroDetails;
