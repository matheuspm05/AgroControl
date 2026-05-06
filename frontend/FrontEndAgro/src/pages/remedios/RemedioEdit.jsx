import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import Button from "../../components/Button";
import FazendaGate from "../../components/FazendaGate";
import Input from "../../components/Input";
import StatusBanner from "../../components/StatusBanner";
import StatusChip from "../../components/StatusChip";
import { agroApi } from "../../services/api";
import { getApiErrorMessage } from "../../utils/apiError";
import { buildRemedioPayload } from "../../utils/remedioModule";
import { formatDate } from "../../utils/formatters";

function RemedioEdit() {
  return (
    <FazendaGate>
      {(activeFazenda) => <RemedioEditContent activeFazenda={activeFazenda} />}
    </FazendaGate>
  );
}

function RemedioEditContent({ activeFazenda }) {
  const navigate = useNavigate();
  const { remedioId } = useParams();
  const [remedio, setRemedio] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [statusUpdating, setStatusUpdating] = useState(false);
  const [form, setForm] = useState({
    nome: "",
    descricao: "",
    dosePadrao: "",
  });

  useEffect(() => {
    let isMounted = true;

    async function loadData() {
      try {
        setLoading(true);
        setError("");

        const remedioData = await agroApi.getRemedio(remedioId);
        if (!isMounted) {
          return;
        }

        setRemedio(remedioData);
        setForm({
          nome: remedioData.nome || "",
          descricao: remedioData.descricao || "",
          dosePadrao:
            remedioData.dosePadrao === null || remedioData.dosePadrao === undefined
              ? ""
              : String(remedioData.dosePadrao),
        });
      } catch (err) {
        if (isMounted) {
          setError(
            getApiErrorMessage(
              err,
              "Não foi possível carregar os dados do remédio.",
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
  }, [remedioId]);

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

    if (!remedio) {
      return;
    }

    try {
      setSubmitting(true);
      setError("");

      const payload = buildRemedioPayload(remedio, {
        nome: form.nome,
        descricao: form.descricao || null,
        dosePadrao: form.dosePadrao === "" ? null : Number(form.dosePadrao),
      });

      await agroApi.updateRemedio(remedio.id, payload);
      setRemedio((current) =>
        current
          ? {
              ...current,
              nome: payload.nome,
              descricao: payload.descricao,
              dosePadrao: payload.dosePadrao,
            }
          : current,
      );
    } catch (err) {
      setError(
        getApiErrorMessage(
          err,
          "Não foi possível salvar as alterações do remédio.",
        ),
      );
    } finally {
      setSubmitting(false);
    }
  }

  async function handleToggleStatus() {
    if (!remedio) {
      return;
    }

    try {
      setStatusUpdating(true);
      setError("");

      const nextStatus = !remedio.ativo;
      await agroApi.updateRemedio(
        remedio.id,
        buildRemedioPayload(remedio, {
          ativo: nextStatus,
        }),
      );

      setRemedio((current) =>
        current ? { ...current, ativo: nextStatus } : current,
      );
    } catch (err) {
      setError(
        getApiErrorMessage(
          err,
          "Não foi possível alterar o status do remédio.",
        ),
      );
    } finally {
      setStatusUpdating(false);
    }
  }

  async function handleDelete() {
    if (!remedio) {
      return;
    }

    const confirmed = window.confirm(
      `Deseja excluir o remédio "${remedio.nome}"? Essa ação não pode ser desfeita.`,
    );

    if (!confirmed) {
      return;
    }

    try {
      setDeleting(true);
      setError("");
      await agroApi.deleteRemedio(remedio.id);
      navigate("/remedios");
    } catch (err) {
      setError(
        getApiErrorMessage(
          err,
          "Não foi possível excluir o remédio agora.",
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

      {remedio && remedio.fazendaId !== activeFazenda.id ? (
        <StatusBanner
          variant="info"
          title="Remédio carregado fora da fazenda ativa"
          message="A edição continua disponível, mas vale revisar a fazenda ativa do ambiente para manter o contexto alinhado."
        />
      ) : null}

      <section className="overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm">
        <div className="border-b border-emerald-950/8 px-5 py-5 sm:px-6">
          <p className="text-sm font-semibold uppercase tracking-wide text-emerald-700">
            Dados do remédio
          </p>
          <h2 className="mt-2 text-2xl font-bold text-emerald-950">
            {remedio ? `Editar ${remedio.nome}` : "Editar remédio"}
          </h2>
        </div>

        {loading ? (
          <EditLoading />
        ) : remedio ? (
          <form onSubmit={handleSubmit} className="px-5 py-5 sm:px-6">
            <div className="grid gap-5 lg:grid-cols-2">
              <Input
                label="Nome do remédio"
                placeholder="Digite o nome do remédio"
                value={form.nome}
                onChange={updateField("nome")}
                className="lg:col-span-2"
                required
              />

              <Input
                label="Descrição"
                placeholder="Descreva o remédio, uso principal e observações"
                value={form.descricao}
                onChange={updateField("descricao")}
                className="lg:col-span-2"
                multiline
                rows={6}
              />

              <Input
                label="Dose padrão (ml)"
                type="number"
                min="0"
                step="0.01"
                placeholder="Ex.: 10"
                value={form.dosePadrao}
                onChange={updateField("dosePadrao")}
              />
            </div>

            <div className="mt-8 grid gap-4 rounded-lg border border-slate-200 bg-slate-50 px-4 py-4 sm:grid-cols-2 xl:grid-cols-4">
              <DataItem label="Fazenda" value={`#${remedio.fazendaId}`} />
              <DataItem label="Cadastro" value={formatDate(remedio.dataCadastro)} />
              <DataItem
                label="Dose padrão"
                value={
                  remedio.dosePadrao === null || remedio.dosePadrao === undefined
                    ? "Não informada"
                    : `${remedio.dosePadrao} ml`
                }
              />
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Status
                </p>
                <div className="mt-2">
                  <StatusChip active={remedio.ativo} />
                </div>
              </div>
            </div>

            <div className="mt-8 flex flex-col-reverse gap-3 border-t border-slate-100 pt-5 sm:flex-row sm:flex-wrap sm:justify-start">
              <Button type="submit" disabled={submitting}>
                {submitting ? "Salvando..." : "Salvar Alterações"}
              </Button>

              <Link
                to="/remedios"
                className="inline-flex items-center justify-center rounded-lg border border-emerald-950/15 bg-white px-5 py-3 text-base font-semibold text-emerald-950 transition hover:bg-emerald-50"
              >
                Cancelar
              </Link>

              <button
                type="button"
                onClick={() => void handleToggleStatus()}
                disabled={statusUpdating}
                className="inline-flex items-center justify-center rounded-lg border border-amber-200 bg-amber-50 px-5 py-3 text-base font-semibold text-amber-800 transition hover:bg-amber-100 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {statusUpdating
                  ? "Atualizando..."
                  : remedio.ativo
                    ? "Desativar remédio"
                    : "Ativar remédio"}
              </button>

              <button
                type="button"
                onClick={() => void handleDelete()}
                disabled={deleting}
                className="inline-flex items-center justify-center rounded-lg border border-rose-200 bg-rose-50 px-5 py-3 text-base font-semibold text-rose-700 transition hover:bg-rose-100 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {deleting ? "Excluindo..." : "Excluir remédio"}
              </button>
            </div>
          </form>
        ) : (
          <div className="px-5 py-10 sm:px-6">
            <p className="text-base text-slate-600">
              O remédio solicitado não foi encontrado.
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
        {Array.from({ length: 4 }).map((_, index) => (
          <div
            key={index}
            className={`ag-skeleton animate-pulse rounded-lg ${
              index === 0 || index === 1 ? "lg:col-span-2" : ""
            } h-24`}
          />
        ))}
      </div>
    </div>
  );
}

export default RemedioEdit;
