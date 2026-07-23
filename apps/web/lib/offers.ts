/**
 * Catalogue des offres de CAP Entreprendre France.
 *
 * L'assistante IA (Capucine) s'appuie sur ce catalogue pour diagnostiquer le
 * besoin d'une entreprise et recommander la ou les bonnes offres.
 *
 * ➜ Modifiez librement ce fichier : ajoutez vos offres réelles, vos prix, vos
 *   descriptions. L'assistante s'adapte automatiquement.
 */
export interface Offer {
  id: string;
  name: string;
  /** Accroche courte affichée sur la carte d'offre. */
  tagline: string;
  /** Problèmes / signaux qui déclenchent cette recommandation. */
  solves: string[];
  /** Bénéfices concrets, pour argumenter. */
  outcomes: string[];
  /** Fourchette de prix indicative (texte libre). */
  priceHint?: string;
}

export const OFFERS: Offer[] = [
  {
    id: "site-web",
    name: "Site web & application sur-mesure",
    tagline: "Un site ou une app moderne, rapide, qui convertit.",
    solves: [
      "pas de site ou site vieillissant",
      "peu de demandes entrantes",
      "image de marque à moderniser",
      "besoin de vendre en ligne",
    ],
    outcomes: ["Présence pro crédible", "Plus de prospects", "Prise de contact facilitée"],
    priceHint: "à partir de 1 500 €",
  },
  {
    id: "assistant-ia",
    name: "Assistant IA conversationnel",
    tagline: "Un assistant intelligent qui répond et qualifie 24/7 sur votre site.",
    solves: [
      "questions clients répétitives",
      "leads perdus hors horaires",
      "temps passé à répondre",
    ],
    outcomes: ["Réponses instantanées", "Leads qualifiés automatiquement", "Gain de temps"],
    priceHint: "à partir de 490 €/mois",
  },
  {
    id: "assistant-vocal",
    name: "Assistant vocal (RDV & qualification)",
    tagline: "Un agent vocal qui prend vos appels, qualifie et pose des RDV.",
    solves: [
      "appels manqués",
      "standard saturé",
      "prise de rendez-vous chronophage",
    ],
    outcomes: ["Zéro appel manqué", "Agenda rempli automatiquement", "Leads pré-qualifiés"],
    priceHint: "à partir de 690 €/mois",
  },
  {
    id: "seo-social",
    name: "SEO & réseaux sociaux",
    tagline: "Plus de visibilité, plus de vues, plus de clients.",
    solves: [
      "invisible sur Google",
      "peu d'abonnés / d'engagement",
      "pas de temps pour publier",
    ],
    outcomes: ["Trafic qualifié", "Notoriété", "Contenu régulier sans effort"],
    priceHint: "à partir de 590 €/mois",
  },
  {
    id: "visuels",
    name: "Visuels & vidéos cinématographiques",
    tagline: "Des visuels et pubs vidéo dignes du cinéma.",
    solves: [
      "images de mauvaise qualité",
      "pas de contenu vidéo",
      "besoin de se démarquer",
    ],
    outcomes: ["Image premium", "Publicités qui accrochent", "Différenciation forte"],
    priceHint: "à partir de 390 €",
  },
  {
    id: "prospection",
    name: "Prospection B2B & CRM (HubSpot)",
    tagline: "On trouve et qualifie vos futurs clients, connectés à votre CRM.",
    solves: [
      "pas assez de nouveaux clients",
      "prospection non structurée",
      "pas de suivi des leads",
    ],
    outcomes: ["Pipeline rempli", "Leads qualifiés dans HubSpot", "Suivi automatisé"],
    priceHint: "sur devis",
  },
  {
    id: "relance",
    name: "Relance & fidélisation client",
    tagline: "Séquences automatiques : suivi, avis, paiement, upsell.",
    solves: [
      "clients qui ne reviennent pas",
      "devis / factures en attente",
      "peu d'avis clients",
    ],
    outcomes: ["Plus de réachat", "Paiements accélérés", "Réputation renforcée"],
    priceHint: "à partir de 290 €/mois",
  },
  {
    id: "automatisation",
    name: "Automatisation (Make / Google Sheets)",
    tagline: "On automatise vos tâches répétitives de bout en bout.",
    solves: [
      "trop de tâches manuelles",
      "outils qui ne communiquent pas",
      "erreurs de ressaisie",
    ],
    outcomes: ["Heures gagnées chaque semaine", "Process fiabilisés", "Données centralisées"],
    priceHint: "sur devis",
  },
  {
    id: "formation-metier",
    name: "Formation IA par métier",
    tagline: "On forme vos équipes à l'IA, adaptée à votre secteur.",
    solves: [
      "équipe pas à l'aise avec l'IA",
      "besoin de monter en compétence",
      "envie d'internaliser",
    ],
    outcomes: ["Équipe autonome", "Productivité en hausse", "Avantage concurrentiel"],
    priceHint: "sur devis",
  },
];

export function offerById(id: string): Offer | undefined {
  return OFFERS.find((o) => o.id === id);
}
