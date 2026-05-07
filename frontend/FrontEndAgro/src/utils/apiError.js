export function getApiErrorMessage(
  error,
  fallbackMessage = "Ocorreu um erro inesperado.",
) {
  if (error?.code === "ECONNABORTED") {
    return "A API demorou demais para responder. Se o backend estiver no plano gratuito do Render, aguarde ele acordar e tente novamente.";
  }

  if (error?.code === "ERR_NETWORK" || error?.message === "Network Error") {
    return "Erro de rede ao chamar a API. Confira se VITE_API_BASE_URL na Vercel aponta para o backend do Render com /api e se Cors__AllowedOrigins no Render contém a URL exata do frontend.";
  }

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
