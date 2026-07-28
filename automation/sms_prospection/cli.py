"""Interface en ligne de commande.

Exemples :
    python -m automation.sms_prospection.cli import-csv data/prospects_exemple.csv
    python -m automation.sms_prospection.cli send --limite 50 --dry-run
    python -m automation.sms_prospection.cli serve
"""
from __future__ import annotations

import argparse
import logging

from .campaign import envoyer_campagne, envoyer_email_campagne, importer_prospects_csv

logging.basicConfig(level=logging.INFO, format="%(asctime)s %(levelname)s %(name)s: %(message)s")


def main() -> None:
    parser = argparse.ArgumentParser(description="Assistant de prospection SMS — Pack Digitalisation")
    sous_commandes = parser.add_subparsers(dest="commande", required=True)

    p_import = sous_commandes.add_parser("import-csv", help="Importe des prospects depuis un CSV")
    p_import.add_argument("chemin", help="Chemin du fichier CSV")

    p_send = sous_commandes.add_parser("send", help="Envoie la campagne SMS")
    p_send.add_argument("--limite", type=int, default=None)
    p_send.add_argument("--dry-run", action="store_true")

    p_send_email = sous_commandes.add_parser("send-email", help="Envoie la campagne e-mail")
    p_send_email.add_argument("--limite", type=int, default=None)
    p_send_email.add_argument("--dry-run", action="store_true")

    sous_commandes.add_parser("serve", help="Démarre le serveur webhook/réservation")

    args = parser.parse_args()

    if args.commande == "import-csv":
        n = importer_prospects_csv(args.chemin)
        print(f"{n} prospect(s) importé(s).")
    elif args.commande == "send":
        rapport = envoyer_campagne(limite=args.limite, dry_run=args.dry_run or None)
        print(
            f"Total: {rapport.total} | Envoyés: {rapport.envoyes} | "
            f"Bloqués (liste noire): {rapport.bloques_blacklist} | Échecs: {rapport.echecs}"
        )
    elif args.commande == "send-email":
        rapport = envoyer_email_campagne(limite=args.limite, dry_run=args.dry_run or None)
        print(
            f"Total: {rapport.total} | Envoyés: {rapport.envoyes} | "
            f"Bloqués (liste noire): {rapport.bloques_blacklist} | "
            f"Sans e-mail: {rapport.ignores_sans_email} | Échecs: {rapport.echecs}"
        )
    elif args.commande == "serve":
        import uvicorn

        uvicorn.run("automation.sms_prospection.webhook_server:app", host="0.0.0.0", port=8010)


if __name__ == "__main__":
    main()
