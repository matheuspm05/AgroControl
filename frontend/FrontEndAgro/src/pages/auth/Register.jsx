import { Link, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import AuthCard from "../../components/AuthCard";
import Button from "../../components/Button";
import Input from "../../components/Input";
import Logo from "../../components/Logo";
import StatusBanner from "../../components/StatusBanner";
import heroBackground from "../../assets/images/fazenda criar conta.png";
import useFazenda from "../../hooks/useFazenda";
import { agroApi, saveAuthToken } from "../../services/api";
import { getApiErrorMessage } from "../../utils/apiError";
import { applyTheme, getStoredTheme } from "../../utils/theme";

function Register() {
  const navigate = useNavigate();
  const { refreshFazendas } = useFazenda();
  const [showPassword, setShowPassword] = useState(false);
  const [theme, setTheme] = useState(() => getStoredTheme());
  const isDark = theme === "dark";
  const [form, setForm] = useState({
    nome: "",
    email: "",
    senha: "",
    confirmarSenha: "",
  });
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    applyTheme(theme);
  }, [theme]);

  async function handleSubmit(event) {
    event.preventDefault();

    try {
      setSubmitting(true);
      setError("");

      const response = await agroApi.register({
        nome: form.nome,
        email: form.email,
        senha: form.senha,
        confirmarSenha: form.confirmarSenha,
        contato: null,
      });

      saveAuthToken(response.token);
      await refreshFazendas();
      navigate("/setup-fazenda");
    } catch (err) {
      setError(
        getApiErrorMessage(err, "Não foi possível criar sua conta agora."),
      );
    } finally {
      setSubmitting(false);
    }
  }

  function updateField(field) {
    return (event) => {
      setForm((current) => ({ ...current, [field]: event.target.value }));
    };
  }

  return (
    <div className="relative min-h-screen overflow-hidden bg-[linear-gradient(135deg,#f7faf4_0%,#eef7ec_45%,#fdfcf6_100%)] px-4 py-6 text-[var(--color-ink)] sm:px-6 sm:py-10 lg:px-8 dark:bg-[linear-gradient(135deg,#07140f_0%,#102419_48%,#171b10_100%)]">
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div
          className="absolute inset-y-0 left-0 hidden w-[52%] bg-cover bg-center lg:block"
          style={{
            backgroundImage: `linear-gradient(90deg,rgba(8,53,32,0.68) 0%,rgba(8,53,32,0.42) 42%,rgba(8,53,32,0.18) 72%,rgba(8,53,32,0.02) 100%),url(${heroBackground})`,
          }}
        />
        <div className="absolute inset-y-0 left-[44%] hidden w-[18rem] bg-[linear-gradient(90deg,rgba(247,250,244,0)_0%,rgba(247,250,244,0.54)_38%,rgba(247,250,244,0.88)_72%,rgba(247,250,244,1)_100%)] lg:block dark:bg-[linear-gradient(90deg,rgba(7,20,15,0)_0%,rgba(7,20,15,0.4)_36%,rgba(7,20,15,0.76)_70%,rgba(7,20,15,0.96)_100%)]" />
        <div className="absolute left-[46%] top-1/2 hidden h-[34rem] w-[34rem] -translate-y-1/2 rounded-full bg-emerald-100/55 blur-3xl lg:block dark:bg-emerald-800/12" />
        <div className="absolute right-[8%] top-[14%] hidden h-[32rem] w-[32rem] rounded-full bg-white/35 blur-3xl lg:block dark:bg-emerald-700/10" />
        <div className="absolute right-0 top-0 h-80 w-80 rounded-full bg-lime-200/30 blur-3xl dark:bg-emerald-900/20" />
      </div>

      <div className="relative z-10 mx-auto grid min-h-[calc(100vh-3rem)] max-w-7xl items-center gap-8 sm:min-h-[calc(100vh-5rem)] lg:grid-cols-[1.02fr_0.98fr] lg:gap-10">
        <section className="order-2 lg:order-1 lg:pr-10">
          <Logo
            className="h-16 w-52 justify-start sm:h-24 sm:w-80"
            imageClassName="h-16 origin-left scale-[2.15] sm:h-24 sm:scale-[2.35]"
          />

          <h1 className="mt-7 max-w-xl text-4xl font-black leading-[1.04] tracking-[-0.05em] text-emerald-950 dark:text-white sm:mt-10 sm:text-6xl">
            Comece a organizar sua fazenda hoje
          </h1>
          <p className="mt-4 max-w-lg text-lg leading-8 text-slate-700 dark:text-emerald-50/82 sm:mt-6 sm:text-2xl sm:leading-11">
            Crie sua conta e tenha controle total do seu rebanho.
          </p>

          <div
            className="mt-6 h-52 max-w-2xl overflow-hidden rounded-[1.5rem] border border-white/45 bg-cover bg-center shadow-[0_40px_100px_-50px_rgba(15,23,42,0.45)] sm:mt-8 sm:h-72 sm:rounded-[2rem] lg:hidden"
            style={{ backgroundImage: `url(${heroBackground})` }}
          >
            <div className="h-full w-full bg-[linear-gradient(180deg,rgba(5,55,34,0.08),rgba(5,55,34,0.56))]" />
          </div>
        </section>

        <section className="order-1 lg:order-2 lg:pl-6">
          <div className="mb-5 flex items-center justify-end gap-2 sm:gap-3">
            <button
              type="button"
              className="auth-theme-toggle"
              onClick={() => setTheme(isDark ? "light" : "dark")}
              aria-label={isDark ? "Ativar modo claro" : "Ativar modo escuro"}
              title={isDark ? "Modo claro" : "Modo escuro"}
            >
              {isDark ? <SunIcon /> : <MoonIcon />}
            </button>
            <Link
              to="/"
              className="auth-back-link inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold shadow-sm backdrop-blur transition focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[var(--color-focus)]"
            >
              <span aria-hidden="true">←</span>
              <span>Voltar para o início</span>
            </Link>
          </div>

          <div className="relative mx-auto max-w-xl">
            <div className="pointer-events-none absolute inset-x-8 top-8 -z-10 h-[88%] rounded-[2rem] bg-emerald-200/30 blur-3xl dark:bg-emerald-700/12" />
            <AuthCard title="Criar conta" className="mx-auto max-w-xl">
            {error ? (
              <StatusBanner
                title="Não foi possível criar a conta"
                message={error}
              />
            ) : null}

            <form onSubmit={handleSubmit} className="space-y-5">
              <Input
                label="Nome completo"
                placeholder="Digite seu nome"
                value={form.nome}
                onChange={updateField("nome")}
                icon={UserIcon}
              />

              <Input
                label="Email"
                type="email"
                placeholder="Digite seu email"
                value={form.email}
                onChange={updateField("email")}
                icon={MailIcon}
              />

              <Input
                label="Senha"
                type={showPassword ? "text" : "password"}
                placeholder="Crie uma senha"
                value={form.senha}
                onChange={updateField("senha")}
                icon={LockIcon}
                rightElement={
                  <button
                    type="button"
                    onClick={() => setShowPassword((value) => !value)}
                    className="text-slate-500 transition hover:text-emerald-800"
                    aria-label="Mostrar senha"
                  >
                    <EyeIcon />
                  </button>
                }
              />

              <Input
                placeholder="Digite novamente a senha"
                type={showPassword ? "text" : "password"}
                value={form.confirmarSenha}
                onChange={updateField("confirmarSenha")}
                icon={LockIcon}
              />

              <Button type="submit" fullWidth className="mt-3" disabled={submitting}>
                {submitting ? "Criando conta..." : "Criar conta"}
              </Button>
            </form>

            <div className="mt-8 flex items-center gap-4">
              <span className="h-px flex-1 bg-slate-200" />
              <span className="text-sm text-slate-500">ou</span>
              <span className="h-px flex-1 bg-slate-200" />
            </div>

            <p className="mt-8 text-center text-sm text-slate-600 sm:text-base">
              Já tem conta?{" "}
              <Link
                to="/login"
                className="font-semibold text-amber-700 transition hover:text-amber-600"
              >
                Entrar
              </Link>
            </p>
            </AuthCard>
          </div>
        </section>
      </div>
    </div>
  );
}

function UserIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-6 w-6 fill-current" aria-hidden="true">
      <path d="M12 3.2a4.4 4.4 0 1 1 0 8.8 4.4 4.4 0 0 1 0-8.8Zm-7 14.5c0-3.3 2.8-5.9 7-5.9s7 2.6 7 5.9V19H5v-1.3Z" />
    </svg>
  );
}

function MailIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-6 w-6 stroke-current" fill="none" aria-hidden="true">
      <path d="M3.5 6.5h17v11h-17v-11Zm0 1 8.5 6 8.5-6" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function LockIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-6 w-6 fill-current" aria-hidden="true">
      <path d="M12 1.8a4.5 4.5 0 0 0-4.5 4.5V9H6a2 2 0 0 0-2 2v8.2a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V11a2 2 0 0 0-2-2h-1.5V6.3A4.5 4.5 0 0 0 12 1.8Zm-2.7 7.2V6.3a2.7 2.7 0 1 1 5.4 0V9H9.3Zm2.7 3.2a2 2 0 0 1 1 3.8v2.1h-2v-2.1a2 2 0 0 1 1-3.8Z" />
    </svg>
  );
}

function EyeIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-6 w-6 fill-current" aria-hidden="true">
      <path d="M12 5c5 0 8.9 4.6 9.8 6-.9 1.4-4.8 6-9.8 6S3.1 12.4 2.2 11C3.1 9.6 7 5 12 5Zm0 2c-3.3 0-6.3 2.7-7.5 4 1.2 1.3 4.2 4 7.5 4s6.3-2.7 7.5-4c-1.2-1.3-4.2-4-7.5-4Zm0 1.8a2.2 2.2 0 1 1 0 4.4 2.2 2.2 0 0 1 0-4.4Z" />
    </svg>
  );
}

function MoonIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-4 w-4 stroke-current" fill="none" aria-hidden="true">
      <path d="M20 14.5A7.5 7.5 0 0 1 9.5 4 8 8 0 1 0 20 14.5Z" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function SunIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-4 w-4 stroke-current" fill="none" aria-hidden="true">
      <path d="M12 8a4 4 0 1 0 0 8 4 4 0 0 0 0-8Zm0-5v2m0 14v2m9-9h-2M5 12H3m15.4-6.4L17 7M7 17l-1.4 1.4m0-12.8L7 7m10 10 1.4 1.4" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export default Register;
