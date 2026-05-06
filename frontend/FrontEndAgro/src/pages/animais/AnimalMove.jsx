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
  buildLocalOptions,
  getLocalDisplay,
  getTodayInputValue,
  isSameLocal,
  parseLocalOption,
} from "../../utils/animalModule";

function AnimalMove() {
  return (
    <FazendaGate>
      {(activeFazenda) => <AnimalMoveContent activeFazenda={activeFazenda} />}
    </FazendaGate>
  );
}

function AnimalMoveContent({ activeFazenda }) {
  const navigate = useNavigate();
  const { animalId } = useParams();
  const [animal, setAnimal] = useState(null);
  const [pastos, setPastos] = useState([]);
  const [currais, setCurrais] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({
    destino: "",
    dataMovimentacao: getTodayInputValue(),
    observacao: "",
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
      } catch (err) {
        if (isMounted) {
          setError(
            getApiErrorMessage(
              err,
              "Não foi possível carregar os dados da movimentação.",
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

    const destino = parseLocalOption(form.destino);
    if (!destino) {
      setError("Selecione um destino válido para concluir a movimentação.");
      return;
    }

    if (
      isSameLocal(
        animal.tipoLocalAtual,
        animal.localAtualId,
        destino.tipoLocal,
        destino.localId,
      )
    ) {
      setError("Escolha um destino diferente do local atual do animal.");
      return;
    }

    try {
      setSubmitting(true);
      setError("");

      await agroApi.createMovimentacaoAnimal({
        fazendaId: animal.fazendaId,
        animalId: animal.id,
        origemTipoLocal: animal.tipoLocalAtual,
        origemLocalId: animal.localAtualId,
        destinoTipoLocal: destino.tipoLocal,
        destinoLocalId: destino.localId,
        dataMovimentacao: form.dataMovimentacao,
        observacao: form.observacao || null,
      });

      navigate(`/animais/${animal.id}`);
    } catch (err) {
      setError(
        getApiErrorMessage(
          err,
          "Não foi possível registrar a movimentação agora.",
        ),
      );
    } finally {
      setSubmitting(false);
    }
  }

  const destinationOptions = animal
    ? buildLocalOptions(pastos, currais, animal.fazendaId).filter(
        (item) =>
          !isSameLocal(
            animal.tipoLocalAtual,
            animal.localAtualId,
            item.tipoLocal,
            item.localId,
          ),
      )
    : [];

  return (
    <div className="space-y-5">
      {error ? (
        <StatusBanner
          title="Não foi possível concluir a movimentação"
          message={error}
        />
      ) : null}

      {animal && animal.fazendaId !== activeFazenda.id ? (
        <StatusBanner
          variant="info"
          title="Animal carregado fora da fazenda ativa"
          message="O histórico ainda será salvo no backend, mas vale revisar a fazenda ativa para manter o contexto visual alinhado."
        />
      ) : null}

      {!loading && destinationOptions.length === 0 ? (
        <StatusBanner
          variant="warning"
          title="Nenhum destino disponível"
          message="Cadastre outro pasto ou curral nesta fazenda para conseguir registrar a movimentação do animal."
        />
      ) : null}

      <section className="overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm">
        <div className="border-b border-emerald-950/8 px-5 py-5 sm:px-6">
          <p className="text-sm font-semibold uppercase tracking-wide text-emerald-700">
            Movimentação
          </p>
          <h2 className="mt-2 text-2xl font-bold text-emerald-950">
            {animal ? `Movimentar ${animal.nome}` : "Movimentar animal"}
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
          <MoveLoading />
        ) : animal ? (
          <form onSubmit={handleSubmit} className="px-5 py-5 sm:px-6">
            <div className="grid gap-5 lg:grid-cols-2">
              <SelectField
                label="Mover para"
                value={form.destino}
                onChange={updateField("destino")}
                options={destinationOptions}
                placeholder="Selecione o novo local"
                className="lg:col-span-2"
                required
              />

              <Input
                label="Data da movimentação"
                type="date"
                value={form.dataMovimentacao}
                onChange={updateField("dataMovimentacao")}
                required
              />

              <Input
                label="Observações"
                placeholder="Motivo, manejo, observações do processo"
                value={form.observacao}
                onChange={updateField("observacao")}
                multiline
                rows={4}
                className="lg:col-span-2"
              />
            </div>

            <div className="mt-8 flex flex-col-reverse gap-3 border-t border-slate-100 pt-5 sm:flex-row sm:justify-end">
              <Link
                to={animal ? `/animais/${animal.id}` : "/animais"}
                className="inline-flex items-center justify-center rounded-lg border border-emerald-950/15 bg-white px-5 py-3 text-base font-semibold text-emerald-950 transition hover:bg-emerald-50"
              >
                Cancelar
              </Link>

              <Button
                type="submit"
                disabled={submitting || destinationOptions.length === 0}
              >
                {submitting ? "Movimentando..." : "Registrar movimentação"}
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

function MoveLoading() {
  return (
    <div className="px-5 py-5 sm:px-6">
      <div className="grid gap-5">
        {Array.from({ length: 3 }).map((_, index) => (
          <div key={index} className="ag-skeleton h-24 animate-pulse rounded-lg" />
        ))}
      </div>
    </div>
  );
}

export default AnimalMove;
