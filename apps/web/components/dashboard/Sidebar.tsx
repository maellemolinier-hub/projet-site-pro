"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";
import {
  Map, Smartphone, GraduationCap, BarChart3,
  Settings, MapPin, BadgeCheck, LogOut, User, Sparkles,
} from "lucide-react";
import { cn } from "@/lib/utils";

const navItems = [
  { href: "/dashboard", icon: Map, label: "Tableau de bord", exact: true },
  { href: "/dashboard/carte", icon: Map, label: "Carte des prix" },
  { href: "/dashboard/prospects", icon: Smartphone, label: "Prospection IA" },
  { href: "/dashboard/assistant", icon: Sparkles, label: "Assistant IA" },
  { href: "/dashboard/formation", icon: GraduationCap, label: "Formation" },
  { href: "/dashboard/rapports", icon: BarChart3, label: "Rapports" },
  { href: "/dashboard/expert", icon: BadgeCheck, label: "Mon profil Expert" },
  { href: "/dashboard/parametres", icon: Settings, label: "Paramètres" },
];

interface Props {
  user: { name?: string | null; email?: string | null; image?: string | null };
}

export function DashboardSidebar({ user }: Props) {
  const pathname = usePathname();

  return (
    <aside className="w-64 bg-white border-r border-gray-100 flex flex-col shrink-0">
      {/* Logo */}
      <div className="p-6 border-b border-gray-100">
        <Link href="/" className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-brand-600 flex items-center justify-center">
            <MapPin className="w-3.5 h-3.5 text-white" />
          </div>
          <span className="font-bold text-gray-900">
            Immo<span className="text-brand-600">Expert</span>
          </span>
        </Link>
      </div>

      {/* User info */}
      <div className="px-4 py-3 border-b border-gray-50 flex items-center gap-3">
        <div className="w-8 h-8 rounded-lg bg-brand-100 text-brand-700 flex items-center justify-center text-xs font-bold shrink-0">
          {user.name?.split(" ").map((n) => n[0]).join("").slice(0, 2) ?? <User className="w-4 h-4" />}
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-xs font-semibold text-gray-900 truncate">{user.name ?? "Mon compte"}</p>
          <p className="text-xs text-gray-400 truncate">{user.email}</p>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 p-4 space-y-1">
        {navItems.map(({ href, icon: Icon, label, exact }) => {
          const active = exact ? pathname === href : (pathname.startsWith(href) && href !== "/dashboard");
          const isHome = href === "/dashboard" && pathname === "/dashboard";
          const isActive = isHome || (!exact && pathname.startsWith(href) && href !== "/dashboard");

          return (
            <Link
              key={href}
              href={href}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all",
                isActive || isHome
                  ? "bg-brand-50 text-brand-700"
                  : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
              )}
            >
              <Icon className={cn("w-4 h-4", isActive || isHome ? "text-brand-600" : "text-gray-400")} />
              {label}
            </Link>
          );
        })}
      </nav>

      {/* Sign out */}
      <div className="p-4 border-t border-gray-100">
        <button
          onClick={() => signOut({ callbackUrl: "/" })}
          className="flex items-center gap-3 px-3 py-2.5 w-full rounded-xl text-sm font-medium text-gray-500 hover:text-gray-900 hover:bg-gray-50 transition-all"
        >
          <LogOut className="w-4 h-4 text-gray-400" />
          Déconnexion
        </button>
      </div>
    </aside>
  );
}
