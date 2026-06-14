// ─── Subscription ────────────────────────────────────────────────────────────

export type Plan = "STARTER" | "EXPERT" | "AGENCE_PRO" | "ENTERPRISE";
export type SubscriptionStatus =
  | "TRIALING"
  | "ACTIVE"
  | "PAST_DUE"
  | "CANCELED"
  | "UNPAID";

// ─── Real estate data ────────────────────────────────────────────────────────

export type PropertyType =
  | "APARTMENT"
  | "HOUSE"
  | "LAND"
  | "COMMERCIAL"
  | "PARKING";

export interface PricePoint {
  lat: number;
  lng: number;
  priceSqm: number;
  type: PropertyType;
  soldAt?: string;
  source: string;
}

export interface ZoneStats {
  zone: string;
  avgPriceSqm: number;
  medianPriceSqm: number;
  minPriceSqm: number;
  maxPriceSqm: number;
  count: number;
  trend12m?: number;
}

// ─── Prospects ───────────────────────────────────────────────────────────────

export type ProspectStatus =
  | "NEW"
  | "CONTACTED"
  | "IN_PROGRESS"
  | "CONVERTED"
  | "LOST";

export interface Prospect {
  id: string;
  address: string;
  city: string;
  postalCode: string;
  lat: number;
  lng: number;
  saleScore: number;
  scoreLabel: string;
  reasons: string[];
  status: ProspectStatus;
  yearsOwned?: number;
  lastMutation?: string;
}

// ─── Expert directory ────────────────────────────────────────────────────────

export interface ExpertProfile {
  id: string;
  slug: string;
  name: string;
  city: string;
  postalCode: string;
  bio?: string;
  specialties: string[];
  avgRating: number;
  totalReviews: number;
  certifiedSince?: string;
  websiteUrl?: string;
}

// ─── Formation ───────────────────────────────────────────────────────────────

export interface Course {
  id: string;
  title: string;
  description: string;
  modulesCount: number;
  durationHours: number;
  isCertified: boolean;
}

export interface LessonProgress {
  lessonId: string;
  completed: boolean;
  watchedSeconds: number;
}

export interface CertificationStatus {
  status: "IN_PROGRESS" | "EXAM_READY" | "CERTIFIED" | "EXPIRED";
  progressPct: number;
  modulesCompleted: number;
  modulesTotal: number;
  examUnlocked: boolean;
  score?: number;
  completedAt?: string;
}
