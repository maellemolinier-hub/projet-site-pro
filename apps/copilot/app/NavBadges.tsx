"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { api } from "@/lib/api";

const LIENS = [
  { href: "/", label: "Activité", cat: null },
  { href: "/chat", label: "Chat IA", cat: null },
  { href: "/prospects", label: "Prospects", cat: "reponse_prospect" },
  { href: "/campagne", label: "Campagne", cat: null },
  { href: "/parametres", label: "Paramètres", cat: null },
] as const;

export default function NavBadges() {
  const [compteurs, setCompteurs] = useState<Record<string, number>>({});

  useEffect(() => {
    let annule = false;
    const charger = () => {
      api
        .activite()
        .then((r) => !annule && setCompteurs(r.compteurs_non_lus))
        .catch(() => {});
    };
    charger();
    const id = setInterval(charger, 10000);
    return () => {
      annule = true;
      clearInterval(id);
    };
  }, []);

  const total = Object.values(compteurs).reduce((a, b) => a + b, 0);

  return (
    <>
      {LIENS.map((lien) => {
        const n = lien.href === "/" ? total : lien.cat ? compteurs[lien.cat] || 0 : 0;
        return (
          <Link key={lien.href} href={lien.href}>
            <span>{lien.label}</span>
            {n > 0 && <span className="badge">{n}</span>}
          </Link>
        );
      })}
    </>
  );
}
