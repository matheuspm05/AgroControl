import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import FazendaGate from "../../components/FazendaGate";
import StatusBanner from "../../components/StatusBanner";
import { agroApi } from "../../services/api";
import { getApiErrorMessage } from "../../utils/apiError";

function Relatorios() {
  return (
    <FazendaGate>
      {(activeFazenda) => <RelatoriosContent activeFazenda={activeFazenda} />}
    </FazendaGate>
  );
}

function RelatoriosContent({ activeFazenda }) {
  const [summary, setSummary] = useState({
    animais: 0,
    pastos: 0,
    currais: 0,
    remediosAtivos: 0,
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
          remediosAtivos: remedios.filter(
            (item) => belongsToActiveFarm(item) && item.ativo,
          ).length,
          campeiros: campeiros.filter(belongsToActiveFarm).length,
        });
      } catch (err) {
        if (isMounted) {
          setError(
            getApiErrorMessage(
              err,
              "Não foi possível carregar os indicadores dos relatórios.",
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
          title="Não foi possível carregar os relatórios"
          message={error}
        />
      ) : null}

      <section className="rounded-lg border border-slate-200 bg-white px-5 py-5 shadow-sm sm:px-6">
        <div className="flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
          <div>
            <div className="inline-flex items-center rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-emerald-800">
              Fazenda ativa: {activeFazenda.nome}
            </div>
            <h2 className="mt-3 text-2xl font-bold text-emerald-950">
              Relatórios operacionais
            </h2>
            <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-600">
              Acompanhe uma visão resumida dos principais cadastros da fazenda.
              Esta área fica pronta para receber filtros, exportações e análises
              mais detalhadas depois.
            </p>
          </div>

          <Link
            to="/dashboard"
            className="inline-flex items-center justify-center rounded-lg border border-emerald-950/15 bg-white px-5 py-3 text-base font-semibold text-emerald-950 transition hover:bg-emerald-50"
          >
            Voltar ao dashboard
          </Link>
        </div>
      </section>

      <section className="rounded-lg border border-slate-200 bg-white px-5 py-5 shadow-sm sm:px-6">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-wide text-emerald-700">
              Resumo
            </p>
            <h3 className="mt-2 text-2xl font-bold text-emerald-950">
              Indicadores cadastrados
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
          <SummaryItem label="Remédios ativos" value={summary.remediosAtivos} />
          <SummaryItem label="Campeiros" value={summary.campeiros} />
        </div>
      </section>

      <section className="grid gap-4 lg:grid-cols-3">
        <ReportShortcut
          title="Rebanho"
          description="Consulte animais, locais atuais e cadastros do módulo."
          to="/animais"
        />
        <ReportShortcut
          title="Estrutura"
          description="Revise pastos, currais e distribuição da fazenda."
          to="/fazenda"
        />
        <ReportShortcut
          title="Manejo"
          description="Acesse remédios ativos e equipe cadastrada."
          to="/remedios"
        />
      </section>
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

function ReportShortcut({ title, description, to }) {
  return (
    <Link
      to={to}
      className="rounded-lg border border-slate-200 bg-white px-5 py-5 shadow-sm transition hover:border-emerald-700/25 hover:bg-emerald-50"
    >
      <h3 className="text-lg font-bold text-emerald-950">{title}</h3>
      <p className="mt-2 text-sm leading-6 text-slate-600">{description}</p>
    </Link>
  );
}

export default Relatorios;
