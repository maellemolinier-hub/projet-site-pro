"""CLI de capture des nouvelles entreprises (données publiques SIRENE).

Exemples :
    # Toutes les entreprises prioritaires (BTP, jardinier, restaurateur, VTC),
    # créées dans les 60 derniers jours, France entière :
    python -m automation.prospection_publique.cli capturer --jours 60 \
        --sortie data/nouvelles_entreprises.csv

    # Un seul secteur, un seul département :
    python -m automation.prospection_publique.cli capturer --secteur plombier \
        --departement 33 --jours 30 --sortie data/plombiers_33.csv

    # Enrichissement gratuit (OpenStreetMap) du CSV capturé ci-dessus :
    python -m automation.prospection_publique.cli enrichir \
        --entree data/nouvelles_entreprises.csv --sortie data/nouvelles_entreprises_enrichi.csv
"""
from __future__ import annotations

import argparse
import logging
from datetime import date, timedelta

from .export import enrichir_csv, exporter_csv
from .secteurs_naf import SECTEURS_NAF, codes_naf_pour, secteurs_prioritaires
from .sirene_client import SireneError, rechercher_nouvelles_entreprises

logging.basicConfig(level=logging.INFO, format="%(asctime)s %(levelname)s %(name)s: %(message)s")
logger = logging.getLogger(__name__)


def main() -> None:
    parser = argparse.ArgumentParser(description="Capture de nouvelles entreprises (SIRENE, données publiques)")
    sous_commandes = parser.add_subparsers(dest="commande", required=True)

    p_capturer = sous_commandes.add_parser("capturer", help="Capture les nouvelles entreprises")
    p_capturer.add_argument(
        "--secteur",
        action="append",
        choices=sorted(SECTEURS_NAF.keys()),
        help="Secteur à capter (répétable). Par défaut : tous les secteurs prioritaires.",
    )
    p_capturer.add_argument("--departement", help="Code département (ex: 33). Par défaut : France entière.")
    p_capturer.add_argument("--jours", type=int, default=60, help="Ancienneté maximale de création, en jours (défaut 60).")
    p_capturer.add_argument("--max", type=int, default=200, help="Nombre maximum d'entreprises à capter (défaut 200).")
    p_capturer.add_argument("--sortie", required=True, help="Chemin du CSV de sortie.")

    p_enrichir = sous_commandes.add_parser(
        "enrichir",
        help="Complète (gratuitement, via OpenStreetMap) le téléphone/e-mail/site web d'un CSV déjà capturé.",
    )
    p_enrichir.add_argument("--entree", required=True, help="CSV produit par la commande 'capturer'.")
    p_enrichir.add_argument("--sortie", required=True, help="Chemin du CSV enrichi de sortie.")
    p_enrichir.add_argument(
        "--delai",
        type=float,
        default=1.1,
        help="Délai en secondes entre deux entreprises (respect du rythme imposé par Nominatim, défaut 1.1).",
    )

    args = parser.parse_args()

    if args.commande == "capturer":
        secteurs = args.secteur or secteurs_prioritaires()
        codes_naf: list[str] = []
        for s in secteurs:
            codes_naf.extend(codes_naf_pour(s))
        codes_naf = sorted(set(codes_naf))

        date_min = date.today() - timedelta(days=args.jours)
        logger.info(
            "Capture des secteurs %s (codes NAF %s), créées depuis le %s...",
            secteurs, codes_naf, date_min.isoformat(),
        )

        try:
            entreprises = rechercher_nouvelles_entreprises(
                codes_naf=codes_naf,
                date_min=date_min,
                departement=args.departement,
                max_resultats=args.max,
            )
        except SireneError as exc:
            logger.error("Échec de la capture : %s", exc)
            raise SystemExit(1) from exc

        n = exporter_csv(entreprises, args.sortie)
        print(f"{n} entreprise(s) capturée(s) -> {args.sortie}")
        print("Rappel : les colonnes 'telephone' et 'email' sont vides (non publiques) — enrichissement requis avant contact.")

    elif args.commande == "enrichir":
        logger.info("Enrichissement (OpenStreetMap) de %s...", args.entree)
        total, trouvees = enrichir_csv(args.entree, args.sortie, delai_entre_appels=args.delai)
        print(f"{trouvees}/{total} entreprise(s) enrichie(s) -> {args.sortie}")
        print(
            "Rappel : OpenStreetMap est une base communautaire, la couverture est partielle. "
            "Les lignes sans correspondance gardent des colonnes 'telephone'/'email' vides."
        )


if __name__ == "__main__":
    main()
