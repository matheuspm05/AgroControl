import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import Button from "../../components/Button";
import FazendaGate from "../../components/FazendaGate";
import Input from "../../components/Input";
import OccupancyPill from "../../components/OccupancyPill";
import StatusBanner from "../../components/StatusBanner";
import { agroApi } from "../../services/api";
import { getApiErrorMessage } from "../../utils/apiError";
import { formatDate } from "../../utils/formatters";

function CurralEdit() {
  return (
    <FazendaGate>
      {(activeFazenda) => <CurralEditContent activeFazenda={activeFazenda} />}
    </FazendaGate>
  );
}

function CurralEditContent({ activeFazenda }) {
  const navigate = useNavigate();
  const { curralId } = useParams();
  const [curral, setCurral] = useState(null);
  const [animais, setAnimais] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [form, setForm] = useState({
    nome: "",
    capacidadeMaxima: "",
  });

  useEffect(() => {
    let isMounted = true;

    async function loadData() {
      try {
        setLoading(true);
        setError("");

        const [curralData, animaisData] = await Promise.all([
          agroApi.getCurral(curralId),
          agroApi.getCurralAnimais(curralId),
        ]);

        if (!isMounted) {
          return;
        }

        setCurral(curralData);
        setAnimais(animaisData);
        setForm({
          nome: curralData.nome || "",
          capacidadeMaxima:
            curralData.capacidadeMaxima === null ||
            curralData.capacidadeMaxima === undefined
              ? ""
              : String(curralData.capacidadeMaxima),
        });
      } catch (err) {
        if (isMounted) {
          setError(
            getApiErrorMessage(
              err,
              "Não foi possível carregar os dados do curral.",
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
  }, [curralId]);

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

    if (!curral) {
      return;
    }

    try {
      setSubmitting(true);
      setError("");

      await agroApi.updateCurral(curral.id, {
        fazendaId: curral.fazendaId,
        nome: form.nome,
        capacidadeMaxima:
          form.capacidadeMaxima === "" ? null : Number(form.capacidadeMaxima),
        dataCadastro: curral.dataCadastro,
      });

      navigate(`/currais/${curral.id}`);
    } catch (err) {
      setError(
        getApiErrorMessage(
          err,
          "Não foi possível salvar as alterações do curral.",
        ),
      );
    } finally {
      setSubmitting(false);
    }
  }

  async function handleDelete() {
    if (!curral) {
      return;
    }

    const confirmed = window.confirm(
      `Deseja excluir o curral "${curral.nome}"? Essa ação não pode ser desfeita.`,
    );

    if (!confirmed) {
      return;
    }

    try {
      setDeleting(true);
      setError("");
      await agroApi.deleteCurral(curral.id);
      navigate("/currais");
    } catch (err) {
      setError(
        getApiErrorMessage(
          err,
          "Não foi possível excluir o curral agora.",
        ),
      );
    } finally {
      setDeleting(false);
    }
  }

  const hasAnimaisVinculados = animais.length > 0;

  return (
    <div className="space-y-5">
      {error ? (
        <StatusBanner
          title="Não foi possível concluir esta operação"
          message={error}
        />
      ) : null}

      {curral && curral.fazendaId !== activeFazenda.id ? (
        <StatusBanner
          variant="info"
          title="Curral carregado fora da fazenda ativa"
          message="A edição continua disponível, mas vale revisar a fazenda ativa do ambiente para manter o contexto alinhado."
        />
      ) : null}

      <section className="overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm">
        <div className="border-b border-emerald-950/8 px-5 py-5 sm:px-6">
          <p className="text-sm font-semibold uppercase tracking-wide text-emerald-700">
            Dados do curral
          </p>
          <h2 className="mt-2 text-2xl font-bold text-emerald-950">
            {curral ? `Editar ${curral.nome}` : "Editar curral"}
          </h2>
          <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-600">
            Atualize os dados do curral. A exclusão fica bloqueada enquanto houver
            animais vinculados a este local.
          </p>
        </div>

        {loading ? (
          <EditLoading />
        ) : curral ? (
          <>
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

              <div className="mt-8 grid gap-4 rounded-lg border border-slate-200 bg-slate-50 px-4 py-4 sm:grid-cols-2 xl:grid-cols-4">
                <DataItem label="Fazenda" value={`#${curral.fazendaId}`} />
                <DataItem
                  label="Capacidade atual"
                  value={curral.capacidadeMaxima ?? "Não informado"}
                />
                <DataItem
                  label="Cadastro"
                  value={formatDate(curral.dataCadastro)}
                />
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                    Ocupação
                  </p>
                  <div className="mt-2">
                    <OccupancyPill
                      capacidadeMaxima={curral.capacidadeMaxima}
                      ocupacaoAtual={animais.length}
                      compact
                    />
                  </div>
                </div>
              </div>

              <div className="mt-8 flex flex-col-reverse gap-3 border-t border-slate-100 pt-5 sm:flex-row sm:justify-end">
                <Link
                  to={`/currais/${curral.id}`}
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
              {hasAnimaisVinculados ? (
                <StatusBanner
                  title="Não é possível excluir este curral agora"
                  message="Existem animais vinculados a este curral. Movimente os animais antes de tentar excluir."
                  variant="error"
                />
              ) : (
                <StatusBanner
                  title="Exclusão disponível"
                  message="Nenhum animal está vinculado a este curral neste momento."
                  variant="warning"
                />
              )}

              <div className="mt-4 flex justify-end">
                <button
                  type="button"
                  onClick={handleDelete}
                  disabled={hasAnimaisVinculados || deleting}
                  className="inline-flex items-center justify-center rounded-lg border border-rose-200 bg-rose-50 px-5 py-3 text-base font-semibold text-rose-700 transition hover:bg-rose-100 disabled:cursor-not-allowed disabled:border-slate-200 disabled:bg-slate-100 disabled:text-slate-400"
                >
                  {deleting ? "Excluindo..." : "Excluir curral"}
                </button>
              </div>
            </div>
          </>
        ) : (
          <div className="px-5 py-10 sm:px-6">
            <p className="text-base text-slate-600">
              O curral solicitado não foi encontrado.
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
        {Array.from({ length: 5 }).map((_, index) => (
          <div
            key={index}
            className={`ag-skeleton animate-pulse rounded-lg ${
              index === 0 ? "lg:col-span-2" : ""
            } h-24`}
          />
        ))}
      </div>
    </div>
  );
}

export default CurralEdit;
