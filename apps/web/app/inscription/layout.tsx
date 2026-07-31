import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Créer un compte — Cap Entreprendre France",
  description:
    "Rejoignez Cap Entreprendre France et bénéficiez d'un accompagnement en communication et design graphique personnalisé à Grasse.",
  robots: { index: false, follow: false },
};

export default function InscriptionLayout({ children }: { children: React.ReactNode }) {
  return children;
}