import Link from "next/link";
import { MapPin } from "lucide-react";

const links = {
  Produit: [
    { href: "#fonctionnalites", label: "Fonctionnalités" },
    { href: "#tarifs", label: "Tarifs" },
    { href: "/experts", label: "Annuaire experts" },
    { href: "/formation", label: "Formation certifiante" },
  ],
  Ressources: [
    { href: "/blog", label: "Blog immobilier" },
    { href: "/api-docs", label: "Documentation API" },
    { href: "/integrations", label: "Intégrations CRM" },
    { href: "/changelog", label: "Nouveautés" },
  ],
  Entreprise: [
    { href: "/a-propos", label: "À propos" },
    { href: "/contact", label: "Contact" },
    { href: "/reseaux", label: "Agences & Réseaux" },
    { href: "/presse", label: "Presse" },
  ],
  Légal: [
    { href: "/cgu", label: "CGU" },
    { href: "/confidentialite", label: "Confidentialité" },
    { href: "/mentions-legales", label: "Mentions légales" },
    { href: "/cookies", label: "Cookies" },
  ],
};

export function Footer() {
  return (
    <footer className="bg-gray-950 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-2 lg:grid-cols-5 gap-8">
          {/* Brand */}
          <div className="col-span-2 lg:col-span-1 space-y-4">
            <Link href="/" className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-brand-600 flex items-center justify-center">
                <MapPin className="w-4 h-4 text-white" />
              </div>
              <span className="font-bold text-lg">
                Immo<span className="text-brand-400">Expert</span>
              </span>
            </Link>
            <p className="text-sm text-gray-400 leading-relaxed">
              L&apos;outil n°1 des agents immobiliers français pour rentrer plus
              de mandats et estimer avec précision.
            </p>
            <p className="text-xs text-gray-600">
              Données DVF · PERVAL · INSEE
              <br />
              Mises à jour quotidiennes
            </p>
          </div>

          {/* Links */}
          {Object.entries(links).map(([category, items]) => (
            <div key={category} className="space-y-4">
              <h4 className="text-sm font-semibold text-gray-300">
                {category}
              </h4>
              <ul className="space-y-2">
                {items.map((item) => (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      className="text-sm text-gray-500 hover:text-white transition-colors"
                    >
                      {item.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-16 pt-8 border-t border-gray-800 flex flex-col sm:flex-row justify-between items-center gap-4">
          <p className="text-xs text-gray-600">
            © 2026 ImmoExpert SAS. Tous droits réservés.
          </p>
          <p className="text-xs text-gray-600">
            Fait avec ❤️ pour les agents immobiliers français
          </p>
        </div>
      </div>
    </footer>
  );
}
