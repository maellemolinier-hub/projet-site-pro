# Prospection publique — capture des nouvelles entreprises (SIRENE)

Module de capture des entreprises **récemment créées** en France, à partir du
répertoire public SIRENE (API gratuite et sans authentification
`recherche-entreprises.api.gouv.fr`). Objectif : repérer en amont les artisans,
commerçants et autres professionnels qui ont besoin de se faire connaître, avant
de lancer une campagne SMS ou e-mail Cap Entreprendre France.

## Ce que ce module fait — et ne fait pas

**Fait** : identifie de nouvelles entreprises par secteur d'activité (code NAF/APE),
avec leur nom, SIREN/SIRET, date de création et adresse.

**Ne fait pas** : fournir un téléphone ou un e-mail. Le répertoire SIRENE est un
registre légal public — il ne contient **aucune coordonnée de contact**. C'est une
contrainte légale/technique du registre, pas une limite de ce code.

➡️ La capture publique est donc la **première étape** d'un pipeline en deux temps :

1. **Capture** (ce module) → liste d'entreprises ciblées, sans contact.
2. **Enrichissement** (à décider) → trouver le téléphone/e-mail de chaque entreprise
   avant de pouvoir la contacter. Options possibles, à trancher séparément :
   - un service d'enrichissement payant (type DropContact, Kaspr...) ;
   - une recherche manuelle (Google Maps / Pages Jaunes / site web) ;
   - Apollo.io (couverture probablement faible sur les très petits artisans locaux).

Le CSV produit par ce module **n'est pas directement importable** dans la campagne
SMS existante (`automation.sms_prospection.campaign.importer_prospects_csv`), qui
attend un prénom + téléphone déjà renseignés.

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
```

Colonnes du CSV : `siren, siret, nom, secteur, code_naf, date_creation, adresse,
code_postal, ville, telephone, email` (les deux dernières colonnes sont toujours
vides — à compléter lors de l'enrichissement).

## Statut de test

Les tests unitaires (`tests/`) simulent les appels HTTP (`httpx.Client.get` mocké) —
aucun appel réseau réel n'est fait. L'accès réel à
`recherche-entreprises.api.gouv.fr` n'a pas pu être testé en conditions réelles
depuis cet environnement de développement (proxy sortant bloqué sur ce domaine).
Le code a été écrit conformément à la documentation publique de l'API ; un test de
connexion réel est recommandé avant la première utilisation en production (depuis
un poste ou serveur ayant un accès internet normal).
