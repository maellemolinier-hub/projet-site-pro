export type ContentBlock = { type: "p" | "h2"; text: string };

export interface Article {
  slug: string;
  title: string;
  excerpt: string;
  category: string;
  publishedAt: string; // ISO date
  readingMinutes: number;
  content: ContentBlock[];
}

export const articles: Article[] = [
  {
    slug: "ia-productivite-auto-entrepreneurs",
    title: "5 façons dont l'IA fait gagner du temps aux auto-entrepreneurs",
    excerpt:
      "Rédaction, réponses clients, visuels, organisation : voici où l'IA change concrètement le quotidien d'un entrepreneur solo, sans compétence technique requise.",
    category: "Intelligence artificielle",
    publishedAt: "2026-01-12",
    readingMinutes: 5,
    content: [
      {
        type: "p",
        text: "Quand on est seul aux commandes de son entreprise, chaque heure compte double. Entre la production, la relation client et l'administratif, la communication passe souvent en dernier — faute de temps, pas de volonté. L'IA change la donne, à condition de savoir où l'utiliser.",
      },
      { type: "h2", text: "1. Répondre aux clients sans être derrière son téléphone" },
      {
        type: "p",
        text: "Un assistant IA sur votre site répond aux questions fréquentes — horaires, tarifs, disponibilités — pendant que vous êtes sur un chantier ou avec un client. C'est exactement le rôle de Capia sur ce site : elle ne remplace pas la relation humaine, elle évite qu'un prospect reparte faute de réponse rapide.",
      },
      { type: "h2", text: "2. Rédiger sans passer une heure devant une page blanche" },
      {
        type: "p",
        text: "Description de service, post réseaux sociaux, réponse à un avis client : l'IA générative propose un premier jet en quelques secondes. Vous gardez la main sur le ton et le fond, mais vous partez d'une base au lieu d'une page vide.",
      },
      { type: "h2", text: "3. Trier et prioriser les demandes entrantes" },
      {
        type: "p",
        text: "Un assistant bien configuré qualifie une demande avant qu'elle n'arrive dans votre boîte mail : type de projet, budget approximatif, urgence. Vous ouvrez votre messagerie avec l'information déjà triée.",
      },
      { type: "h2", text: "4. Générer des visuels cohérents rapidement" },
      {
        type: "p",
        text: "Les outils de génération d'image accélèrent la création de visuels pour les réseaux sociaux, à condition de partir d'une charte graphique solide — sinon, le résultat reste hors-sujet visuellement, même s'il est techniquement propre.",
      },
      { type: "h2", text: "5. Garder une cohérence même sans temps dédié" },
      {
        type: "p",
        text: "Le vrai gain n'est pas de \"faire à votre place\", mais de maintenir une présence régulière sans y consacrer des heures chaque semaine. C'est souvent ce qui fait la différence entre une communication qui existe et une communication qui convertit.",
      },
    ],
  },
  {
    slug: "site-web-intelligent-2026",
    title: "À quoi ressemble un site web qui travaille pour vous en 2026 ?",
    excerpt:
      "Un site vitrine classique attend qu'on le visite. Un site intelligent engage la conversation, répond aux questions et qualifie les demandes — même la nuit.",
    category: "Digitalisation",
    publishedAt: "2026-02-03",
    readingMinutes: 4,
    content: [
      {
        type: "p",
        text: "Pendant longtemps, un bon site web se résumait à : rapide, beau, mobile-friendly. C'est toujours vrai, mais ce n'est plus suffisant. En 2026, les entreprises qui se démarquent ont des sites qui font quelque chose pendant que vous dormez.",
      },
      { type: "h2", text: "Le site vitrine attend, le site intelligent engage" },
      {
        type: "p",
        text: "Un formulaire de contact classique attend qu'un visiteur ait déjà pris sa décision de vous écrire — ce qui élimine tous ceux qui hésitent encore. Un assistant conversationnel, lui, engage la discussion au moment où le doute apparaît : \"combien ça coûte\", \"est-ce que vous faites ça\", \"comment ça se passe\".",
      },
      { type: "h2", text: "Le SEO se prépare dès la conception" },
      {
        type: "p",
        text: "Ajouter le référencement après coup, c'est comme repeindre une maison mal isolée : ça masque le problème sans le résoudre. Un site pensé pour le SEO dès le départ — structure, temps de chargement, données structurées — obtient des résultats plus vite et moins cher qu'un rattrapage après lancement.",
      },
      { type: "h2", text: "La rapidité de mise en ligne n'est plus un luxe" },
      {
        type: "p",
        text: "Grâce à des workflows assistés par IA, on peut aujourd'hui livrer un site professionnel en semaines plutôt qu'en mois — sans sacrifier la qualité, à condition que le cadrage initial (positionnement, contenu, objectifs) soit solide.",
      },
    ],
  },
  {
    slug: "chatbot-ia-pme-guide",
    title: "Faut-il un chatbot IA pour votre PME ? Le guide sans jargon",
    excerpt:
      "Ni gadget, ni solution miracle. Voici comment savoir si un assistant IA a vraiment sa place sur votre site — et ce qu'il faut éviter.",
    category: "Intelligence artificielle",
    publishedAt: "2026-02-20",
    readingMinutes: 6,
    content: [
      {
        type: "p",
        text: "\"Chatbot\" a une mauvaise réputation, souvent méritée : des menus déroulants rigides qui frustrent plus qu'ils n'aident. Les assistants IA actuels sont d'une autre nature, mais ça ne veut pas dire qu'ils conviennent à toutes les entreprises.",
      },
      { type: "h2", text: "Les bons signaux pour se lancer" },
      {
        type: "p",
        text: "Si vous recevez régulièrement les mêmes questions par téléphone ou email, si vous perdez des demandes parce que vous ne répondez pas assez vite, ou si votre activité génère des demandes en dehors de vos horaires — un assistant IA a un vrai rôle à jouer.",
      },
      { type: "h2", text: "Les faux bons signaux" },
      {
        type: "p",
        text: "\"Tout le monde en a un\" n'est pas une raison suffisante. Un assistant mal configuré, qui donne de mauvaises réponses ou ne sait pas dire \"je ne sais pas\", fait plus de mal que l'absence d'assistant. La qualité de la base de connaissances compte plus que la technologie elle-même.",
      },
      { type: "h2", text: "Ce qui fait la différence" },
      {
        type: "p",
        text: "Un bon assistant IA d'entreprise doit : ne répondre qu'avec des informations vérifiées sur votre activité, savoir rediriger vers un humain quand c'est nécessaire, et avoir un ton qui correspond à votre marque. C'est un travail de configuration, pas juste d'installation d'un outil.",
      },
    ],
  },
  {
    slug: "identite-visuelle-erreurs-debutant",
    title: "5 erreurs d'identité visuelle qui coûtent cher aux entrepreneurs qui démarrent",
    excerpt:
      "Un logo fait \"vite fait\", une charte inexistante, des couleurs qui changent à chaque support : ces erreurs se paient plus tard, au moment de la refonte.",
    category: "Communication",
    publishedAt: "2026-03-05",
    readingMinutes: 4,
    content: [
      {
        type: "p",
        text: "L'identité visuelle est souvent la première chose qu'on bâcle en démarrant une activité — par manque de budget ou parce qu'on pense que ça viendra \"plus tard, quand ça marchera\". Le problème, c'est que ce \"plus tard\" coûte toujours plus cher qu'un bon départ.",
      },
      { type: "h2", text: "1. Pas de charte graphique écrite" },
      {
        type: "p",
        text: "Sans document de référence, chaque nouveau support (flyer, post, site) réinvente les couleurs et les polices. Résultat : une image incohérente qui donne une impression d'amateurisme, même quand chaque élément pris isolément est correct.",
      },
      { type: "h2", text: "2. Un logo pensé pour un seul format" },
      {
        type: "p",
        text: "Un logo qui ne fonctionne qu'en grand format devient illisible en icône de réseau social ou en tampon. Un bon logo prévoit ses déclinaisons dès la conception.",
      },
      { type: "h2", text: "3. Copier la concurrence plutôt que se positionner" },
      {
        type: "p",
        text: "Ressembler à ses concurrents rassure à court terme, mais rend invisible à moyen terme. Le travail de positionnement en amont évite ce piège.",
      },
      { type: "h2", text: "4. Négliger la version noir et blanc" },
      {
        type: "p",
        text: "Facture, contrat, tampon : votre logo doit rester lisible sans couleur. C'est un test simple qui révèle beaucoup de logos mal construits.",
      },
      { type: "h2", text: "5. Attendre d'avoir \"le temps\" pour s'en occuper" },
      {
        type: "p",
        text: "Une identité visuelle claire dès le départ évite une refonte coûteuse une fois que la marque a gagné en visibilité — et donc que le changement d'image devient plus risqué.",
      },
    ],
  },
  {
    slug: "seo-local-artisans-commercants",
    title: "SEO local : comment les artisans et commerçants deviennent visibles sur Google",
    excerpt:
      "Pas besoin d'être une grande enseigne pour apparaître en premier sur Google Maps. Trois leviers accessibles à toutes les petites structures.",
    category: "SEO",
    publishedAt: "2026-03-18",
    readingMinutes: 5,
    content: [
      {
        type: "p",
        text: "Quand un client cherche \"plombier près de moi\" ou \"boulangerie Grasse\", trois résultats apparaissent en haut de la page avant même la liste des sites web. C'est le pack local Google — et il change complètement la donne pour les petites entreprises.",
      },
      { type: "h2", text: "1. Une fiche Google Business Profile complète et à jour" },
      {
        type: "p",
        text: "Horaires exacts, photos récentes, catégorie d'activité précise, réponses aux avis : ces détails, souvent négligés, pèsent lourd dans le classement local. Une fiche mise à jour une fois par trimestre vaut mieux qu'une fiche créée puis oubliée.",
      },
      { type: "h2", text: "2. Des avis clients, régulièrement" },
      {
        type: "p",
        text: "Le nombre et la fraîcheur des avis comptent autant que la note moyenne. Demander un avis juste après une prestation réussie, au bon moment, change tout — la plupart des clients satisfaits sont prêts à le faire s'ils y pensent.",
      },
      { type: "h2", text: "3. Un site qui mentionne clairement sa zone d'activité" },
      {
        type: "p",
        text: "Un site qui cite explicitement sa ville et les communes environnantes, dans ses titres et son contenu, aide Google à comprendre où vous proposer. C'est un détail technique simple, mais rarement bien fait.",
      },
      { type: "h2", text: "En résumé" },
      {
        type: "p",
        text: "Le SEO local n'est pas réservé aux grandes structures avec un budget marketing conséquent. C'est une question de régularité sur des actions simples, plus que de budget.",
      },
    ],
  },
];

export function getArticleBySlug(slug: string): Article | undefined {
  return articles.find((a) => a.slug === slug);
}

export function getLatestArticles(count: number): Article[] {
  return [...articles]
    .sort((a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime())
    .slice(0, count);
}

export function formatArticleDate(iso: string): string {
  return new Intl.DateTimeFormat("fr-FR", { day: "numeric", month: "long", year: "numeric" }).format(
    new Date(iso)
  );
}
