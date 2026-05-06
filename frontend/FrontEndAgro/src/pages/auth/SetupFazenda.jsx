import { Link, useNavigate } from "react-router-dom";
import { useState } from "react";
import AuthCard from "../../components/AuthCard";
import Button from "../../components/Button";
import Input from "../../components/Input";
import Logo from "../../components/Logo";
import StatusBanner from "../../components/StatusBanner";
import useFazenda from "../../hooks/useFazenda";
import { agroApi } from "../../services/api";
import { getApiErrorMessage } from "../../utils/apiError";

function SetupFazenda() {
  const navigate = useNavigate();
  const { refreshFazendas } = useFazenda();
  const [form, setForm] = useState({
    nomeFazenda: "",
    localizacao: "",
    tamanho: "",
    descricao: "",
  });
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(event) {
    event.preventDefault();

    try {
      setSubmitting(true);
      setError("");

      const fazenda = await agroApi.createFazenda({
        nome: form.nomeFazenda,
        dataCriacao: null,
        localizacao: form.localizacao || null,
        tamanhoPropriedade:
          form.tamanho === "" ? null : Number(form.tamanho),
        descricao: form.descricao || null,
      });

      await refreshFazendas(fazenda.id);
      navigate("/dashboard");
    } catch (err) {
      setError(
        getApiErrorMessage(
          err,
          "Não foi possível cadastrar a fazenda agora.",
        ),
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
    <div className="relative min-h-screen overflow-hidden bg-[linear-gradient(135deg,#f6faf4_0%,#edf7ee_48%,#f9fbf7_100%)] px-4 py-6 text-[var(--color-ink)] sm:px-6 sm:py-10 dark:bg-[linear-gradient(135deg,#07140f_0%,#0d2118_52%,#091711_100%)]">
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute left-1/2 top-0 h-80 w-80 -translate-x-1/2 rounded-full bg-emerald-200/30 blur-3xl dark:bg-emerald-900/20" />
      </div>

      <div className="relative z-10 mx-auto flex min-h-[calc(100vh-3rem)] max-w-5xl flex-col items-center justify-center sm:min-h-[calc(100vh-5rem)]">
        <div className="mb-5 flex w-full justify-center">
          <Link
            to="/"
            className="auth-back-link inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold shadow-sm backdrop-blur transition focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[var(--color-focus)]"
          >
            <span aria-hidden="true">←</span>
            <span>Voltar para o início</span>
          </Link>
        </div>

        <p className="text-center text-base font-medium text-slate-700 dark:text-emerald-50/85 sm:text-2xl">
          <span className="font-semibold text-emerald-950 dark:text-white">
            Etapa 2 de 2
          </span>{" "}
          - Cadastro da fazenda
        </p>

        <Logo
          className="mt-8 h-18 w-64 justify-center sm:w-72"
          imageClassName="h-18 origin-center scale-[2.1] sm:scale-[2.25]"
        />

        <div className="mt-8 max-w-3xl text-center">
          <h1 className="text-3xl font-black tracking-[-0.04em] text-emerald-950 dark:text-white sm:text-5xl">
            Vamos cadastrar sua fazenda
          </h1>
          <p className="mt-4 text-lg leading-8 text-slate-600 dark:text-emerald-50/78">
            Preencha os dados abaixo para começar a usar o sistema.
          </p>
        </div>

        <AuthCard className="mt-8 w-full max-w-3xl">
          {error ? (
            <StatusBanner
              title="Não foi possível concluir o cadastro"
              message={error}
            />
          ) : null}

          <form onSubmit={handleSubmit} className="space-y-5">
            <Input
              label="Nome da fazenda"
              placeholder="Digite o nome da fazenda"
              value={form.nomeFazenda}
              onChange={updateField("nomeFazenda")}
              icon={FarmIcon}
              required
            />

            <Input
              label="Localização"
              placeholder="Digite a localização"
              value={form.localizacao}
              onChange={updateField("localizacao")}
              icon={PinIcon}
            />

            <Input
              label="Tamanho da propriedade"
              type="number"
              min="0"
              step="0.01"
              placeholder="Número de hectares"
              value={form.tamanho}
              onChange={updateField("tamanho")}
              rightElement={
                <span className="text-sm font-medium text-[var(--color-text-muted)]">hectares</span>
              }
            />

            <Input
              label="Descrição (opcional)"
              placeholder="Descrição da fazenda (opcional)"
              value={form.descricao}
              onChange={updateField("descricao")}
              multiline
              rows={4}
            />

            <div className="pt-2">
              <Button type="submit" fullWidth disabled={submitting}>
                {submitting ? "Salvando fazenda..." : "Concluir cadastro"}
              </Button>
            </div>
          </form>

          <div className="mt-5 text-center">
            <Link
              to="/register"
              className="inline-flex items-center justify-center rounded-2xl px-4 py-2 text-base font-medium text-slate-600 transition hover:bg-slate-100 hover:text-slate-800"
            >
              Voltar para cadastro
            </Link>
          </div>
        </AuthCard>
      </div>
    </div>
  );
}

function FarmIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-6 w-6 fill-current" aria-hidden="true">
      <path d="M3 19.5h18v2H3v-2Zm2.4-1.4V10l6.6-4.7 6.6 4.7v8.1h-3.1v-4.5h-3v4.5H5.4Zm10.9-8.4h1.7V7.4h-1.7v2.3ZM7.3 9.7H9V7.4H7.3v2.3Z" />
    </svg>
  );
}

function PinIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-6 w-6 fill-current" aria-hidden="true">
      <path d="M12 2.7a6.1 6.1 0 0 0-6.1 6.1c0 4.3 6.1 12.6 6.1 12.6s6.1-8.3 6.1-12.6A6.1 6.1 0 0 0 12 2.7Zm0 8.5a2.4 2.4 0 1 1 0-4.8 2.4 2.4 0 0 1 0 4.8Z" />
    </svg>
  );
}

export default SetupFazenda;
