# Prospection publique — capture des nouvelles entreprises (SIRENE)

Module de capture des entreprises **récemment créées** en France, à partir du
répertoire public SIRENE (API gratuite et sans authentification
`recherche-entreprises.api.gouv.fr`). Objectif : repérer en amont les artisans,
commerçants et autres professionnels qui ont besoin de se faire connaître, avant
de lancer une campagne SMS ou e-mail Cap Entreprendre France.

## Ce que ce module fait — et ne fait pas

**Fait** : identifie de nouvelles entreprises par secteur d'activité (code NAF/APE),
avec leur nom, SIREN/SIRET, date de création et adresse.

**Ne fait pas** : fournir un téléphone ou un e-mail directement. Le répertoire
SIRENE est un registre légal public — il ne contient **aucune coordonnée de
contact**. C'est une contrainte légale/technique du registre, pas une limite de
ce code.

➡️ La capture publique est donc la **première étape** d'un pipeline en deux temps :

1. **Capture** (`sirene_client.py`) → liste d'entreprises ciblées, sans contact.
2. **Enrichissement** (`osm_enrichment.py`) → tente de compléter le
   téléphone/e-mail/site web via OpenStreetMap (gratuit, sans clé API — voir
   section dédiée ci-dessous). Ce n'est pas garanti à 100 % (couverture
   communautaire) : pour aller plus loin, d'autres options existent (à trancher
   séparément selon budget/volume) : Google Places API (payant à l'usage,
   meilleure couverture), SocieteInfo (API française B2B), ou un fichier
   professionnel prêt à l'emploi acheté directement.

Le CSV produit par `capturer` **n'est pas directement importable** dans la
campagne SMS existante (`automation.sms_prospection.campaign.importer_prospects_csv`),
qui attend un prénom déjà renseigné — même après enrichissement, il manque le
prénom du contact (l'enrichissement ne donne qu'un téléphone d'entreprise/un
standard, pas un contact nommé).

## Secteurs couverts

Voir `secteurs_naf.py` pour la liste complète des codes NAF/APE par secteur.
Secteurs prioritaires actuels (BTP, jardinier/paysagiste, restaurateur, VTC...) :

```python
from automation.prospection_publique.secteurs_naf import secteurs_prioritaires
secteurs_prioritaires()
```

## Utilisation (CLI)

```bash
# Tous les secteurs prioritaires, créés dans les 60 derniers jours, France entière
python -m automation.prospection_publique.cli capturer --jours 60 \
    --sortie data/nouvelles_entreprises.csv

# Un seul secteur, un seul département
python -m automation.prospection_publique.cli capturer --secteur plombier \
    --departement 33 --jours 30 --sortie data/plombiers_33.csv

# Enrichissement gratuit (OpenStreetMap) du CSV capturé ci-dessus
python -m automation.prospection_publique.cli enrichir \
    --entree data/nouvelles_entreprises.csv --sortie data/nouvelles_entreprises_enrichi.csv
```

Colonnes du CSV : `siren, siret, nom, secteur, code_naf, date_creation, adresse,
code_postal, ville, telephone, email, site_web, source_enrichissement`.
Après `capturer` seul, les colonnes `telephone`/`email`/`site_web` sont vides.
Après `enrichir`, elles sont complétées quand une correspondance a été trouvée
sur OpenStreetMap (`source_enrichissement` vaut alors `osm`, sinon `aucun`).

## Enrichissement gratuit via OpenStreetMap (`osm_enrichment.py`)

Fonctionnement : pour chaque entreprise, l'adresse est géocodée via Nominatim
(service de recherche d'adresses d'OpenStreetMap), puis on cherche autour de ce
point un point d'intérêt dont le nom ressemble à celui de l'entreprise, et on
lit ses tags `phone`/`email`/`website` s'ils existent.

**Gratuit, sans clé API, sans compte à créer.** En contrepartie :
- Couverture partielle — OpenStreetMap est alimenté par des contributeurs
  bénévoles, une entreprise tout juste créée n'y figure pas toujours.
- Respect obligatoire d'une limite de 1 requête/seconde imposée par Nominatim
  (gérée automatiquement par la commande `enrichir`, via `--delai`, défaut 1.1s
  entre deux entreprises — donc environ 1 minute pour 50 entreprises).

Pour un volume important ou une meilleure fiabilité, voir les alternatives
payantes listées plus haut.

## Statut de test

Les tests unitaires (`tests/`) simulent les appels HTTP (`httpx.Client.get`/`post`
mockés) — aucun appel réseau réel n'est fait. L'accès réel à
`recherche-entreprises.api.gouv.fr`, `nominatim.openstreetmap.org` et
`overpass-api.de` n'a pas pu être testé en conditions réelles depuis cet
environnement de développement (proxy sortant bloqué sur ces domaines). Le code
a été écrit conformément à la documentation publique de ces API ; un test de
connexion réel est recommandé avant la première utilisation en production (depuis
un poste ou serveur ayant un accès internet normal).
