import { useDeferredValue, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import FazendaGate from "../../components/FazendaGate";
import Input from "../../components/Input";
import StatusBanner from "../../components/StatusBanner";
import { agroApi } from "../../services/api";
import { getApiErrorMessage } from "../../utils/apiError";
import { formatServiceTime } from "../../utils/campeiroModule";
import { formatCurrency, formatDate } from "../../utils/formatters";

function Campeiros() {
  return (
    <FazendaGate>
      {(activeFazenda) => <CampeirosContent activeFazenda={activeFazenda} />}
    </FazendaGate>
  );
}

function CampeirosContent({ activeFazenda }) {
  const [search, setSearch] = useState("");
  const deferredSearch = useDeferredValue(search);
  const [campeiros, setCampeiros] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let isMounted = true;

    async function loadData() {
      try {
        setLoading(true);
        setError("");

        const campeirosData = await agroApi.listCampeiros();
        if (!isMounted) {
          return;
        }

        setCampeiros(
          campeirosData.filter((item) => item.fazendaId === activeFazenda.id),
        );
      } catch (err) {
        if (isMounted) {
          setError(
            getApiErrorMessage(
              err,
              "Não foi possível buscar os campeiros no momento.",
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
  }, [activeFazenda.id]);

  async function handleDelete(campeiro) {
    const confirmed = window.confirm(
      `Deseja excluir o campeiro "${campeiro.nome}"? Essa ação não pode ser desfeita.`,
    );

    if (!confirmed) {
      return;
    }

    try {
      setError("");
      await agroApi.deleteCampeiro(campeiro.id);
      setCampeiros((current) =>
        current.filter((item) => item.id !== campeiro.id),
      );
    } catch (err) {
      setError(
        getApiErrorMessage(
          err,
          "Não foi possível excluir o campeiro agora.",
        ),
      );
    }
  }

  const normalizedSearch = deferredSearch.trim().toLowerCase();
  const filteredCampeiros = campeiros.filter((campeiro) =>
    [
      campeiro.nome,
      campeiro.telefone || "",
      campeiro.cpf || "",
      campeiro.estadoCivil || "",
    ]
      .join(" ")
      .toLowerCase()
      .includes(normalizedSearch),
  );

  return (
    <div className="space-y-5">
      {error ? (
        <StatusBanner
          title="Não foi possível carregar os campeiros"
          message={error}
        />
      ) : null}

      <section className="ag-surface rounded-lg border">
        <div className="flex flex-col gap-4 border-b border-emerald-950/8 px-5 py-5 sm:px-6">
          <div className="flex flex-col gap-4 xl:flex-row xl:items-end xl:justify-between">
            <div>
              <div className="ag-page-kicker inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-wide">
                Fazenda ativa: {activeFazenda.nome}
              </div>
              <h2 className="mt-3 text-2xl font-bold text-emerald-950">
                Campeiros cadastrados
              </h2>
              <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-600">
                Organize a equipe da fazenda, acompanhe dados de contato,
                admissão e salário dos campeiros.
              </p>
              <p className="mt-2 max-w-3xl text-sm font-medium leading-6 text-emerald-800">
                Clique no nome do campeiro para visualizar as informações
                completas.
              </p>
            </div>

            <div className="flex w-full flex-col items-stretch gap-3 xl:w-auto xl:items-end">
              <Link
                to="/campeiros/novo"
                className="ag-button-primary inline-flex min-h-12 items-center justify-center rounded-lg border px-5 py-3 text-base font-semibold shadow-sm transition focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[var(--color-focus)] xl:self-end"
              >
                Cadastrar campeiro
              </Link>

              <Input
                placeholder="Buscar campeiro por nome, CPF ou telefone..."
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                className="md:min-w-[30rem] xl:min-w-[34rem]"
                inputClassName="h-12"
                icon={SearchIcon}
              />
            </div>
          </div>
        </div>

        {loading ? (
          <LoadingState />
        ) : filteredCampeiros.length === 0 ? (
          <EmptyState hasCampeiros={campeiros.length > 0} />
        ) : (
          <>
            <div className="hidden overflow-x-auto lg:block">
              <table className="min-w-full divide-y divide-emerald-950/8">
                <thead className="bg-emerald-50/65">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                      Nome
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                      Tempo de serviço
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                      Salário
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                      Admissão
                    </th>
                    <th className="w-[18rem] px-6 py-4 text-right text-xs font-semibold uppercase tracking-wide text-slate-500">
                      Ações
                    </th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-emerald-950/6">
                  {filteredCampeiros.map((campeiro) => (
                    <tr key={campeiro.id} className="hover:bg-emerald-50/40">
                      <td className="px-6 py-4 align-top">
                        <Link
                          to={`/campeiros/${campeiro.id}`}
                          className="font-semibold text-emerald-950 transition hover:text-emerald-700"
                        >
                          {campeiro.nome}
                        </Link>
                      </td>
                      <td className="px-6 py-4 align-top text-sm text-slate-700">
                        {formatServiceTime(campeiro.dataAdmissao)}
                      </td>
                      <td className="px-6 py-4 align-top text-sm text-slate-700">
                        {formatCurrency(campeiro.salario)}
                      </td>
                      <td className="px-6 py-4 align-top text-sm text-slate-700">
                        {formatDate(campeiro.dataAdmissao)}
                      </td>
                      <td className="w-[18rem] px-6 py-4 align-top text-right">
                        <div className="flex flex-wrap justify-end gap-2">
                          <ActionButtonLink to={`/campeiros/${campeiro.id}`}>
                            Ver detalhes
                          </ActionButtonLink>
                          <ActionButtonLink
                            to={`/campeiros/${campeiro.id}/editar`}
                          >
                            Editar
                          </ActionButtonLink>
                          <DangerActionButton
                            onClick={() => void handleDelete(campeiro)}
                          >
                            Excluir
                          </DangerActionButton>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="grid gap-4 px-5 py-5 lg:hidden">
              {filteredCampeiros.map((campeiro) => (
                <article
                  key={campeiro.id}
                  className="ag-surface rounded-lg border p-4"
                >
                  <Link
                    to={`/campeiros/${campeiro.id}`}
                    className="text-lg font-semibold text-emerald-950"
                  >
                    {campeiro.nome}
                  </Link>

                  <div className="mt-4 grid gap-3 sm:grid-cols-2">
                    <InfoPill
                      label="Tempo de serviço"
                      value={formatServiceTime(campeiro.dataAdmissao)}
                    />
                    <InfoPill
                      label="Salário"
                      value={formatCurrency(campeiro.salario)}
                    />
                    <InfoPill
                      label="Telefone"
                      value={campeiro.telefone || "Não informado"}
                    />
                    <InfoPill
                      label="Admissão"
                      value={formatDate(campeiro.dataAdmissao)}
                    />
                  </div>

                  <div className="mt-4 flex flex-wrap gap-2">
                    <ActionButtonLink to={`/campeiros/${campeiro.id}`}>
                      Ver detalhes
                    </ActionButtonLink>
                    <ActionButtonLink to={`/campeiros/${campeiro.id}/editar`}>
                      Editar
                    </ActionButtonLink>
                    <DangerActionButton
                      onClick={() => void handleDelete(campeiro)}
                    >
                      Excluir
                    </DangerActionButton>
                  </div>
                </article>
              ))}
            </div>
          </>
        )}
      </section>
    </div>
  );
}

function ActionButtonLink({ to, children }) {
  return (
    <Link
      to={to}
      className="ag-action-secondary inline-flex items-center justify-center rounded-lg px-3 py-2 text-sm font-semibold transition focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[var(--color-focus)]"
    >
      {children}
    </Link>
  );
}

function DangerActionButton({ onClick, children }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="ag-danger-action inline-flex items-center justify-center rounded-lg px-3 py-2 text-sm font-semibold transition focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[var(--color-focus)]"
    >
      {children}
    </button>
  );
}

function InfoPill({ label, value }) {
  return (
    <div className="ag-info-pill px-4 py-3">
      <p className="text-xs font-semibold uppercase tracking-wide text-[var(--color-text-muted)]">
        {label}
      </p>
      <p className="mt-2 text-sm font-medium text-[var(--color-text)]">{value}</p>
    </div>
  );
}

function EmptyState({ hasCampeiros }) {
  return (
    <div className="px-5 py-14 text-center sm:px-6">
      <p className="text-lg font-semibold text-emerald-950">
        {hasCampeiros
          ? "Nenhum campeiro corresponde à busca."
          : "Nenhum campeiro cadastrado ainda."}
      </p>
      <p className="mt-2 text-sm text-slate-600">
        {hasCampeiros
          ? "Ajuste os termos da busca para encontrar um campeiro existente."
          : "Quando a equipe for cadastrada, os campeiros aparecerão aqui com acesso às ações do módulo."}
      </p>

      {!hasCampeiros ? (
        <div className="mt-5">
          <Link
            to="/campeiros/novo"
            className="ag-button-primary inline-flex min-h-12 items-center justify-center rounded-lg border px-5 py-3 text-base font-semibold shadow-sm transition focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[var(--color-focus)]"
          >
            Cadastrar primeiro campeiro
          </Link>
        </div>
      ) : null}
    </div>
  );
}

function LoadingState() {
  return (
    <div className="px-5 py-5 sm:px-6">
      <div className="space-y-3">
        {Array.from({ length: 5 }).map((_, index) => (
          <div
            key={index}
            className="ag-skeleton h-16 animate-pulse rounded-lg"
          />
        ))}
      </div>
    </div>
  );
}

function SearchIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5 stroke-current" fill="none">
      <path
        d="M10.5 18a7.5 7.5 0 1 1 5.3-2.2L21 21"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export default Campeiros;
