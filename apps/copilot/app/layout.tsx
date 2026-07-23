import type { Metadata } from "next";
import "./globals.css";
import NavBadges from "./NavBadges";

export const metadata: Metadata = {
  title: "Centre de pilotage — Prospection SMS",
  description: "Discutez avec vos assistants IA, suivez leur activité et intervenez si besoin.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr">
      <body>
        <div className="shell">
          <nav className="nav">
            <h1>Centre de pilotage</h1>
            <NavBadges />
          </nav>
          <main className="main">{children}</main>
        </div>
      </body>
    </html>
  );
}
