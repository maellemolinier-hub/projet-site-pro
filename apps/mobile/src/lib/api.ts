import axios from "axios";
import * as SecureStore from "expo-secure-store";

const API_URL = process.env.EXPO_PUBLIC_API_URL ?? "https://api.cap-entreprendre-france.fr";
const WEB_URL = process.env.EXPO_PUBLIC_WEB_URL ?? "https://cap-entreprendre-france.fr";

export const apiClient = axios.create({
  baseURL: API_URL,
  timeout: 15000,
  headers: { "Content-Type": "application/json" },
});

export const webClient = axios.create({
  baseURL: WEB_URL,
  timeout: 15000,
  headers: { "Content-Type": "application/json" },
});

apiClient.interceptors.request.use(async (config) => {
  const token = await SecureStore.getItemAsync("auth_token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

webClient.interceptors.request.use(async (config) => {
  const token = await SecureStore.getItemAsync("auth_token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

export async function login(email: string, password: string) {
  const res = await webClient.post("/api/auth/mobile-login", { email, password });
  const { token } = res.data;
  await SecureStore.setItemAsync("auth_token", token);
  return res.data;
}

export async function logout() {
  await SecureStore.deleteItemAsync("auth_token");
}

export async function getZoneStats(lat: number, lng: number, radius = 500) {
  const res = await apiClient.get("/prices/zone", { params: { lat, lng, radius } });
  return res.data;
}

export async function scanProspects(lat: number, lng: number, radius = 300) {
  const res = await apiClient.post("/prospects/scan", { lat, lng, radius });
  return res.data;
}

export async function getStreetPrices(lat: number, lng: number) {
  const res = await apiClient.get("/prices/street", { params: { lat, lng } });
  return res.data;
}

export async function getTrend(lat: number, lng: number) {
  const res = await apiClient.get("/prices/trend", { params: { lat, lng } });
  return res.data;
}