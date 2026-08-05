"use client";

import { useState } from "react";
import {
  Play, CheckCircle2, Lock, Clock, Award,
  ChevronDown, ChevronRight, BookOpen,
} from "lucide-react";

interface Lesson {
  id: string;
  title: string;
  duration: number;
  completed: boolean;
  locked: boolean;
  type: "video" | "quiz" | "doc";
}

interface Module {
  id: string;
  num: number;
  title: string;
  lessons: Lesson[];
  completed: boolean;
}

const MODULES: Module[] = [
  {
    id: "m1", num: 1,
    title: "Introduction à l'expertise en valeur vénale",
    completed: true,
    lessons: [
      { id: "l1", title: "Définition et cadre juridique", duration: 18, completed: true, locked: false, type: "video" },
      { id: "l2", title: "Les acteurs de l'expertise immobilière", duration: 12, completed: true, locked: false, type: "video" },
      { id: "l3", title: "Quiz d'introduction", duration: 5, completed: true, locked: false, type: "quiz" },
    ],
  },
  {
    id: "m2", num: 2,
    title: "Les données du marché : DVF et PERVAL",
    completed: true,
    lessons: [
      { id: "l4", title: "Comprendre la base DVF", duration: 22, completed: true, locked: false, type: "video" },
      { id: "l5", title: "La base PERVAL des notaires", duration: 15, completed: true, locked: false, type: "video" },
      { id: "l6", title: "Utiliser Cap Entreprendre France pour accéder aux données", duration: 20, completed: true, locked: false, type: "video" },
      { id: "l7", title: "Quiz données de marché", duration: 8, completed: true, locked: false, type: "quiz" },
    ],
  },
  {
    id: "m3", num: 3,
    title: "Méthode par comparaison directe",
    completed: true,
    lessons: [
      { id: "l8", title: "Principe et champ d'application", duration: 25, completed: true, locked: false, type: "video" },
      { id: "l9", title: "Sélection des termes de comparaison", duration: 30, completed: true, locked: false, type: "video" },
      { id: "l10", title: "Ajustements et pondération", duration: 28, completed: true, locked: false, type: "video" },
      { id: "l11", title: "Cas pratique : appartement Paris 15e", duration: 20, completed: true, locked: false, type: "doc" },
      { id: "l12", title: "Quiz méthode comparative", duration: 10, completed: true, locked: false, type: "quiz" },
    ],
  },
  {
    id: "m4", num: 4,
    title: "Méthode par capitalisation des revenus",
    completed: false,
    lessons: [
      { id: "l13", title: "Taux de capitalisation et rendement", duration: 24, completed: false, locked: false, type: "video" },
      { id: "l14", title: "Calcul des revenus nets et charges", duration: 18, completed: false, locked: false, type: "video" },
      { id: "l15", title: "Cas pratique : immeuble de rapport", duration: 25, completed: false, locked: false, type: "doc" },
      { id: "l16", title: "Quiz capitalisation", duration: 8, completed: false, locked: false, type: "quiz" },
    ],
  },
  {
    id: "m5", num: 5,
    title: "Méthode du coût de remplacement",
    completed: false,
    lessons: [
      { id: "l17", title: "Vétusté et valeur résiduelle", duration: 20, completed: false, locked: true, type: "video" },
      { id: "l18", title: "Application aux biens atypiques", duration: 22, completed: false, locked: true, type: "video" },
    ],
  },
  {
    id: "m6", num: 6,
    title: "Rédaction de l'avis de valeur",
    completed: false,
    lessons: [
      { id: "l19", title: "Structure et mentions obligatoires", duration: 18, completed: false, locked: true, type: "video" },
      { id: "l20", title: "Responsabilité professionnelle", duration: 14, completed: false, locked: true, type: "video" },
      { id: "l21", title: "Modèles d'avis de valeur", duration: 12, completed: false, locked: true, type: "doc" },
    ],
  },
  {
    id: "m7", num: 7,
    title: "Cas spéciaux : indivision, viager, neuf",
    completed: false,
    lessons: [
      { id: "l22", title: "Évaluation en indivision", duration: 20, completed: false, locked: true, type: "video" },
      { id: "l23", title: "Le viager : bouquet et rente", duration: 25, completed: false, locked: true, type: "video" },
      { id: "l24", title: "Immobilier neuf et VEFA", duration: 18, completed: false, locked: true, type: "video" },
    ],
  },
  {
    id: "m8", num: 8,
    title: "Examen final de certification",
    completed: false,
    lessons: [
      { id: "l25", title: "Révisions et cas pratiques", duration: 45, completed: false, locked: true, type: "doc" },
      { id: "l26", title: "Examen final (80 questions)", duration: 90, completed: false, locked: true, type: "quiz" },
    ],
  },
];

const TOTAL_LESSONS = MODULES.flatMap((m) => m.lessons).length;
const COMPLETED_LESSONS = MODULES.flatMap((m) => m.lessons).filter((l) => l.completed).length;
const PROGRESS_PCT = Math.round((COMPLETED_LESSONS / TOTAL_LESSONS) * 100);

export function FormationDashboard() {
  const [openModules, setOpenModules] = useState<string[]>(["m4"]);
  const [activeLesson, setActiveLesson] = useState<string | null>(null);

  const toggleModule = (id: string) => {
    setOpenModules((prev) =>
      prev.includes(id) ? prev.filter((m) => m !== id) : [...prev, id]
    );
  };

  const typeIcon = (type: Lesson["type"]) => {
    if (type === "quiz") return "📝";
    if (type === "doc") return "📄";
    return "🎬";
  };

  return (
    <div className="flex h-full">
      {/* Sidebar — modules list */}
      <div className="w-80 border-r border-gray-100 bg-white overflow-y-auto shrink-0">
        {/* Header */}
        <div className="p-5 border-b border-gray-100 space-y-3">
          <div className="flex items-center gap-2">
            <Award className="w-5 h-5 text-brand-600" />
            <h2 className="font-semibold text-gray-900 text-sm">Formation Expert Valeur Vénale</h2>
          </div>
          <div>
            <div className="flex justify-between text-xs text-gray-500 mb-1.5">
              <span>{COMPLETED_LESSONS}/{TOTAL_LESSONS} leçons</span>
              <span className="font-semibold text-brand-600">{PROGRESS_PCT}%</span>
            </div>
            <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
              <div
                className="h-full bg-brand-600 rounded-full transition-all"
                style={{ width: `${PROGRESS_PCT}%` }}
              />
            </div>
          </div>
          {PROGRESS_PCT >= 80 && (
            <button className="w-full bg-yellow-400 hover:bg-yellow-500 text-yellow-900 text-xs font-bold py-2 rounded-lg transition-colors">
              🏆 Passer l'examen final
            </button>
          )}
        </div>

        {/* Module list */}
        <div className="divide-y divide-gray-50">
          {MODULES.map((mod) => (
            <div key={mod.id}>
              <button
                onClick={() => toggleModule(mod.id)}
                className="w-full flex items-center gap-3 p-4 hover:bg-gray-50 transition-colors text-left"
              >
                <div className={`w-7 h-7 rounded-lg flex items-center justify-center text-xs font-bold shrink-0 ${
                  mod.completed
                    ? "bg-green-100 text-green-600"
                    : "bg-gray-100 text-gray-500"
                }`}>
                  {mod.completed ? <CheckCircle2 className="w-4 h-4" /> : mod.num}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate">{mod.title}</p>
                  <p className="text-xs text-gray-400">{mod.lessons.length} leçons</p>
                </div>
                {openModules.includes(mod.id)
                  ? <ChevronDown className="w-4 h-4 text-gray-400 shrink-0" />
                  : <ChevronRight className="w-4 h-4 text-gray-400 shrink-0" />
                }
              </button>

              {openModules.includes(mod.id) && (
                <div className="bg-gray-50 divide-y divide-gray-100">
                  {mod.lessons.map((lesson) => (
                    <button
                      key={lesson.id}
                      onClick={() => !lesson.locked && setActiveLesson(lesson.id)}
                      className={`w-full flex items-center gap-3 px-4 py-3 text-left transition-colors ${
                        lesson.locked
                          ? "opacity-40 cursor-not-allowed"
                          : activeLesson === lesson.id
                            ? "bg-brand-50"
                            : "hover:bg-white"
                      }`}
                    >
                      <span className="text-base shrink-0">{typeIcon(lesson.type)}</span>
                      <div className="flex-1 min-w-0">
                        <p className={`text-xs font-medium truncate ${
                          activeLesson === lesson.id ? "text-brand-700" : "text-gray-700"
                        }`}>
                          {lesson.title}
                        </p>
                        <div className="flex items-center gap-1 mt-0.5">
                          <Clock className="w-3 h-3 text-gray-300" />
                          <span className="text-xs text-gray-400">{lesson.duration} min</span>
                        </div>
                      </div>
                      {lesson.locked
                        ? <Lock className="w-3.5 h-3.5 text-gray-300 shrink-0" />
                        : lesson.completed
                          ? <CheckCircle2 className="w-3.5 h-3.5 text-green-500 shrink-0" />
                          : activeLesson === lesson.id
                            ? <Play className="w-3.5 h-3.5 text-brand-500 shrink-0" />
                            : null
                      }
                    </button>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Main content */}
      <div className="flex-1 overflow-y-auto">
        {activeLesson ? (
          <LessonPlayer lessonId={activeLesson} />
        ) : (
          <FormationHome progress={PROGRESS_PCT} completedLessons={COMPLETED_LESSONS} />
        )}
      </div>
    </div>
  );
}

function FormationHome({ progress, completedLessons }: { progress: number; completedLessons: number }) {
  return (
    <div className="p-8 space-y-8 max-w-2xl">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 mb-1">
          Formation Expert en Valeur Vénale
        </h1>
        <p className="text-gray-500">
          Maîtrisez les méthodes d'évaluation immobilière reconnues et obtenez votre certification.
        </p>
      </div>

      {/* Next lesson CTA */}
      <div className="bg-brand-950 text-white rounded-2xl p-6">
        <p className="text-white/60 text-sm mb-1">Reprendre là où vous en étiez</p>
        <h3 className="font-semibold text-lg mb-4">
          Module 4 · Taux de capitalisation et rendement
        </h3>
        <button className="flex items-center gap-2 bg-accent-500 hover:bg-accent-600 text-white font-semibold px-5 py-2.5 rounded-xl transition-colors text-sm">
          <Play className="w-4 h-4" />
          Reprendre la leçon
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: "Progression", value: `${progress}%` },
          { label: "Leçons complétées", value: `${completedLessons}` },
          { label: "Heures de formation", value: "6h20" },
        ].map((s) => (
          <div key={s.label} className="bg-white rounded-xl p-4 border border-gray-100 shadow-sm text-center">
            <p className="text-2xl font-bold text-gray-900">{s.value}</p>
            <p className="text-xs text-gray-400 mt-0.5">{s.label}</p>
          </div>
        ))}
      </div>

      {/* What you'll get */}
      <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm space-y-4">
        <h3 className="font-semibold text-gray-900 flex items-center gap-2">
          <BookOpen className="w-5 h-5 text-brand-600" />
          Ce que vous maîtriserez
        </h3>
        <ul className="space-y-2.5">
          {[
            "Méthode par comparaison directe (appartements, maisons)",
            "Méthode par capitalisation des revenus (locatif, commercial)",
            "Méthode du coût de remplacement (biens atypiques)",
            "Rédaction d'avis de valeur conformes et opposables",
            "Cas spéciaux : viager, indivision, VEFA",
            "Utilisation des données DVF et PERVAL en temps réel",
          ].map((item) => (
            <li key={item} className="flex items-start gap-2.5 text-sm text-gray-600">
              <CheckCircle2 className="w-4 h-4 text-green-500 mt-0.5 shrink-0" />
              {item}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

function LessonPlayer({ lessonId }: { lessonId: string }) {
  return (
    <div className="p-8 space-y-6 max-w-3xl">
      <div>
        <p className="text-sm text-brand-600 font-medium mb-1">Module 4 · Méthode par capitalisation</p>
        <h2 className="text-xl font-bold text-gray-900">
          Taux de capitalisation et rendement
        </h2>
      </div>

      {/* Video placeholder */}
      <div className="aspect-video bg-gray-900 rounded-2xl flex items-center justify-center relative overflow-hidden shadow-xl">
        <div className="absolute inset-0 bg-gradient-to-br from-brand-900/50 to-brand-950" />
        <button className="relative z-10 w-16 h-16 bg-white/20 hover:bg-white/30 rounded-full flex items-center justify-center transition-all hover:scale-110">
          <Play className="w-8 h-8 text-white ml-1" />
        </button>
        <div className="absolute bottom-4 left-4 right-4 text-white/70 text-xs">
          Durée : 24 minutes · HD
        </div>
      </div>

      {/* Description */}
      <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm space-y-3">
        <h3 className="font-semibold text-gray-900">Dans cette leçon</h3>
        <p className="text-gray-500 text-sm leading-relaxed">
          Apprenez à calculer le taux de capitalisation d'un bien immobilier à usage locatif.
          Vous maîtriserez les notions de rendement brut, rendement net et rendement net-net,
          et vous saurez comment les appliquer dans votre avis de valeur.
        </p>
        <ul className="space-y-1.5 text-sm text-gray-500">
          {[
            "Définition du taux de capitalisation",
            "Différence rendement brut / net / net-net",
            "Sources des taux de marché (indices notaires, IEIF)",
            "Application pratique sur un immeuble de 6 appartements",
          ].map((p) => (
            <li key={p} className="flex items-start gap-2">
              <span className="text-brand-400 mt-0.5">→</span>
              {p}
            </li>
          ))}
        </ul>
      </div>

      {/* Navigation */}
      <div className="flex justify-between">
        <button className="text-sm text-gray-500 hover:text-gray-700 font-medium flex items-center gap-1">
          ← Leçon précédente
        </button>
        <button className="flex items-center gap-2 bg-brand-600 hover:bg-brand-700 text-white text-sm font-semibold px-5 py-2.5 rounded-xl transition-colors">
          Marquer comme complété →
        </button>
      </div>
    </div>
  );
}
