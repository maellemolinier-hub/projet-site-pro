import { Reveal } from "@/components/marketing/Reveal";

const steps = [
  {
    num: "01",
    title: "Choisissez votre formule",
    description:
      "Starter, Expert ou Agence Pro. Essai 14 jours sans CB, résiliation en 1 clic. Accès immédiat à toute la plateforme.",
  },
  {
    num: "02",
    title: "Explorez les prix de votre secteur",
    description:
      "Ouvrez la carte, tapez une adresse, et visualisez instantanément les prix rue par rue avec l'historique des ventes et les tendances.",
  },
  {
    num: "03",
    title: "Prospectez avec l'IA terrain",
    description:
      "L'app mobile vous indique les propriétaires les plus susceptibles de vendre dans votre zone. Fini la prospection à l'aveugle.",
  },
  {
    num: "04",
    title: "Devenez Expert certifié",
    description:
      "Suivez la formation valeur vénale, passez la certification, obtenez votre badge et soyez référencé dans notre annuaire national.",
  },
];

export function HowItWorks() {
  return (
    <section id="comment-ca-marche" className="py-24 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <Reveal className="text-center max-w-2xl mx-auto mb-16">
          <span className="inline-block text-xs font-semibold tracking-widest text-brand-600 uppercase mb-3">
            Comment ça marche
          </span>
          <h2 className="text-3xl sm:text-4xl font-bold text-ink-950 mb-4">
            Opérationnel en{" "}
            <span className="text-brand-600">moins de 10 minutes</span>
          </h2>
          <p className="text-ink-500 text-lg">
            Aucune installation, aucune configuration complexe. Vous êtes
            directement dans la carte.
          </p>
        </Reveal>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {steps.map((step, i) => (
            <Reveal key={step.num} delay={i * 80} className="relative">
              {/* Connector line */}
              {i < steps.length - 1 && (
                <div className="hidden lg:block absolute top-6 left-[calc(100%_-_16px)] w-8 h-px bg-ink-100 z-10" />
              )}

              <div className="space-y-4">
                <div className="w-12 h-12 rounded-full bg-ink-950 flex items-center justify-center">
                  <span className="text-sm font-bold text-white">
                    {step.num}
                  </span>
                </div>
                <h3 className="font-semibold text-ink-950">{step.title}</h3>
                <p className="text-sm text-ink-500 leading-relaxed">
                  {step.description}
                </p>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
