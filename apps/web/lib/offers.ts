import {
  Palette,
  Globe,
  MessageCircle,
  Megaphone,
  PenTool,
  Image as ImageIcon,
  BarChart3,
  Zap,
  Lightbulb,
  type LucideIcon,
} from "lucide-react";

export interface ServiceOffer {
  slug: string;
  icon: LucideIcon;
  color: string;
  title: string;
  shortDescription: string;
  description: string;
  benefits: string[];
  deliverables: string[];
  idealFor: string;
}

export const services: ServiceOffer[] = [
  {
    slug: "identite-visuelle",
    icon: Palette,
    color: "bg-blue-50 text-blue-600",
    title: "Identité visuelle",
    shortDescription:
      "Logo, charte graphique, palette de couleurs et typographies. Une identité forte qui vous distingue de vos concurrents.",
    description:
      "Votre identité visuelle est la première chose que vos clients retiennent. On construit un logo, une charte graphique et un univers cohérent qui vous ressemble vraiment — pas un template générique de plus.",
    benefits: [
      "Une image professionnelle dès le premier contact",
      "Une cohérence sur tous vos supports (print, digital, réseaux)",
      "Une identité qui vous démarque de la concurrence locale",
    ],
    deliverables: ["Logo (variantes)", "Charte graphique complète", "Palette de couleurs & typographies", "Fichiers sources exploitables"],
    idealFor: "Entrepreneurs qui lancent leur activité ou veulent enfin une image à la hauteur de leur travail.",
  },
  {
    slug: "creation-site-web",
    icon: Globe,
    color: "bg-orange-50 text-orange-600",
    title: "Sites web intelligents",
    shortDescription:
      "Sites vitrines et e-commerce conçus avec l'IA : plus rapides à livrer, optimisés SEO dès le départ, prêts à intégrer un assistant IA.",
    description:
      "On ne construit plus un site comme il y a cinq ans. Grâce à l'IA, on conçoit, rédige et optimise votre site plus vite et avec plus de précision — et on peut y intégrer un assistant conversationnel comme Capia pour transformer vos visiteurs en clients, 24h/24.",
    benefits: [
      "Mise en ligne plus rapide grâce à des workflows assistés par IA",
      "Optimisation SEO intégrée dès la conception, pas ajoutée après coup",
      "Compatible avec un assistant IA conversationnel (option)",
    ],
    deliverables: ["Site vitrine ou e-commerce", "Design responsive mobile-first", "SEO technique (metadata, sitemap, structured data)", "Formation à la prise en main"],
    idealFor: "Entrepreneurs qui veulent un site qui travaille pour eux, pas juste une carte de visite en ligne.",
  },
  {
    slug: "assistants-ia-sur-mesure",
    icon: MessageCircle,
    color: "bg-brand-50 text-brand-600",
    title: "Assistants IA sur-mesure",
    shortDescription:
      "Un assistant comme Capia, à votre image : accueil client, réponses aux questions fréquentes, qualification de leads — 24h/24, sans effort pour vous.",
    description:
      "Capia, l'assistante IA de ce site, est un exemple de ce qu'on sait créer pour vous. On conçoit un assistant conversationnel personnalisé — nom, ton, connaissances propres à votre activité — qui accueille vos visiteurs, répond à leurs questions et qualifie vos prospects pendant que vous travaillez.",
    benefits: [
      "Disponible 24h/24, même quand vous êtes sur un chantier ou avec un client",
      "Répond avec VOS informations : offres, tarifs, horaires, spécificités",
      "Capture et qualifie les demandes avant qu'elles n'arrivent dans votre boîte mail",
    ],
    deliverables: ["Persona IA personnalisé (nom, ton, avatar)", "Base de connaissances sur votre activité", "Intégration sur votre site", "Ajustements après mise en ligne"],
    idealFor: "Entrepreneurs qui perdent des prospects parce que personne ne répond assez vite.",
  },
  {
    slug: "communication-digitale",
    icon: Megaphone,
    color: "bg-purple-50 text-purple-600",
    title: "Communication digitale",
    shortDescription:
      "Gestion des réseaux sociaux, campagnes publicitaires et stratégie de contenu. Votre marque visible partout.",
    description:
      "Une belle identité ne sert à rien si personne ne la voit. On pilote votre présence sur les réseaux, vos campagnes publicitaires et votre stratégie de contenu pour que votre marque soit visible là où sont vos clients.",
    benefits: [
      "Une présence régulière sans que vous ayez à y penser",
      "Des campagnes ciblées sur votre zone et votre clientèle",
      "Un contenu qui vous ressemble, pas du remplissage",
    ],
    deliverables: ["Calendrier de publication", "Création de contenu (visuels, textes)", "Campagnes Meta / Google Ads", "Reporting mensuel"],
    idealFor: "Entrepreneurs qui savent que la visibilité est leur premier problème.",
  },
  {
    slug: "strategie-de-marque",
    icon: PenTool,
    color: "bg-yellow-50 text-yellow-600",
    title: "Stratégie de marque",
    shortDescription:
      "Positionnement, valeurs, ton de communication. On construit une marque cohérente qui parle à votre audience.",
    description:
      "Avant de créer quoi que ce soit, on clarifie qui vous êtes, pour qui vous travaillez et ce qui vous différencie. Cette base guide ensuite tous vos choix de communication — et évite les demi-tours coûteux.",
    benefits: [
      "Un positionnement clair, facile à expliquer en une phrase",
      "Une cohérence entre ce que vous dites et ce que vous montrez",
      "Une base solide pour toutes vos futures décisions marketing",
    ],
    deliverables: ["Atelier de positionnement", "Document de plateforme de marque", "Ton de voix & messages clés", "Recommandations par canal"],
    idealFor: "Entrepreneurs qui ont du mal à expliquer simplement ce qu'ils font et pour qui.",
  },
  {
    slug: "design-graphique",
    icon: ImageIcon,
    color: "bg-green-50 text-green-600",
    title: "Design graphique",
    shortDescription:
      "Flyers, cartes de visite, brochures, bannières. Des supports print et digitaux qui attirent l'œil.",
    description:
      "Du support imprimé au visuel réseaux sociaux, on crée des supports qui respectent votre charte et attirent réellement l'attention — sans repartir de zéro à chaque fois grâce à des gabarits réutilisables.",
    benefits: [
      "Des supports cohérents avec votre identité, prêts à l'emploi",
      "Des gabarits réutilisables pour vos futurs besoins",
      "Un rendu professionnel, print comme digital",
    ],
    deliverables: ["Flyers & brochures", "Cartes de visite", "Visuels réseaux sociaux", "Bannières publicitaires"],
    idealFor: "Entrepreneurs qui ont besoin de supports ponctuels, propres et rapides.",
  },
  {
    slug: "refonte-de-marque",
    icon: BarChart3,
    color: "bg-red-50 text-red-600",
    title: "Refonte de marque",
    shortDescription:
      "Modernisation de votre identité existante. On garde votre ADN tout en vous donnant un coup de jeune.",
    description:
      "Votre marque a vieilli, mais elle a de la valeur. On la modernise sans effacer ce que vos clients reconnaissent déjà — un équilibre entre continuité et renouveau.",
    benefits: [
      "Une image rafraîchie sans perdre votre reconnaissance existante",
      "Une transition en douceur pour vos clients fidèles",
      "Un nouveau départ sans repartir de zéro",
    ],
    deliverables: ["Audit de votre identité actuelle", "Nouvelle direction créative", "Déclinaison sur tous vos supports", "Plan de transition"],
    idealFor: "Entrepreneurs dont l'activité a évolué mais dont l'image est restée figée.",
  },
  {
    slug: "accompagnement-entrepreneurial",
    icon: Zap,
    color: "bg-brand-50 text-brand-600",
    title: "Accompagnement entrepreneurial",
    shortDescription:
      "Conseils et support pour lancer ou développer votre activité. On vous aide à communiquer dès le premier jour.",
    description:
      "Lancer ou développer une entreprise seul, c'est difficile. On vous accompagne sur les décisions de communication et de digitalisation au fil de votre développement — un vrai copilote, pas juste un prestataire ponctuel.",
    benefits: [
      "Un interlocuteur qui connaît votre activité dans la durée",
      "Des décisions de communication prises avec du recul",
      "Un accompagnement qui grandit avec votre entreprise",
    ],
    deliverables: ["Points de suivi réguliers", "Conseils personnalisés", "Priorisation des actions à fort impact", "Accès prioritaire à l'équipe"],
    idealFor: "Entrepreneurs qui démarrent et veulent éviter les erreurs de communication coûteuses.",
  },
  {
    slug: "conseils-formation",
    icon: Lightbulb,
    color: "bg-teal-50 text-teal-600",
    title: "Conseils & formation",
    shortDescription:
      "Ateliers et formations en communication. Apprenez à gérer votre image et celle de votre entreprise.",
    description:
      "On ne veut pas vous rendre dépendant. Nos ateliers vous donnent les bases pour gérer vous-même votre communication au quotidien, et savoir quand faire appel à nous.",
    benefits: [
      "Autonomie sur la gestion quotidienne de votre image",
      "Des outils concrets, pas de théorie abstraite",
      "La capacité à identifier vos priorités de communication",
    ],
    deliverables: ["Ateliers pratiques", "Supports pédagogiques", "Exercices sur votre propre activité", "Suivi post-formation"],
    idealFor: "Entrepreneurs qui veulent comprendre et reprendre la main sur leur communication.",
  },
];

export function getServiceBySlug(slug: string): ServiceOffer | undefined {
  return services.find((s) => s.slug === slug);
}

export interface PricingPlan {
  name: string;
  tagline: string;
  monthlyPrice: number;
  annualPrice: number;
  annualMonthly: number;
  color: string;
  buttonClass: string;
  popular: boolean;
  features: string[];
  missing: string[];
}

export const pricingPlans: PricingPlan[] = [
  {
    name: "Essentiel",
    tagline: "Pour démarrer",
    monthlyPrice: 290,
    annualPrice: 2900,
    annualMonthly: 242,
    color: "border-gray-200",
    buttonClass: "bg-gray-900 hover:bg-gray-800 text-white",
    popular: false,
    features: [
      "Logo + charte graphique",
      "Cartes de visite",
      "1 page web vitrine",
      "Réseaux sociaux : setup de base",
      "Support email",
    ],
    missing: [
      "Site web complet",
      "Assistant IA personnalisé",
      "Stratégie de marque",
      "Campagnes publicitaires",
      "Formation en communication",
      "Accompagnement continu",
    ],
  },
  {
    name: "Business",
    tagline: "Le plus populaire",
    monthlyPrice: 590,
    annualPrice: 5900,
    annualMonthly: 492,
    color: "border-brand-600 ring-2 ring-brand-600",
    buttonClass: "bg-brand-600 hover:bg-brand-700 text-white",
    popular: true,
    features: [
      "Tout du pack Essentiel",
      "Site web complet (5 pages) optimisé SEO",
      "Assistant IA personnalisé (FAQ + prise de contact)",
      "Stratégie de marque complète",
      "Gestion des réseaux sociaux (4 posts/mois)",
      "Flyers & brochures",
      "Refonte de marque incluse",
      "Support prioritaire",
    ],
    missing: [],
  },
  {
    name: "Premium",
    tagline: "Pour les entreprises ambitieuses",
    monthlyPrice: 1290,
    annualPrice: 12900,
    annualMonthly: 1075,
    color: "border-gray-200",
    buttonClass: "bg-gray-900 hover:bg-gray-800 text-white",
    popular: false,
    features: [
      "Tout du pack Business",
      "Site e-commerce ou application web",
      "Assistant IA avancé multi-canal (site + réseaux)",
      "Campagnes publicitaires (Meta, Google)",
      "Stratégie de contenu complète",
      "Ateliers de formation en communication",
      "Accompagnement dédié mensuel",
      "SLA 99,9%",
    ],
    missing: [],
  },
];
