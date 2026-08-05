"use client";

import { useEffect, useState } from "react";
import { api, Evenement } from "@/lib/api";

const LABELS_CATEGORIE: Record<string, string> = {
  sms_envoye: "SMS envoyés",
  sms_erreur: "Erreurs d'envoi",
  reponse_prospect: "Réponses des prospects",
  stop_recu: "Désinscriptions (STOP)",
  rdv_pris: "Rendez-vous pris",
  action_pilote: "Actions du pilote IA",
  commande: "Commandes",
  alerte_technique: "Alertes techniques",
};

export default function ActivitePage() {
  const [evenements, setEvenements] = useState<Evenement[]>([]);
  const [compteurs, setCompteurs] = useState<Record<string, number>>({});
  const [filtre, setFiltre] = useState<string | null>(null);
  const [chargement, setChargement] = useState(true);

  const charger = () => {
    api
      .activite({ categorie: filtre || undefined })
      .then((r) => {
        setEvenements(r.evenements);
        setCompteurs(r.compteurs_non_lus);
      })
      .finally(() => setChargement(false));
  };

  useEffect(() => {
    charger();
    const id = setInterval(charger, 8000);
    return () => clearInterval(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filtre]);

  const categories = Object.keys(LABELS_CATEGORIE);

  return (
    <div className="stack">
      <h2 style={{ fontSize: "1.3rem" }}>Activité</h2>
      <p className="muted">
        Vue par catégorie de toute l&apos;activité de vos assistants IA, avec alerte
        dès qu&apos;il se passe quelque chose (erreur, réponse, RDV pris...).
      </p>

      <div className="row" style={{ flexWrap: "wrap" }}>
        <button className={!filtre ? "" : "secondaire"} onClick={() => setFiltre(null)}>
          Tout
        </button>
        {categories.map((c) => (
          <button
            key={c}
            className={filtre === c ? "" : "secondaire"}
            onClick={() => setFiltre(c)}
          >
            {LABELS_CATEGORIE[c]}
            {compteurs[c] > 0 && <span className="badge" style={{ marginLeft: 6 }}>{compteurs[c]}</span>}
          </button>
        ))}
      </div>

      <div className="card">
        {chargement && <p className="muted">Chargement...</p>}
        {!chargement && evenements.length === 0 && <p className="muted">Aucune activité pour le moment.</p>}
        {evenements.map((e) => (
          <div className="event-row" key={e.id}>
            <span className={`tag ${e.niveau === "alerte" ? "alerte" : ""}`}>
              {LABELS_CATEGORIE[e.categorie] || e.categorie}
            </span>
            <div style={{ flex: 1 }}>
              <div>
                <strong>{e.titre}</strong>
                {!e.lu && <span className="badge" style={{ marginLeft: 8 }}>nouveau</span>}
              </div>
              {e.detail && <div className="muted">{e.detail}</div>}
            </div>
            <span className="muted" style={{ whiteSpace: "nowrap" }}>
              {new Date(e.created_at).toLocaleString("fr-FR")}
            </span>
            {!e.lu && (
              <button
                className="secondaire"
                onClick={() => api.marquerLu(e.id).then(charger)}
              >
                Marquer lu
              </button>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
