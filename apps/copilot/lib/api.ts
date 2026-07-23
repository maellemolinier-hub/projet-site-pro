const API_BASE =
  process.env.NEXT_PUBLIC_COPILOT_API_URL || "http://localhost:8020";

async function requete<T>(chemin: string, options?: RequestInit): Promise<T> {
  const reponse = await fetch(`${API_BASE}${chemin}`, {
    ...options,
    headers: { "Content-Type": "application/json", ...(options?.headers || {}) },
    cache: "no-store",
  });
  if (!reponse.ok) {
    const texte = await reponse.text();
    throw new Error(`Erreur API (${reponse.status}) : ${texte}`);
  }
  return reponse.json() as Promise<T>;
}

export type Evenement = {
  id: number;
  categorie: string;
  niveau: "info" | "alerte";
  titre: string;
  detail: string | null;
  prospect_id: number | null;
  lu: boolean;
  created_at: string;
};

export type ActiviteReponse = {
  evenements: Evenement[];
  compteurs_non_lus: Record<string, number>;
  categories: string[];
};

export type EtatCampagne = { en_pause: boolean; motif: string | null };

export type NumeroBloque = { id: number; phone: string; source: string; created_at: string };

export type ProspectResume = {
  id: number;
  prenom: string;
  nom: string | null;
  phone: string;
  secteur: string;
  statut: string;
  dernier_message: string | null;
  dernier_message_direction: string | null;
  dernier_message_date: string | null;
};

export type Message = {
  id: number;
  prospect_id: number;
  direction: "entrant" | "sortant";
  auteur: "automatique" | "manuel" | "prospect";
  texte: string;
  created_at: string;
};

export type SecteurConfig = {
  cle: string;
  label_pluriel: string;
  assistant_ia: string;
  argumentaire: string;
};

export type ChatReponse = { texte: string; actions?: { name: string; args: unknown; resultat: string }[] };

export const api = {
  activite: (params: { categorie?: string; nonLusSeulement?: boolean } = {}) => {
    const qs = new URLSearchParams();
    if (params.categorie) qs.set("categorie", params.categorie);
    if (params.nonLusSeulement) qs.set("non_lus_seulement", "true");
    return requete<ActiviteReponse>(`/api/activite?${qs.toString()}`);
  },
  marquerLu: (id: number) => requete(`/api/activite/${id}/lu`, { method: "POST" }),
  marquerCategorieLue: (categorie: string) =>
    requete(`/api/activite/categorie/${categorie}/lu`, { method: "POST" }),

  campagneEtat: () => requete<EtatCampagne>("/api/campagne/etat"),
  campagnePause: (motif?: string) =>
    requete("/api/campagne/pause", { method: "POST", body: JSON.stringify({ motif }) }),
  campagneReprendre: () => requete("/api/campagne/reprendre", { method: "POST" }),

  blacklistLister: () => requete<{ numeros: NumeroBloque[] }>("/api/blacklist"),
  blacklistAjouter: (phone: string) =>
    requete("/api/blacklist", { method: "POST", body: JSON.stringify({ phone }) }),
  blacklistRetirer: (phone: string) =>
    requete(`/api/blacklist/${encodeURIComponent(phone)}`, { method: "DELETE" }),

  prospects: () => requete<{ prospects: ProspectResume[] }>("/api/prospects"),
  prospectDetail: (id: number) =>
    requete<{ prospect: ProspectResume; messages: Message[] }>(`/api/prospects/${id}`),
  envoyerMessage: (id: number, texte: string) =>
    requete<{ resultat: string; messages: Message[] }>(`/api/prospects/${id}/messages`, {
      method: "POST",
      body: JSON.stringify({ texte }),
    }),

  secteurs: () => requete<{ secteurs: SecteurConfig[] }>("/api/secteurs"),
  secteurMettreAJour: (cle: string, body: Partial<SecteurConfig>) =>
    requete<{ secteur: SecteurConfig }>(`/api/secteurs/${cle}`, {
      method: "PUT",
      body: JSON.stringify(body),
    }),

  chatPilote: (message: string, historique: unknown[] = []) =>
    requete<ChatReponse>("/api/chat/pilote", {
      method: "POST",
      body: JSON.stringify({ message, historique }),
    }),
  chatSecteur: (cle: string, message: string, historique: unknown[] = []) =>
    requete<ChatReponse>(`/api/chat/secteur/${cle}`, {
      method: "POST",
      body: JSON.stringify({ message, historique }),
    }),
};
