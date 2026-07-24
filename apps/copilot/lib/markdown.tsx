import { Fragment, type ReactNode } from "react";

// Rendu minimal et sûr (aucun dangerouslySetInnerHTML) d'un sous-ensemble de
// markdown produit par les réponses IA : texte en gras et listes à puces.
export function renderMarkdown(texte: string): ReactNode {
  const lignes = texte.split("\n");

  return lignes.map((ligne, i) => {
    const puce = /^[*-]\s+(.*)/.exec(ligne);
    const contenu = renderInline(puce ? puce[1] : ligne);
    if (puce) {
      return (
        <div key={i} style={{ paddingLeft: 14 }}>
          • {contenu}
        </div>
      );
    }
    return (
      <Fragment key={i}>
        {contenu}
        {i < lignes.length - 1 && <br />}
      </Fragment>
    );
  });
}

function renderInline(ligne: string): ReactNode {
  const parts = ligne.split(/(\*\*[^*]+\*\*)/g).filter(Boolean);
  return parts.map((part, i) => {
    if (part.startsWith("**") && part.endsWith("**")) {
      return <strong key={i}>{part.slice(2, -2)}</strong>;
    }
    return <Fragment key={i}>{part}</Fragment>;
  });
}
