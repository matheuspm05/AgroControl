import { Link, NavLink } from "react-router-dom";
import Logo from "./Logo";
import useFazenda from "../hooks/useFazenda";
import { agroApi } from "../services/api";

const navItems = [
  { to: "/dashboard", label: "Dashboard", icon: DashboardIcon },
  { to: "/animais", label: "Animais", icon: HerdIcon },
  { to: "/pastos", label: "Pastos", icon: PastoIcon },
  { to: "/currais", label: "Currais", icon: CurralIcon },
  { to: "/remedios", label: "Remédios", icon: RemedyIcon },
  { to: "/campeiros", label: "Campeiros", icon: TeamIcon },
  { to: "/relatorios", label: "Relatórios", icon: ReportIcon },
];

function Sidebar({ isOpen, onClose }) {
  const { activeFazenda, loading } = useFazenda();

  async function handleLogout() {
    await agroApi.logout();
    onClose();
  }

  return (
    <>
      <div
        className={`fixed inset-0 z-30 bg-emerald-950/35 backdrop-blur-sm transition lg:hidden ${
          isOpen ? "opacity-100" : "pointer-events-none opacity-0"
        }`}
        onClick={onClose}
      />

      <aside
        className={`fixed inset-y-0 left-0 z-40 flex w-72 max-w-[85vw] flex-col overflow-hidden border-r border-[var(--color-border)] bg-[var(--color-surface)] px-5 py-4 shadow-xl transition duration-300 lg:w-72 lg:translate-x-0 lg:px-5 ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="shrink-0">
          <div className="flex items-center justify-between gap-3">
            <Link to="/dashboard" onClick={onClose} className="shrink-0">
              <Logo
                className="h-12 w-40"
                imageClassName="h-15 origin-left scale-[2.3]"
              />
            </Link>

            <button
              type="button"
              onClick={onClose}
              className="ag-button-secondary inline-flex h-10 w-10 items-center justify-center rounded-lg border lg:hidden"
              aria-label="Fechar menu"
            >
              <CloseIcon />
            </button>
          </div>

          <Link
            to="/fazenda"
            onClick={onClose}
            className="farm-card mt-4 block rounded-xl border px-4 py-3 text-[var(--color-text)] transition hover:-translate-y-0.5"
          >
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <h2 className="truncate text-lg font-black tracking-[-0.03em]">
                  {loading
                    ? "Carregando..."
                    : activeFazenda?.nome || "Nenhuma fazenda ativa"}
                </h2>
                <p className="mt-1 truncate text-xs font-medium text-[var(--color-text-muted)]">
                  {activeFazenda?.localizacao || "Ambiente local"}
                  {activeFazenda ? (
                    <span className="ml-2 font-bold text-[var(--color-primary)]">• Ativo</span>
                  ) : null}
                </p>
              </div>
              <span className="mt-0.5 text-xl leading-none text-[var(--color-primary)]">
                <ChevronIcon />
              </span>
            </div>
          </Link>
        </div>

        <nav className="sidebar-nav mt-4 min-h-0 flex-1 space-y-1 overflow-y-auto pr-0">
          {navItems.map(({ to, label, icon: Icon }) => (
            <NavLink
              key={to}
              to={to}
              onClick={onClose}
              className={({ isActive }) =>
                `group flex min-h-10 items-center gap-3 rounded-lg px-3 py-1.5 text-sm font-bold transition focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[var(--color-focus)] ${
                  isActive
                    ? "sidebar-active-link shadow-sm"
                    : "text-[var(--color-text)] hover:bg-[var(--color-surface-hover)]"
                }`
              }
            >
              {({ isActive }) => (
                <>
                  <span
                    className={`inline-flex h-7 w-7 items-center justify-center rounded-lg ${
                      isActive
                        ? "bg-white/18 text-[var(--color-primary-text)]"
                        : "text-[var(--color-primary)]"
                    }`}
                  >
                    <Icon />
                  </span>
                  <span>{label}</span>
                </>
              )}
            </NavLink>
          ))}
        </nav>

        <div className="shrink-0 border-t border-[var(--color-border)] pt-2 pb-0">
          <Link
            to="/configuracoes"
            onClick={onClose}
            className="group flex min-h-10 items-center gap-3 rounded-lg px-3 py-1.5 text-sm font-bold text-[var(--color-text)] transition hover:bg-[var(--color-surface-hover)] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[var(--color-focus)]"
          >
            <span className="inline-flex h-7 w-7 items-center justify-center rounded-lg text-[var(--color-primary)]">
              <SettingsIcon />
            </span>
            <span>Configurações</span>
          </Link>

          <Link
            to="/"
            onClick={handleLogout}
            className="group flex min-h-10 items-center gap-3 rounded-lg px-3 py-1.5 text-sm font-bold text-[var(--color-text)] transition hover:bg-[var(--color-surface-hover)] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[var(--color-focus)]"
          >
            <span className="inline-flex h-7 w-7 items-center justify-center rounded-lg text-[var(--color-primary)]">
              <LogoutIcon />
            </span>
            <span>Sair</span>
          </Link>
        </div>
      </aside>
    </>
  );
}

function DashboardIcon() {
  return (
    <IconPath path="M4 13h7V4H4v9Zm9 7h7V4h-7v16ZM4 20h7v-5H4v5Z" />
  );
}

function HerdIcon() {
  return (
    <IconPath path="M5 10.5h10.5l2-2H21v4l-2 1.5v3.5h-2.5v-3H8v3H5.5v-4.2L3 12V8.5l2 2Zm2-3.5 2 2m5-2-2 2" />
  );
}

function PastoIcon() {
  return (
    <IconPath path="M4 19h16M6 17V9m0 8c2.2-4.8 5.2-7.8 9-9m-4 9V7m0 10c1.7-3 3.8-5.2 6.5-6.6m.5 6.6v-6" />
  );
}

function CurralIcon() {
  return (
    <IconPath path="M4 6h16v12H4V6Zm0 4h16M8 6v12m8-12v12" />
  );
}

function RemedyIcon() {
  return (
    <IconPath path="m8 4 12 12-4 4L4 8l4-4Zm2 6-3 3m6-6-3 3M4 20h7" />
  );
}

function TeamIcon() {
  return (
    <IconPath path="M12 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8Zm-7 10a7 7 0 0 1 14 0M18 11.5a3 3 0 0 0 0-6M21 20a5.5 5.5 0 0 0-3-4.8" />
  );
}

function ReportIcon() {
  return (
    <IconPath path="M5 20V4h14v16H5Zm4-4v-5m3 5V8m3 8v-3M8 20h8" />
  );
}

function CloseIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5 stroke-current" fill="none" aria-hidden="true">
      <path d="M6 6 18 18M18 6 6 18" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

function LogoutIcon() {
  return (
    <IconPath path="M10 6H6.8A1.8 1.8 0 0 0 5 7.8v8.4A1.8 1.8 0 0 0 6.8 18H10M14.5 8.5 18 12m0 0-3.5 3.5M18 12H9" />
  );
}

function SettingsIcon() {
  return (
    <IconPath path="M12 15.2a3.2 3.2 0 1 0 0-6.4 3.2 3.2 0 0 0 0 6.4Zm7.4-2.1c.1-.4.1-.7.1-1.1s0-.7-.1-1.1l2-1.5-2-3.4-2.4 1a8 8 0 0 0-1.9-1.1L14.8 3h-5.6l-.3 2.9A8 8 0 0 0 7 7L4.6 6l-2 3.4 2 1.5c-.1.4-.1.7-.1 1.1s0 .7.1 1.1l-2 1.5 2 3.4 2.4-1c.6.5 1.2.8 1.9 1.1l.3 2.9h5.6l.3-2.9c.7-.3 1.3-.6 1.9-1.1l2.4 1 2-3.4-2-1.5Z" />
  );
}

function ChevronIcon() {
  return <IconPath path="m9 6 6 6-6 6" className="h-4 w-4" />;
}

function IconPath({ path, className = "h-4 w-4" }) {
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

export default Sidebar;
