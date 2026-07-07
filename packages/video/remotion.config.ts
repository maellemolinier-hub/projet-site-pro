import { Config } from "@remotion/cli/config";

Config.setVideoImageFormat("jpeg");
Config.setOverwriteOutput(true);

// Permet de pointer vers un binaire Chromium headless-shell déjà installé
// (utile en environnement sandboxé sans accès au CDN de téléchargement de
// Remotion) plutôt que d'en télécharger un à chaque render.
if (process.env.REMOTION_BROWSER_EXECUTABLE) {
  Config.setBrowserExecutable(process.env.REMOTION_BROWSER_EXECUTABLE);
}
