const THEME_STORAGE_KEY = "agrocontrol.theme";
const THEME_STORAGE_PREFIX = "agrocontrol.theme.user.";
const AUTH_TOKEN_STORAGE_KEY = "agrocontrol.authToken";

function normalizeTheme(theme) {
  return theme === "dark" || theme === "light" ? theme : null;
}

export function getSystemTheme() {
  if (typeof window === "undefined" || !window.matchMedia) {
    return "light";
  }

  return window.matchMedia("(prefers-color-scheme: dark)").matches
    ? "dark"
    : "light";
}

function decodeJwtPayload(token) {
  try {
    const [, payload] = token.split(".");
    if (!payload) {
      return null;
    }

    const normalizedPayload = payload.replace(/-/g, "+").replace(/_/g, "/");
    const paddedPayload = normalizedPayload.padEnd(
      normalizedPayload.length + ((4 - (normalizedPayload.length % 4)) % 4),
      "=",
    );

    return JSON.parse(window.atob(paddedPayload));
  } catch {
    return null;
  }
}

function getThemeStorageKey() {
  if (typeof window === "undefined") {
    return THEME_STORAGE_KEY;
  }

  const token = window.localStorage.getItem(AUTH_TOKEN_STORAGE_KEY);
  if (!token) {
    return THEME_STORAGE_KEY;
  }

  const payload = decodeJwtPayload(token);
  const userIdentifier =
    payload?.sub ||
    payload?.nameid ||
    payload?.[
      "http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier"
    ] ||
    payload?.email;

  if (!userIdentifier) {
    return THEME_STORAGE_KEY;
  }

  return `${THEME_STORAGE_PREFIX}${userIdentifier}`;
}

export function getStoredTheme() {
  if (typeof window === "undefined") {
    return "light";
  }

  const themeStorageKey = getThemeStorageKey();
  const storedTheme = normalizeTheme(window.localStorage.getItem(themeStorageKey));
  const fallbackTheme = normalizeTheme(window.localStorage.getItem(THEME_STORAGE_KEY));

  return storedTheme ?? fallbackTheme ?? getSystemTheme();
}

export function applyTheme(theme, { persist = true } = {}) {
  if (typeof document === "undefined") {
    return;
  }

  const nextTheme = normalizeTheme(theme) ?? getSystemTheme();
  document.documentElement.classList.toggle("dark", nextTheme === "dark");
  document.documentElement.dataset.theme = nextTheme;

  if (persist && typeof window !== "undefined") {
    window.localStorage.setItem(getThemeStorageKey(), nextTheme);
  }
}
