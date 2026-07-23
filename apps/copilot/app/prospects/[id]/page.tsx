"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { api, Message, ProspectResume } from "@/lib/api";

export default function ProspectDetailPage() {
  const params = useParams<{ id: string }>();
  const id = Number(params.id);

  const [prospect, setProspect] = useState<ProspectResume | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [saisie, setSaisie] = useState("");
  const [envoi, setEnvoi] = useState(false);
  const [resultat, setResultat] = useState<string | null>(null);

  const charger = () => {
    api.prospectDetail(id).then((r) => {
      setProspect(r.prospect);
      setMessages(r.messages);
    });
  };

  useEffect(() => {
    charger();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const envoyer = async () => {
    const texte = saisie.trim();
    if (!texte || envoi) return;
    setEnvoi(true);
    setResultat(null);
    try {
      const r = await api.envoyerMessage(id, texte);
      setMessages(r.messages);
      setResultat(r.resultat);
      setSaisie("");
    } catch (err) {
      setResultat(`Erreur : ${(err as Error).message}`);
    } finally {
      setEnvoi(false);
    }
  };

  if (!prospect) return <p className="muted">Chargement...</p>;

  return (
    <div className="stack">
      <h2 style={{ fontSize: "1.3rem" }}>
        {prospect.prenom} {prospect.nom ? `— ${prospect.nom}` : ""}
      </h2>
      <p className="muted">
        {prospect.phone} · secteur {prospect.secteur} · statut <span className="tag">{prospect.statut}</span>
      </p>

      <div className="card">
        <div className="chat-messages">
          {messages.length === 0 && <p className="muted">Aucun message échangé pour le moment.</p>}
          {messages.map((m) => (
            <div
              key={m.id}
              className={`bulle ${m.direction === "sortant" ? "utilisateur" : "assistant"}`}
            >
              {m.texte}
              <div className="muted" style={{ fontSize: "0.72rem", marginTop: 4 }}>
                {m.auteur} · {new Date(m.created_at).toLocaleString("fr-FR")}
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="row">
        <input
          type="text"
          placeholder="Répondre manuellement à ce prospect..."
          value={saisie}
          onChange={(e) => setSaisie(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && envoyer()}
          disabled={envoi}
        />
        <button onClick={envoyer} disabled={envoi}>{envoi ? "..." : "Envoyer"}</button>
      </div>
      {resultat && <p className="muted">{resultat}</p>}
    </div>
  );
}
