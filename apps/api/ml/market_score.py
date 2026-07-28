"""
Moteur de score de MARCHÉ agrégé par zone (RGPD-safe).

Combine, en temps réel, des indicateurs publics agrégés (jamais nominatifs) en un
score 0–100 traduisant la « pression / opportunité de mise en vente » d'un secteur,
avec le détail transparent de chaque facteur (contribution en points).

Aucune donnée individuelle : tout est calculé au niveau de la commune / du national.
"""
from __future__ import annotations

from typing import Optional


def _clamp(x: float, lo: float, hi: float) -> float:
    return max(lo, min(hi, x))


def _season_factor(month: int) -> tuple[float, str]:
    """Saisonnalité du marché immobilier français."""
    if month in (3, 4, 5, 6):
        return 8.0, "Haute saison (printemps) — pic de mises en vente"
    if month in (9, 10):
        return 5.0, "Rentrée — reprise des transactions"
    if month in (7, 8):
        return 2.0, "Été — activité modérée"
    return -4.0, "Basse saison (hiver) — marché ralenti"


def compute_market_score(features: dict) -> dict:
    """
    features (toutes optionnelles) :
      trend_12m, vacancy_rate, death_rate, divorce_rate, birth_rate,
      median_income, credit_rate, month
    Retourne : {score, level, factors:[{label, contribution, value, detail}], missing:[...]}
    """
    base = 40.0
    factors: list[dict] = []
    missing: list[str] = []

    def add(label: str, value: Optional[float], contribution: float, detail: str):
        factors.append({
            "label": label,
            "value": value,
            "contribution": round(contribution, 1),
            "detail": detail,
        })

    # Logements vacants — plus de vacance ⇒ plus de rotation / d'opportunités
    vac = features.get("vacancy_rate")
    if vac is not None:
        c = _clamp((vac - 6.0) * 2.0, -6.0, 15.0)
        add("Logements vacants", vac, c, f"{vac:.1f}% du parc")
    else:
        missing.append("vacancy_rate")

    # Taux de décès — signal de succession
    dr = features.get("death_rate")
    if dr is not None:
        c = _clamp((dr - 8.0) * 2.5, -5.0, 12.0)
        add("Taux de décès", dr, c, f"{dr:.1f} ‰ — potentiel de successions")
    else:
        missing.append("death_rate")

    # Taux de divorce — mobilité résidentielle
    dv = features.get("divorce_rate")
    if dv is not None:
        c = _clamp((dv - 1.8) * 6.0, -4.0, 10.0)
        add("Taux de divorce", dv, c, f"{dv:.1f} ‰ — séparations / reventes")
    else:
        missing.append("divorce_rate")

    # Natalité — croissance des familles ⇒ besoin de plus grand
    br = features.get("birth_rate")
    if br is not None:
        c = _clamp((br - 10.0) * 1.2, -3.0, 5.0)
        add("Natalité", br, c, f"{br:.1f} ‰ — familles en agrandissement")
    else:
        missing.append("birth_rate")

    # Tendance de prix 12 mois — bon moment pour vendre
    tr = features.get("trend_12m")
    if tr is not None:
        c = _clamp(tr * 1.2, -8.0, 12.0)
        sens = "hausse — incite à vendre" if tr >= 0 else "baisse — attentisme"
        add("Tendance des prix (12 mois)", tr, c, f"{tr:+.1f}% — {sens}")
    else:
        missing.append("trend_12m")

    # Taux de crédit — plus bas ⇒ acheteurs actifs ⇒ marché fluide
    cr = features.get("credit_rate")
    if cr is not None:
        c = _clamp((4.0 - cr) * 6.0, -12.0, 12.0)
        sens = "favorable aux acheteurs" if cr <= 4.0 else "frein à la demande"
        add("Taux de crédit (national)", cr, c, f"{cr:.2f}% — {sens}")
    else:
        missing.append("credit_rate")

    # Saison (toujours disponible)
    month = int(features.get("month") or 1)
    sc, sdetail = _season_factor(month)
    add("Saisonnalité", month, sc, sdetail)

    # Revenu médian : contexte (non scoré directionnellement)
    inc = features.get("median_income")
    if inc is not None:
        add("Revenu médian", inc, 0.0, f"{int(inc):,} €/an — contexte de solvabilité".replace(",", " "))

    score = _clamp(base + sum(f["contribution"] for f in factors), 0.0, 100.0)
    score = round(score)
    level = "Élevé" if score >= 70 else "Modéré" if score >= 50 else "Faible"

    return {
        "score": score,
        "level": level,
        "base": base,
        "factors": sorted(factors, key=lambda f: f["contribution"], reverse=True),
        "missing": missing,
    }
