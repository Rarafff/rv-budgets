import axios from "axios";
import { clearAuth, getToken, isTokenExpired } from "../utils/auth";

const apiBaseUrl = import.meta.env.VITE_API_BASE_URL || "http://localhost:8080/api";

if (import.meta.env.PROD && !import.meta.env.VITE_API_BASE_URL) {
  throw new Error("VITE_API_BASE_URL is required for production builds.");
}

const api = axios.create({
  baseURL: apiBaseUrl,
  headers: {
    "Content-Type": "application/json",
  },
});

const redirectToLogin = () => {
  if (window.location.pathname !== "/login") {
    window.location.href = "/login";
  }
};

api.interceptors.request.use((config) => {
  const token = getToken();

  if (token && isTokenExpired(token)) {
    clearAuth();
    redirectToLogin();
    return Promise.reject(new Error("Session expired. Please login again."));
  }

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      clearAuth();
      redirectToLogin();
    }

    return Promise.reject(error);
  },
);

export default api;

