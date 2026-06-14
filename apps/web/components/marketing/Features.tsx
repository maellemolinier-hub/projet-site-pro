import {
  Map,
  Smartphone,
  GraduationCap,
  Star,
  Zap,
  Globe,
  BarChart3,
  Shield,
} from "lucide-react";

const features = [
  {
    icon: Map,
    color: "bg-blue-50 text-blue-600",
    title: "Carte prix temps réel",
    description:
      "Visualisez les prix au m² rue par rue sur toute la France. Heatmap dynamique, vue satellite et bascule 3D des bâtiments.",
  },
  {
    icon: Smartphone,
    color: "bg-orange-50 text-orange-600",
    title: "Prospection prédictive IA",
    description:
      "Notre IA identifie les propriétaires susceptibles de vendre dans les 6 mois. Prioritisez votre terrain et rentrez plus de mandats.",
  },
  {
    icon: GraduationCap,
    color: "bg-purple-50 text-purple-600",
    title: "Formation Expert Valeur Vénale",
    description:
      "Parcours certifiant 100% en ligne pour maîtriser l'expertise immobilière. Vidéos, quiz, cas pratiques et certificat officiel.",
  },
  {
    icon: Star,
    color: "bg-yellow-50 text-yellow-600",
    title: "Badge Expert certifié",
    description:
      "Référencé dans notre annuaire national. Vos clients vous trouvent avant vos concurrents. Badge visible sur votre site.",
  },
  {
    icon: Globe,
    color: "bg-green-50 text-green-600",
    title: "Intégration sur votre site",
    description:
      "Widget carte et landing page en marque blanche à intégrer sur votre site en 5 minutes. Convertit vos visiteurs en mandats.",
  },
  {
    icon: BarChart3,
    color: "bg-red-50 text-red-600",
    title: "Rapports de marché",
    description:
      "Générez des PDF de marché personnalisés par secteur pour impressionner vos clients. Données DVF + annonces actives.",
  },
  {
    icon: Zap,
    color: "bg-brand-50 text-brand-600",
    title: "Données quasi temps réel",
    description:
      "Annonces scrapées quotidiennement + DVF trimestriel + PERVAL notaires. La source la plus fraîche du marché.",
  },
  {
    icon: Shield,
    color: "bg-teal-50 text-teal-600",
    title: "Analyse foncière promoteurs",
    description:
      "Potentiel constructible, PLU, prix foncier historique. L'outil indispensable pour sourcer les meilleurs terrains.",
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
            Fonctionnalités
          </span>
          <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
            Tout ce dont un professionnel{" "}
            <span className="gradient-text">a vraiment besoin</span>
          </h2>
          <p className="text-gray-500 text-lg">
            Une seule plateforme remplace cinq abonnements. Et vous donne un
            avantage que vos concurrents n&apos;ont pas encore.
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
