import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import {
  Map,
  Smartphone,
  GraduationCap,
  BarChart3,
  TrendingUp,
  Star,
  ArrowRight,
  BadgeCheck,
  Clock,
} from "lucide-react";
import Link from "next/link";

const quickActions = [
  {
    href: "/dashboard/carte",
    icon: Map,
    label: "Carte des prix",
    desc: "Voir les prix en temps réel",
    color: "bg-brand-50 text-brand-600 border-brand-100",
    iconBg: "bg-brand-100",
  },
  {
    href: "/dashboard/prospects",
    icon: Smartphone,
    label: "Prospection IA",
    desc: "Scanner une zone",
    color: "bg-orange-50 text-orange-600 border-orange-100",
    iconBg: "bg-orange-100",
  },
  {
    href: "/dashboard/formation",
    icon: GraduationCap,
    label: "Formation",
    desc: "Continuer l'apprentissage",
    color: "bg-purple-50 text-purple-600 border-purple-100",
    iconBg: "bg-purple-100",
  },
  {
    href: "/dashboard/rapports",
    icon: BarChart3,
    label: "Rapports",
    desc: "Générer un rapport de marché",
    color: "bg-green-50 text-green-600 border-green-100",
    iconBg: "bg-green-100",
  },
];

const recentActivity = [
  {
    type: "prospect",
    icon: Smartphone,
    color: "text-orange-500",
    label: "Nouveau prospect détecté",
    detail: "12 Bd des Capucines, Paris 2e — Score 89%",
    time: "Il y a 2h",
  },
  {
    type: "report",
    icon: BarChart3,
    color: "text-green-500",
    label: "Rapport généré",
    detail: "Marché Lyon 6e — Juin 2026",
    time: "Il y a 5h",
  },
  {
    type: "formation",
    icon: GraduationCap,
    color: "text-purple-500",
    label: "Module complété",
    detail: "Module 3 — Méthode par comparaison directe",
    time: "Hier",
  },
  {
    type: "map",
    icon: Map,
    color: "text-brand-500",
    label: "Zone consultée",
    detail: "Bordeaux — Chartrons · 5 420 €/m² médian",
    time: "Hier",
  },
];

export default async function DashboardPage() {
  const { userId } = await auth();
  if (!userId) redirect("/connexion");

  return (
    <div className="p-6 lg:p-8 space-y-8">
      {/* Welcome */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Bonjour 👋
          </h1>
          <p className="text-gray-500 mt-1">
            Voici votre tableau de bord ImmoExpert — dimanche 14 juin 2026
          </p>
        </div>
        <Link
          href="/dashboard/carte"
          className="hidden sm:flex items-center gap-2 bg-brand-600 hover:bg-brand-700 text-white text-sm font-semibold px-4 py-2 rounded-lg transition-colors"
        >
          Ouvrir la carte
          <ArrowRight className="w-4 h-4" />
        </Link>
      </div>

      {/* Stats cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: "Prospects IA ce mois", value: "23", trend: "+8", icon: Smartphone, color: "text-orange-500" },
          { label: "Zones consultées", value: "47", trend: "+12", icon: Map, color: "text-brand-500" },
          { label: "Rapports générés", value: "6", trend: "+2", icon: BarChart3, color: "text-green-500" },
          { label: "Progression formation", value: "38%", trend: "+15%", icon: GraduationCap, color: "text-purple-500" },
        ].map((stat) => (
          <div key={stat.label} className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-medium text-gray-400 uppercase tracking-wide">
                {stat.label}
              </span>
              <stat.icon className={`w-4 h-4 ${stat.color}`} />
            </div>
            <p className="text-3xl font-bold text-gray-900">{stat.value}</p>
            <div className="flex items-center gap-1 mt-1">
              <TrendingUp className="w-3 h-3 text-green-500" />
              <span className="text-xs text-green-600 font-medium">{stat.trend}</span>
              <span className="text-xs text-gray-400">ce mois</span>
            </div>
          </div>
        ))}
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Quick actions */}
        <div className="lg:col-span-2 space-y-4">
          <h2 className="font-semibold text-gray-900">Actions rapides</h2>
          <div className="grid sm:grid-cols-2 gap-3">
            {quickActions.map((action) => (
              <Link
                key={action.href}
                href={action.href}
                className={`flex items-center gap-4 p-4 rounded-xl border bg-white hover:shadow-md transition-all group ${action.color}`}
              >
                <div className={`w-10 h-10 rounded-xl ${action.iconBg} flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform`}>
                  <action.icon className="w-5 h-5" />
                </div>
                <div>
                  <p className="font-semibold text-gray-900 text-sm">{action.label}</p>
                  <p className="text-xs text-gray-500">{action.desc}</p>
                </div>
              </Link>
            ))}
          </div>

          {/* Certification progress */}
          <div className="bg-gradient-to-br from-brand-950 to-brand-800 rounded-2xl p-6 text-white">
            <div className="flex items-start justify-between mb-4">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <Star className="w-4 h-4 text-yellow-400" />
                  <span className="text-sm font-semibold text-white/90">
                    Certification Expert Valeur Vénale
                  </span>
                </div>
                <p className="text-white/60 text-xs">
                  3 modules complétés sur 8 · Examen dans ~4 semaines
                </p>
              </div>
              <BadgeCheck className="w-8 h-8 text-brand-300 shrink-0" />
            </div>
            <div className="w-full bg-white/10 rounded-full h-2 mb-3">
              <div className="bg-accent-400 h-2 rounded-full" style={{ width: "38%" }} />
            </div>
            <div className="flex items-center justify-between">
              <span className="text-white/50 text-xs">38% complété</span>
              <Link
                href="/dashboard/formation"
                className="text-xs font-semibold text-accent-400 hover:text-accent-300 flex items-center gap-1"
              >
                Continuer <ArrowRight className="w-3 h-3" />
              </Link>
            </div>
          </div>
        </div>

        {/* Activity feed */}
        <div className="space-y-4">
          <h2 className="font-semibold text-gray-900">Activité récente</h2>
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm divide-y divide-gray-50">
            {recentActivity.map((item, i) => (
              <div key={i} className="p-4 flex items-start gap-3">
                <div className="w-8 h-8 rounded-lg bg-gray-50 flex items-center justify-center shrink-0 mt-0.5">
                  <item.icon className={`w-4 h-4 ${item.color}`} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900">{item.label}</p>
                  <p className="text-xs text-gray-400 truncate mt-0.5">{item.detail}</p>
                  <div className="flex items-center gap-1 mt-1">
                    <Clock className="w-3 h-3 text-gray-300" />
                    <span className="text-xs text-gray-400">{item.time}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
