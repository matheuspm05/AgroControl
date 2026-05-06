import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import FazendaGate from "../../components/FazendaGate";
import { agroApi } from "../../services/api";

function Dashboard() {
  return (
    <FazendaGate>
      <DashboardContent />
    </FazendaGate>
  );
}

function DashboardContent() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let isMounted = true;

    async function loadData() {
      try {
        setLoading(true);
        setError("");
        const response = await agroApi.getDashboardData();

        if (isMounted) {
          setData(response);
        }
      } catch (err) {
        if (isMounted) {
          setError(getErrorMessage(err));
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
  }, []);

  const summary = [
    {
      label: "Animais",
      value: data?.animais.length ?? 0,
      helper: "cadastrados",
      to: "/animais",
      icon: HerdIcon,
    },
    {
      label: "Pastos",
      value: data?.pastos.length ?? 0,
      helper: "cadastrados",
      to: "/pastos",
      icon: GrassIcon,
    },
    {
      label: "Currais",
      value: data?.currais.length ?? 0,
      helper: "cadastrados",
      to: "/currais",
      icon: CurralIcon,
    },
    {
      label: "Remédios",
      value: data?.remedios.length ?? 0,
      helper: "registrados",
      to: "/remedios",
      icon: RemedyIcon,
    },
    {
      label: "Campeiros",
      value: data?.campeiros.length ?? 0,
      helper: "ativos",
      to: "/campeiros",
      icon: WorkerIcon,
    },
  ];

  return (
    <div className="space-y-5">
      {error ? (
        <section className="rounded-lg border border-[var(--color-danger-border)] bg-[var(--color-danger-bg)] px-5 py-4 text-[var(--color-danger)] shadow-sm">
          <p className="text-sm font-semibold uppercase tracking-wide">
            Não foi possível carregar o dashboard
          </p>
          <p className="mt-2 text-base">{error}</p>
        </section>
      ) : null}

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
        {summary.map((item) => (
          <SummaryCard key={item.label} item={item} loading={loading} />
        ))}
      </section>

      <section className="grid gap-5 xl:grid-cols-[0.86fr_1.08fr]">
        <div className="quick-panel rounded-2xl p-5 text-white shadow-[0_28px_70px_-45px_rgba(0,0,0,0.85)]">
          <div className="flex items-start gap-3">
            <span className="mt-1 text-lime-300" aria-hidden="true">
              <LightningIcon />
            </span>
            <div>
              <h2 className="text-xl font-bold">Ações rápidas</h2>
              <p className="mt-1 text-sm text-white/72">
                Atalhos para os fluxos mais usados.
              </p>
            </div>
          </div>

          <div className="mt-5 grid gap-2">
            <QuickAction to="/animais/novo" label="Cadastrar animal" icon={HerdIcon} />
            <QuickAction to="/pastos" label="Ver pastos" icon={GrassIcon} />
            <QuickAction to="/currais" label="Ver currais" icon={CurralIcon} />
            <QuickAction to="/remedios" label="Ver remédios" icon={RemedyIcon} />
          </div>
        </div>

        <DashboardPanel
          title="Animais recentes"
          to="/animais"
          loading={loading}
          items={(data?.animais ?? []).slice(0, 5)}
          renderItem={(animal) => (
            <div className="flex w-full flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex min-w-0 items-center gap-3 sm:gap-4">
                <span className="dashboard-row-icon">
                  <GrassIcon />
                </span>
                <div className="min-w-0">
                  <p className="truncate font-semibold text-emerald-950">{animal.nome}</p>
                  <p className="truncate text-sm text-slate-500">
                  {animal.tipoAnimal} • {animal.tipoLocalAtual} #{animal.localAtualId}
                  </p>
                </div>
              </div>
              <div className="flex shrink-0 items-center justify-between gap-3 sm:justify-end">
                <span className="rounded-lg bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-800">
                  Fazenda #{animal.fazendaId}
                </span>
                <span className="text-2xl leading-none text-emerald-800" aria-hidden="true">›</span>
              </div>
            </div>
          )}
          emptyMessage="Nenhum animal cadastrado ainda."
        />
      </section>

      <section className="grid gap-5 xl:grid-cols-2">
        <DashboardPanel
          title="Pastos"
          to="/pastos"
          loading={loading}
          items={(data?.pastos ?? []).slice(0, 4)}
          renderItem={(pasto) => (
            <div className="w-full">
              <div className="flex items-center justify-between gap-3">
                <p className="font-semibold text-emerald-950">{pasto.nome}</p>
                <span className="text-sm font-semibold text-emerald-700">
                  {getPastoUsage(pasto.id)}%
                </span>
              </div>
              <p className="mt-1 text-sm text-slate-500">
                {pasto.tamanho ? `${pasto.tamanho} ha` : "Tamanho não informado"}
              </p>
              <div className="mt-3 h-2 overflow-hidden rounded-full bg-emerald-50">
                <div
                  className="h-full rounded-full bg-emerald-700"
                  style={{ width: `${getPastoUsage(pasto.id)}%` }}
                />
              </div>
            </div>
          )}
          emptyMessage="Nenhum pasto cadastrado ainda."
        />

        <DashboardPanel
          title="Currais"
          to="/currais"
          loading={loading}
          items={(data?.currais ?? []).slice(0, 4)}
          renderItem={(curral) => (
            <div className="flex w-full flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div className="min-w-0">
                <p className="font-semibold text-emerald-950">{curral.nome}</p>
                <p className="text-sm text-slate-500">
                  Capacidade: {curral.capacidadeMaxima ?? "não informada"}
                </p>
              </div>
              <span className="w-fit rounded-md bg-amber-50 px-3 py-1 text-xs font-semibold text-amber-800">
                Fazenda #{curral.fazendaId}
              </span>
            </div>
          )}
          emptyMessage="Nenhum curral cadastrado ainda."
          emptyIcon={<CurralIcon />}
        />
      </section>
    </div>
  );
}

function SummaryCard({ item, loading }) {
  const Icon = item.icon;

  return (
    <Link
      to={item.to}
      className="dashboard-summary-card rounded-2xl border p-4 transition hover:-translate-y-0.5"
    >
      <span className="dashboard-summary-icon">
        <Icon />
      </span>
      <div>
        <p className="text-base font-bold text-slate-700">{item.label}</p>
        <p className="mt-1 text-3xl font-black tracking-[-0.04em] text-emerald-950">
          {loading ? "..." : item.value}
        </p>
        <p className="text-sm text-slate-500">{item.helper}</p>
      </div>
    </Link>
  );
}

function QuickAction({ to, label, icon: Icon }) {
  return (
    <Link
      to={to}
      className="quick-action-link flex min-h-12 items-center justify-between rounded-lg px-4 py-3 text-sm font-semibold transition focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-white/20"
    >
      <span className="flex items-center gap-4">
        <Icon />
        {label}
      </span>
      <span aria-hidden="true">›</span>
    </Link>
  );
}

function DashboardPanel({ title, to, loading, items, renderItem, emptyMessage, emptyIcon = null }) {
  return (
    <section className="dashboard-panel rounded-2xl border p-4 sm:p-5">
      <div className="flex items-start justify-between gap-3 sm:items-center">
        <h2 className="text-xl font-bold text-emerald-950">{title}</h2>
        {to ? (
          <Link
            to={to}
            className="rounded-lg border border-emerald-900/20 px-4 py-2 text-sm font-semibold text-emerald-700 transition hover:bg-emerald-50"
          >
            Ver todos
          </Link>
        ) : null}
      </div>

      <div className="mt-4 space-y-3">
        {loading ? (
          Array.from({ length: 4 }).map((_, index) => (
            <div
              key={index}
              className="ag-skeleton h-16 animate-pulse rounded-lg"
            />
          ))
        ) : items.length > 0 ? (
          items.map((item, index) => (
            <article
              key={item.id ?? index}
              className="dashboard-list-item flex min-h-20 items-center justify-between gap-3 rounded-lg border px-3 py-3 sm:px-4"
            >
              {renderItem(item)}
            </article>
          ))
        ) : (
          <div className="ag-empty-state flex min-h-36 flex-col items-center justify-center px-4 py-8 text-center">
            {emptyIcon ? (
              <span className="mb-3 text-emerald-950">{emptyIcon}</span>
            ) : null}
            <p className="font-semibold text-[var(--color-text)]">{emptyMessage}</p>
            <p className="mt-1 text-sm">Cadastre o primeiro registro para começar.</p>
          </div>
        )}
      </div>
    </section>
  );
}

function getPastoUsage(id) {
  return Math.min(92, 34 + ((Number(id) || 1) * 17) % 48);
}

function getErrorMessage(error) {
  return (
    error?.response?.data ||
    error?.message ||
    "Ocorreu um erro inesperado ao carregar os dados."
  );
}

function IconPath({ path, className = "h-5 w-5" }) {
  return (
    <svg
      viewBox="0 0 24 24"
      className={`${className} stroke-current`}
      fill="none"
      aria-hidden="true"
    >
      <path
        d={path}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function HerdIcon() {
  return <IconPath path="M5 10.5h10.5l2-2H21v4l-2 1.5v3.5h-2.5v-3H8v3H5.5v-4.2L3 12V8.5l2 2Zm2-3.5 2 2m5-2-2 2" />;
}

function GrassIcon() {
  return <IconPath path="M4 19h16M6 17V9m0 8c2.2-4.8 5.2-7.8 9-9m-4 9V7m0 10c1.7-3 3.8-5.2 6.5-6.6m.5 6.6v-6" />;
}

function CurralIcon() {
  return <IconPath path="M4 6h16v12H4V6Zm0 4h16M8 6v12m8-12v12" />;
}

function RemedyIcon() {
  return <IconPath path="m8 4 12 12-4 4L4 8l4-4Zm2 6-3 3m6-6-3 3M4 20h7" />;
}

function WorkerIcon() {
  return <IconPath path="M12 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8Zm-7 10a7 7 0 0 1 14 0M9 15l3 3 3-3" />;
}

function LightningIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-7 w-7 fill-current" aria-hidden="true">
      <path d="M13.7 2.5 5 13.2h5.5L9.6 22l8.7-11.2h-5.4l.8-8.3Z" />
    </svg>
  );
}

export default Dashboard;
