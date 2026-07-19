import axios from "axios";

const baseURL = window.__API_URL__ || "/api";

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

export function apiErrorMessage(err) {
  return err?.response?.data?.error || "Something went wrong. Please try again.";
}

export default api;
