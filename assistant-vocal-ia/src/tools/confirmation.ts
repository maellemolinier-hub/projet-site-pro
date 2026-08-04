// Le mot "CONFIRME" seul est un secret trivial (il est documente dans le
// README) - n'importe qui connaissant l'existence de Serv'IA pourrait
// l'utiliser. Le vrai secret est CONFIRMATION_CODE, propre a chaque
// installation, jamais commit, a fournir juste apres le mot CONFIRME.
const CONFIRMATION_PATTERN = /\bconfirme\s+(\S+)/i;

/**
 * Verifie que le texte brut de la demande (tape, transcrit du micro, ou
 * mail recu) contient "CONFIRME <code>" avec le bon code secret. Sans
 * CONFIRMATION_CODE configure, une demande n'est jamais consideree comme
 * confirmee (echoue de facon fermee plutot qu'ouverte).
 */
export function isPreConfirmed(
  rawText: string,
  confirmationCode: string | undefined,
): boolean {
  if (!confirmationCode) return false;

  const match = rawText.match(CONFIRMATION_PATTERN);
  return match !== null && match[1] === confirmationCode;
}
