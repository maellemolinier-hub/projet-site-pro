import { JsonLd } from "@/components/seo/JsonLd";

const faqs = [
  {
    question: "Capia peut-elle vraiment répondre à mes questions maintenant ?",
    answer:
      "Oui. Capia, en bas à droite de votre écran, répond en temps réel sur nos services, nos tarifs et votre projet. C'est un exemple concret des assistants IA qu'on crée pour nos clients.",
  },
  {
    question: "Combien de temps pour avoir mon site en ligne ?",
    answer:
      "En général 3 à 6 semaines selon la formule choisie, grâce à des workflows assistés par IA qui accélèrent la conception sans sacrifier la qualité ni le SEO.",
  },
  {
    question: "Puis-je avoir un assistant IA comme Capia sur mon propre site ?",
    answer:
      "Oui, c'est l'un de nos services. On crée un assistant à votre image — nom, ton, connaissances propres à votre activité — inclus dès le pack Business.",
  },
  {
    question: "Travaillez-vous uniquement avec des entreprises à Grasse ?",
    answer:
      "Non. On est basés à Grasse mais on accompagne des entrepreneurs partout en France, à distance comme en présentiel selon les besoins.",
  },
  {
    question: "Le devis est-il vraiment gratuit et sans engagement ?",
    answer:
      "Oui, systématiquement. On échange sur votre projet, on vous propose une formule adaptée, et vous décidez ensuite librement.",
  },
];

const faqSchema = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: faqs.map((f) => ({
    "@type": "Question",
    name: f.question,
    acceptedAnswer: { "@type": "Answer", text: f.answer },
  })),
};

export function FAQ() {
  return (
    <section className="py-24 bg-white">
      <JsonLd id="faq" data={faqSchema} />
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <span className="inline-block text-xs font-semibold tracking-widest text-brand-600 uppercase mb-3">
            Questions fréquentes
          </span>
          <h2 className="text-3xl sm:text-4xl font-bold text-gray-900">
            Ce qu'on nous demande le plus souvent
          </h2>
        </div>

        <div className="space-y-3">
          {faqs.map((faq) => (
            <details
              key={faq.question}
              className="group bg-gray-50 border border-gray-100 rounded-2xl p-5 open:bg-white open:border-brand-200 open:shadow-sm transition-colors"
            >
              <summary className="flex items-center justify-between cursor-pointer font-semibold text-gray-900 text-sm list-none">
                {faq.question}
                <span className="text-brand-600 group-open:rotate-45 transition-transform text-xl leading-none shrink-0 ml-4">
                  +
                </span>
              </summary>
              <p className="text-sm text-gray-500 leading-relaxed mt-3">{faq.answer}</p>
            </details>
          ))}
        </div>
      </div>
    </section>
  );
}
