"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { api, ProspectResume } from "@/lib/api";

export default function ProspectsPage() {
  const [prospects, setProspects] = useState<ProspectResume[]>([]);
  const [chargement, setChargement] = useState(true);

  useEffect(() => {
    api.prospects().then((r) => setProspects(r.prospects)).finally(() => setChargement(false));
  }, []);

  return (
    <div className="stack">
      <h2 style={{ fontSize: "1.3rem" }}>Prospects</h2>
      <p className="muted">
        Fil de conversation par prospect — reprenez la main à tout moment sur un
        échange en répondant manuellement.
      </p>

      <div className="card" style={{ padding: 0 }}>
        {chargement && <p className="muted" style={{ padding: 18 }}>Chargement...</p>}
        {!chargement && prospects.length === 0 && (
          <p className="muted" style={{ padding: 18 }}>Aucun prospect importé pour le moment.</p>
        )}
        {prospects.length > 0 && (
          <table>
            <thead>
              <tr>
                <th>Prénom</th>
                <th>Secteur</th>
                <th>Statut</th>
                <th>Dernier message</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {prospects.map((p) => (
                <tr key={p.id}>
                  <td>{p.prenom} {p.nom ? `(${p.nom})` : ""}</td>
                  <td>{p.secteur}</td>
                  <td><span className="tag">{p.statut}</span></td>
                  <td className="muted">
                    {p.dernier_message
                      ? `${p.dernier_message_direction === "entrant" ? "← " : "→ "}${p.dernier_message.slice(0, 60)}`
                      : "—"}
                  </td>
                  <td>
                    <Link className="btn secondaire" href={`/prospects/${p.id}`}>Ouvrir</Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
