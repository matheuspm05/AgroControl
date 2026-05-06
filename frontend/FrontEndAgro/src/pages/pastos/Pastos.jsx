import { useDeferredValue, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import FazendaGate from "../../components/FazendaGate";
import Input from "../../components/Input";
import StatusBanner from "../../components/StatusBanner";
import { agroApi } from "../../services/api";
import { getApiErrorMessage } from "../../utils/apiError";
import { formatArea, formatDate } from "../../utils/formatters";

function Pastos() {
  return (
    <FazendaGate>
      {(activeFazenda) => <PastosContent activeFazenda={activeFazenda} />}
    </FazendaGate>
  );
}

function PastosContent({ activeFazenda }) {
  const [search, setSearch] = useState("");
  const deferredSearch = useDeferredValue(search);
  const [pastos, setPastos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let isMounted = true;

    async function loadData() {
      try {
        setLoading(true);
        setError("");

        const pastosData = await agroApi.listPastos();
        if (!isMounted) {
          return;
        }

        setPastos(
          pastosData.filter((item) => item.fazendaId === activeFazenda.id),
        );
      } catch (err) {
        if (isMounted) {
          setError(
            getApiErrorMessage(
              err,
              "Não foi possível buscar os pastos no momento.",
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

  const normalizedSearch = deferredSearch.trim().toLowerCase();
  const filteredPastos = pastos.filter((pasto) =>
    [pasto.nome, pasto.tipoVegetacao || ""]
      .join(" ")
      .toLowerCase()
      .includes(normalizedSearch),
  );

  return (
    <div className="space-y-5">
      {error ? (
        <StatusBanner
          title="Não foi possível carregar os pastos"
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
                Pastos cadastrados
              </h2>
              <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-600">
                Organize os locais de manejo da fazenda, acompanhe área e
                vegetação e entre nos detalhes para ver os animais do pasto.
              </p>
              <p className="mt-2 max-w-3xl text-sm font-medium leading-6 text-emerald-800">
                Clique no nome do pasto para visualizar os animais vinculados e
                mais informações.
              </p>
            </div>

            <div className="flex w-full flex-col items-stretch gap-3 xl:w-auto xl:items-end">
              <Link
                to="/pastos/novo"
                className="ag-button-primary inline-flex min-h-12 items-center justify-center rounded-lg border px-5 py-3 text-base font-semibold shadow-sm transition focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[var(--color-focus)] xl:self-end"
              >
                Cadastrar pasto
              </Link>

              <Input
                placeholder="Buscar pasto por nome ou vegetação..."
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
        ) : filteredPastos.length === 0 ? (
          <EmptyState hasPastos={pastos.length > 0} />
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
                      Tamanho
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                      Tipo de vegetação
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                      Cadastro
                    </th>
                    <th className="w-[16rem] px-6 py-4 text-right text-xs font-semibold uppercase tracking-wide text-slate-500">
                      Ações
                    </th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-emerald-950/6">
                  {filteredPastos.map((pasto) => (
                    <tr key={pasto.id} className="hover:bg-emerald-50/40">
                      <td className="px-6 py-4 align-top">
                        <Link
                          to={`/pastos/${pasto.id}`}
                          className="font-semibold text-emerald-950 transition hover:text-emerald-700"
                        >
                          {pasto.nome}
                        </Link>
                      </td>
                      <td className="px-6 py-4 align-top text-sm text-slate-700">
                        {formatArea(pasto.tamanho)}
                      </td>
                      <td className="px-6 py-4 align-top text-sm text-slate-700">
                        {pasto.tipoVegetacao || "Não informado"}
                      </td>
                      <td className="px-6 py-4 align-top text-sm text-slate-700">
                        {formatDate(pasto.dataCadastro)}
                      </td>
                      <td className="w-[16rem] px-6 py-4 align-top text-right">
                        <PastoActionButtons pastoId={pasto.id} />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="grid gap-4 px-5 py-5 lg:hidden">
              {filteredPastos.map((pasto) => (
                <article
                  key={pasto.id}
                  className="ag-surface rounded-lg border p-4"
                >
                  <Link
                    to={`/pastos/${pasto.id}`}
                    className="text-lg font-semibold text-emerald-950"
                  >
                    {pasto.nome}
                  </Link>

                  <div className="mt-4 grid gap-3 sm:grid-cols-2">
                    <InfoPill label="Tamanho" value={formatArea(pasto.tamanho)} />
                    <InfoPill
                      label="Vegetação"
                      value={pasto.tipoVegetacao || "Não informado"}
                    />
                    <InfoPill
                      label="Cadastro"
                      value={formatDate(pasto.dataCadastro)}
                    />
                  </div>

                  <div className="mt-4 flex flex-wrap gap-2">
                    <MobileActionLink to={`/pastos/${pasto.id}`}>
                      Ver detalhes
                    </MobileActionLink>
                    <MobileActionLink to={`/pastos/${pasto.id}/editar`}>
                      Editar
                    </MobileActionLink>
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

function PastoActionButtons({ pastoId }) {
  return (
    <div className="flex flex-wrap justify-end gap-2">
      <DesktopActionLink to={`/pastos/${pastoId}`}>Ver detalhes</DesktopActionLink>
      <DesktopActionLink to={`/pastos/${pastoId}/editar`}>Editar</DesktopActionLink>
    </div>
  );
}

function DesktopActionLink({ to, children }) {
  return (
    <Link
      to={to}
      className="ag-action-secondary inline-flex items-center justify-center rounded-lg px-3 py-2 text-sm font-semibold transition focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[var(--color-focus)]"
    >
      {children}
    </Link>
  );
}

function MobileActionLink({ to, children }) {
  return (
    <Link
      to={to}
      className="ag-action-secondary inline-flex items-center justify-center rounded-lg px-3 py-2 text-sm font-semibold transition focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[var(--color-focus)]"
    >
      {children}
    </Link>
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

function EmptyState({ hasPastos }) {
  return (
    <div className="px-5 py-14 text-center sm:px-6">
      <p className="text-lg font-semibold text-emerald-950">
        {hasPastos
          ? "Nenhum pasto corresponde à busca."
          : "Nenhum pasto cadastrado ainda."}
      </p>
      <p className="mt-2 text-sm text-slate-600">
        {hasPastos
          ? "Ajuste os termos da busca para encontrar um pasto existente."
          : "Quando os pastos forem cadastrados, eles aparecerão aqui com acesso às páginas de detalhe e edição."}
      </p>

      {!hasPastos ? (
        <div className="mt-5">
          <Link
            to="/pastos/novo"
            className="ag-button-primary inline-flex min-h-12 items-center justify-center rounded-lg border px-5 py-3 text-base font-semibold shadow-sm transition focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[var(--color-focus)]"
          >
            Cadastrar primeiro pasto
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

export default Pastos;
