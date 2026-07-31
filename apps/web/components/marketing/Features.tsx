import {
  Palette,
  Globe,
  Megaphone,
  PenTool,
  Zap,
  Image as ImageIcon,
  BarChart3,
  Lightbulb,
} from "lucide-react";

const features = [
  {
    icon: Palette,
    color: "bg-blue-50 text-blue-600",
    title: "Identité visuelle",
    description:
      "Logo, charte graphique, palette de couleurs et typographies. Une identité forte qui vous distingue de vos concurrents.",
  },
  {
    icon: Globe,
    color: "bg-orange-50 text-orange-600",
    title: "Création de sites web",
    description:
      "Sites vitrines, e-commerce et applications web. Modernes, rapides et optimisés pour le référencement.",
  },
  {
    icon: Megaphone,
    color: "bg-purple-50 text-purple-600",
    title: "Communication digitale",
    description:
      "Gestion des réseaux sociaux, campagnes publicitaires et stratégie de contenu. Votre marque visible partout.",
  },
  {
    icon: PenTool,
    color: "bg-yellow-50 text-yellow-600",
    title: "Stratégie de marque",
    description:
      "Positionnement, valeurs, ton de communication. On construit une marque cohérente qui parle à votre audience.",
  },
  {
    icon: ImageIcon,
    color: "bg-green-50 text-green-600",
    title: "Design graphique",
    description:
      "Flyers, cartes de visite, brochures, bannières. Des supports print et digitaux qui attirent l'œil.",
  },
  {
    icon: BarChart3,
    color: "bg-red-50 text-red-600",
    title: "Refonte de marque",
    description:
      "Modernisation de votre identité existante. On garde votre ADN tout en vous donnant un coup de jeune.",
  },
  {
    icon: Zap,
    color: "bg-brand-50 text-brand-600",
    title: "Accompagnement entrepreneurial",
    description:
      "Conseils et support pour lancer ou développer votre activité. On vous aide à communiquer dès le premier jour.",
  },
  {
    icon: Lightbulb,
    color: "bg-teal-50 text-teal-600",
    title: "Conseils & formation",
    description:
      "Ateliers et formations en communication. Apprenez à gérer votre image et celle de votre entreprise.",
  },
];

export function Features() {
  return (
    <section
      id="fonctionnalites"
      className="py-24 bg-gray-50"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center max-w-2xl mx-auto mb-16">
          <span className="inline-block text-xs font-semibold tracking-widest text-brand-600 uppercase mb-3">
            Nos services
          </span>
          <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
            Tout ce dont votre entreprise{" "}
            <span className="gradient-text">a besoin pour communiquer</span>
          </h2>
          <p className="text-gray-500 text-lg">
            Un studio complet pour gérer votre image de A à Z. De l'identité
            visuelle à la stratégie digitale, on couvre tous vos besoins.
          </p>
        </div>

        {/* Grid */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((feature) => (
            <div
              key={feature.title}
              className="bg-white rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow border border-gray-100 group"
            >
              <div
                className={`w-10 h-10 rounded-xl ${feature.color} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}
              >
                <feature.icon className="w-5 h-5" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">
                {feature.title}
              </h3>
              <p className="text-sm text-gray-500 leading-relaxed">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}