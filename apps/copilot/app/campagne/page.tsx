"use client";

import { useEffect, useState } from "react";
import { api, EtatCampagne } from "@/lib/api";

export default function CampagnePage() {
  const [etat, setEtat] = useState<EtatCampagne | null>(null);
  const [motif, setMotif] = useState("");
  const [enCours, setEnCours] = useState(false);

  const charger = () => api.campagneEtat().then(setEtat);

  useEffect(() => {
    charger();
  }, []);

  const pauser = async () => {
    setEnCours(true);
    try {
      await api.campagnePause(motif || undefined);
      await charger();
      setMotif("");
    } finally {
      setEnCours(false);
    }
  };

  const reprendre = async () => {
    setEnCours(true);
    try {
      await api.campagneReprendre();
      await charger();
    } finally {
      setEnCours(false);
    }
  };

  if (!etat) return <p className="muted">Chargement...</p>;

  return (
    <div className="stack">
      <h2 style={{ fontSize: "1.3rem" }}>Campagne</h2>

      <div className="card">
        <h2>État actuel</h2>
        <p>
          {etat.en_pause ? (
            <>
              <span className="tag alerte">En pause</span>
              {etat.motif && <span className="muted"> — {etat.motif}</span>}
            </>
          ) : (
            <span className="tag" style={{ color: "var(--ok)" }}>Active</span>
          )}
        </p>

        {etat.en_pause ? (
          <button onClick={reprendre} disabled={enCours}>Reprendre la campagne</button>
        ) : (
          <div className="stack">
            <input
              type="text"
              placeholder="Motif de la pause (optionnel)"
              value={motif}
              onChange={(e) => setMotif(e.target.value)}
            />
            <button className="danger" onClick={pauser} disabled={enCours} style={{ width: "fit-content" }}>
              Mettre en pause
            </button>
          </div>
        )}
      </div>

      <p className="muted">
        Tant que la campagne est en pause, aucun nouvel envoi automatique n&apos;est
        déclenché — les réponses entrantes et les prises de RDV continuent d&apos;être traitées normalement.
      </p>
    </div>
  );
}
