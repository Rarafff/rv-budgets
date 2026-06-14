const TOKEN_KEY = "token";
const USER_KEY = "user";

export const getToken = () =>
  localStorage.getItem(TOKEN_KEY) || sessionStorage.getItem(TOKEN_KEY);

export const saveAuth = ({ token, user, rememberMe }) => {
  const storage = rememberMe ? localStorage : sessionStorage;
  const otherStorage = rememberMe ? sessionStorage : localStorage;

  otherStorage.removeItem(TOKEN_KEY);
  otherStorage.removeItem(USER_KEY);

  if (token) {
    storage.setItem(TOKEN_KEY, token);
  }

  if (user) {
    storage.setItem(USER_KEY, JSON.stringify(user));
  }
};

export const getStoredUser = () => {
  const storedUser =
    localStorage.getItem(USER_KEY) || sessionStorage.getItem(USER_KEY);

  if (!storedUser) return null;

  try {
    return JSON.parse(storedUser);
  } catch {
    return null;
  }
};

export const saveStoredUser = (user) => {
  const storage = localStorage.getItem(TOKEN_KEY)
    ? localStorage
    : sessionStorage;

  storage.setItem(USER_KEY, JSON.stringify(user));
};

export const clearAuth = () => {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
  sessionStorage.removeItem(TOKEN_KEY);
  sessionStorage.removeItem(USER_KEY);
};

const decodeJwtPayload = (token) => {
  try {
    const [, payload] = token.split(".");
    const normalizedPayload = payload.replace(/-/g, "+").replace(/_/g, "/");
    return JSON.parse(atob(normalizedPayload));
  } catch {
    return null;
  }
};

export const isTokenExpired = (token = getToken()) => {
  if (!token) return true;

  const payload = decodeJwtPayload(token);
  if (!payload?.exp) return true;

  return payload.exp * 1000 <= Date.now();
};

export const isAuthenticated = () => {
  const token = getToken();
  return Boolean(token) && !isTokenExpired(token);
};
