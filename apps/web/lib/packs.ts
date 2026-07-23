/**
 * Packs (offres groupées) de CAP Entreprendre France.
 * Pensés pour "claquer" : lisibles, orientés résultat, avec un pack mis en avant.
 * ➜ Modifiez librement noms, prix et contenus.
 */
export interface Pack {
  id: string;
  name: string;
  punchline: string;
  price: string;
  priceNote?: string;
  features: string[];
  highlighted?: boolean;
  badge?: string;
}

export const PACKS: Pack[] = [
  {
    id: "decollage",
    name: "Décollage",
    punchline: "Pour exister enfin en ligne et capter vos premiers clients.",
    price: "1 490 €",
    priceNote: "paiement unique",
    features: [
      "Site web moderne sur-mesure",
      "Capia, votre assistante IA sur le site",
      "Fiche Google + bases SEO",
      "Livraison clé en main sous 7 jours",
    ],
  },
  {
    id: "croissance",
    name: "Croissance",
    punchline: "La machine complète pour attirer et convertir en continu.",
    price: "990 €",
    priceNote: "par mois",
    highlighted: true,
    badge: "Le plus choisi",
    features: [
      "Tout le pack Décollage",
      "SEO + réseaux sociaux (contenu chaque semaine)",
      "Visuels & vidéos cinématographiques",
      "Assistant vocal (prise de RDV 24/7)",
      "Tableau de pilotage + suivi",
    ],
  },
  {
    id: "domination",
    name: "Domination",
    punchline: "Passez devant vos concurrents et industrialisez votre croissance.",
    price: "Sur devis",
    features: [
      "Tout le pack Croissance",
      "Téléprospecteur IA (appels + RDV)",
      "Prospection B2B connectée à HubSpot",
      "Automatisations sur-mesure (Make)",
      "Accompagnement prioritaire",
    ],
  },
];
