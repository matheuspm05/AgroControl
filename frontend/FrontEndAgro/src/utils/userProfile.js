const USER_PROFILE_STORAGE_KEY = "agrocontrol.userProfile";

export const DEFAULT_USER_PROFILE = {
  nome: "Matheus",
  email: "matheus@email.com",
  telefone: "(55) 9 9988-7766",
  perfil: "Administrador",
  descricao: "Usuário principal do sistema",
  contaCriadaEm: "2026-04-10",
  ultimoAcesso: "Agora há pouco",
};

export function getUserProfile() {
  if (typeof window === "undefined") {
    return DEFAULT_USER_PROFILE;
  }

  const storedValue = window.localStorage.getItem(USER_PROFILE_STORAGE_KEY);
  if (!storedValue) {
    return DEFAULT_USER_PROFILE;
  }

  try {
    return {
      ...DEFAULT_USER_PROFILE,
      ...JSON.parse(storedValue),
    };
  } catch {
    return DEFAULT_USER_PROFILE;
  }
}

export function saveUserProfile(profile) {
  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.setItem(
    USER_PROFILE_STORAGE_KEY,
    JSON.stringify({
      ...DEFAULT_USER_PROFILE,
      ...profile,
    }),
  );
}
