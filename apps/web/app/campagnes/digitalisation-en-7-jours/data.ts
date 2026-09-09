export type CampaignDay = {
  slug: string;
  dayNumber: number;
  title: string;
  summary: string;
  description: string;
  content: string;
  datePublished: string;
  ogImage: string;
};

export const campaignSlug = "digitalisation-en-7-jours";
export const campaignTitle = "Digitalisation en 7 jours";
export const baseUrl = "https://cap-entreprendre-france.fr";

export const campaignDays: CampaignDay[] = [
  {
    slug: "jour-1-echange",
    dayNumber: 1,
    title: "Échange et découverte de ton métier",
    summary: "30 minutes pour comprendre ton activité, tes services et tes clients cibles.",
    description:
      "Jour 1 : on échange 30 minutes pour comprendre ton métier, tes services et tes clients. Suivez notre campagne Digitalisation en 7 jours par Cap Entreprendre France, agence de communication à Grasse.",
    content:
      "On commence par un échange de 30 minutes. L'objectif : comprendre ton métier, tes services, tes clients cibles et ce qui te différencie. Pas de jargon, pas de questionnaire interminable. Juste une conversation pour qu'on sache exactement ce dont tu as besoin. Tu n'as pas besoin de comprendre le web. On s'en occupe.",
    datePublished: "2026-09-14",
    ogImage: "/og-image.png",
  },
  {
    slug: "jour-2-contenu",
    dayNumber: 2,
    title: "Rédaction du contenu de ton site",
    summary: "On rédige le contenu du site et on prépare ta fiche Google Business.",
    description:
      "Jour 2 : on rédige le contenu de ton site et on prépare ta fiche Google Business. Suivez notre campagne Digitalisation en 7 jours par Cap Entreprendre France, agence de communication à Grasse.",
    content:
      "On rédige le contenu de ton site : tes services, ton histoire, tes zones d'intervention. On prépare aussi le contenu de ta fiche Google Business : description, horaires, photos. Tout est pensé pour ton métier, pas un template générique. Tu valides, on ajuste.",
    datePublished: "2026-09-15",
    ogImage: "/og-image.png",
  },
  {
    slug: "jour-3-design",
    dayNumber: 3,
    title: "Design et mise en page de ton site",
    summary: "Ton site prend forme avec un design sur-mesure pensé pour ton métier.",
    description:
      "Jour 3 : ton site prend forme avec un design sur-mesure pensé pour ton métier. Suivez notre campagne Digitalisation en 7 jours par Cap Entreprendre France, agence de communication à Grasse.",
    content:
      "On passe au design. Ton site prend forme visuellement : couleurs, typographie, mise en page. Pas un template vite fait : un site qui reflète ton savoir-faire. On construit une identité visuelle qui te ressemble et qui parle à tes clients.",
    datePublished: "2026-09-16",
    ogImage: "/og-image.png",
  },
  {
    slug: "jour-4-integration",
    dayNumber: 4,
    title: "Intégration des photos et contenus",
    summary: "Tes photos, tes services et tes textes prennent place sur le site.",
    description:
      "Jour 4 : on intègre tes photos, tes services et tes textes sur le site. Suivez notre campagne Digitalisation en 7 jours par Cap Entreprendre France, agence de communication à Grasse.",
    content:
      "On intègre tout : tes photos, tes services, tes textes, ton formulaire de contact. Chaque élément est placé pour que tes clients trouvent rapidement l'information qu'ils cherchent. Le site devient concret, vivant, prêt à recevoir tes visiteurs.",
    datePublished: "2026-09-17",
    ogImage: "/og-image.png",
  },
  {
    slug: "jour-5-google-business",
    dayNumber: 5,
    title: "Création de ta fiche Google Business",
    summary: "On crée et optimise ta fiche Google Business pour la visibilité locale.",
    description:
      "Jour 5 : on crée et optimise ta fiche Google Business pour que tes clients te trouvent localement. Suivez notre campagne Digitalisation en 7 jours par Cap Entreprendre France, agence de communication à Grasse.",
    content:
      "On crée ou optimise ta fiche Google Business. Photos, horaires, zone d'intervention, description de tes services, collecte d'avis clients. C'est la chose numéro un qui fait que tu apparaîs dans les recherches locales. Une fiche Google optimisée augmente ta visibilité de 70 %.",
    datePublished: "2026-09-18",
    ogImage: "/og-image.png",
  },
  {
    slug: "jour-6-relecture",
    dayNumber: 6,
    title: "Relecture et ajustements avec toi",
    summary: "On parcourt le site ensemble et on ajuste les derniers détails.",
    description:
      "Jour 6 : on parcourt le site ensemble et on ajuste les derniers détails. Suivez notre campagne Digitalisation en 7 jours par Cap Entreprendre France, agence de communication à Grasse.",
    content:
      "On parcourt le site ensemble. Tu regardes, tu commentes, on ajuste. C'est le moment des derniers détails : un texte à reformuler, une photo à repositionner, une information à ajouter. On s'assure que le site est exactement comme tu le veux avant la mise en ligne.",
    datePublished: "2026-09-19",
    ogImage: "/og-image.png",
  },
  {
    slug: "jour-7-mise-en-ligne",
    dayNumber: 7,
    title: "Mise en ligne et activation",
    summary: "Ton site est en ligne, ta fiche Google est active. Tes clients peuvent te trouver.",
    description:
      "Jour 7 : ton site est en ligne, ta fiche Google est active. Tes clients peuvent te trouver. Suivez notre campagne Digitalisation en 7 jours par Cap Entreprendre France, agence de communication à Grasse.",
    content:
      "Le grand jour. On met ton site en ligne et on active ta fiche Google Business. Tes clients peuvent enfin te trouver en ligne. En 7 jours, tu passes d'invisible à trouvé. On s'est occupé de tout. Tu te concentres sur ton métier.",
    datePublished: "2026-09-20",
    ogImage: "/og-image.png",
  },
];

export function getDayBySlug(slug: string): CampaignDay | undefined {
  return campaignDays.find((day) => day.slug === slug);
}