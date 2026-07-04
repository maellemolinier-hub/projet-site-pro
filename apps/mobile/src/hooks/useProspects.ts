import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { scanProspects } from "@/lib/api";

export interface Prospect {
  address: string;
  city: string;
  postalCode: string;
  lat: number;
  lng: number;
  saleScore: number;
  scoreLabel: string;
  reasons: string[];
  yearsOwned: number | null;
  lastMutation: string | null;
}

function mapProspect(raw: any): Prospect {
  return {
    address: raw.address,
    city: raw.city,
    postalCode: raw.postal_code,
    lat: raw.lat,
    lng: raw.lng,
    saleScore: raw.sale_score,
    scoreLabel: raw.score_label,
    reasons: raw.reasons ?? [],
    yearsOwned: raw.years_owned ?? null,
    lastMutation: raw.last_mutation ?? null,
  };
}

export function useProspects(lat: number, lng: number, radius = 300) {
  return useQuery({
    queryKey: ["prospects", lat, lng, radius],
    queryFn: async () => (await scanProspects(lat, lng, radius)).map(mapProspect),
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
