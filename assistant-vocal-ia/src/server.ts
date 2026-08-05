import "dotenv/config";
import express from "express";
import { runCommand } from "./core/router.js";

const PORT = Number(process.env.PORT ?? 4174);
const TOKEN = process.env.ASSISTANT_TOKEN;

if (!TOKEN) {
  console.error(
    "ASSISTANT_TOKEN manquant dans .env - obligatoire pour exposer le serveur (voir README > App mobile).",
  );
  process.exit(1);
}

const app = express();
app.use(express.json());

// Public: sert juste a verifier que l'app mobile peut joindre le serveur,
// aucune information sensible n'y transite.
app.get("/health", (_req, res) => res.json({ ok: true }));

// Toute requete au-dela d'ici doit presenter le token partage. Sans ca,
// n'importe quel appareil sur le meme reseau local pourrait piloter ton PC.
app.use((req, res, next) => {
  const header = req.header("authorization");
  if (header !== `Bearer ${TOKEN}`) {
    res.status(401).json({ error: "Non autorise." });
    return;
  }
  next();
});

app.post("/command", async (req, res) => {
  const { text } = req.body ?? {};
  if (typeof text !== "string" || !text.trim()) {
    res.status(400).json({ error: "Champ 'text' manquant ou vide." });
    return;
  }

  try {
    const response = await runCommand(text);
    res.json({ response });
  } catch (error) {
    res.status(500).json({
      error: error instanceof Error ? error.message : "Erreur inconnue.",
    });
  }
});

app.listen(PORT, "0.0.0.0", () => {
  console.log(`Serveur assistant en ecoute sur le port ${PORT}.`);
  console.log(
    "Accessible depuis l'app mobile via l'adresse IP locale de ce PC (voir README > App mobile).",
  );
});
