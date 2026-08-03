import Anthropic from "@anthropic-ai/sdk";
import { betaZodTool } from "@anthropic-ai/sdk/helpers/beta/zod";
import { z } from "zod/v4";
import { organizePhotosByDate } from "../tools/organizeFiles.js";
import { openApplication } from "../tools/openApp.js";
import { fetchCredential } from "../tools/bitwarden.js";
import { loginToSite } from "../tools/loginToSite.js";
import { listRecentEmails } from "../tools/mail/gmail.js";

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
    "Liste les emails recents de la boite Gmail connectee (lecture seule - ne peut ni envoyer ni supprimer). Utilise ceci quand l'utilisateur demande de consulter ses mails ou ses non-lus.",
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

const SYSTEM_PROMPT = `Tu es un assistant vocal personnel qui execute des actions sur l'ordinateur de l'utilisateur : ranger des fichiers/photos, lancer des logiciels, consulter les mails recents (lecture seule), et se connecter a des comptes en ligne deja enregistres dans le gestionnaire de mots de passe.
Confirme toujours en une phrase ce que tu as fait apres avoir execute une action. Si une commande est ambigue, demande une precision plutot que de deviner.`;

export async function runCommand(command: string): Promise<string> {
  const finalMessage = await client.beta.messages.toolRunner({
    model: "claude-opus-5",
    max_tokens: 2048,
    system: SYSTEM_PROMPT,
    // NB: `output_config.effort` (controle du niveau de reflexion) n'est pas
    // encore type dans @anthropic-ai/sdk@0.68.0 installe ici. A ajouter des
    // que le SDK est mis a jour vers une version qui l'expose.
    tools: [
      organizePhotosTool,
      openAppTool,
      fetchCredentialTool,
      loginToSiteTool,
      listEmailsTool,
    ],
    messages: [{ role: "user", content: command }],
  });

  const textBlocks = finalMessage.content.filter(
    (block): block is Extract<typeof block, { type: "text" }> =>
      block.type === "text",
  );
  return textBlocks.map((block) => block.text).join("\n") || "(pas de reponse)";
}
