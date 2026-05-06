import { useDeferredValue, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import FazendaGate from "../../components/FazendaGate";
import Input from "../../components/Input";
import StatusBanner from "../../components/StatusBanner";
import { agroApi } from "../../services/api";
import { getApiErrorMessage } from "../../utils/apiError";
import { getLocalDisplay } from "../../utils/animalModule";
import { formatDate, formatWeight } from "../../utils/formatters";

function Animais() {
  return (
    <FazendaGate>
      {(activeFazenda) => <AnimaisContent activeFazenda={activeFazenda} />}
    </FazendaGate>
  );
}

function AnimaisContent({ activeFazenda }) {
  const [search, setSearch] = useState("");
  const deferredSearch = useDeferredValue(search);
  const [animais, setAnimais] = useState([]);
  const [pastos, setPastos] = useState([]);
  const [currais, setCurrais] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let isMounted = true;

    async function loadData() {
      try {
        setLoading(true);
        setError("");

        const [animaisData, pastosData, curraisData] = await Promise.all([
          agroApi.listAnimais(),
          agroApi.listPastos(),
          agroApi.listCurrais(),
        ]);

        if (!isMounted) {
          return;
        }

        setAnimais(
          animaisData.filter((item) => item.fazendaId === activeFazenda.id),
        );
        setPastos(pastosData.filter((item) => item.fazendaId === activeFazenda.id));
        setCurrais(
          curraisData.filter((item) => item.fazendaId === activeFazenda.id),
        );
      } catch (err) {
        if (isMounted) {
          setError(
            getApiErrorMessage(
              err,
              "Não foi possível buscar os animais no momento.",
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
  const filteredAnimals = animais.filter((animal) => {
    if (!normalizedSearch) {
      return true;
    }

    const localAtual = getLocalDisplay(
      animal.tipoLocalAtual,
      animal.localAtualId,
      pastos,
      currais,
    );

    return [animal.nome, animal.tipoAnimal, localAtual]
      .join(" ")
      .toLowerCase()
      .includes(normalizedSearch);
  });

  return (
    <div className="space-y-5">
      {error ? (
        <StatusBanner
          title="Não foi possível carregar os animais"
          message={error}
        />
      ) : null}

      <section className="ag-surface overflow-visible rounded-lg border">
        <div className="flex flex-col gap-4 border-b border-emerald-950/8 px-5 py-5 sm:px-6">
          <div className="flex flex-col gap-4 xl:flex-row xl:items-end xl:justify-between">
            <div>
              <div className="ag-page-kicker inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-wide">
                Fazenda ativa: {activeFazenda.nome}
              </div>
              <h2 className="mt-3 text-2xl font-bold text-emerald-950">
                Animais cadastrados
              </h2>
              <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-600">
                Consulte o rebanho, acesse o histórico individual e siga para as
                rotas de edição, movimentação e aplicação de remédio.
              </p>
              <p className="mt-2 max-w-3xl text-sm font-medium leading-6 text-emerald-800">
                Clique no nome do animal para visualizar as informações completas.
              </p>
            </div>

            <div className="flex w-full flex-col items-stretch gap-3 xl:w-auto xl:items-end">
              <Link
                to="/animais/novo"
                className="ag-button-primary inline-flex min-h-12 items-center justify-center rounded-lg border px-5 py-3 text-base font-semibold shadow-sm transition focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[var(--color-focus)] xl:self-end"
              >
                Cadastrar animal
              </Link>

              <Input
                placeholder="Buscar animal por nome, tipo ou local..."
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
        ) : filteredAnimals.length === 0 ? (
          <EmptyState hasAnimals={animais.length > 0} />
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
                      Tipo
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                      Peso
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                      Local atual
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                      Cadastro
                    </th>
                    <th className="w-[24rem] px-6 py-4 text-right text-xs font-semibold uppercase tracking-wide text-slate-500">
                      Ações
                    </th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-emerald-950/6">
                  {filteredAnimals.map((animal) => (
                    <tr key={animal.id} className="hover:bg-emerald-50/40">
                      <td className="px-6 py-4 align-top">
                        <Link
                          to={`/animais/${animal.id}`}
                          className="font-semibold text-emerald-950 transition hover:text-emerald-700"
                        >
                          {animal.nome}
                        </Link>
                      </td>
                      <td className="px-6 py-4 align-top text-sm text-slate-700">
                        {animal.tipoAnimal}
                      </td>
                      <td className="px-6 py-4 align-top text-sm text-slate-700">
                        {formatWeight(animal.peso)}
                      </td>
                      <td className="px-6 py-4 align-top text-sm text-slate-700">
                        {getLocalDisplay(
                          animal.tipoLocalAtual,
                          animal.localAtualId,
                          pastos,
                          currais,
                        )}
                      </td>
                      <td className="px-6 py-4 align-top text-sm text-slate-700">
                        {formatDate(animal.dataCadastro)}
                      </td>
                      <td className="w-[24rem] px-6 py-4 align-top text-right">
                        <AnimalActions animalId={animal.id} />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="grid gap-4 px-5 py-5 lg:hidden">
              {filteredAnimals.map((animal) => (
                <article
                  key={animal.id}
                  className="ag-surface rounded-lg border p-4"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <Link
                        to={`/animais/${animal.id}`}
                        className="text-lg font-semibold text-emerald-950"
                      >
                        {animal.nome}
                      </Link>
                      <p className="mt-1 text-sm text-slate-500">
                        {animal.tipoAnimal} • {formatWeight(animal.peso)}
                      </p>
                    </div>

                    <AnimalActions animalId={animal.id} compact />
                  </div>

                  <div className="mt-4 grid gap-3 sm:grid-cols-2">
                    <InfoPill
                      label="Local atual"
                      value={getLocalDisplay(
                        animal.tipoLocalAtual,
                        animal.localAtualId,
                        pastos,
                        currais,
                      )}
                    />
                    <InfoPill
                      label="Cadastro"
                      value={formatDate(animal.dataCadastro)}
                    />
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

function AnimalActions({ animalId, compact = false }) {
  if (!compact) {
    return (
      <div className="flex flex-wrap justify-end gap-2">
        <InlineActionLink to={`/animais/${animalId}`}>Ver detalhes</InlineActionLink>
        <InlineActionLink to={`/animais/${animalId}/editar`}>Editar</InlineActionLink>
        <InlineActionLink to={`/animais/${animalId}/movimentar`}>
          Movimentar
        </InlineActionLink>
        <InlineActionLink to={`/animais/${animalId}/aplicar-remedio`}>
          Aplicar remédio
        </InlineActionLink>
      </div>
    );
  }

  return (
    <details className="relative inline-block text-left">
      <summary
        className="ag-action-secondary list-none cursor-pointer rounded-lg px-2.5 py-2 text-xs font-semibold shadow-sm transition focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[var(--color-focus)]"
      >
        Ações
      </summary>

      <div className="ag-surface absolute right-0 top-full z-30 mt-2 min-w-56 overflow-hidden rounded-lg border">
        <ActionLink to={`/animais/${animalId}`}>Ver detalhes</ActionLink>
        <ActionLink to={`/animais/${animalId}/editar`}>Editar</ActionLink>
        <ActionLink to={`/animais/${animalId}/movimentar`}>
          Movimentar
        </ActionLink>
        <ActionLink to={`/animais/${animalId}/aplicar-remedio`}>
          Aplicar remédio
        </ActionLink>
      </div>
    </details>
  );
}

function InlineActionLink({ to, children }) {
  return (
    <Link
      to={to}
      className="ag-action-secondary inline-flex items-center justify-center rounded-lg px-3 py-2 text-sm font-semibold transition focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[var(--color-focus)]"
    >
      {children}
    </Link>
  );
}

function ActionLink({ to, children }) {
  return (
    <Link
      to={to}
      className="block border-b border-[var(--color-border)] px-4 py-3 text-sm font-medium text-[var(--color-text)] transition last:border-b-0 hover:bg-[var(--color-surface-hover)] hover:text-[var(--color-primary)]"
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

function EmptyState({ hasAnimals }) {
  return (
    <div className="px-5 py-14 text-center sm:px-6">
      <p className="text-lg font-semibold text-emerald-950">
        {hasAnimals
          ? "Nenhum animal corresponde à busca."
          : "Nenhum animal cadastrado ainda."}
      </p>
      <p className="mt-2 text-sm text-slate-600">
        {hasAnimals
          ? "Ajuste os termos da busca para encontrar um registro existente."
          : "Quando o rebanho começar a ser cadastrado, ele aparecerá aqui com acesso às rotas do módulo."}
      </p>

      {!hasAnimals ? (
        <div className="mt-5">
          <Link
            to="/animais/novo"
            className="ag-button-primary inline-flex min-h-12 items-center justify-center rounded-lg border px-5 py-3 text-base font-semibold shadow-sm transition focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[var(--color-focus)]"
          >
            Cadastrar primeiro animal
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

export default Animais;
