import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Connexion — Cap Entreprendre France",
  description:
    "Accédez à votre espace client Cap Entreprendre France. Gérez vos projets de communication en ligne en toute sécurité.",
  robots: { index: false, follow: false },
};

export default function ConnexionLayout({ children }: { children: React.ReactNode }) {
  return children;
}