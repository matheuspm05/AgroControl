import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import Button from "../../components/Button";
import FazendaGate from "../../components/FazendaGate";
import Input from "../../components/Input";
import SelectField from "../../components/SelectField";
import StatusBanner from "../../components/StatusBanner";
import { agroApi } from "../../services/api";
import { getApiErrorMessage } from "../../utils/apiError";
import {
  buildLocalOptions,
  parseLocalOption,
  tipoAnimalOptions,
} from "../../utils/animalModule";

function AnimalCreate() {
  return (
    <FazendaGate>
      {(activeFazenda) => <AnimalCreateContent activeFazenda={activeFazenda} />}
    </FazendaGate>
  );
}

function AnimalCreateContent({ activeFazenda }) {
  const navigate = useNavigate();
  const [pastos, setPastos] = useState([]);
  const [currais, setCurrais] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({
    nome: "",
    tipoAnimal: "Boi",
    peso: "",
    dataNascimento: "",
    localInicial: "",
  });

  useEffect(() => {
    let isMounted = true;

    async function loadData() {
      try {
        setLoading(true);
        setError("");

        const [pastosData, curraisData] = await Promise.all([
          agroApi.listPastos(),
          agroApi.listCurrais(),
        ]);

        if (!isMounted) {
          return;
        }

        setPastos(pastosData);
        setCurrais(curraisData);
      } catch (err) {
        if (isMounted) {
          setError(
            getApiErrorMessage(
              err,
              "Não foi possível carregar os locais disponíveis.",
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
  }, []);

  const localOptions = buildLocalOptions(pastos, currais, activeFazenda.id);

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

    const parsedLocal = parseLocalOption(form.localInicial);
    if (!parsedLocal) {
      setError("Selecione um local inicial válido para o animal.");
      return;
    }

    try {
      setSubmitting(true);
      setError("");

      const createdAnimal = await agroApi.createAnimal({
        fazendaId: activeFazenda.id,
        nome: form.nome,
        tipoAnimal: form.tipoAnimal,
        dataNascimento: form.dataNascimento || null,
        peso: form.peso === "" ? null : Number(form.peso),
        dataCadastro: null,
        tipoLocalAtual: parsedLocal.tipoLocal,
        localAtualId: parsedLocal.localId,
      });

      navigate(`/animais/${createdAnimal.id}`);
    } catch (err) {
      setError(
        getApiErrorMessage(
          err,
          "Não foi possível cadastrar o animal agora.",
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
          title="Não foi possível salvar o animal"
          message={error}
        />
      ) : null}

      {!loading && localOptions.length === 0 ? (
        <StatusBanner
          variant="warning"
          title="Cadastre um pasto ou curral antes de continuar"
          message="O backend exige um local inicial válido para criar o animal. Assim que houver ao menos um pasto ou curral nesta fazenda, o cadastro fica liberado."
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
            Preencha os dados principais do animal e escolha em qual local ele
            entra no sistema pela primeira vez.
          </p>
        </div>

        {loading ? (
          <FormLoading />
        ) : (
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

              <Input
                label="Data de nascimento"
                type="date"
                value={form.dataNascimento}
                onChange={updateField("dataNascimento")}
              />

              <SelectField
                label="Local inicial"
                value={form.localInicial}
                onChange={updateField("localInicial")}
                options={localOptions}
                placeholder="Selecione pasto ou curral"
                className="lg:col-span-2"
                required
              />
            </div>

            <div className="mt-8 flex flex-col-reverse gap-3 border-t border-slate-100 pt-5 sm:flex-row sm:justify-end">
              <Link
                to="/animais"
                className="inline-flex items-center justify-center rounded-lg border border-emerald-950/15 bg-white px-5 py-3 text-base font-semibold text-emerald-950 transition hover:bg-emerald-50"
              >
                Cancelar
              </Link>

              <Button
                type="submit"
                disabled={submitting || localOptions.length === 0}
              >
                {submitting ? "Salvando..." : "Salvar animal"}
              </Button>
            </div>
          </form>
        )}
      </section>
    </div>
  );
}

function FormLoading() {
  return (
    <div className="px-5 py-5 sm:px-6">
      <div className="grid gap-5 lg:grid-cols-2">
        {Array.from({ length: 5 }).map((_, index) => (
          <div
            key={index}
            className={`ag-skeleton animate-pulse rounded-lg ${
              index === 0 || index === 4 ? "lg:col-span-2" : ""
            } h-24`}
          />
        ))}
      </div>
    </div>
  );
}

export default AnimalCreate;
