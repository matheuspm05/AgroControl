import { useEffect, useState } from "react";
import FazendaContext from "./fazendaContextValue";
import { agroApi, getAuthToken } from "../services/api";
import { getApiErrorMessage } from "../utils/apiError";

const ACTIVE_FAZENDA_STORAGE_KEY = "agrocontrol.activeFazendaId";

function getStoredFazendaId() {
  if (typeof window === "undefined") {
    return null;
  }

  const value = window.localStorage.getItem(ACTIVE_FAZENDA_STORAGE_KEY);
  if (!value) {
    return null;
  }

  const parsedValue = Number(value);
  return Number.isNaN(parsedValue) ? null : parsedValue;
}

function storeActiveFazendaId(fazendaId) {
  if (typeof window === "undefined") {
    return;
  }

  if (fazendaId === null || fazendaId === undefined) {
    window.localStorage.removeItem(ACTIVE_FAZENDA_STORAGE_KEY);
    return;
  }

  window.localStorage.setItem(ACTIVE_FAZENDA_STORAGE_KEY, String(fazendaId));
}

function resolveActiveFazenda(fazendas, preferredId) {
  if (!fazendas.length) {
    return null;
  }

  if (preferredId !== null && preferredId !== undefined) {
    const preferredFazenda = fazendas.find((item) => item.id === preferredId);
    if (preferredFazenda) {
      return preferredFazenda;
    }
  }

  return fazendas[0];
}

async function loadFazendas(preferredId) {
  if (!getAuthToken()) {
    return {
      fazendas: [],
      activeFazendaId: null,
    };
  }

  const fazendas = await agroApi.listFazendas();
  const activeFazenda = resolveActiveFazenda(fazendas, preferredId);

  return {
    fazendas,
    activeFazendaId: activeFazenda?.id ?? null,
  };
}

function FazendaProvider({ children }) {
  const [fazendas, setFazendas] = useState([]);
  const [activeFazendaId, setActiveFazendaIdState] = useState(
    () => getStoredFazendaId(),
  );
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let isMounted = true;

    async function syncFazendas() {
      try {
        setLoading(true);
        setError("");

        const nextState = await loadFazendas(getStoredFazendaId());
        if (!isMounted) {
          return;
        }

        setFazendas(nextState.fazendas);
        setActiveFazendaIdState(nextState.activeFazendaId);
        storeActiveFazendaId(nextState.activeFazendaId);
      } catch (err) {
        if (isMounted) {
          setError(
            getApiErrorMessage(
              err,
              "Não foi possível carregar a fazenda ativa no momento.",
            ),
          );
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    }

    syncFazendas();

    return () => {
      isMounted = false;
    };
  }, []);

  async function refreshFazendas(preferredId = activeFazendaId) {
    try {
      setLoading(true);
      setError("");

      const nextState = await loadFazendas(preferredId);
      setFazendas(nextState.fazendas);
      setActiveFazendaIdState(nextState.activeFazendaId);
      storeActiveFazendaId(nextState.activeFazendaId);

      return nextState;
    } catch (err) {
      setError(
        getApiErrorMessage(
          err,
          "Não foi possível atualizar a fazenda ativa no momento.",
        ),
      );
      throw err;
    } finally {
      setLoading(false);
    }
  }

  function setActiveFazendaId(fazendaId) {
    const parsedFazendaId = Number(fazendaId);
    if (Number.isNaN(parsedFazendaId)) {
      return;
    }

    setActiveFazendaIdState(parsedFazendaId);
    storeActiveFazendaId(parsedFazendaId);
  }

  const activeFazenda =
    fazendas.find((item) => item.id === activeFazendaId) ?? null;

  return (
    <FazendaContext.Provider
      value={{
        fazendas,
        activeFazenda,
        activeFazendaId: activeFazenda?.id ?? null,
        loading,
        error,
        refreshFazendas,
        setActiveFazendaId,
      }}
    >
      {children}
    </FazendaContext.Provider>
  );
}

export { FazendaProvider };
