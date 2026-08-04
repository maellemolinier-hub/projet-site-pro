import Link from "next/link";
import { MapPin } from "lucide-react";

const links = {
  Services: [
    { href: "#fonctionnalites", label: "Nos services" },
    { href: "#tarifs", label: "Tarifs" },
    { href: "/contact-entreprise", label: "Contact" },
  ],
  Ressources: [
    { href: "/articles", label: "Blog" },
    { href: "/contact-entreprise", label: "Demander un devis" },
  ],
  Entreprise: [
    { href: "/contact-entreprise", label: "À propos" },
    { href: "/contact-entreprise", label: "Contact" },
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
                Cap Entreprendre France
              </span>
            </Link>
            <p className="text-sm text-gray-400 leading-relaxed">
              Agence de communication et studio graphique accompagnant les entrepreneurs à Grasse.
            </p>
            <p className="text-xs text-gray-600">
              Identité visuelle · Sites web · Stratégie de marque
              <br />
              Basé à Grasse (06130)
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
            © 2026 Cap Entreprendre France. Tous droits réservés.
          </p>
          <p className="text-xs text-gray-600">
            Studio de communication &amp; graphisme à Grasse
          </p>
        </div>
      </div>
    </footer>
  );
}