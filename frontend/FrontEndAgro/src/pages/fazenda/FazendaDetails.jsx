import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import FazendaGate from "../../components/FazendaGate";
import StatusBanner from "../../components/StatusBanner";
import { agroApi } from "../../services/api";
import { getApiErrorMessage } from "../../utils/apiError";
import { formatArea, formatDate } from "../../utils/formatters";

function FazendaDetails() {
  return (
    <FazendaGate>
      {(activeFazenda) => (
        <FazendaDetailsContent activeFazenda={activeFazenda} />
      )}
    </FazendaGate>
  );
}

function FazendaDetailsContent({ activeFazenda }) {
  const [summary, setSummary] = useState({
    animais: 0,
    pastos: 0,
    currais: 0,
    remedios: 0,
    campeiros: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let isMounted = true;

    async function loadData() {
      try {
        setLoading(true);
        setError("");

        const [animais, pastos, currais, remedios, campeiros] =
          await Promise.all([
            agroApi.listAnimais(),
            agroApi.listPastos(),
            agroApi.listCurrais(),
            agroApi.listRemedios(),
            agroApi.listCampeiros(),
          ]);

        if (!isMounted) {
          return;
        }

        const belongsToActiveFarm = (item) => item.fazendaId === activeFazenda.id;
        setSummary({
          animais: animais.filter(belongsToActiveFarm).length,
          pastos: pastos.filter(belongsToActiveFarm).length,
          currais: currais.filter(belongsToActiveFarm).length,
          remedios: remedios.filter(belongsToActiveFarm).length,
          campeiros: campeiros.filter(belongsToActiveFarm).length,
        });
      } catch (err) {
        if (isMounted) {
          setError(
            getApiErrorMessage(
              err,
              "Não foi possível carregar os indicadores da fazenda.",
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

  return (
    <div className="space-y-5">
      {error ? (
        <StatusBanner
          title="Não foi possível carregar a fazenda"
          message={error}
        />
      ) : null}

      <section className="flex flex-col gap-5 rounded-lg border border-slate-200 bg-white px-5 py-5 shadow-sm sm:px-6 xl:flex-row xl:items-start xl:justify-between">
        <div>
          <p className="text-sm font-semibold uppercase tracking-wide text-emerald-700">
            Fazenda ativa
          </p>
          <h2 className="mt-2 text-3xl font-bold text-emerald-950">
            {activeFazenda.nome}
          </h2>
          <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-600">
            Consulte as informações principais da fazenda vinculada ao ambiente
            de trabalho atual.
          </p>
        </div>

        <div className="flex flex-col gap-3 sm:flex-row">
          <Link
            to="/perfil"
            className="inline-flex items-center justify-center rounded-lg border border-emerald-950/15 bg-white px-5 py-3 text-base font-semibold text-emerald-950 transition hover:bg-emerald-50"
          >
            Voltar para perfil
          </Link>
          <Link
            to="/dashboard"
            className="inline-flex items-center justify-center rounded-lg bg-emerald-800 px-5 py-3 text-base font-semibold text-white shadow-sm transition hover:bg-emerald-700"
          >
            Ir para dashboard
          </Link>
        </div>
      </section>

      <section className="overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm">
        <div className="grid gap-5 border-b border-emerald-950/8 px-5 py-5 sm:px-6 xl:grid-cols-[16rem_1fr]">
          <div className="flex min-h-52 items-center justify-center rounded-lg bg-emerald-50 text-emerald-800">
            <FarmIcon />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <DataItem label="Nome" value={activeFazenda.nome} />
            <DataItem
              label="Localização"
              value={activeFazenda.localizacao || "Não informada"}
            />
            <DataItem
              label="Tamanho da propriedade"
              value={formatArea(activeFazenda.tamanhoPropriedade)}
            />
            <DataItem
              label="Cadastro"
              value={formatDate(activeFazenda.dataCriacao)}
            />
          </div>
        </div>

        <div className="px-5 py-5 sm:px-6">
          <p className="text-sm font-semibold uppercase tracking-wide text-slate-500">
            Descrição
          </p>
          <p className="mt-2 whitespace-pre-line text-base leading-7 text-slate-700">
            {activeFazenda.descricao ||
              "Nenhuma descrição cadastrada para esta fazenda."}
          </p>
        </div>
      </section>

      <section className="rounded-lg border border-slate-200 bg-white px-5 py-5 shadow-sm sm:px-6">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-wide text-emerald-700">
              Indicadores
            </p>
            <h3 className="mt-2 text-2xl font-bold text-emerald-950">
              Estrutura cadastrada
            </h3>
          </div>
          {loading ? (
            <p className="text-sm font-medium text-slate-500">
              Carregando indicadores...
            </p>
          ) : null}
        </div>

        <div className="mt-5 grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
          <SummaryItem label="Animais" value={summary.animais} />
          <SummaryItem label="Pastos" value={summary.pastos} />
          <SummaryItem label="Currais" value={summary.currais} />
          <SummaryItem label="Remédios" value={summary.remedios} />
          <SummaryItem label="Campeiros" value={summary.campeiros} />
        </div>
      </section>
    </div>
  );
}

function DataItem({ label, value }) {
  return (
    <div className="rounded-lg border border-slate-200 bg-slate-50 px-4 py-4">
      <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
        {label}
      </p>
      <p className="mt-2 text-base font-semibold text-emerald-950">{value}</p>
    </div>
  );
}

function SummaryItem({ label, value }) {
  return (
    <div className="rounded-lg border border-emerald-950/8 bg-emerald-50 px-4 py-4">
      <p className="text-xs font-semibold uppercase tracking-wide text-emerald-800">
        {label}
      </p>
      <p className="mt-2 text-3xl font-bold text-emerald-950">{value}</p>
    </div>
  );
}

function FarmIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-24 w-24 fill-current" aria-hidden="true">
      <path d="M3 20h18v2H3v-2Zm2-1V9.8L12 5l7 4.8V19h-3.5v-5h-7v5H5Zm12-9.7V6h2v4.7l-2-1.4ZM8 9H6V6.5h2V9Zm10 9v-6.9l-6-4.1-6 4.1V18h1.5v-5h9v5H18Z" />
    </svg>
  );
}

export default FazendaDetails;
