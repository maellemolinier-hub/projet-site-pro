// Detection heuristique - PAS un sandbox. Une commande peut etre destructrice
// sans matcher ces motifs (ex: un script custom qui supprime des fichiers).
// C'est un filet de securite pour les cas les plus courants, pas une garantie.
const DESTRUCTIVE_PATTERNS: RegExp[] = [
  /\brm\s+-[a-z]*r[a-z]*f\b/i, // rm -rf, rm -fr...
  /\brm\s+-[a-z]*f[a-z]*r\b/i,
  /\brm\s+-r\b/i,
  /\bdel\s+\/[a-z]/i, // del /f, del /s (Windows)
  /\brd\s+\/[a-z]/i, // rd /s (Windows)
  /\bformat\b/i,
  /\bmkfs\b/i,
  /\bshutdown\b/i,
  /\breboot\b/i,
  /\bdd\s+if=/i,
  />\s*\/dev\/(sd|nvme|disk)/i,
  /\bsudo\b/i,
  /\bchmod\s+-r\s+777\b/i,
  /\bdrop\s+table\b/i,
  /\bdelete\s+from\b/i,
  /\btruncate\b/i,
  /\bkill\s+-9\b/i,
  /\bgit\s+push\s+--force\b/i,
  /\bgit\s+reset\s+--hard\b/i,
];

/**
 * Verifie si une commande shell correspond a un motif potentiellement
 * destructeur connu (suppression massive, formatage, arret systeme...).
 */
export function isDestructiveCommand(command: string): boolean {
  return DESTRUCTIVE_PATTERNS.some((pattern) => pattern.test(command));
}
