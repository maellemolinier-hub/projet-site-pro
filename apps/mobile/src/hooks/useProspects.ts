import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { scanProspects } from "@/lib/api";

export interface Prospect {
  id: string;
  address: string;
  lat: number;
  lng: number;
  score: number;
  signals: string[];
  status: "new" | "contacted" | "qualified" | "lost";
  estimatedValue: number | null;
}

export function useProspects(lat: number, lng: number, radius = 300) {
  return useQuery({
    queryKey: ["prospects", lat, lng, radius],
    queryFn: () => scanProspects(lat, lng, radius),
    enabled: lat !== 0 && lng !== 0,
    staleTime: 5 * 60 * 1000,
  });
}

export function useScanZone() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ lat, lng, radius }: { lat: number; lng: number; radius?: number }) =>
      scanProspects(lat, lng, radius ?? 300),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["prospects"] });
    },
  });
}
