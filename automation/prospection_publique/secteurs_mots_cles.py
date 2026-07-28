"""Mots-clés par secteur, pour le filtrage des avis BODACC.

Contrairement à SIRENE, le BODACC ne classe pas ses avis par code NAF/APE :
seul un texte libre décrivant l'activité est disponible dans les annonces.
Ce module fournit donc une approximation par mots-clés — moins précise que le
filtrage par code NAF de `secteurs_naf.py`, mais suffisante pour repérer les
secteurs prioritaires (BTP, jardinier, restaurateur, VTC...).

Les secteurs sont testés dans l'ordre de la liste ci-dessous : le premier
secteur dont un mot-clé apparaît dans le texte est retenu (ordre du plus
spécifique au plus générique, pour éviter qu'un mot-clé générique masque un
mot-clé plus précis).
"""
from __future__ import annotations

MOTS_CLES: dict[str, tuple[str, ...]] = {
    "plombier": ("plomberie", "plombier", "chauffage sanitaire"),
    "electricien": ("électricité", "electricite", "électricien", "electricien"),
    "couvreur": ("couverture", "couvreur", "zinguerie"),
    "menuisier": ("menuiserie", "menuisier"),
    "platrier_carreleur": ("plâtrerie", "platrerie", "carrelage", "carreleur", "plâtrier", "platrier"),
    "peintre": ("peinture en bâtiment", "peinture batiment", "peintre en bâtiment", "peintre-décorateur"),
    "macon": ("maçonnerie", "maconnerie", "maçon", "macon"),
    "btp": ("bâtiment", "batiment", "travaux publics", "gros oeuvre", "gros œuvre"),
    "jardinier": ("paysagiste", "jardinage", "espaces verts", "jardinier"),
    "restaurateur": ("restaurant", "restauration", "brasserie", "traiteur"),
    "vtc": ("vtc", "transport de personnes", "chauffeur privé", "chauffeur prive"),
    "coiffeur": ("coiffure", "coiffeur", "coiffeuse"),
    "esthetique": ("esthétique", "esthetique", "institut de beauté", "institut de beaute"),
    "boulanger": ("boulangerie", "boulanger", "pâtisserie", "patisserie"),
    "boucher": ("boucherie", "boucher", "charcuterie"),
    "fleuriste": ("fleuriste", "fleurs",),
    "garagiste": ("garage automobile", "garagiste", "mécanique automobile", "mecanique automobile"),
}


def secteur_pour_texte_libre(texte: str) -> str | None:
    """Renvoie le premier secteur dont un mot-clé apparaît dans `texte`
    (recherche insensible à la casse), ou None si aucun ne correspond."""
    texte_normalise = (texte or "").lower()
    for secteur, mots in MOTS_CLES.items():
        for mot in mots:
            if mot in texte_normalise:
                return secteur
    return None
