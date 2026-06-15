import { create } from "zustand";

interface User {
  id: string;
  email: string;
  firstName: string | null;
  lastName: string | null;
  plan: string;
}

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  setUser: (user: User | null) => void;
  clearAuth: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isAuthenticated: false,
  setUser: (user) => set({ user, isAuthenticated: !!user }),
  clearAuth: () => set({ user: null, isAuthenticated: false }),
}));

interface MapState {
  region: { lat: number; lng: number; zoom: number };
  showHeatmap: boolean;
  showProspects: boolean;
  setRegion: (region: Partial<MapState["region"]>) => void;
  toggleHeatmap: () => void;
  toggleProspects: () => void;
}

export const useMapStore = create<MapState>((set) => ({
  region: { lat: 48.8566, lng: 2.3522, zoom: 13 },
  showHeatmap: true,
  showProspects: false,
  setRegion: (region) => set((s) => ({ region: { ...s.region, ...region } })),
  toggleHeatmap: () => set((s) => ({ showHeatmap: !s.showHeatmap })),
  toggleProspects: () => set((s) => ({ showProspects: !s.showProspects })),
}));
