# Changelog

Toutes les modifications notables apportées à l'extension **Algorithme Tunisien** sont consignées dans ce fichier.

---

## [1.3.3] - 2026-10-31

### Added
- **Vérification automatique de l'existence des expressions fermantes** (Diagnostics / Problèmes) :
  - `Début` ➔ `Fin`
  - `Si ... Alors` ➔ `Fin Si`
  - `Tant Que ... Faire` ➔ `Fin Tant Que`
  - `Répéter` ➔ `Jusqu'à`
  - `Pour ... Faire` ➔ `Fin Pour`
  - `Selon` ➔ `Fin Selon`
- **Fermeture automatique à la frappe** : insertion intelligente du mot-clé de fermeture lors de l'appui sur `Entrée` après une expression ouvrante si elle n'est pas encore fermée.
- **Actions rapides (Quick Fix / 💡)** : possibilité d'insérer en un clic l'expression fermante manquante depuis l'ampoule VS Code (`Ctrl+.`).

---

## [1.2.1] - 2026-10-30

### Fixed & Improved
- Correction de l'erreur d'analyse JavaScript (`SyntaxError: Unexpected identifier 'Segoe'`) dans le panneau d'aperçu.
- Amélioration de la réactivité et de la stabilité des boutons d'actions (`Copier pour Word`, `Exporter .doc`, `Thème`, `Imprimer / PDF`).
- Disposition adaptative (responsive avec `flex-wrap` et `white-space: nowrap`) des boutons de la barre d'outils de l'aperçu.
- Mise à jour temps réel instantanée du document lors de la frappe sans rechargement complet du webview.

---

## [1.1.0] - 2026-10-15

### Added
- **Volet d'aperçu dynamique** (`Ctrl+Shift+V` / `Cmd+Shift+V` ou icône dans la barre de titre de l'éditeur).
- Détection et génération automatique des tableaux **TDO** (Tableau des Objets) et **TDNT** (Tableau des Nouveaux Types).
- Bouton **Copier pour Word** : copie directe dans le presse-papiers avec tableaux et coloration syntaxique compatibles Microsoft Word.
- Bouton **Exporter .doc** : création et enregistrement direct d'un fichier Word `.doc`.
- Bouton **Thème** : bascule entre mode sombre et mode clair avec mémorisation.
- Bouton **Imprimer / PDF** : impression ou export PDF optimisé.
- Remplacement automatique des opérateurs (`<-` vers `←`, `<>` vers `≠`, `dans` vers `∈`).

---

## [1.0.0] - 2026-05-23

### Added
- Version initiale de la coloration syntaxique pour le langage Algorithme.
- Mots-clés officiels : `algorithme`, `début`, `fin`, `si`, `alors`, `sinon`, `fin si`, `tant que`, `faire`, `fin tant que`, `répéter`, `jusqu'à`, `pour`, `de`, `à`, `pas`, `procédure`, `fonction`, `tableau`.
- Types de données : `entier`, `réel`, `booléen`, `caractère`, `chaîne`, `matrice`.
- Opérateurs arithmétiques, de comparaison et d'affectation (`+`, `-`, `*`, `/`, `div`, `mod`, `>`, `<`, `≥`, `≤`, `=`, `≠`, `←`, `∈`).
- Fonctions prédéfinies : `lire`, `écrire`, `aléa`, `chr`, `ord`, `sous_chaine`, `effacer`, `long`, `ent`, `estnum`, `convch`, `valeur`.
- Bibliothèque complète de snippets de code.
- Formateur automatique de document (indentation intelligente).
