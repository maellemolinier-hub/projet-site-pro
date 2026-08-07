import { Sparkles, Calendar, ShoppingBag, UtensilsCrossed, type LucideIcon } from "lucide-react";

export interface AIPersona {
  name: string;
  role: string;
  description: string;
  idealFor: string;
  icon: LucideIcon;
  gradient: string;
  isCapia?: boolean;
}

export const aiPersonas: AIPersona[] = [
  {
    name: "Capia",
    role: "Assistante généraliste",
    description:
      "Accueille les visiteurs de ce site, présente nos services et nos tarifs, et qualifie les demandes de devis. C'est elle qui vous parle en bas à droite de votre écran.",
    idealFor: "Studios, agences, indépendants",
    icon: Sparkles,
    gradient: "from-brand-600 to-accent-500",
    isCapia: true,
  },
  {
    name: "Léa",
    role: "Assistante prise de rendez-vous",
    description:
      "Propose des créneaux disponibles, confirme les rendez-vous et répond aux questions pratiques (horaires, tarifs, adresse) sans intervention humaine.",
    idealFor: "Salons de coiffure, cabinets, praticiens",
    icon: Calendar,
    gradient: "from-purple-500 to-purple-700",
  },
  {
    name: "Max",
    role: "Conseiller produit",
    description:
      "Aide les visiteurs d'une boutique en ligne à trouver le bon produit, répond aux questions techniques et relance les paniers abandonnés.",
    idealFor: "E-commerce, boutiques spécialisées",
    icon: ShoppingBag,
    gradient: "from-orange-500 to-orange-700",
  },
  {
    name: "Nova",
    role: "Assistante réservation & FAQ",
    description:
      "Gère les réservations, explique le menu ou les prestations, et rassure les nouveaux clients sur les informations pratiques avant leur venue.",
    idealFor: "Restaurants, hôtellerie, événementiel",
    icon: UtensilsCrossed,
    gradient: "from-green-500 to-green-700",
  },
];
