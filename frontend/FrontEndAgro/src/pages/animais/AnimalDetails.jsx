import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import FazendaGate from "../../components/FazendaGate";
import StatusBanner from "../../components/StatusBanner";
import { agroApi } from "../../services/api";
import { getApiErrorMessage } from "../../utils/apiError";
import { getLocalDisplay, getLocalName } from "../../utils/animalModule";
import { formatDate, formatWeight } from "../../utils/formatters";

function AnimalDetails() {
  return (
    <FazendaGate>
      {(activeFazenda) => <AnimalDetailsContent activeFazenda={activeFazenda} />}
    </FazendaGate>
  );
}

function AnimalDetailsContent({ activeFazenda }) {
  const { animalId } = useParams();
  const [animal, setAnimal] = useState(null);
  const [pastos, setPastos] = useState([]);
  const [currais, setCurrais] = useState([]);
  const [remedios, setRemedios] = useState([]);
  const [movimentacoes, setMovimentacoes] = useState([]);
  const [aplicacoes, setAplicacoes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let isMounted = true;

    async function loadData() {
      try {
        setLoading(true);
        setError("");

        const [
          animalData,
          pastosData,
          curraisData,
          remediosData,
          movimentacoesData,
          aplicacoesData,
        ] = await Promise.all([
          agroApi.getAnimal(animalId),
          agroApi.listPastos(),
          agroApi.listCurrais(),
          agroApi.listRemedios(),
          agroApi.listMovimentacoesAnimais(),
          agroApi.listAplicacoesRemedio(),
        ]);

        if (!isMounted) {
          return;
        }

        setAnimal(animalData);
        setPastos(pastosData);
        setCurrais(curraisData);
        setRemedios(remediosData);
        setMovimentacoes(
          movimentacoesData
            .filter((item) => item.animalId === animalData.id)
            .sort(
              (first, second) =>
                new Date(second.dataMovimentacao) -
                new Date(first.dataMovimentacao),
            ),
        );
        setAplicacoes(
          aplicacoesData
            .filter((item) => item.animalId === animalData.id)
            .sort(
              (first, second) =>
                new Date(second.dataAplicacao) - new Date(first.dataAplicacao),
            ),
        );
      } catch (err) {
        if (isMounted) {
          setError(
            getApiErrorMessage(
              err,
              "Não foi possível carregar os detalhes do animal.",
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
  }, [animalId]);

  return (
    <div className="space-y-5">
      {error ? (
        <StatusBanner
          title="Não foi possível carregar o animal"
          message={error}
        />
      ) : null}

      {animal && animal.fazendaId !== activeFazenda.id ? (
        <StatusBanner
          variant="info"
          title="Registro fora da fazenda ativa"
          message="O detalhe foi aberto com sucesso, mas o layout continua apontando para outra fazenda ativa no ambiente."
        />
      ) : null}

      {loading ? (
        <DetailLoading />
      ) : animal ? (
        <>
          <section className="overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm">
            <div className="flex flex-col gap-5 border-b border-emerald-950/8 px-5 py-5 sm:px-6 xl:flex-row xl:items-start xl:justify-between">
              <div>
                <p className="text-sm font-semibold uppercase tracking-wide text-emerald-700">
                  Animal
                </p>
                <h2 className="mt-2 text-3xl font-bold text-emerald-950">
                  {animal.nome}
                </h2>
                <p className="mt-3 text-base text-slate-600">
                  {animal.tipoAnimal} • {formatWeight(animal.peso)} •{" "}
                  {animal.dataNascimento
                    ? formatDate(animal.dataNascimento)
                    : "Nascimento não informado"}
                </p>
                <p className="mt-2 text-base text-slate-600">
                  Local atual:{" "}
                  <span className="font-semibold text-emerald-950">
                    {getLocalDisplay(
                      animal.tipoLocalAtual,
                      animal.localAtualId,
                      pastos,
                      currais,
                    )}
                  </span>
                </p>
              </div>

              <div className="grid gap-3 sm:grid-cols-2 xl:w-auto xl:grid-cols-4">
                <ActionLink to="/animais" variant="secondary">
                  Voltar para animais
                </ActionLink>
                <ActionLink to={`/animais/${animal.id}/editar`} variant="secondary">
                  Editar
                </ActionLink>
                <ActionLink
                  to={`/animais/${animal.id}/movimentar`}
                  variant="secondary"
                >
                  Movimentar
                </ActionLink>
                <ActionLink
                  to={`/animais/${animal.id}/aplicar-remedio`}
                  variant="primary"
                >
                  Aplicar remédio
                </ActionLink>
              </div>
            </div>

            <div className="grid gap-4 px-5 py-5 sm:px-6 lg:grid-cols-2 xl:grid-cols-4">
              <SummaryCard label="Fazenda" value={`#${animal.fazendaId}`} />
              <SummaryCard
                label="Local atual"
                value={getLocalName(
                  animal.tipoLocalAtual,
                  animal.localAtualId,
                  pastos,
                  currais,
                )}
              />
              <SummaryCard
                label="Nascimento"
                value={
                  animal.dataNascimento
                    ? formatDate(animal.dataNascimento)
                    : "Não informado"
                }
              />
              <SummaryCard
                label="Cadastro"
                value={formatDate(animal.dataCadastro)}
              />
            </div>
          </section>

          <HistorySection
            title="Histórico de movimentações"
            emptyMessage="Nenhuma movimentação registrada para este animal."
            columns={["Data", "Origem", "Destino", "Observação"]}
            rows={movimentacoes}
            renderRow={(item) => (
              <tr key={item.id} className="border-t border-slate-100">
                <HistoryCell>{formatDate(item.dataMovimentacao)}</HistoryCell>
                <HistoryCell>
                  {item.origemTipoLocal && item.origemLocalId
                    ? getLocalDisplay(
                        item.origemTipoLocal,
                        item.origemLocalId,
                        pastos,
                        currais,
                      )
                    : "Cadastro inicial"}
                </HistoryCell>
                <HistoryCell>
                  {getLocalDisplay(
                    item.destinoTipoLocal,
                    item.destinoLocalId,
                    pastos,
                    currais,
                  )}
                </HistoryCell>
                <HistoryCell>{item.observacao || "—"}</HistoryCell>
              </tr>
            )}
            renderMobileCard={(item) => (
              <>
                <MobileField
                  label="Data"
                  value={formatDate(item.dataMovimentacao)}
                />
                <MobileField
                  label="Origem"
                  value={
                    item.origemTipoLocal && item.origemLocalId
                      ? getLocalDisplay(
                          item.origemTipoLocal,
                          item.origemLocalId,
                          pastos,
                          currais,
                        )
                      : "Cadastro inicial"
                  }
                />
                <MobileField
                  label="Destino"
                  value={getLocalDisplay(
                    item.destinoTipoLocal,
                    item.destinoLocalId,
                    pastos,
                    currais,
                  )}
                />
                <MobileField
                  label="Observação"
                  value={item.observacao || "—"}
                />
              </>
            )}
          />

          <HistorySection
            title="Aplicações de remédio"
            emptyMessage="Nenhuma aplicação de remédio registrada para este animal."
            columns={["Data", "Remédio", "Dose", "Observação"]}
            rows={aplicacoes}
            renderRow={(item) => (
              <tr key={item.id} className="border-t border-slate-100">
                <HistoryCell>{formatDate(item.dataAplicacao)}</HistoryCell>
                <HistoryCell>
                  {remedios.find((remedio) => remedio.id === item.remedioId)?.nome ||
                    `Remédio #${item.remedioId}`}
                </HistoryCell>
                <HistoryCell>{item.doseAplicada} ml</HistoryCell>
                <HistoryCell>{item.observacao || "—"}</HistoryCell>
              </tr>
            )}
            renderMobileCard={(item) => (
              <>
                <MobileField
                  label="Data"
                  value={formatDate(item.dataAplicacao)}
                />
                <MobileField
                  label="Remédio"
                  value={
                    remedios.find((remedio) => remedio.id === item.remedioId)?.nome ||
                    `Remédio #${item.remedioId}`
                  }
                />
                <MobileField label="Dose" value={`${item.doseAplicada} ml`} />
                <MobileField
                  label="Observação"
                  value={item.observacao || "—"}
                />
              </>
            )}
          />
        </>
      ) : (
        <section className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="text-xl font-bold text-emerald-950">
            Animal não encontrado
          </h2>
          <p className="mt-3 text-base leading-7 text-slate-600">
            O registro solicitado não existe mais ou ainda não foi criado neste
            ambiente.
          </p>
          <div className="mt-5">
            <Link
              to="/animais"
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
    primary:
      "bg-emerald-800 text-white shadow-sm hover:bg-emerald-700",
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

function HistorySection({
  title,
  emptyMessage,
  columns,
  rows,
  renderRow,
  renderMobileCard,
}) {
  return (
    <section className="overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm">
      <div className="border-b border-emerald-950/8 px-5 py-5 sm:px-6">
        <h3 className="text-2xl font-bold text-emerald-950">{title}</h3>
      </div>

      {rows.length === 0 ? (
        <div className="px-5 py-10 text-center sm:px-6">
          <p className="text-base text-slate-600">{emptyMessage}</p>
        </div>
      ) : (
        <>
          <div className="hidden overflow-x-auto lg:block">
            <table className="min-w-full">
              <thead className="bg-emerald-50/65">
                <tr>
                  {columns.map((column) => (
                    <th
                      key={column}
                      className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wide text-slate-500"
                    >
                      {column}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>{renderRows(rows, renderRow)}</tbody>
            </table>
          </div>

          <div className="grid gap-4 px-5 py-5 lg:hidden">
            {rows.map((row) => (
              <article
                key={row.id}
                className="rounded-lg border border-slate-200 bg-white p-4"
              >
                <div className="grid gap-3">{renderMobileCard(row)}</div>
              </article>
            ))}
          </div>
        </>
      )}
    </section>
  );
}

function renderRows(rows, renderRow) {
  return rows.map((item) => renderRow(item));
}

function HistoryCell({ children }) {
  return <td className="px-6 py-4 text-sm text-slate-700">{children}</td>;
}

function MobileField({ label, value }) {
  return (
    <div>
      <p className="text-[0.68rem] font-semibold uppercase tracking-wide text-slate-500">
        {label}
      </p>
      <div className="mt-1 text-sm text-slate-700">{value}</div>
    </div>
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

export default AnimalDetails;
