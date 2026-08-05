"use client";

import { useEffect, useState } from "react";
import { api, NumeroBloque, SecteurConfig } from "@/lib/api";

export default function ParametresPage() {
  const [numeros, setNumeros] = useState<NumeroBloque[]>([]);
  const [nouveauNumero, setNouveauNumero] = useState("");
  const [secteurs, setSecteurs] = useState<SecteurConfig[]>([]);
  const [secteurOuvert, setSecteurOuvert] = useState<string | null>(null);
  const [brouillon, setBrouillon] = useState<Partial<SecteurConfig>>({});
  const [statut, setStatut] = useState<string | null>(null);

  const chargerBlacklist = () => api.blacklistLister().then((r) => setNumeros(r.numeros));
  const chargerSecteurs = () => api.secteurs().then((r) => setSecteurs(r.secteurs));

  useEffect(() => {
    chargerBlacklist();
    chargerSecteurs();
  }, []);

  const ajouterNumero = async () => {
    if (!nouveauNumero.trim()) return;
    await api.blacklistAjouter(nouveauNumero.trim());
    setNouveauNumero("");
    chargerBlacklist();
  };

  const retirerNumero = async (phone: string) => {
    await api.blacklistRetirer(phone);
    chargerBlacklist();
  };

  const ouvrirSecteur = (s: SecteurConfig) => {
    setSecteurOuvert(s.cle);
    setBrouillon(s);
    setStatut(null);
  };

  const enregistrerSecteur = async () => {
    if (!secteurOuvert) return;
    await api.secteurMettreAJour(secteurOuvert, brouillon);
    setStatut("Argumentaire mis à jour.");
    chargerSecteurs();
  };

  return (
    <div className="stack">
      <h2 style={{ fontSize: "1.3rem" }}>Paramètres</h2>

      <div className="card">
        <h2>Liste noire</h2>
        <p className="muted">
          Numéros désinscrits — alimentée automatiquement par les réponses STOP,
          modifiable manuellement ici.
        </p>
        <div className="row" style={{ marginBottom: 12 }}>
          <input
            type="text"
            placeholder="Ajouter un numéro (ex: 06 12 34 56 78)"
            value={nouveauNumero}
            onChange={(e) => setNouveauNumero(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && ajouterNumero()}
          />
          <button onClick={ajouterNumero}>Ajouter</button>
        </div>
        <table>
          <thead>
            <tr><th>Numéro</th><th>Source</th><th></th></tr>
          </thead>
          <tbody>
            {numeros.map((n) => (
              <tr key={n.id}>
                <td>{n.phone}</td>
                <td className="muted">{n.source}</td>
                <td>
                  <button className="secondaire" onClick={() => retirerNumero(n.phone)}>Retirer</button>
                </td>
              </tr>
            ))}
            {numeros.length === 0 && (
              <tr><td colSpan={3} className="muted">Aucun numéro bloqué.</td></tr>
            )}
          </tbody>
        </table>
      </div>

      <div className="card">
        <h2>Argumentaire par secteur</h2>
        <p className="muted">
          Le texte utilisé dans le SMS et par l&apos;assistant IA sectoriel pour
          expliquer l&apos;offre, le Pack Digitalisation et répondre aux questions.
        </p>
        <div className="stack">
          {secteurs.map((s) => (
            <div key={s.cle} className="card" style={{ margin: 0, background: "var(--panel-alt)" }}>
              <div className="row" style={{ justifyContent: "space-between" }}>
                <strong>{s.assistant_ia} ({s.label_pluriel})</strong>
                <button className="secondaire" onClick={() => ouvrirSecteur(s)}>
                  {secteurOuvert === s.cle ? "Fermer" : "Modifier"}
                </button>
              </div>
              {secteurOuvert === s.cle && (
                <div className="stack" style={{ marginTop: 10 }}>
                  <label className="muted">Nom de l&apos;assistant IA</label>
                  <input
                    type="text"
                    value={brouillon.assistant_ia || ""}
                    onChange={(e) => setBrouillon({ ...brouillon, assistant_ia: e.target.value })}
                  />
                  <label className="muted">Libellé métier (pluriel)</label>
                  <input
                    type="text"
                    value={brouillon.label_pluriel || ""}
                    onChange={(e) => setBrouillon({ ...brouillon, label_pluriel: e.target.value })}
                  />
                  <label className="muted">Argumentaire / explications sur l&apos;offre</label>
                  <textarea
                    rows={5}
                    value={brouillon.argumentaire || ""}
                    onChange={(e) => setBrouillon({ ...brouillon, argumentaire: e.target.value })}
                  />
                  <button onClick={enregistrerSecteur} style={{ width: "fit-content" }}>
                    Enregistrer
                  </button>
                  {statut && <p className="muted">{statut}</p>}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
