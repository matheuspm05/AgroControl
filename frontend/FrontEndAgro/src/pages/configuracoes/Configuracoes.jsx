import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import StatusBanner from "../../components/StatusBanner";
import { applyTheme, getStoredTheme } from "../../utils/theme";

function Configuracoes() {
  const [theme, setTheme] = useState(() => getStoredTheme());
  const [notificationsEnabled, setNotificationsEnabled] = useState(false);

  useEffect(() => {
    applyTheme(theme);
  }, [theme]);

  const isDark = theme === "dark";

  return (
    <div className="space-y-5">
      <section className="rounded-lg border border-slate-200 bg-white px-5 py-5 shadow-sm sm:px-6">
        <p className="text-sm font-semibold uppercase tracking-wide text-emerald-700">
          Conta
        </p>
        <h2 className="mt-2 text-3xl font-bold text-emerald-950">
          Configurações
        </h2>
        <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-600">
          Faça ajustes nas configurações da sua conta, aparência e preferências
          do sistema.
        </p>

        <div className="mt-5 flex gap-5 border-b border-slate-200">
          <Tab active icon={UserSettingsIcon}>
            Perfil
          </Tab>
          <Tab icon={LockIcon}>Segurança</Tab>
        </div>
      </section>

      <section className="space-y-4">
        <SettingsCard
          icon={ShieldIcon}
          title="Segurança"
          description="Altere sua senha de acesso."
          action={
            <Link
              to="/perfil/editar"
              className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-emerald-800 px-5 py-3 text-base font-semibold text-white shadow-sm transition hover:bg-emerald-700 sm:w-auto"
            >
              <LockIcon />
              Alterar senha
            </Link>
          }
        />

        <SettingsCard
          icon={PaletteIcon}
          title="Aparência"
          description="Escolha entre tema claro e escuro."
          action={
            <button
              type="button"
              onClick={() => setTheme(isDark ? "light" : "dark")}
              className="inline-flex w-full items-center justify-center gap-2 rounded-lg border border-emerald-950/15 bg-white px-5 py-3 text-base font-semibold text-emerald-950 transition hover:bg-emerald-50 sm:w-auto"
            >
              {isDark ? <SunIcon /> : <MoonIcon />}
              {isDark ? "Usar tema claro" : "Usar tema escuro"}
            </button>
          }
        />

        <SettingsCard
          icon={BellIcon}
          title="Notificações"
          description="Configure as preferências de notificações da conta."
          action={
            <button
              type="button"
              onClick={() => setNotificationsEnabled((current) => !current)}
              className={`inline-flex w-full items-center justify-center gap-3 rounded-lg border px-5 py-3 text-base font-semibold transition sm:w-auto sm:min-w-52 ${
                notificationsEnabled
                  ? "border-emerald-700 bg-emerald-50 text-emerald-900"
                  : "border-slate-200 bg-slate-50 text-slate-700"
              }`}
            >
              <span
                className={`relative h-6 w-11 rounded-full transition ${
                  notificationsEnabled ? "bg-emerald-700" : "bg-slate-300"
                }`}
              >
                <span
                  className={`absolute top-1 h-4 w-4 rounded-full bg-white transition ${
                    notificationsEnabled ? "left-6" : "left-1"
                  }`}
                />
              </span>
              {notificationsEnabled ? "Notificações ativas" : "Ativar notificações"}
            </button>
          }
        />
      </section>

      <StatusBanner
        variant="info"
        title="Preferências locais"
        message="Por enquanto, tema e notificações ficam salvos neste navegador. Quando a autenticação real entrar, esses dados podem ir para o backend."
      />
    </div>
  );
}

function Tab({ active = false, icon: Icon, children }) {
  return (
    <button
      type="button"
      className={`inline-flex items-center gap-2 border-b-2 px-1 pb-3 text-base font-semibold transition ${
        active
          ? "border-emerald-800 text-emerald-800"
          : "border-transparent text-slate-500 hover:text-emerald-800"
      }`}
    >
      <Icon />
      {children}
    </button>
  );
}

function SettingsCard({ icon: Icon, title, description, action }) {
  return (
    <article className="flex flex-col gap-4 rounded-lg border border-slate-200 bg-white px-4 py-5 shadow-sm sm:px-6 lg:flex-row lg:items-center lg:justify-between">
      <div className="flex items-start gap-4 sm:items-center sm:gap-5">
        <span className="inline-flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-emerald-50 text-emerald-800 sm:h-20 sm:w-20">
          <Icon />
        </span>
        <div>
          <h3 className="text-xl font-bold text-emerald-950 sm:text-2xl">{title}</h3>
          <p className="mt-2 text-base text-slate-600">{description}</p>
        </div>
      </div>

      <div className="lg:shrink-0">{action}</div>
    </article>
  );
}

function UserSettingsIcon() {
  return <IconPath path="M12 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8Zm-7 8a7 7 0 0 1 14 0m-3.5-4.5 1.5 1.5 2.5-3" />;
}

function ShieldIcon() {
  return <IconPath path="M12 3 5 6v5c0 4.5 3 7.8 7 9 4-1.2 7-4.5 7-9V6l-7-3Zm-3 8 2 2 4-4" className="h-9 w-9" />;
}

function PaletteIcon() {
  return <IconPath path="M12 4a8 8 0 1 0 0 16h1.5a1.8 1.8 0 0 0 0-3.6H12a1.7 1.7 0 0 1 0-3.4h2.4A4.6 4.6 0 0 0 19 8.4 7.9 7.9 0 0 0 12 4Zm-4 7h.1m2.9-3h.1m4.9 2h.1" className="h-9 w-9" />;
}

function BellIcon() {
  return <IconPath path="M18 15v-4a6 6 0 0 0-12 0v4l-2 2h16l-2-2Zm-8 5h4" className="h-9 w-9" />;
}

function LockIcon() {
  return <IconPath path="M7 10h10v10H7V10Zm2 0V8a3 3 0 0 1 6 0v2" />;
}

function MoonIcon() {
  return <IconPath path="M20 14.5A7.5 7.5 0 0 1 9.5 4 8 8 0 1 0 20 14.5Z" />;
}

function SunIcon() {
  return <IconPath path="M12 8a4 4 0 1 0 0 8 4 4 0 0 0 0-8Zm0-5v2m0 14v2m9-9h-2M5 12H3m15.4-6.4L17 7M7 17l-1.4 1.4m0-12.8L7 7m10 10 1.4 1.4" />;
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

export default Configuracoes;
