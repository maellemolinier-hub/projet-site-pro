// Plage Unicode des diacritiques combinants (accents apres normalisation
// NFD) - construite via \u pour eviter d'embarquer des caracteres combinants
// litteraux illisibles dans le code source.
const COMBINING_DIACRITICS = new RegExp("[̀-ͯ]", "g");

/**
 * Normalise un texte pour la detection du mot-cle : minuscules, accents et
 * apostrophes/espaces/tirets retires. Rend la detection tolerante aux
 * variantes de transcription ("Hey Serv'IA", "hey servia", "Hey Serv IA"...).
 */
export function normalizeForWakeWord(text: string): string {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(COMBINING_DIACRITICS, "")
    .replace(/['’\s-]/g, "");
}

/**
 * Detecte si un transcript contient le mot-cle "Serv'IA" (avec ou sans
 * "hey" devant - la transcription vocale du mot d'introduction est peu
 * fiable, donc seul "servia" est requis).
 */
export function containsWakeWord(transcript: string): boolean {
  return normalizeForWakeWord(transcript).includes("servia");
}
