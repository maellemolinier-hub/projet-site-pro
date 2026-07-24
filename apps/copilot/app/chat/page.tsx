"use client";

import { useEffect, useRef, useState } from "react";
import { api, SecteurConfig } from "@/lib/api";
import { renderMarkdown } from "@/lib/markdown";

type Tour = { role: "user" | "model"; texte: string; actions?: { name: string; resultat: string }[] };

export default function ChatPage() {
  const [mode, setMode] = useState<"pilote" | "secteur">("pilote");
  const [secteurs, setSecteurs] = useState<SecteurConfig[]>([]);
  const [secteurChoisi, setSecteurChoisi] = useState("plombier");
  const [tours, setTours] = useState<Tour[]>([]);
  const [saisie, setSaisie] = useState("");
  const [enCours, setEnCours] = useState(false);
  const finRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    api.secteurs().then((r) => setSecteurs(r.secteurs));
  }, []);

  useEffect(() => {
    finRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [tours]);

  const historiquePourApi = () =>
    tours.map((t) => ({ role: t.role, parts: [{ text: t.texte }] }));

  const envoyer = async () => {
    const message = saisie.trim();
    if (!message || enCours) return;
    setSaisie("");
    setTours((t) => [...t, { role: "user", texte: message }]);
    setEnCours(true);
    try {
      const reponse =
        mode === "pilote"
          ? await api.chatPilote(message, historiquePourApi())
          : await api.chatSecteur(secteurChoisi, message, historiquePourApi());
      setTours((t) => [...t, { role: "model", texte: reponse.texte, actions: reponse.actions }]);
    } catch (err) {
      setTours((t) => [
        ...t,
        { role: "model", texte: `Erreur : ${(err as Error).message}` },
      ]);
    } finally {
      setEnCours(false);
    }
  };

  return (
    <div className="stack">
      <h2 style={{ fontSize: "1.3rem" }}>Chat IA</h2>

      <div className="row">
        <button className={mode === "pilote" ? "" : "secondaire"} onClick={() => { setMode("pilote"); setTours([]); }}>
          Pilote (contrôle la campagne)
        </button>
        <button className={mode === "secteur" ? "" : "secondaire"} onClick={() => { setMode("secteur"); setTours([]); }}>
          Assistant sectoriel
        </button>
        {mode === "secteur" && (
          <select value={secteurChoisi} onChange={(e) => { setSecteurChoisi(e.target.value); setTours([]); }}>
            {secteurs.map((s) => (
              <option key={s.cle} value={s.cle}>{s.assistant_ia}</option>
            ))}
          </select>
        )}
      </div>

      <p className="muted">
        {mode === "pilote"
          ? "Demandez-lui de mettre en pause la campagne, bloquer un numéro, envoyer un message, consulter l'activité..."
          : "Testez ici la façon dont l'assistant IA sectoriel répond à vos futurs clients."}
      </p>

      <div className="card">
        <div className="chat-messages">
          {tours.length === 0 && <p className="muted">Aucun message. Commencez la conversation ci-dessous.</p>}
          {tours.map((t, i) => (
            <div key={i} className={`bulle ${t.role === "user" ? "utilisateur" : "assistant"}`}>
              {t.role === "model" ? renderMarkdown(t.texte) : t.texte}
              {t.actions && t.actions.length > 0 && (
                <div className="muted" style={{ marginTop: 6, fontSize: "0.78rem" }}>
                  {t.actions.map((a, j) => (
                    <div key={j}>⚙️ {a.name} → {a.resultat}</div>
                  ))}
                </div>
              )}
            </div>
          ))}
          <div ref={finRef} />
        </div>
      </div>

      <div className="row">
        <input
          type="text"
          placeholder="Écrivez votre message..."
          value={saisie}
          onChange={(e) => setSaisie(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && envoyer()}
          disabled={enCours}
        />
        <button onClick={envoyer} disabled={enCours}>
          {enCours ? "..." : "Envoyer"}
        </button>
      </div>
    </div>
  );
}
