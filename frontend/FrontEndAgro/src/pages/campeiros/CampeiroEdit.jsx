import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import Button from "../../components/Button";
import FazendaGate from "../../components/FazendaGate";
import Input from "../../components/Input";
import SelectField from "../../components/SelectField";
import StatusBanner from "../../components/StatusBanner";
import { agroApi } from "../../services/api";
import { getApiErrorMessage } from "../../utils/apiError";
import {
  ESTADO_CIVIL_OPTIONS,
  buildCampeiroPayload,
  formatServiceTime,
} from "../../utils/campeiroModule";
import { formatCurrency, formatDate, formatDateInput } from "../../utils/formatters";

function CampeiroEdit() {
  return (
    <FazendaGate>
      {(activeFazenda) => <CampeiroEditContent activeFazenda={activeFazenda} />}
    </FazendaGate>
  );
}

function CampeiroEditContent({ activeFazenda }) {
  const navigate = useNavigate();
  const { campeiroId } = useParams();
  const [campeiro, setCampeiro] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [form, setForm] = useState({
    nome: "",
    dataAdmissao: "",
    salario: "",
    telefone: "",
    cpf: "",
    estadoCivil: "",
    observacoes: "",
  });

  useEffect(() => {
    let isMounted = true;

    async function loadData() {
      try {
        setLoading(true);
        setError("");

        const campeiroData = await agroApi.getCampeiro(campeiroId);
        if (!isMounted) {
          return;
        }

        setCampeiro(campeiroData);
        setForm({
          nome: campeiroData.nome || "",
          dataAdmissao: formatDateInput(campeiroData.dataAdmissao),
          salario:
            campeiroData.salario === null || campeiroData.salario === undefined
              ? ""
              : String(campeiroData.salario),
          telefone: campeiroData.telefone || "",
          cpf: campeiroData.cpf || "",
          estadoCivil: campeiroData.estadoCivil || "",
          observacoes: campeiroData.observacoes || "",
        });
      } catch (err) {
        if (isMounted) {
          setError(
            getApiErrorMessage(
              err,
              "Não foi possível carregar os dados do campeiro.",
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
  }, [campeiroId]);

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

    if (!campeiro) {
      return;
    }

    try {
      setSubmitting(true);
      setError("");

      await agroApi.updateCampeiro(
        campeiro.id,
        buildCampeiroPayload(campeiro, {
          nome: form.nome,
          dataAdmissao: form.dataAdmissao || null,
          salario: form.salario === "" ? null : Number(form.salario),
          estadoCivil: form.estadoCivil || null,
          telefone: form.telefone || null,
          cpf: form.cpf || null,
          observacoes: form.observacoes || null,
        }),
      );

      navigate(`/campeiros/${campeiro.id}`);
    } catch (err) {
      setError(
        getApiErrorMessage(
          err,
          "Não foi possível salvar as alterações do campeiro.",
        ),
      );
    } finally {
      setSubmitting(false);
    }
  }

  async function handleDelete() {
    if (!campeiro) {
      return;
    }

    const confirmed = window.confirm(
      `Deseja excluir o campeiro "${campeiro.nome}"? Essa ação não pode ser desfeita.`,
    );

    if (!confirmed) {
      return;
    }

    try {
      setDeleting(true);
      setError("");
      await agroApi.deleteCampeiro(campeiro.id);
      navigate("/campeiros");
    } catch (err) {
      setError(
        getApiErrorMessage(
          err,
          "Não foi possível excluir o campeiro agora.",
        ),
      );
    } finally {
      setDeleting(false);
    }
  }

  return (
    <div className="space-y-5">
      {error ? (
        <StatusBanner
          title="Não foi possível concluir esta operação"
          message={error}
        />
      ) : null}

      {campeiro && campeiro.fazendaId !== activeFazenda.id ? (
        <StatusBanner
          variant="info"
          title="Campeiro carregado fora da fazenda ativa"
          message="A edição continua disponível, mas vale revisar a fazenda ativa do ambiente para manter o contexto alinhado."
        />
      ) : null}

      <section className="overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm">
        <div className="flex flex-col gap-4 border-b border-emerald-950/8 px-5 py-5 sm:px-6 xl:flex-row xl:items-start xl:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-wide text-emerald-700">
              Dados do campeiro
            </p>
            <h2 className="mt-2 text-2xl font-bold text-emerald-950">
              {campeiro ? `Editar ${campeiro.nome}` : "Editar campeiro"}
            </h2>
            <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-600">
              Atualize as informações cadastrais e os dados de trabalho do
              campeiro.
            </p>
          </div>

          {campeiro ? (
            <Link
              to={`/campeiros/${campeiro.id}`}
              className="inline-flex items-center justify-center rounded-lg border border-emerald-950/15 bg-white px-5 py-3 text-base font-semibold text-emerald-950 transition hover:bg-emerald-50"
            >
              Voltar para detalhes
            </Link>
          ) : null}
        </div>

        {loading ? (
          <EditLoading />
        ) : campeiro ? (
          <>
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

              <div className="mt-8 grid gap-4 rounded-lg border border-slate-200 bg-slate-50 px-4 py-4 sm:grid-cols-2 xl:grid-cols-4">
                <DataItem label="Fazenda" value={`#${campeiro.fazendaId}`} />
                <DataItem
                  label="Tempo de serviço"
                  value={formatServiceTime(campeiro.dataAdmissao)}
                />
                <DataItem
                  label="Admissão atual"
                  value={formatDate(campeiro.dataAdmissao)}
                />
                <DataItem
                  label="Salário atual"
                  value={formatCurrency(campeiro.salario)}
                />
              </div>

              <div className="mt-8 flex flex-col-reverse gap-3 border-t border-slate-100 pt-5 sm:flex-row sm:justify-end">
                <Link
                  to={`/campeiros/${campeiro.id}`}
                  className="inline-flex items-center justify-center rounded-lg border border-emerald-950/15 bg-white px-5 py-3 text-base font-semibold text-emerald-950 transition hover:bg-emerald-50"
                >
                  Cancelar
                </Link>

                <Button type="submit" disabled={submitting}>
                  {submitting ? "Salvando..." : "Salvar alterações"}
                </Button>
              </div>
            </form>

            <div className="border-t border-slate-100 px-5 py-5 sm:px-6">
              <StatusBanner
                title="Excluir campeiro"
                message="A exclusão remove o cadastro do campeiro da fazenda. Use apenas quando o registro não for mais necessário."
                variant="warning"
              />

              <div className="mt-4 flex justify-end">
                <button
                  type="button"
                  onClick={() => void handleDelete()}
                  disabled={deleting}
                  className="inline-flex items-center justify-center rounded-lg border border-rose-200 bg-rose-50 px-5 py-3 text-base font-semibold text-rose-700 transition hover:bg-rose-100 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {deleting ? "Excluindo..." : "Excluir campeiro"}
                </button>
              </div>
            </div>
          </>
        ) : (
          <div className="px-5 py-10 sm:px-6">
            <p className="text-base text-slate-600">
              O campeiro solicitado não foi encontrado.
            </p>
          </div>
        )}
      </section>
    </div>
  );
}

function DataItem({ label, value }) {
  return (
    <div>
      <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
        {label}
      </p>
      <p className="mt-2 text-sm font-medium text-slate-700">{value}</p>
    </div>
  );
}

function EditLoading() {
  return (
    <div className="px-5 py-5 sm:px-6">
      <div className="grid gap-5 lg:grid-cols-2">
        {Array.from({ length: 6 }).map((_, index) => (
          <div
            key={index}
            className={`ag-skeleton animate-pulse rounded-lg ${
              index === 0 || index === 5 ? "h-15 lg:col-span-2" : "h-15"
            }`}
          />
        ))}
      </div>
    </div>
  );
}

export default CampeiroEdit;
