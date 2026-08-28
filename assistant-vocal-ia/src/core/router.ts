import Anthropic from "@anthropic-ai/sdk";
import { betaZodTool } from "@anthropic-ai/sdk/helpers/beta/zod";
import { z } from "zod/v4";
import { organizePhotosByDate } from "../tools/organizeFiles.js";
import { openApplication } from "../tools/openApp.js";
import { fetchCredential } from "../tools/bitwarden.js";
import { loginToSite } from "../tools/loginToSite.js";
import { listRecentEmails, searchEmails, readEmailById } from "../tools/mail/gmail.js";
import { runShellCommand } from "../tools/shell.js";
import { isDestructiveCommand } from "../tools/destructiveCommand.js";
import { isPreConfirmed } from "../tools/confirmation.js";
import { askGemini, generateVideo } from "../connectors/gemini.js";

const client = new Anthropic();

const organizePhotosTool = betaZodTool({
  name: "organize_photos",
  description:
    "Range les photos d'un dossier en sous-dossiers AAAA-MM selon leur date. Utilise ceci quand l'utilisateur demande de ranger/trier ses photos.",
  inputSchema: z.object({
    directory: z
      .string()
      .describe("Chemin absolu du dossier de photos a ranger"),
  }),
  run: async ({ directory }) => {
    const result = await organizePhotosByDate(directory);
    return JSON.stringify(result);
  },
});

const openAppTool = betaZodTool({
  name: "open_application",
  description:
    "Lance un logiciel installe sur cet ordinateur par son nom (ex: 'Spotify', 'Visual Studio Code').",
  inputSchema: z.object({
    appName: z.string().describe("Nom du logiciel a lancer"),
  }),
  run: async ({ appName }) => openApplication(appName),
});

const fetchCredentialTool = betaZodTool({
  name: "fetch_credential",
  description:
    "Recupere l'identifiant (nom d'utilisateur uniquement, le mot de passe reste prive) stocke dans Bitwarden pour un site donne. A utiliser avant login_to_site.",
  inputSchema: z.object({
    siteName: z
      .string()
      .describe("Nom exact de l'entree Bitwarden correspondant au site"),
  }),
  run: async ({ siteName }) => {
    const result = await fetchCredential(siteName);
    return JSON.stringify(result);
  },
});

const loginToSiteTool = betaZodTool({
  name: "login_to_site",
  description:
    "Ouvre un site web et tente de remplir automatiquement les champs de connexion avec l'identifiant deja recupere via fetch_credential.",
  inputSchema: z.object({
    siteName: z
      .string()
      .describe("Meme nom que celui utilise avec fetch_credential"),
    url: z.string().describe("URL de la page de connexion du site"),
  }),
  run: async ({ siteName, url }) => loginToSite(siteName, url),
});

const listEmailsTool = betaZodTool({
  name: "list_recent_emails",
  description:
    "Liste les emails recents de la boite Gmail connectee (lecture seule). Utilise ceci quand l'utilisateur demande ses derniers mails ou ses non-lus.",
  inputSchema: z.object({
    maxResults: z
      .number()
      .int()
      .min(1)
      .max(20)
      .optional()
      .describe("Nombre d'emails a recuperer (5 par defaut)"),
    unreadOnly: z
      .boolean()
      .optional()
      .describe("true pour ne montrer que les emails non lus"),
  }),
  run: async ({ maxResults, unreadOnly }) => {
    const emails = await listRecentEmails({ maxResults, unreadOnly });
    return JSON.stringify(emails);
  },
});

const searchEmailsTool = betaZodTool({
  name: "search_emails",
  description:
    "Recherche n'importe quel email (pas seulement les plus recents) avec une requete de recherche Gmail classique (from:, subject:, after:, before:, ou texte libre). Lecture seule. Utilise ceci pour trouver un mail precis.",
  inputSchema: z.object({
    query: z
      .string()
      .describe("Requete de recherche Gmail, ex: \"from:banque facture\""),
    maxResults: z.number().int().min(1).max(20).optional(),
  }),
  run: async ({ query, maxResults }) => {
    const emails = await searchEmails(query, maxResults ?? 10);
    return JSON.stringify(emails);
  },
});

const readEmailTool = betaZodTool({
  name: "read_email",
  description:
    "Lit le contenu complet (corps entier, pas juste un extrait) d'un email a partir de son id, obtenu via list_recent_emails ou search_emails.",
  inputSchema: z.object({
    emailId: z.string().describe("Id du message Gmail"),
  }),
  run: async ({ emailId }) => {
    const email = await readEmailById(emailId);
    return JSON.stringify(email);
  },
});

const askGeminiTool = betaZodTool({
  name: "ask_gemini",
  description:
    "Envoie une question a Gemini (Google), avec en option un fichier local a analyser (video, image, audio, document). Utilise ceci pour comprendre le contenu d'une video ou de tout fichier que Serv'IA ne sait pas interpreter directement - ex: 'resume cette video', 'qu'est-ce qu'il y a sur cette photo'. Necessite GEMINI_API_KEY dans .env.",
  inputSchema: z.object({
    prompt: z.string().describe("Question ou instruction pour Gemini"),
    filePath: z
      .string()
      .optional()
      .describe("Chemin absolu d'un fichier local a analyser (video, image, audio, document)"),
  }),
  run: async ({ prompt, filePath }) => askGemini(prompt, filePath),
});

/**
 * Genere une video (Veo/Gemini) - PAYANT, facture a la seconde de video
 * generee cote Google. Toujours soumis au meme garde-fou CONFIRME que les
 * commandes shell destructrices : depenser de l'argent reel sans
 * confirmation explicite est le meme genre de risque, pas seulement les
 * commandes destructrices.
 */
function buildGenerateVideoTool(preConfirmed: boolean) {
  return betaZodTool({
    name: "generate_video",
    description:
      "Genere une video a partir d'un texte (Veo/Gemini) et la telecharge en local. PAYANT (facture a la seconde de video). La demande d'origine doit contenir 'CONFIRME <code secret>', sinon l'outil refuse et il faut le dire a l'utilisateur - meme regle que pour les commandes shell destructrices, car c'est une depense d'argent reelle.",
    inputSchema: z.object({
      prompt: z.string().describe("Description de la video a generer"),
      outputPath: z
        .string()
        .optional()
        .describe("Chemin de sortie du fichier video (par defaut : ~/Serv'IA-videos/)"),
    }),
    run: async ({ prompt, outputPath }) => {
      if (!preConfirmed) {
        return "REFUSE : generer une video est payant. Redemande a l'utilisateur de reformuler en incluant 'CONFIRME <son code secret>' s'il est sur de lui.";
      }
      const destination = await generateVideo(prompt, outputPath);
      return `Video generee et enregistree dans ${destination}`;
    },
  });
}

/**
 * L'outil shell est construit par requete plutot que declare une seule fois,
 * pour pouvoir fermer sur `preConfirmed` (calcule a partir du texte brut de
 * la demande de l'utilisateur - CLI, transcription vocale ou mail) sans
 * dependre de ce que le modele affirme lui-meme avoir verifie.
 */
function buildRunShellCommandTool(preConfirmed: boolean) {
  return betaZodTool({
    name: "run_shell_command",
    description:
      "Execute une commande shell sur le PC pour accomplir toute tache non couverte par les autres outils (creer/deplacer/renommer fichiers ou dossiers, verifier l'espace disque, installer un paquet, lancer un script...). Dossier de travail : dossier utilisateur. ATTENTION : aucune sandbox, la commande a les memes droits que l'utilisateur. Pour une commande potentiellement destructrice (suppression, formatage, arret systeme, sudo...), la demande d'origine doit contenir 'CONFIRME <code secret>' (le code secret de l'utilisateur, pas le mot CONFIRME seul), sinon l'outil refuse et il faut le dire a l'utilisateur.",
    inputSchema: z.object({
      command: z.string().describe("Commande shell a executer"),
    }),
    run: async ({ command }) => {
      if (isDestructiveCommand(command) && !preConfirmed) {
        return "REFUSE : cette commande a l'air destructrice. Redemande a l'utilisateur de reformuler en incluant 'CONFIRME <son code secret>' s'il est sur de lui - le mot CONFIRME seul ne suffit pas.";
      }
      const result = await runShellCommand(command);
      return JSON.stringify(result);
    },
  });
}

const SYSTEM_PROMPT = `Tu es Serv'IA, un assistant personnel qui execute des actions sur l'ordinateur de l'utilisateur : ranger des fichiers/photos, lancer des logiciels, chercher et lire n'importe quel email (lecture seule), se connecter a des comptes en ligne deja enregistres, executer des commandes shell pour toute autre tache demandee (run_shell_command), chercher sur le web, executer du code dans un bac a sable pour analyser des donnees ou generer des fichiers, deleguer a Gemini (ask_gemini) l'analyse de fichiers qu'il comprend nativement (video, image, audio), et generer des videos (generate_video, payant).
Si run_shell_command ou generate_video refuse une action car elle est destructrice ou payante, explique a l'utilisateur qu'il doit reformuler sa demande en incluant "CONFIRME" suivi de son code secret personnel - n'insiste pas et n'essaie pas de contourner, et ne devine jamais ce code.
Confirme toujours en une phrase ce que tu as fait apres avoir execute une action. Si une commande est ambigue, demande une precision plutot que de deviner.`;

export async function runCommand(command: string): Promise<string> {
  const preConfirmed = isPreConfirmed(command, process.env.CONFIRMATION_CODE);

  const finalMessage = await client.beta.messages.toolRunner({
    model: "claude-opus-5",
    max_tokens: 2048,
    system: SYSTEM_PROMPT,
    // NB: `output_config.effort` (controle du niveau de reflexion) n'est pas
    // encore type dans @anthropic-ai/sdk@0.68.0 installe ici. A ajouter des
    // que le SDK est mis a jour vers une version qui l'expose.
    betas: ["code-execution-2025-05-22"],
    tools: [
      organizePhotosTool,
      openAppTool,
      fetchCredentialTool,
      loginToSiteTool,
      listEmailsTool,
      searchEmailsTool,
      readEmailTool,
      askGeminiTool,
      { type: "web_search_20250305", name: "web_search" },
      { type: "code_execution_20250522", name: "code_execution" },
      buildRunShellCommandTool(preConfirmed),
      buildGenerateVideoTool(preConfirmed),
    ],
    messages: [{ role: "user", content: command }],
  });

  const textBlocks = finalMessage.content.filter(
    (block): block is Extract<typeof block, { type: "text" }> =>
      block.type === "text",
  );
  return textBlocks.map((block) => block.text).join("\n") || "(pas de reponse)";
}
