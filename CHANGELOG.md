# Changelog

Toutes les modifications notables apportées à l'extension **Algorithme Tunisien** sont consignées dans ce fichier.

---

## [1.8.0] - 2026-11-05

### Added
- **Transpilation automatique vers Python 3 (`algo.exe --to-python`)** :
  - Nouvelle commande `algorithme.toPython` (*« Algorithme : Transpiler en Python »*).
  - Bouton d'action rapide `$(file-code)` dans la barre de titre de l'éditeur (`editor/title`) aux côtés de l'exécution et de l'aperçu.
  - Raccourci clavier dédié **`Shift+F5`** pour transpiler en un instant le fichier algorithme actif.
  - Intégration dans le menu contextuel de l'éditeur et de l'explorateur de fichiers sur les fichiers `.alg`, `.algo` et `.algorithme`.
  - Génération automatique du fichier Python correspondant (`nom_fichier.py`) dans le répertoire de travail.
  - Ouverture côte à côte (`ViewColumn.Beside`) du code Python généré avec coloration syntaxique complète.
  - Notification de confirmation avec bouton d'action direct **« Exécuter en Python »** pour lancer immédiatement le script dans un terminal dédié.

---

## [1.7.0] - 2026-11-04

### Added
- **Support des commentaires multi-lignes (`/* ... */`)** :
  - Coloration syntaxique complète dans le fichier TextMate grammar pour les blocs de commentaires sur plusieurs lignes.
  - Respect de l'indentation et de l'état des commentaires multi-lignes dans le formateur de document (`Shift+Alt+F`).
  - Prise en charge du style dans le volet d'aperçu dynamique (`Ctrl+Shift+V`) et lors de l'export Word (`.doc`).
  - Snippet d'insertion rapide : `comment` / `commentaire`.

- **Support de `Ecrire(message, sep=" ", fin="\n")`** :
  - Coloration dédiée des paramètres nommés `sep` (séparateur entre valeurs) et `fin` (caractère de terminaison).
  - Prise en charge des valeurs par défaut : espace `" "` pour `sep` et retour à la ligne `"\n"` pour `fin`.
  - Nouveaux snippets : `ecrire_sep_fin`, `ecrire_sep`, `ecrire_fin`.
  - Exécution conforme et vérifiée avec l'interpréteur `algo.exe`.

- **Autocomplétion intelligente des sous-programmes (Fonctions & Procédures)** :
  - Lors de la saisie d'un sous-programme, l'éditeur propose automatiquement ses paramètres par défaut sous forme de tabstops éditables (`Tab` pour naviguer).
  - Prise en charge de toutes les fonctions et procédures prédéfinies (`Ecrire`, `Lire`, `Ouvrir`, `Fermer`, `Sous_chaine`, `Pos`, `Convch`, `Valeur`, `Alea`, etc.).
  - Analyse dynamique en temps réel du document courant : détection de toutes les fonctions et procédures personnalisées définies par l'utilisateur avec extraction intelligente de leurs paramètres typés ou par référence (`@`).
  - Info-bulles d'aide aux signatures (*Signature Help*) : affichage en direct de la documentation et du paramètre actif dès la frappe de `(` ou d'une virgule `,`.

---

## [1.6.1] - 2026-11-03

### Added
- **Support complet de la syntaxe des Matrices (tableaux 2D)** :
  - Déclaration dans le TDNT et TDO : `Tableau de N lignes * M colonnes <type>`, `Tableau [0..N, 0..M] de <type>`, `Matrice de N * M colonnes <type>`.
  - Indexation et affectation bidimensionnelle : notation à virgule `M[i, j]` et notation chaînée `M[i][j]`.
  - Coloration syntaxique des mots-clés dimensionnels : `lignes`, `colonnes`, `ligne`, `colonne`, `matrice`.
  - Nouveaux snippets : `matrice_tdnt`, `matrice_tdo`, `parcours_matrice`.
  - Exemple exécutable complet ajouté dans `exemples/matrice.alg`.

- **Support complet de la syntaxe des Enregistrements** :
  - Définition de structures d'enregistrements multi-champs dans le TDNT : `Type = Enregistrement ... Fin`.
  - Déclaration directe dans le TDO : `variable : Enregistrement ... Fin` ou déclaration typée `t : Tableau de N Type`.
  - Prise en charge de l'accès aux champs par point (`p.nom`, `t[i].age`), de la copie globale (`p2 ← p1`), de la lecture (`Lire(p.nom)`) et de l'écriture.
  - Indentation automatique à la saisie de `Enregistrement` et désindentation sur `Fin` / `Fin Enregistrement`.
  - Fermeture automatique du bloc `Enregistrement` lors de l'appui sur `Entrée`.
  - Détection des blocs d'enregistrements non fermés (diagnostics) et Quick Fix (`Insérer 'Fin'`).
  - Rendu visuel propre et fidèle dans l'aperçu et dans l'export Microsoft Word (`.doc`) : préservation des sauts de ligne et de l'indentation des champs au sein des tableaux TDNT et TDO.
  - Nouveaux snippets : `enreg_tdnt`, `enreg_tdo`, `tab_enreg`.
  - Exemple exécutable complet ajouté dans `exemples/enregistrement.alg`.

- **Support complet de la syntaxe des Fichiers** :
  - Déclaration des fichiers texte (`Fichier Texte`) et des fichiers typés (`Fichier de entier`, `Fichier de Eleve`, etc.).
  - Coloration et reconnaissance des procédures et fonctions standard : `Ouvrir`, `Fermer`, `Ecrire`, `Ecrire_nl` / `Écrire_nl`, `Lire`, `Lire_ligne`, `Fin_fichier` / `FinFichier`.
  - Prise en charge de tous les modes d'accès (`"r"`, `"w"`, `"a"`, `"rb"`, `"wb"`, `"ab"`).
  - Nouveaux snippets : `fich_lire_texte`, `fich_ecrire_texte`, `fich_lire_data`, `fich_ecrire_data`.
  - Exemple exécutable complet ajouté dans `exemples/fichier.alg`.

- **Améliorations complémentaires de syntaxe et fonctions prédéfinies** :
  - Prise en charge de l'opérateur de passage par référence `@` (`@M : Mat`).
  - Prise en charge et coloration des fonctions prédéfinies : `abs`, `arrondi`, `exp`, `ln`, `log`, `graine`, `est_num`, `minus`.

---

## [1.5.2] - 2026-11-03

### Fixed
- **Correction majeure des règles d'indentation lors de la saisie** :
  - Suppression des fausses détections d'indentation causées par les parenthèses (ex : `Ecrire("message")`, `Lire(x)`, appels de fonctions).
  - L'indentation automatique à la frappe de `Entrée` s'applique désormais **uniquement** aux instructions fermées en fin de ligne : `Début`, `Alors`, `Faire`, `Répéter`, `Sinon` (et structure `Selon`).
  - La désindentation s'applique fidèlement aux instructions : `Fin`, `Fin Si`, `Fin Pour`, `Fin Tant Que`, `Fin Selon`, `Jusqu'à` et `Sinon`.
  - Harmonisation du formateur automatique de document (`Shift+Alt+F`) avec ces mêmes règles strictes.

---

## [1.5.1] - 2026-11-03

### Added
- **Support étendu de la structure Selon** :
  - Support de la syntaxe sans le mot-clé `Faire` : `Selon v` ... `Fin Selon`.
  - Prise en charge des **intervalles de valeurs** avec l'opérateur `..` (ex : `4 .. 5`, `8..9`, `6, 7, 8..9`).
  - Prise en charge de la clause alternative `Sinon` ou `Autrement` (avec ou sans deux-points `:`).
  - Coloration syntaxique de l'opérateur d'intervalle `..`.
  - Exécution complète et vérifiée dans le compilateur/interpréteur `algo.exe`.

---

## [1.5.0] - 2026-11-03

### Added
- **Prise en charge complète de la structure Selon** :
  - Coloration syntaxique de `Selon`, `Cas`, `Autrement`, `Fin Selon`.
  - Fermeture automatique et vérification des blocs `Selon ... Faire` ➔ `Fin Selon`.
  - Ajout du snippet intelligent `selon`.
  - Prise en charge et exécution directe dans l'interpréteur `algo.exe` (cas multiples, expressions, blocs conditionnels imbriqués).
- **Exécution directe et interactive des algorithmes** :
  - Intégration de l'interpréteur/compilateur d'algorithmes (`algo.exe`).
  - Lancement dans un **terminal interactif dédié** supportant la saisie au clavier (`Lire(...)`) et l'affichage des résultats (`Ecrire(...)`).
  - Bouton d'action rapide ▶ **Exécuter** dans la barre de titre de l'éditeur (`editor/title`).
  - Raccourci clavier dédié **`F5`** pour exécuter instantanément le fichier algorithme actif.
  - Commandes accessibles via le menu contextuel de l'éditeur et de l'explorateur de fichiers.
  - Sauvegarde automatique du fichier `.alg` avant chaque exécution.
  - Paramètre de configuration `algorithme.interpreterPath` avec détection intelligente et boîte de sélection si l'exécutable est déplacé ou introuvable.
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
