import axios from "axios";
import * as SecureStore from "expo-secure-store";

const API_URL = process.env.EXPO_PUBLIC_API_URL ?? "https://api.immoexpert.fr";
const WEB_URL = process.env.EXPO_PUBLIC_WEB_URL ?? "https://immoexpert.fr";

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
  const res = await apiClient.get("/prices/zone", { params: { lat, lng, radius_m: radius } });
  return res.data;
}

export interface MarketFactor {
  label: string;
  value: number | null;
  contribution: number;
  detail: string;
}

export interface MarketPrediction {
  zone: {
    lat: number;
    lng: number;
    radius_m: number;
    postal_code: string | null;
    city: string | null;
    department: string | null;
  };
  market: {
    transactions: number;
    avg_price_sqm: number | null;
    median_price_sqm: number | null;
    trend_12m: number | null;
  };
  indicators: Record<string, number | string | null> | null;
  credit_rate: number | null;
  season_month: number;
  score: number;
  level: string;
  factors: MarketFactor[];
  missing_indicators: string[];
}

/** Prédiction de marché agrégée par zone (score temps réel + facteurs). */
export async function getMarketPrediction(
  lat: number,
  lng: number,
  radius = 1000,
): Promise<MarketPrediction> {
  const res = await apiClient.get("/predict/zone", {
    params: { lat, lng, radius_m: radius },
  });
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
