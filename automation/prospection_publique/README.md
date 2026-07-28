# Prospection publique — capture des nouvelles entreprises (SIRENE + BODACC)

Module de capture des entreprises **récemment créées** en France, à partir de
deux sources publiques et gratuites :
- le répertoire SIRENE (`recherche-entreprises.api.gouv.fr`, `sirene_client.py`) ;
- le BODACC (`bodacc_client.py`), qui publie les avis de création jusqu'à 5 fois
  par semaine — plus fréquent que le cycle hebdomadaire de l'API SIRENE (voir
  section dédiée ci-dessous).

Objectif : repérer en amont les artisans, commerçants et autres professionnels
qui ont besoin de se faire connaître, avant de lancer une campagne SMS ou
e-mail Cap Entreprendre France.

**Sur LinkedIn** : LinkedIn interdit le scraping automatisé dans ses conditions
d'utilisation (et poursuit les entreprises qui le font) — ce module ne capte
donc rien depuis LinkedIn. Une recherche manuelle par un humain sur son propre
compte reste possible et compatible avec leurs règles, mais n'est pas
automatisée ici.

## Ce que ce module fait — et ne fait pas

**Fait** : identifie de nouvelles entreprises par secteur d'activité (code NAF/APE),
avec leur nom, SIREN/SIRET, date de création et adresse.

**Ne fait pas** : fournir un téléphone ou un e-mail directement. Le répertoire
SIRENE est un registre légal public — il ne contient **aucune coordonnée de
contact**. C'est une contrainte légale/technique du registre, pas une limite de
ce code.

➡️ La capture publique est donc la **première étape** d'un pipeline en trois temps :

1. **Capture** (`sirene_client.py` + `bodacc_client.py`) → liste d'entreprises
   ciblées, sans contact.
2. **Fusion** (`export.fusionner_csv`) → combine les deux sources en
   dédoublonnant (par SIREN, ou par nom+ville quand le SIREN est absent).
3. **Enrichissement** (`osm_enrichment.py`) → tente de compléter le
   téléphone/e-mail/site web via OpenStreetMap (gratuit, sans clé API — voir
   section dédiée ci-dessous). Ce n'est pas garanti à 100 % (couverture
   communautaire) : pour aller plus loin, d'autres options existent (à trancher
   séparément selon budget/volume) : Google Places API (payant à l'usage,
   meilleure couverture), SocieteInfo (API française B2B), Apollo.io (couverture
   probablement faible sur les tout petits artisans), ou un fichier
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

# Capture complémentaire via le BODACC (plus fréquent, sans code NAF — filtrage par mots-clés)
python -m automation.prospection_publique.cli capturer-bodacc --jours 20 \
    --sortie data/nouvelles_entreprises_bodacc.csv

# Fusion des deux captures (dédoublonnage par SIREN ou nom+ville)
python -m automation.prospection_publique.cli fusionner \
    --entree data/nouvelles_entreprises.csv --entree data/nouvelles_entreprises_bodacc.csv \
    --sortie data/nouvelles_entreprises_fusionnees.csv

# Enrichissement gratuit (OpenStreetMap) du CSV fusionné
python -m automation.prospection_publique.cli enrichir \
    --entree data/nouvelles_entreprises_fusionnees.csv --sortie data/nouvelles_entreprises_enrichi.csv
```

Colonnes du CSV : `siren, siret, nom, secteur, code_naf, date_creation,
date_parution_bodacc, adresse, code_postal, ville, telephone, email, site_web,
source_enrichissement, source_capture`.
Après capture seule, les colonnes `telephone`/`email`/`site_web` sont vides.
Après `enrichir`, elles sont complétées quand une correspondance a été trouvée
sur OpenStreetMap (`source_enrichissement` vaut alors `osm`, sinon `aucun`).
`source_capture` indique l'origine de la ligne (`sirene` ou `bodacc`).

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

## Capture complémentaire via le BODACC (`bodacc_client.py`)

Le BODACC publie les avis de création d'entreprise dès leur enregistrement au
greffe, jusqu'à 5 fois par semaine — contre un cycle de rafraîchissement
hebdomadaire pour l'API SIRENE. Ça ne supprime pas le délai administratif réel
(2 à 4 semaines entre la création et son enregistrement), mais ça évite
d'attendre en plus le prochain cycle de synchronisation hebdomadaire de SIRENE.

**Limite importante** : le BODACC ne classe pas ses avis par code NAF/APE,
seulement par texte libre. Le secteur est donc déduit par recherche de
mots-clés (`secteurs_mots_cles.py`) — une approximation moins fiable que le
code NAF de SIRENE. Utilisez `fusionner` pour combiner les deux sources sans
doublon (priorité donnée à SIRENE en cas de recoupement, plus complet : SIRET,
code NAF, adresse).

## Statut de test

Les tests unitaires (`tests/`) simulent les appels HTTP (`httpx.Client.get`/`post`
mockés) — aucun appel réseau réel n'est fait. L'accès réel à
`recherche-entreprises.api.gouv.fr`, `nominatim.openstreetmap.org`,
`overpass-api.de` et `bodacc-datadila.opendatasoft.com` n'a pas pu être testé en
conditions réelles depuis cet environnement de développement (proxy sortant
bloqué sur ces domaines). Le code a été écrit conformément à la documentation
publique de ces API (avec une extraction volontairement défensive côté BODACC,
dont le schéma exact des champs n'a pas pu être vérifié en direct) ; un test de
connexion réel est recommandé avant la première utilisation en production
(depuis un poste ou serveur ayant un accès internet normal).
