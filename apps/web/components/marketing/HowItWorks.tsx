const steps = [
  {
    num: "01",
    title: "Définissons votre projet ensemble",
    description:
      "Échange gratuit pour comprendre vos besoins : identité visuelle, site web, stratégie de marque. Devis transparent sous 24h.",
    color: "from-brand-400 to-brand-600",
  },
  {
    num: "02",
    title: "Création de votre identité",
    description:
      "Logo, charte graphique, palette de couleurs et typographies. Une identité forte qui vous distingue de vos concurrents.",
    color: "from-purple-400 to-purple-600",
  },
  {
    num: "03",
    title: "Déploiement digital",
    description:
      "Site web moderne et optimisé SEO, supports de communication, réseaux sociaux. Votre marque visible partout, tout de suite.",
    color: "from-orange-400 to-orange-600",
  },
  {
    num: "04",
    title: "Suivi & accompagnement",
    description:
      "Conseils continus, formations en communication et ajustements. On reste à vos côtés pour faire grandir votre image.",
    color: "from-green-400 to-green-600",
  },
];

export function HowItWorks() {
  return (
    <section id="comment-ca-marche" className="py-24 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <span className="inline-block text-xs font-semibold tracking-widest text-brand-600 uppercase mb-3">
            Comment ça marche
          </span>
          <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
            De l'idée à la{" "}
            <span className="gradient-text">réalisation en 4 étapes</span>
          </h2>
          <p className="text-gray-500 text-lg">
            Un accompagnement clair et structuré, de la première rencontre au
            suivi de votre image de marque.
          </p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {steps.map((step, i) => (
            <div key={step.num} className="relative">
              {/* Connector line */}
              {i < steps.length - 1 && (
                <div className="hidden lg:block absolute top-6 left-[calc(100%_-_16px)] w-8 h-px bg-gray-200 z-10" />
              )}

              <div className="space-y-4">
                <div
                  className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${step.color} flex items-center justify-center shadow-lg`}
                >
                  <span className="text-sm font-bold text-white">
                    {step.num}
                  </span>
                </div>
                <h3 className="font-semibold text-gray-900">{step.title}</h3>
                <p className="text-sm text-gray-500 leading-relaxed">
                  {step.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}