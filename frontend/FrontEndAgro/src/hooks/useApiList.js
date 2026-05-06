import { useEffect, useState } from "react";
import { getApiErrorMessage } from "../utils/apiError";

function useApiList(fetcher, fallbackErrorMessage) {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let isMounted = true;

    async function loadData() {
      try {
        setLoading(true);
        setError("");
        const data = await fetcher();

        if (isMounted) {
          setItems(data);
        }
      } catch (err) {
        if (isMounted) {
          setError(getApiErrorMessage(err, fallbackErrorMessage));
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
  }, [fetcher, fallbackErrorMessage]);

  return { items, loading, error };
}

export default useApiList;
