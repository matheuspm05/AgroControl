import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import Button from "../../components/Button";
import FazendaGate from "../../components/FazendaGate";
import Input from "../../components/Input";
import StatusBanner from "../../components/StatusBanner";
import { agroApi } from "../../services/api";
import { getApiErrorMessage } from "../../utils/apiError";

function CurralCreate() {
  return (
    <FazendaGate>
      {(activeFazenda) => <CurralCreateContent activeFazenda={activeFazenda} />}
    </FazendaGate>
  );
}

function CurralCreateContent({ activeFazenda }) {
  const navigate = useNavigate();
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({
    nome: "",
    capacidadeMaxima: "",
  });

  function updateField(field) {
    return (event) => {
      setForm((current) => ({
        ...current,
        [field]: event.target.value,
      }));
    };
  }

  async function handleSubmit(event) {
    event.preventDefault();

    try {
      setSubmitting(true);
      setError("");

      const curral = await agroApi.createCurral({
        fazendaId: activeFazenda.id,
        nome: form.nome,
        capacidadeMaxima:
          form.capacidadeMaxima === "" ? null : Number(form.capacidadeMaxima),
        dataCadastro: null,
      });

      navigate(`/currais/${curral.id}`);
    } catch (err) {
      setError(
        getApiErrorMessage(
          err,
          "Não foi possível cadastrar o curral agora.",
        ),
      );
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="space-y-5">
      {error ? (
        <StatusBanner
          title="Não foi possível salvar o curral"
          message={error}
        />
      ) : null}

      <section className="overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm">
        <div className="border-b border-emerald-950/8 px-5 py-5 sm:px-6">
          <p className="text-sm font-semibold uppercase tracking-wide text-emerald-700">
            Fazenda ativa
          </p>
          <h2 className="mt-2 text-2xl font-bold text-emerald-950">
            {activeFazenda.nome}
          </h2>
          <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-600">
            Cadastre um novo curral informando nome e capacidade máxima para o
            manejo da fazenda.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="px-5 py-5 sm:px-6">
          <div className="grid gap-5 lg:grid-cols-2">
            <Input
              label="Nome do curral"
              placeholder="Digite o nome do curral"
              value={form.nome}
              onChange={updateField("nome")}
              className="lg:col-span-2"
              required
            />

            <Input
              label="Capacidade máxima"
              type="number"
              min="0"
              step="1"
              placeholder="Ex.: 30"
              value={form.capacidadeMaxima}
              onChange={updateField("capacidadeMaxima")}
            />
          </div>

          <div className="mt-8 flex flex-col-reverse gap-3 border-t border-slate-100 pt-5 sm:flex-row sm:justify-end">
            <Link
              to="/currais"
              className="inline-flex items-center justify-center rounded-lg border border-emerald-950/15 bg-white px-5 py-3 text-base font-semibold text-emerald-950 transition hover:bg-emerald-50"
            >
              Cancelar
            </Link>

            <Button type="submit" disabled={submitting}>
              {submitting ? "Salvando..." : "Salvar curral"}
            </Button>
          </div>
        </form>
      </section>
    </div>
  );
}

export default CurralCreate;
