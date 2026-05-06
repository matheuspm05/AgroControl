import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import Button from "../../components/Button";
import FazendaGate from "../../components/FazendaGate";
import Input from "../../components/Input";
import SelectField from "../../components/SelectField";
import StatusBanner from "../../components/StatusBanner";
import { agroApi } from "../../services/api";
import { getApiErrorMessage } from "../../utils/apiError";
import { getLocalDisplay, tipoAnimalOptions } from "../../utils/animalModule";
import { formatDate, formatDateInput } from "../../utils/formatters";

function AnimalEdit() {
  return (
    <FazendaGate>
      {(activeFazenda) => <AnimalEditContent activeFazenda={activeFazenda} />}
    </FazendaGate>
  );
}

function AnimalEditContent({ activeFazenda }) {
  const navigate = useNavigate();
  const { animalId } = useParams();
  const [animal, setAnimal] = useState(null);
  const [pastos, setPastos] = useState([]);
  const [currais, setCurrais] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [form, setForm] = useState({
    nome: "",
    tipoAnimal: "Boi",
    peso: "",
    dataNascimento: "",
  });

  useEffect(() => {
    let isMounted = true;

    async function loadData() {
      try {
        setLoading(true);
        setError("");

        const [animalData, pastosData, curraisData] = await Promise.all([
          agroApi.getAnimal(animalId),
          agroApi.listPastos(),
          agroApi.listCurrais(),
        ]);

        if (!isMounted) {
          return;
        }

        setAnimal(animalData);
        setPastos(pastosData);
        setCurrais(curraisData);
        setForm({
          nome: animalData.nome || "",
          tipoAnimal: animalData.tipoAnimal || "Boi",
          peso:
            animalData.peso === null || animalData.peso === undefined
              ? ""
              : String(animalData.peso),
          dataNascimento: formatDateInput(animalData.dataNascimento),
        });
      } catch (err) {
        if (isMounted) {
          setError(
            getApiErrorMessage(
              err,
              "Não foi possível carregar os dados do animal.",
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
  }, [animalId]);

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

    if (!animal) {
      return;
    }

    try {
      setSubmitting(true);
      setError("");

      await agroApi.updateAnimal(animal.id, {
        fazendaId: animal.fazendaId,
        nome: form.nome,
        tipoAnimal: form.tipoAnimal,
        dataNascimento: form.dataNascimento || null,
        peso: form.peso === "" ? null : Number(form.peso),
        dataCadastro: animal.dataCadastro,
        tipoLocalAtual: animal.tipoLocalAtual,
        localAtualId: animal.localAtualId,
      });

      navigate(`/animais/${animal.id}`);
    } catch (err) {
      setError(
        getApiErrorMessage(
          err,
          "Não foi possível salvar as alterações do animal.",
        ),
      );
    } finally {
      setSubmitting(false);
    }
  }

  async function handleDelete() {
    if (!animal) {
      return;
    }

    const confirmed = window.confirm(
      `Deseja excluir o animal "${animal.nome}"? Essa ação não pode ser desfeita.`,
    );

    if (!confirmed) {
      return;
    }

    try {
      setDeleting(true);
      setError("");
      await agroApi.deleteAnimal(animal.id);
      navigate("/animais");
    } catch (err) {
      setError(
        getApiErrorMessage(
          err,
          "Não foi possível excluir o animal agora.",
        ),
      );
    } finally {
      setDeleting(false);
    }
  }

  const localAtual = animal
    ? getLocalDisplay(
        animal.tipoLocalAtual,
        animal.localAtualId,
        pastos,
        currais,
      )
    : "—";

  return (
    <div className="space-y-5">
      {error ? (
        <StatusBanner
          title="Não foi possível concluir esta operação"
          message={error}
        />
      ) : null}

      {animal && animal.fazendaId !== activeFazenda.id ? (
        <StatusBanner
          variant="info"
          title="Animal carregado fora da fazenda ativa"
          message="O registro foi aberto diretamente por URL. As alterações continuam funcionando, mas vale revisar a fazenda ativa do ambiente."
        />
      ) : null}

      <section className="overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm">
        <div className="border-b border-emerald-950/8 px-5 py-5 sm:px-6">
          <p className="text-sm font-semibold uppercase tracking-wide text-emerald-700">
            Dados do animal
          </p>
          <h2 className="mt-2 text-2xl font-bold text-emerald-950">
            {animal ? `Editar ${animal.nome}` : "Editar animal"}
          </h2>
          <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-600">
            Atualize as informações principais do registro. O local atual fica
            bloqueado aqui para que o histórico continue sendo gerado apenas pela
            rota de movimentação.
          </p>
        </div>

        {loading ? (
          <EditLoading />
        ) : animal ? (
          <form onSubmit={handleSubmit} className="px-5 py-5 sm:px-6">
            <div className="grid gap-5 lg:grid-cols-2">
              <Input
                label="Nome do animal"
                placeholder="Digite o nome do animal"
                value={form.nome}
                onChange={updateField("nome")}
                className="lg:col-span-2"
                required
              />

              <SelectField
                label="Tipo"
                value={form.tipoAnimal}
                onChange={updateField("tipoAnimal")}
                options={tipoAnimalOptions}
              />

              <Input
                label="Peso (kg)"
                type="number"
                min="0"
                step="0.01"
                placeholder="Ex.: 450"
                value={form.peso}
                onChange={updateField("peso")}
              />

              <ReadOnlyField
                label="Local atual"
                value={localAtual}
                helperText="Para trocar o local, use a rota específica de movimentação."
              />

              <Input
                label="Data de nascimento"
                type="date"
                value={form.dataNascimento}
                onChange={updateField("dataNascimento")}
              />
            </div>

            <div className="mt-8 grid gap-4 rounded-lg border border-slate-200 bg-slate-50 px-4 py-4 sm:grid-cols-2 xl:grid-cols-3">
              <DataItem label="Fazenda" value={`#${animal.fazendaId}`} />
              <DataItem label="Cadastro" value={formatDate(animal.dataCadastro)} />
              <DataItem label="Ambiente ativo" value={activeFazenda.nome} />
            </div>

            <div className="mt-8 flex flex-col-reverse gap-3 border-t border-slate-100 pt-5 sm:flex-row sm:items-center sm:justify-between">
              <button
                type="button"
                onClick={handleDelete}
                disabled={deleting}
                className="inline-flex items-center justify-center rounded-lg border border-rose-200 bg-rose-50 px-5 py-3 text-base font-semibold text-rose-700 transition hover:bg-rose-100 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {deleting ? "Excluindo..." : "Excluir animal"}
              </button>

              <div className="flex flex-col-reverse gap-3 sm:flex-row">
                <Link
                  to={`/animais/${animal.id}`}
                  className="inline-flex items-center justify-center rounded-lg border border-emerald-950/15 bg-white px-5 py-3 text-base font-semibold text-emerald-950 transition hover:bg-emerald-50"
                >
                  Cancelar
                </Link>

                <Button type="submit" disabled={submitting}>
                  {submitting ? "Salvando..." : "Salvar alterações"}
                </Button>
              </div>
            </div>
          </form>
        ) : (
          <div className="px-5 py-10 sm:px-6">
            <p className="text-base text-slate-600">
              O animal solicitado não foi encontrado.
            </p>
          </div>
        )}
      </section>
    </div>
  );
}

function ReadOnlyField({ label, value, helperText }) {
  return (
    <div>
      <span className="mb-3 block text-base font-semibold text-slate-800">
        {label}
      </span>
      <div className="flex min-h-15 items-center rounded-lg border border-emerald-950/12 bg-emerald-50 px-4 py-3 text-base font-medium text-emerald-950">
        {value}
      </div>
      {helperText ? (
        <p className="mt-2 text-sm text-slate-500">{helperText}</p>
      ) : null}
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
              index === 0 ? "lg:col-span-2" : ""
            } h-24`}
          />
        ))}
      </div>
    </div>
  );
}

export default AnimalEdit;
