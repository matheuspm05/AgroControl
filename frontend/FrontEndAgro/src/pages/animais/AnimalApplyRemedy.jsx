import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import Button from "../../components/Button";
import FazendaGate from "../../components/FazendaGate";
import Input from "../../components/Input";
import SelectField from "../../components/SelectField";
import StatusBanner from "../../components/StatusBanner";
import { agroApi } from "../../services/api";
import { getApiErrorMessage } from "../../utils/apiError";
import { getLocalDisplay, getTodayInputValue } from "../../utils/animalModule";

function AnimalApplyRemedy() {
  return (
    <FazendaGate>
      {(activeFazenda) => (
        <AnimalApplyRemedyContent activeFazenda={activeFazenda} />
      )}
    </FazendaGate>
  );
}

function AnimalApplyRemedyContent({ activeFazenda }) {
  const navigate = useNavigate();
  const { animalId } = useParams();
  const [animal, setAnimal] = useState(null);
  const [pastos, setPastos] = useState([]);
  const [currais, setCurrais] = useState([]);
  const [remedios, setRemedios] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({
    remedioId: "",
    dataAplicacao: getTodayInputValue(),
    dose: "",
    observacao: "",
  });

  useEffect(() => {
    let isMounted = true;

    async function loadData() {
      try {
        setLoading(true);
        setError("");

        const [animalData, pastosData, curraisData, remediosData] =
          await Promise.all([
            agroApi.getAnimal(animalId),
            agroApi.listPastos(),
            agroApi.listCurrais(),
            agroApi.listRemedios(),
          ]);

        if (!isMounted) {
          return;
        }

        setAnimal(animalData);
        setPastos(pastosData);
        setCurrais(curraisData);
        setRemedios(remediosData);
      } catch (err) {
        if (isMounted) {
          setError(
            getApiErrorMessage(
              err,
              "Não foi possível carregar os dados para aplicação de remédio.",
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

  const remediosDaFazenda = animal
    ? remedios.filter(
        (item) => item.fazendaId === animal.fazendaId && item.ativo,
      )
    : [];

  function updateField(field) {
    return (event) => {
      const nextValue = event.target.value;

      setForm((current) => {
        const nextForm = {
          ...current,
          [field]: nextValue,
        };

        if (field === "remedioId" && current.dose === "") {
          const selectedRemedio = remediosDaFazenda.find(
            (item) => item.id === Number(nextValue),
          );

          if (
            selectedRemedio &&
            selectedRemedio.dosePadrao !== null &&
            selectedRemedio.dosePadrao !== undefined
          ) {
            nextForm.dose = String(selectedRemedio.dosePadrao);
          }
        }

        return nextForm;
      });
    };
  }

  async function handleSubmit(event) {
    event.preventDefault();

    if (!animal) {
      return;
    }

    if (!form.remedioId) {
      setError("Selecione um remédio para registrar a aplicação.");
      return;
    }

    try {
      setSubmitting(true);
      setError("");

      await agroApi.createAplicacaoRemedio({
        fazendaId: animal.fazendaId,
        animalId: animal.id,
        remedioId: Number(form.remedioId),
        doseAplicada: Number(form.dose),
        dataAplicacao: form.dataAplicacao,
        observacao: form.observacao || null,
        ativo: true,
      });

      navigate(`/animais/${animal.id}`);
    } catch (err) {
      setError(
        getApiErrorMessage(
          err,
          "Não foi possível registrar a aplicação de remédio agora.",
        ),
      );
    } finally {
      setSubmitting(false);
    }
  }

  const selectedRemedio = remediosDaFazenda.find(
    (item) => item.id === Number(form.remedioId),
  );

  return (
    <div className="space-y-5">
      {error ? (
        <StatusBanner
          title="Não foi possível concluir a aplicação"
          message={error}
        />
      ) : null}

      {animal && animal.fazendaId !== activeFazenda.id ? (
        <StatusBanner
          variant="info"
          title="Animal carregado fora da fazenda ativa"
          message="O formulário continua conectado ao backend, mas a fazenda ativa do layout pode não representar este registro."
        />
      ) : null}

      {!loading && remediosDaFazenda.length === 0 ? (
        <StatusBanner
          variant="warning"
          title="Nenhum remédio ativo disponível nesta fazenda"
          message="Cadastre ou reative um remédio antes de tentar registrar a aplicação para este animal."
        />
      ) : null}

      <section className="overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm">
        <div className="border-b border-emerald-950/8 px-5 py-5 sm:px-6">
          <p className="text-sm font-semibold uppercase tracking-wide text-emerald-700">
            Aplicação de remédio
          </p>
          <h2 className="mt-2 text-2xl font-bold text-emerald-950">
            {animal ? `Aplicar remédio em ${animal.nome}` : "Aplicar remédio"}
          </h2>
          {animal ? (
            <p className="mt-2 text-sm leading-6 text-slate-600">
              Local atual:{" "}
              <span className="font-semibold text-emerald-950">
                {getLocalDisplay(
                  animal.tipoLocalAtual,
                  animal.localAtualId,
                  pastos,
                  currais,
                )}
              </span>
            </p>
          ) : null}
        </div>

        {loading ? (
          <ApplyLoading />
        ) : animal ? (
          <form onSubmit={handleSubmit} className="px-5 py-5 sm:px-6">
            <div className="grid gap-5 lg:grid-cols-2">
              <SelectField
                label="Remédio"
                value={form.remedioId}
                onChange={updateField("remedioId")}
                options={remediosDaFazenda.map((item) => ({
                  value: String(item.id),
                  label: item.nome,
                }))}
                placeholder="Selecione um remédio"
                className="lg:col-span-2"
                required
              />

              <Input
                label="Data da aplicação"
                type="date"
                value={form.dataAplicacao}
                onChange={updateField("dataAplicacao")}
                required
              />

              <Input
                label="Dosagem (ml)"
                type="number"
                min="0"
                step="0.01"
                placeholder="Ex.: 10"
                value={form.dose}
                onChange={updateField("dose")}
                required
              />

              <Input
                label="Observações"
                placeholder="Detalhes da aplicação, lote, reforço, resposta do animal"
                value={form.observacao}
                onChange={updateField("observacao")}
                multiline
                rows={4}
                className="lg:col-span-2"
              />
            </div>

            {selectedRemedio ? (
              <div className="mt-5 rounded-lg border border-emerald-100 bg-emerald-50 px-4 py-4">
                <p className="text-sm font-semibold text-emerald-900">
                  Remédio selecionado: {selectedRemedio.nome}
                </p>
                <p className="mt-2 text-sm text-emerald-800">
                  Dose padrão cadastrada:{" "}
                  {selectedRemedio.dosePadrao ?? "não informada"} ml
                </p>
                {selectedRemedio.descricao ? (
                  <p className="mt-2 text-sm text-emerald-800">
                    {selectedRemedio.descricao}
                  </p>
                ) : null}
              </div>
            ) : null}

            <div className="mt-8 flex flex-col-reverse gap-3 border-t border-slate-100 pt-5 sm:flex-row sm:justify-end">
              <Link
                to={animal ? `/animais/${animal.id}` : "/animais"}
                className="inline-flex items-center justify-center rounded-lg border border-emerald-950/15 bg-white px-5 py-3 text-base font-semibold text-emerald-950 transition hover:bg-emerald-50"
              >
                Cancelar
              </Link>

              <Button
                type="submit"
                disabled={submitting || remediosDaFazenda.length === 0}
              >
                {submitting ? "Aplicando..." : "Registrar aplicação"}
              </Button>
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

function ApplyLoading() {
  return (
    <div className="px-5 py-5 sm:px-6">
      <div className="grid gap-5">
        {Array.from({ length: 4 }).map((_, index) => (
          <div key={index} className="ag-skeleton h-24 animate-pulse rounded-lg" />
        ))}
      </div>
    </div>
  );
}

export default AnimalApplyRemedy;
