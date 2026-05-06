import { useDeferredValue, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import FazendaGate from "../../components/FazendaGate";
import Input from "../../components/Input";
import StatusBanner from "../../components/StatusBanner";
import StatusChip from "../../components/StatusChip";
import { agroApi } from "../../services/api";
import { getApiErrorMessage } from "../../utils/apiError";
import { buildRemedioPayload } from "../../utils/remedioModule";
import { formatDate } from "../../utils/formatters";

function Remedios() {
  return (
    <FazendaGate>
      {(activeFazenda) => <RemediosContent activeFazenda={activeFazenda} />}
    </FazendaGate>
  );
}

function RemediosContent({ activeFazenda }) {
  const [search, setSearch] = useState("");
  const deferredSearch = useDeferredValue(search);
  const [remedios, setRemedios] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let isMounted = true;

    async function loadData() {
      try {
        setLoading(true);
        setError("");

        const remediosData = await agroApi.listRemedios();
        if (!isMounted) {
          return;
        }

        setRemedios(
          remediosData.filter((item) => item.fazendaId === activeFazenda.id),
        );
      } catch (err) {
        if (isMounted) {
          setError(
            getApiErrorMessage(
              err,
              "Não foi possível buscar os remédios no momento.",
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

  async function handleToggleStatus(remedio) {
    try {
      setError("");

      await agroApi.updateRemedio(
        remedio.id,
        buildRemedioPayload(remedio, {
          ativo: !remedio.ativo,
        }),
      );

      setRemedios((current) =>
        current.map((item) =>
          item.id === remedio.id ? { ...item, ativo: !item.ativo } : item,
        ),
      );
    } catch (err) {
      setError(
        getApiErrorMessage(
          err,
          "Não foi possível alterar o status do remédio.",
        ),
      );
    }
  }

  async function handleDelete(remedio) {
    const confirmed = window.confirm(
      `Deseja excluir o remédio "${remedio.nome}"? Essa ação não pode ser desfeita.`,
    );

    if (!confirmed) {
      return;
    }

    try {
      setError("");
      await agroApi.deleteRemedio(remedio.id);
      setRemedios((current) =>
        current.filter((item) => item.id !== remedio.id),
      );
    } catch (err) {
      setError(
        getApiErrorMessage(err, "Não foi possível excluir o remédio agora."),
      );
    }
  }

  const normalizedSearch = deferredSearch.trim().toLowerCase();
  const filteredRemedios = remedios.filter((remedio) =>
    [remedio.nome, remedio.descricao || ""]
      .join(" ")
      .toLowerCase()
      .includes(normalizedSearch),
  );

  return (
    <div className="space-y-5">
      {error ? (
        <StatusBanner
          title="Não foi possível carregar os remédios"
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
                Remédios cadastrados
              </h2>
              <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-600">
                Mantenha o catálogo de remédios da fazenda atualizado, com
                status, descrição e dose padrão para uso no manejo.
              </p>
              <div className="mt-2 max-w-3xl space-y-1 text-sm leading-6 text-emerald-800">
                <p>Remédios ativos aparecem para aplicação nos animais.</p>
                <p>
                  Ao desativar, o histórico permanece salvo, mas o remédio deixa
                  de aparecer nas novas aplicações.
                </p>
                <p>
                  A exclusão só fica disponível quando não houver aplicações
                  registradas para ele.
                </p>
              </div>
            </div>

            <div className="flex w-full flex-col items-stretch gap-3 xl:w-auto xl:items-end">
              <Link
                to="/remedios/novo"
                className="ag-button-primary inline-flex min-h-12 items-center justify-center rounded-lg border px-5 py-3 text-base font-semibold shadow-sm transition focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[var(--color-focus)] xl:self-end"
              >
                Cadastrar remédio
              </Link>

              <Input
                placeholder="Buscar remédio..."
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
        ) : filteredRemedios.length === 0 ? (
          <EmptyState hasRemedios={remedios.length > 0} />
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
                      Descrição
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                      Status
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                      Data cadastro
                    </th>
                    <th className="w-[22rem] px-6 py-4 text-right text-xs font-semibold uppercase tracking-wide text-slate-500">
                      Ações
                    </th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-emerald-950/6">
                  {filteredRemedios.map((remedio) => (
                    <tr key={remedio.id} className="hover:bg-emerald-50/40">
                      <td className="px-6 py-4 align-top font-semibold text-emerald-950">
                        {remedio.nome}
                      </td>
                      <td className="px-6 py-4 align-top text-sm text-slate-700">
                        {remedio.descricao || "Não informada"}
                      </td>
                      <td className="px-6 py-4 align-top text-sm text-slate-700">
                        <StatusChip active={remedio.ativo} />
                      </td>
                      <td className="px-6 py-4 align-top text-sm text-slate-700">
                        {formatDate(remedio.dataCadastro)}
                      </td>
                      <td className="w-[22rem] px-6 py-4 align-top text-right">
                        <div className="flex flex-wrap justify-end gap-2">
                          <ActionButtonLink
                            to={`/remedios/${remedio.id}/editar`}
                          >
                            Editar
                          </ActionButtonLink>
                          <ActionButton
                            onClick={() => void handleToggleStatus(remedio)}
                          >
                            {remedio.ativo ? "Desativar" : "Ativar"}
                          </ActionButton>
                          <DangerActionButton
                            onClick={() => void handleDelete(remedio)}
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
              {filteredRemedios.map((remedio) => (
                <article
                  key={remedio.id}
                  className="ag-surface rounded-lg border p-4"
                >
                  <h3 className="text-lg font-semibold text-emerald-950">
                    {remedio.nome}
                  </h3>

                  <div className="mt-3">
                    <StatusChip active={remedio.ativo} />
                  </div>

                  <div className="mt-4 grid gap-3">
                    <InfoPill
                      label="Descrição"
                      value={remedio.descricao || "Não informada"}
                    />
                    <InfoPill
                      label="Data cadastro"
                      value={formatDate(remedio.dataCadastro)}
                    />
                  </div>

                  <div className="mt-4 flex flex-wrap gap-2">
                    <ActionButtonLink to={`/remedios/${remedio.id}/editar`}>
                      Editar
                    </ActionButtonLink>
                    <ActionButton
                      onClick={() => void handleToggleStatus(remedio)}
                    >
                      {remedio.ativo ? "Desativar" : "Ativar"}
                    </ActionButton>
                    <DangerActionButton
                      onClick={() => void handleDelete(remedio)}
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

function ActionButton({ onClick, children }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="ag-action-secondary inline-flex items-center justify-center rounded-lg px-3 py-2 text-sm font-semibold transition focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[var(--color-focus)]"
    >
      {children}
    </button>
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

function EmptyState({ hasRemedios }) {
  return (
    <div className="px-5 py-14 text-center sm:px-6">
      <p className="text-lg font-semibold text-emerald-950">
        {hasRemedios
          ? "Nenhum remédio corresponde à busca."
          : "Nenhum remédio cadastrado ainda."}
      </p>
      <p className="mt-2 text-sm text-slate-600">
        {hasRemedios
          ? "Ajuste os termos da busca para encontrar um remédio existente."
          : "Quando os remédios forem cadastrados, eles aparecerão aqui com acesso às ações do módulo."}
      </p>

      {!hasRemedios ? (
        <div className="mt-5">
          <Link
            to="/remedios/novo"
            className="ag-button-primary inline-flex min-h-12 items-center justify-center rounded-lg border px-5 py-3 text-base font-semibold shadow-sm transition focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[var(--color-focus)]"
          >
            Cadastrar primeiro remédio
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

export default Remedios;
