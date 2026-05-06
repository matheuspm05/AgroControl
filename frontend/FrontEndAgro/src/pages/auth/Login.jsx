import { Link, useNavigate } from "react-router-dom";
import { useState } from "react";
import AuthCard from "../../components/AuthCard";
import Button from "../../components/Button";
import Input from "../../components/Input";
import Logo from "../../components/Logo";
import StatusBanner from "../../components/StatusBanner";
import useFazenda from "../../hooks/useFazenda";
import { agroApi, saveAuthToken } from "../../services/api";
import { getApiErrorMessage } from "../../utils/apiError";

function Login() {
  const navigate = useNavigate();
  const { refreshFazendas } = useFazenda();
  const [showPassword, setShowPassword] = useState(false);
  const [form, setForm] = useState({
    email: "",
    senha: "",
  });
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(event) {
    event.preventDefault();

    try {
      setSubmitting(true);
      setError("");

      const response = await agroApi.login({
        email: form.email,
        senha: form.senha,
      });

      saveAuthToken(response.token);
      const fazendaState = await refreshFazendas();
      navigate(fazendaState.activeFazendaId ? "/dashboard" : "/setup-fazenda");
    } catch (err) {
      setError(getApiErrorMessage(err, "Email ou senha inválidos."));
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
    <div className="relative min-h-screen overflow-hidden bg-[var(--color-page)] px-4 py-6 text-[var(--color-ink)] sm:px-6 sm:py-10">
      <AuthBackground />

      <div className="relative z-10 mx-auto flex min-h-[calc(100vh-3rem)] max-w-6xl items-center justify-center sm:min-h-[calc(100vh-5rem)]">
        <div className="w-full max-w-xl">
          <div className="mb-5 flex justify-center">
            <Link
              to="/"
              className="auth-back-link inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold shadow-sm backdrop-blur transition focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[var(--color-focus)]"
            >
              <span aria-hidden="true">←</span>
              <span>Voltar para o início</span>
            </Link>
          </div>

          <div className="mb-6 flex justify-center">
            <Logo
              className="h-16 w-52 justify-center sm:h-24 sm:w-80"
              imageClassName="h-16 origin-center scale-[2.15] sm:h-24 sm:scale-[2.35]"
            />
          </div>

          <AuthCard className="mx-auto max-w-xl">
            {error ? (
              <StatusBanner
                title="Não foi possível entrar"
                message={error}
              />
            ) : null}

            <form onSubmit={handleSubmit} className="space-y-6">
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
                    className="text-[var(--color-text-muted)] transition hover:text-[var(--color-primary)]"
                    aria-label="Mostrar senha"
                  >
                    <EyeIcon />
                  </button>
                }
              />

              <div className="flex justify-end">
                <button
                  type="button"
                  className="text-sm font-medium text-[var(--color-primary)] transition hover:text-[var(--color-primary-hover)]"
                >
                  Esqueci minha senha
                </button>
              </div>

              <div className="auth-helper-note -mt-1 rounded-2xl px-4 py-3 text-right text-sm leading-6">
                A recuperação de senha entra na próxima etapa. Por enquanto,
                use a conta que você cadastrou para seguir.
              </div>

              <Button type="submit" fullWidth disabled={submitting}>
                {submitting ? "Entrando..." : "Entrar"}
              </Button>
            </form>

            <div className="mt-8 flex items-center gap-4">
              <span className="h-px flex-1 bg-[var(--color-border)]" />
              <span className="text-sm text-[var(--color-text-muted)]">ou</span>
              <span className="h-px flex-1 bg-[var(--color-border)]" />
            </div>

            <p className="mt-8 text-center text-sm text-[var(--color-text-muted)] sm:text-base">
              Não tem conta?{" "}
              <Link
                to="/register"
                className="font-semibold text-[var(--color-primary)] transition hover:text-[var(--color-primary-hover)]"
              >
                Criar conta
              </Link>
            </p>
          </AuthCard>
        </div>
      </div>
    </div>
  );
}

function AuthBackground() {
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden">
      <div className="absolute inset-0 bg-[linear-gradient(135deg,#f5faf4_0%,#edf7ee_48%,#f9fbf7_100%)] dark:bg-[linear-gradient(135deg,#07140f_0%,#0d2118_52%,#091711_100%)]" />
      <div className="absolute left-1/2 top-0 h-72 w-72 -translate-x-1/2 rounded-full bg-emerald-200/30 blur-3xl dark:bg-emerald-900/20" />
    </div>
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

export default Login;
