import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import Button from "../../components/Button";
import FazendaGate from "../../components/FazendaGate";
import Input from "../../components/Input";
import SelectField from "../../components/SelectField";
import StatusBanner from "../../components/StatusBanner";
import { agroApi } from "../../services/api";
import { getApiErrorMessage } from "../../utils/apiError";
import { ESTADO_CIVIL_OPTIONS } from "../../utils/campeiroModule";

function CampeiroCreate() {
  return (
    <FazendaGate>
      {(activeFazenda) => (
        <CampeiroCreateContent activeFazenda={activeFazenda} />
      )}
    </FazendaGate>
  );
}

function CampeiroCreateContent({ activeFazenda }) {
  const navigate = useNavigate();
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({
    nome: "",
    dataAdmissao: "",
    salario: "",
    telefone: "",
    cpf: "",
    estadoCivil: "Solteiro",
    observacoes: "",
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

      const campeiro = await agroApi.createCampeiro({
        fazendaId: activeFazenda.id,
        nome: form.nome,
        dataAdmissao: form.dataAdmissao || null,
        salario: form.salario === "" ? null : Number(form.salario),
        estadoCivil: form.estadoCivil || null,
        telefone: form.telefone || null,
        cpf: form.cpf || null,
        observacoes: form.observacoes || null,
      });

      navigate(`/campeiros/${campeiro.id}`);
    } catch (err) {
      setError(
        getApiErrorMessage(
          err,
          "Não foi possível cadastrar o campeiro agora.",
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
          title="Não foi possível salvar o campeiro"
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
            Cadastre um campeiro com dados de contato, admissão, salário e
            observações importantes para a rotina da fazenda.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="px-5 py-5 sm:px-6">
          <div className="grid gap-5 lg:grid-cols-2">
            <Input
              label="Nome"
              placeholder="Digite o nome do campeiro"
              value={form.nome}
              onChange={updateField("nome")}
              className="lg:col-span-2"
              required
            />

            <Input
              label="Data de admissão"
              type="date"
              value={form.dataAdmissao}
              onChange={updateField("dataAdmissao")}
            />

            <Input
              label="Salário"
              type="number"
              min="0"
              step="0.01"
              placeholder="Ex.: 2500"
              value={form.salario}
              onChange={updateField("salario")}
            />

            <Input
              label="Telefone"
              placeholder="Ex.: (55) 99988-7766"
              value={form.telefone}
              onChange={updateField("telefone")}
            />

            <Input
              label="CPF"
              placeholder="Ex.: 123.456.789-00"
              value={form.cpf}
              onChange={updateField("cpf")}
            />

            <SelectField
              label="Estado civil"
              options={ESTADO_CIVIL_OPTIONS}
              value={form.estadoCivil}
              onChange={updateField("estadoCivil")}
            />

            <Input
              label="Observações"
              placeholder="Observações sobre função, endereço ou rotina"
              value={form.observacoes}
              onChange={updateField("observacoes")}
              className="lg:col-span-2"
              multiline
              rows={4}
            />
          </div>

          <div className="mt-8 flex flex-col-reverse gap-3 border-t border-slate-100 pt-5 sm:flex-row sm:justify-end">
            <Link
              to="/campeiros"
              className="inline-flex items-center justify-center rounded-lg border border-emerald-950/15 bg-white px-5 py-3 text-base font-semibold text-emerald-950 transition hover:bg-emerald-50"
            >
              Cancelar
            </Link>

            <Button type="submit" disabled={submitting}>
              {submitting ? "Salvando..." : "Salvar campeiro"}
            </Button>
          </div>
        </form>
      </section>
    </div>
  );
}

export default CampeiroCreate;
