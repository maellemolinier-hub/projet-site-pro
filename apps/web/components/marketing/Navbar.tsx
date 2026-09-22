"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Menu, X, MapPin } from "lucide-react";

const navLinks = [
  { href: "#fonctionnalites", label: "Fonctionnalités" },
  { href: "#comment-ca-marche", label: "Comment ça marche" },
  { href: "#experts", label: "Experts certifiés" },
  { href: "#tarifs", label: "Tarifs" },
];

export function Navbar() {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ease-premium ${
        scrolled
          ? "bg-cream-50/90 backdrop-blur-md shadow-sm border-b border-ink-100"
          : "bg-transparent"
      }`}
    >
      <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 group">
            <div className="w-8 h-8 rounded-lg bg-ink-950 flex items-center justify-center group-hover:bg-ink-800 transition-colors">
              <MapPin className="w-4 h-4 text-white" />
            </div>
            <span className="font-bold text-ink-950 text-lg tracking-tight">
              Immo<span className="text-brand-600">Expert</span>
            </span>
          </Link>

          {/* Desktop nav */}
          <div className="hidden md:flex items-center gap-8">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="text-sm font-medium text-ink-600 hover:text-ink-950 transition-colors"
              >
                {link.label}
              </Link>
            ))}
          </div>

          {/* CTA */}
          <div className="hidden md:flex items-center gap-3">
            <Link
              href="/connexion"
              className="text-sm font-medium text-ink-600 hover:text-ink-950 transition-colors"
            >
              Connexion
            </Link>
            <Link
              href="/inscription"
              className="inline-flex items-center gap-2 bg-brand-600 hover:bg-brand-700 text-white text-sm font-semibold px-4 py-2 rounded-full transition-colors shadow-sm"
            >
              Essai gratuit 14 jours
            </Link>
          </div>

          {/* Mobile toggle */}
          <button
            className="md:hidden p-2 rounded-lg text-ink-600 hover:bg-ink-50"
            onClick={() => setOpen(!open)}
            aria-label="Menu"
          >
            {open ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>

        {/* Mobile menu */}
        {open && (
          <div className="md:hidden pb-4 border-t border-ink-100 mt-2 pt-4 space-y-2">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setOpen(false)}
                className="block px-3 py-2 text-sm font-medium text-ink-600 hover:text-brand-600 hover:bg-ink-50 rounded-lg transition-colors"
              >
                {link.label}
              </Link>
            ))}
            <div className="pt-2 flex flex-col gap-2">
              <Link
                href="/connexion"
                className="text-center py-2 text-sm font-medium text-ink-600 border border-ink-200 rounded-full hover:bg-ink-50"
              >
                Connexion
              </Link>
              <Link
                href="/inscription"
                className="text-center py-2 text-sm font-semibold text-white bg-brand-600 rounded-full hover:bg-brand-700"
              >
                Essai gratuit 14 jours
              </Link>
            </div>
          </div>
        )}
      </nav>
    </header>
  );
}
