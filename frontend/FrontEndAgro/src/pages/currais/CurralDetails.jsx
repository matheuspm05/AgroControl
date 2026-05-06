import { useDeferredValue, useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import FazendaGate from "../../components/FazendaGate";
import Input from "../../components/Input";
import OccupancyPill from "../../components/OccupancyPill";
import StatusBanner from "../../components/StatusBanner";
import { agroApi } from "../../services/api";
import { getApiErrorMessage } from "../../utils/apiError";
import { formatDate, formatWeight } from "../../utils/formatters";

function CurralDetails() {
  return (
    <FazendaGate>
      {(activeFazenda) => (
        <CurralDetailsContent activeFazenda={activeFazenda} />
      )}
    </FazendaGate>
  );
}

function CurralDetailsContent({ activeFazenda }) {
  const { curralId } = useParams();
  const [search, setSearch] = useState("");
  const deferredSearch = useDeferredValue(search);
  const [curral, setCurral] = useState(null);
  const [animais, setAnimais] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let isMounted = true;

    async function loadData() {
      try {
        setLoading(true);
        setError("");

        const [curralData, animaisData] = await Promise.all([
          agroApi.getCurral(curralId),
          agroApi.getCurralAnimais(curralId),
        ]);

        if (!isMounted) {
          return;
        }

        setCurral(curralData);
        setAnimais(animaisData);
      } catch (err) {
        if (isMounted) {
          setError(
            getApiErrorMessage(
              err,
              "Não foi possível carregar os detalhes do curral.",
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
  }, [curralId]);

  const normalizedSearch = deferredSearch.trim().toLowerCase();
  const filteredAnimals = animais.filter((animal) =>
    [animal.nome, animal.tipoAnimal]
      .join(" ")
      .toLowerCase()
      .includes(normalizedSearch),
  );

  return (
    <div className="space-y-5">
      {error ? (
        <StatusBanner
          title="Não foi possível carregar o curral"
          message={error}
        />
      ) : null}

      {curral && curral.fazendaId !== activeFazenda.id ? (
        <StatusBanner
          variant="info"
          title="Registro fora da fazenda ativa"
          message="O detalhe foi aberto com sucesso, mas o layout continua apontando para outra fazenda ativa no ambiente."
        />
      ) : null}

      {loading ? (
        <DetailLoading />
      ) : curral ? (
        <>
          <section className="overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm">
            <div className="flex flex-col gap-5 border-b border-emerald-950/8 px-5 py-5 sm:px-6 xl:flex-row xl:items-start xl:justify-between">
              <div>
                <p className="text-sm font-semibold uppercase tracking-wide text-emerald-700">
                  Curral
                </p>
                <h2 className="mt-2 text-3xl font-bold text-emerald-950">
                  {curral.nome}
                </h2>
                <p className="mt-3 text-base text-slate-600">
                  Capacidade:{" "}
                  <span className="font-semibold text-emerald-950">
                    {curral.capacidadeMaxima ?? "Não informada"}
                  </span>
                </p>
                <div className="mt-3">
                  <OccupancyPill
                    capacidadeMaxima={curral.capacidadeMaxima}
                    ocupacaoAtual={animais.length}
                  />
                </div>
              </div>

              <div className="grid gap-3 sm:grid-cols-2 xl:w-auto">
                <ActionLink to="/currais" variant="secondary">
                  Voltar para currais
                </ActionLink>
                <ActionLink
                  to={`/currais/${curral.id}/editar`}
                  variant="secondary"
                >
                  Editar
                </ActionLink>
              </div>
            </div>

            <div className="grid gap-4 px-5 py-5 sm:px-6 lg:grid-cols-2 xl:grid-cols-4">
              <SummaryCard label="Fazenda" value={`#${curral.fazendaId}`} />
              <SummaryCard
                label="Capacidade máxima"
                value={curral.capacidadeMaxima ?? "Não informada"}
              />
              <SummaryCard
                label="Animais no curral"
                value={String(animais.length)}
              />
              <SummaryCard
                label="Cadastro"
                value={formatDate(curral.dataCadastro)}
              />
            </div>
          </section>

          <section className="overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm">
            <div className="flex flex-col gap-4 border-b border-emerald-950/8 px-5 py-5 sm:px-6">
              <div className="flex flex-col gap-4 xl:flex-row xl:items-end xl:justify-between">
                <div>
                  <h3 className="text-2xl font-bold text-emerald-950">
                    Animais no curral
                  </h3>
                  <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-600">
                    Consulte os animais atualmente alocados neste curral e siga
                    para os fluxos de detalhe ou movimentação quando precisar.
                  </p>
                </div>

                <Input
                  placeholder="Buscar animal..."
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                  className="xl:min-w-80"
                  inputClassName="h-12"
                  icon={SearchIcon}
                />
              </div>
            </div>

            {filteredAnimals.length === 0 ? (
              <div className="px-5 py-12 text-center sm:px-6">
                <p className="text-lg font-semibold text-emerald-950">
                  {animais.length > 0
                    ? "Nenhum animal corresponde à busca."
                    : "Nenhum animal está neste curral agora."}
                </p>
                <p className="mt-2 text-sm text-slate-600">
                  {animais.length > 0
                    ? "Ajuste os termos para encontrar um animal já vinculado ao curral."
                    : "Quando houver animais com local atual neste curral, eles aparecerão aqui."}
                </p>
              </div>
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
                        <th className="w-[18rem] px-6 py-4 text-right text-xs font-semibold uppercase tracking-wide text-slate-500">
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
                            <AnimalTypeBadge type={animal.tipoAnimal} />
                          </td>
                          <td className="px-6 py-4 align-top text-sm text-slate-700">
                            {formatWeight(animal.peso)}
                          </td>
                          <td className="w-[18rem] px-6 py-4 align-top text-right">
                            <div className="flex flex-wrap justify-end gap-2">
                              <DesktopAnimalLink to={`/animais/${animal.id}`}>
                                Ver detalhes
                              </DesktopAnimalLink>
                              <DesktopAnimalLink
                                to={`/animais/${animal.id}/movimentar`}
                              >
                                Movimentar
                              </DesktopAnimalLink>
                            </div>
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
                      className="rounded-lg border border-emerald-950/8 bg-white p-4 shadow-sm"
                    >
                      <Link
                        to={`/animais/${animal.id}`}
                        className="text-lg font-semibold text-emerald-950"
                      >
                        {animal.nome}
                      </Link>

                      <div className="mt-3 flex flex-wrap gap-2">
                        <AnimalTypeBadge type={animal.tipoAnimal} />
                        <span className="rounded-full bg-slate-100 px-3 py-1 text-sm font-medium text-slate-700">
                          {formatWeight(animal.peso)}
                        </span>
                      </div>

                      <div className="mt-4 flex flex-wrap gap-2">
                        <DesktopAnimalLink to={`/animais/${animal.id}`}>
                          Ver detalhes
                        </DesktopAnimalLink>
                        <DesktopAnimalLink to={`/animais/${animal.id}/movimentar`}>
                          Movimentar
                        </DesktopAnimalLink>
                      </div>
                    </article>
                  ))}
                </div>
              </>
            )}
          </section>
        </>
      ) : (
        <section className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="text-xl font-bold text-emerald-950">
            Curral não encontrado
          </h2>
          <p className="mt-3 text-base leading-7 text-slate-600">
            O registro solicitado não existe mais ou ainda não foi criado neste
            ambiente.
          </p>
          <div className="mt-5">
            <Link
              to="/currais"
              className="inline-flex items-center justify-center rounded-lg bg-emerald-800 px-5 py-3 text-base font-semibold text-white shadow-sm transition hover:bg-emerald-700"
            >
              Voltar para a listagem
            </Link>
          </div>
        </section>
      )}
    </div>
  );
}

function ActionLink({ to, children, variant = "secondary" }) {
  const styles = {
    primary: "bg-emerald-800 text-white shadow-sm hover:bg-emerald-700",
    secondary:
      "border border-emerald-950/15 bg-white text-emerald-950 hover:bg-emerald-50",
  };

  return (
    <Link
      to={to}
      className={`inline-flex items-center justify-center rounded-lg px-5 py-3 text-base font-semibold transition ${styles[variant]}`}
    >
      {children}
    </Link>
  );
}

function DesktopAnimalLink({ to, children }) {
  return (
    <Link
      to={to}
      className="inline-flex items-center justify-center rounded-lg border border-emerald-950/12 bg-white px-3 py-2 text-sm font-semibold text-emerald-900 transition hover:border-emerald-700/25 hover:bg-emerald-50"
    >
      {children}
    </Link>
  );
}

function SummaryCard({ label, value }) {
  return (
    <div className="rounded-lg border border-slate-200 bg-slate-50 px-4 py-4">
      <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
        {label}
      </p>
      <p className="mt-2 text-base font-semibold text-emerald-950">{value}</p>
    </div>
  );
}

function AnimalTypeBadge({ type }) {
  return (
    <span className="inline-flex items-center rounded-full bg-lime-100 px-3 py-1 text-sm font-semibold text-lime-900">
      {type}
    </span>
  );
}

function DetailLoading() {
  return (
    <>
      <section className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
        <div className="space-y-4">
          <div className="ag-skeleton h-8 w-48 animate-pulse rounded" />
          <div className="ag-skeleton h-6 w-72 animate-pulse rounded" />
          <div className="ag-skeleton h-20 animate-pulse rounded-lg" />
        </div>
      </section>

      <section className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
        <div className="ag-skeleton h-64 animate-pulse rounded-lg" />
      </section>
    </>
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

export default CurralDetails;
