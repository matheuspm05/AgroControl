export function getApiErrorMessage(
  error,
  fallbackMessage = "Ocorreu um erro inesperado.",
) {
  const apiMessage = error?.response?.data?.message;

  if (typeof apiMessage === "string" && apiMessage.trim()) {
    return apiMessage;
  }

  const rawResponse = error?.response?.data;
  if (typeof rawResponse === "string" && rawResponse.trim()) {
    return rawResponse;
  }

  if (typeof error?.message === "string" && error.message.trim()) {
    return error.message;
  }

  return fallbackMessage;
}
