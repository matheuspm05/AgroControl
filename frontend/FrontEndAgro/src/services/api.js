import axios from "axios";

const configuredApiBaseUrl = import.meta.env.VITE_API_BASE_URL;
const isProductionBuild = import.meta.env.PROD;
const isApiBaseUrlMissing = isProductionBuild && !configuredApiBaseUrl;
const API_BASE_URL = normalizeApiBaseUrl(
  configuredApiBaseUrl || "http://localhost:5001/api",
);
const AUTH_BASE_URL = API_BASE_URL.replace(/\/api\/?$/, "");
const AUTH_TOKEN_STORAGE_KEY = "agrocontrol.authToken";

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 60000,
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
  },
});

let refreshTokenRequest = null;

export function getAuthToken() {
  if (typeof window === "undefined") {
    return null;
  }

  return window.localStorage.getItem(AUTH_TOKEN_STORAGE_KEY);
}

export function saveAuthToken(token) {
  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.setItem(AUTH_TOKEN_STORAGE_KEY, token);
}

export function clearAuthToken() {
  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.removeItem(AUTH_TOKEN_STORAGE_KEY);
}

api.interceptors.request.use((config) => {
  if (isApiBaseUrlMissing) {
    return Promise.reject(
      new Error(
        "VITE_API_BASE_URL não está configurada no deploy da Vercel. Configure a URL pública do backend Render, por exemplo: https://sua-api.onrender.com/api.",
      ),
    );
  }

  const token = getAuthToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    const status = error.response?.status;

    if (
      status !== 401 ||
      !originalRequest ||
      originalRequest._retry ||
      originalRequest.skipAuthRefresh
    ) {
      return Promise.reject(error);
    }

    originalRequest._retry = true;

    try {
      const token = await refreshAuthToken();
      originalRequest.headers = originalRequest.headers || {};
      originalRequest.headers.Authorization = `Bearer ${token}`;
      return api.request(originalRequest);
    } catch {
      clearAuthToken();
      return Promise.reject(error);
    }
  },
);

async function refreshAuthToken() {
  refreshTokenRequest ??= api
    .request({
      method: "post",
      baseURL: AUTH_BASE_URL,
      url: "/auth/refresh",
      skipAuthRefresh: true,
    })
    .then((response) => {
      saveAuthToken(response.data.token);
      return response.data.token;
    })
    .finally(() => {
      refreshTokenRequest = null;
    });

  return refreshTokenRequest;
}

async function request(config) {
  const response = await api.request(config);
  return response.data;
}

function get(url) {
  return request({ method: "get", url });
}

function post(url, data) {
  return request({ method: "post", url, data });
}

function postAuth(url, data) {
  return request({ method: "post", baseURL: AUTH_BASE_URL, url, data });
}

function put(url, data) {
  return request({ method: "put", url, data });
}

function remove(url) {
  return request({ method: "delete", url });
}

export const agroApi = {
  login: (payload) => postAuth("/auth/login", payload),
  register: (payload) => postAuth("/auth/register", payload),
  async logout() {
    try {
      await postAuth("/auth/logout");
    } finally {
      clearAuthToken();
    }
  },

  listFazendas: () => get("/fazendas"),
  createFazenda: (payload) => post("/fazendas", payload),

  listAnimais: () => get("/animais"),
  getAnimal: (id) => get(`/animais/${id}`),
  createAnimal: (payload) => post("/animais", payload),
  updateAnimal: (id, payload) => put(`/animais/${id}`, payload),
  deleteAnimal: (id) => remove(`/animais/${id}`),

  listPastos: () => get("/pastos"),
  getPasto: (id) => get(`/pastos/${id}`),
  getPastoAnimais: (id) => get(`/pastos/${id}/animais`),
  createPasto: (payload) => post("/pastos", payload),
  updatePasto: (id, payload) => put(`/pastos/${id}`, payload),
  deletePasto: (id) => remove(`/pastos/${id}`),

  listCurrais: () => get("/currais"),
  getCurral: (id) => get(`/currais/${id}`),
  getCurralAnimais: (id) => get(`/currais/${id}/animais`),
  createCurral: (payload) => post("/currais", payload),
  updateCurral: (id, payload) => put(`/currais/${id}`, payload),
  deleteCurral: (id) => remove(`/currais/${id}`),

  listRemedios: () => get("/remedios"),
  getRemedio: (id) => get(`/remedios/${id}`),
  createRemedio: (payload) => post("/remedios", payload),
  updateRemedio: (id, payload) => put(`/remedios/${id}`, payload),
  deleteRemedio: (id) => remove(`/remedios/${id}`),

  listCampeiros: () => get("/campeiros"),
  getCampeiro: (id) => get(`/campeiros/${id}`),
  createCampeiro: (payload) => post("/campeiros", payload),
  updateCampeiro: (id, payload) => put(`/campeiros/${id}`, payload),
  deleteCampeiro: (id) => remove(`/campeiros/${id}`),

  listMovimentacoesAnimais: () => get("/movimentacoes-animais"),
  createMovimentacaoAnimal: (payload) => post("/movimentacoes-animais", payload),

  listAplicacoesRemedio: () => get("/aplicacoes-remedio"),
  createAplicacaoRemedio: (payload) => post("/aplicacoes-remedio", payload),

  async getDashboardData() {
    const [animais, pastos, currais, remedios, campeiros] = await Promise.all([
      this.listAnimais(),
      this.listPastos(),
      this.listCurrais(),
      this.listRemedios(),
      this.listCampeiros(),
    ]);

    return {
      animais,
      pastos,
      currais,
      remedios,
      campeiros,
    };
  },
};

function normalizeApiBaseUrl(value) {
  const trimmedValue = value.trim().replace(/\/+$/, "");
  if (/\/api$/i.test(trimmedValue)) {
    return trimmedValue;
  }

  return `${trimmedValue}/api`;
}

export { API_BASE_URL };
export default api;
