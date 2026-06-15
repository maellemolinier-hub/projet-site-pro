const steps = [
  {
    num: "01",
    title: "Choisissez votre formule",
    description:
      "Starter, Expert ou Agence Pro. Essai 14 jours sans CB, résiliation en 1 clic. Accès immédiat à toute la plateforme.",
    color: "from-brand-400 to-brand-600",
  },
  {
    num: "02",
    title: "Explorez les prix de votre secteur",
    description:
      "Ouvrez la carte, tapez une adresse, et visualisez instantanément les prix rue par rue avec l'historique des ventes et les tendances.",
    color: "from-purple-400 to-purple-600",
  },
  {
    num: "03",
    title: "Prospectez avec l'IA terrain",
    description:
      "L'app mobile vous indique les propriétaires les plus susceptibles de vendre dans votre zone. Fini la prospection à l'aveugle.",
    color: "from-orange-400 to-orange-600",
  },
  {
    num: "04",
    title: "Devenez Expert certifié",
    description:
      "Suivez la formation valeur vénale, passez la certification, obtenez votre badge et soyez référencé dans notre annuaire national.",
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
            Opérationnel en{" "}
            <span className="gradient-text">moins de 10 minutes</span>
          </h2>
          <p className="text-gray-500 text-lg">
            Aucune installation, aucune configuration complexe. Vous êtes
            directement dans la carte.
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
