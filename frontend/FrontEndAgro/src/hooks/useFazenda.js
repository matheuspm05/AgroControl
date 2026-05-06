import { useContext } from "react";
import FazendaContext from "../context/fazendaContextValue";

function useFazenda() {
  const context = useContext(FazendaContext);

  if (!context) {
    throw new Error("useFazenda precisa ser usado dentro de FazendaProvider.");
  }

  return context;
}

export default useFazenda;
