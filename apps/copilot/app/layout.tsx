import type { Metadata } from "next";
import "./globals.css";
import NavBadges from "./NavBadges";

export const metadata: Metadata = {
  title: "Cap Entreprendre France — Centre de pilotage",
  description: "Discutez avec vos assistants IA, suivez leur activité et intervenez si besoin.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr">
      <body>
        <div className="shell">
          <nav className="nav">
            <h1>Cap Entreprendre France</h1>
            <p className="muted" style={{ padding: "0 8px 16px", marginTop: -12 }}>
              Centre de pilotage
            </p>
            <NavBadges />
          </nav>
          <main className="main">{children}</main>
        </div>
      </body>
    </html>
  );
}
