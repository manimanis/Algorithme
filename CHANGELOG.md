# Changelog

Toutes les modifications notables apportées à l'extension **Algorithme Tunisien** sont consignées dans ce fichier.

---

## [2.0.5] - 2026-11-07

### Added
- **Icône personnalisée pour les fichiers d'algorithmes** :
  - Intégration de l'icône dédiée `.algo` pour les fichiers `.alg`, `.algo` et `.algorithme` directement dans l'explorateur VS Code (`contributes.languages[].icon`).
  - Ajout des versions optimisées et détourées haute résolution dans `icons/` (`algo.png`, `algo-light.png`, `algo-dark.png` et `algorithme.ico`).

### Fixed
- **Génération du TDO (Assistant TDO)** :
  - **Prise en charge universelle de l'ordre des blocs** : Détection correcte de la portée active quel que soit l'agencement des sous-programmes et de l'algorithme principal dans le document (sous-programmes placés en tête de fichier avant l'algorithme principal, ou après celui-ci).
  - **Prise en charge des commentaires multi-lignes (`/* ... */`)** : Suivi rigoureux de l'état des commentaires de bloc ligne par ligne pour empêcher que le texte d'un commentaire multi-lignes ne soit pris pour des variables à déclarer.
  - **Support Unicode pour les types de retour de fonctions** : Remplacement des expressions régulières ASCII par des classes de caractères Unicode (`\p{L}`) dans la détection des sous-programmes, résolvant la troncature des types accentués (`Réel` n'est plus tronqué en `R`, `Chaîne` en `Cha`, etc.).
  - **Exclusion des paramètres nommés de fonctions** : Suppression automatique des arguments nommés tels que `sep=` et `fin=` (dans `Ecrire(...)`) et ajout de `sep` aux mots-clés réservés pour éviter sa déclaration en tant qu'objet du TDO.
- **Coloration syntaxique dans l'aperçu** :
  - Résolution d'un décalage de capture dans le tokenizer regex qui provoquait la coloration en mot-clé bleu gras de tous les identifiants (noms d'algorithmes, variables, champs d'enregistrements `nom`, `moyenne`) et affichait `Fin Pour` en italique.
  - Ajout de la coloration des constantes numériques (entiers et réels en vert).
  - Prise en charge des mots-clés `A` et `À` dans les boucles `Pour ... De ... A ... Faire`.
  - Prise en charge des paramètres nommés (`sep=`, `fin=`) et des passages par référence (`@n`).

---

## [2.0.4] - 2026-11-07

### Fixed
- **Vérification de conformité Baccalauréat (`checkBacCompliance`)** :
  - **Prise en charge de la nature des sous-programmes** : Les entrées déclarées comme `Procédure` ou `Fonction` dans la colonne `Type/Nature` du TDO / TDOG / TDOL ne sont plus traitées comme des types de données inconnus. L'outil vérifie plutôt qu'elles correspondent bien à des sous-programmes définis dans l'algorithme.
  - **Support des types personnalisés TDNT** : Les types déclarés dans le `TDNT` (ex: `Tab1`) sont désormais reconnus comme des types valides pour les variables dans le TDO.
  - **Vérification multi-blocs globale** : L'analyse de conformité examine l'exhaustivité des déclarations d'objets sur l'ensemble des blocs (algorithme principal et sous-programmes) et affiche un rapport détaillé et sans faux positifs.

---

## [2.0.3] - 2026-11-07

### Fixed
- **Exclusion stricte des mots-clés de structures du TDO** :
  - Ajout des mots isolés `tant` et `que` aux mots réservés pour empêcher que `Tant` ou `que` (dans `Tant que ... Faire`) ne soient pris pour des variables non déclarées dans le TDO/TDOL.
  - Pré-nettoyage systématique des structures `Tant que`, `Fin Tant que`, `Fin Si`, `Fin Pour`, `Fin Selon` avant l'analyse des tokens.
  - Enrichissement de la liste des mots réservés (`const`, `constante`, `renvoyer`, `afficher`, etc.).

---

## [2.0.2] - 2026-11-07

### Fixed
- **Unification des outils d'exécution dans le menu déroulant (`editor/title/run`)** :
  - Harmonisation du groupe sous `"navigation"` pour regrouper « Interpréter l'algorithme », « Compiler en exécutable » et « Transpiler en Python » au sein d'un seul bouton déroulant / *split button* standard de VS Code.
  - Suppression définitive des icônes parasites multiples (`▷` et `<file-code>`) qui encombraient la barre de titre de l'éditeur.
- **Détection Unicode & Mots réservés dans le TDO** :
  - Remplacement de l'extraction de tokens ASCII par une correspondance Unicode complète (`\p{L}`).
  - Résolution du bug où les mots accentués tels que `Répéter` étaient découpés en fausses variables (`R`, `p`, `ter`) et `Jusqu'à` en `Jusqu`.
  - Exclusion stricte des mots-clés `repeter`, `répéter`, `jusqu`, `jusqua`, `jusqu'a`, `jusqu'à`, ainsi que des fermetures composées (`Fin Si`, `Fin Pour`, `Fin Tant Que`).
- **Gestion stricte des paramètres formels** :
  - Les paramètres d'en-tête de sous-programmes (ex: `@n: entier` dans `Saisir(@n: entier)`) ne sont plus ajoutés au TDO/TDOL.
  - Notification claire à l'utilisateur lorsque tous les objets d'une procédure ou fonction sont déjà déclarés ou sont des paramètres.

---

## [2.0.1] - 2026-11-07

### Fixed
- **Navigation (Ctrl+Clic / `F12`) vers les sous-programmes** :
  - La navigation redirige désormais en priorité absolue vers l'implémentation du sous-programme (`Procédure ...` ou `Fonction ...`) et non vers sa déclaration dans le tableau TDO/TDOG.
- **Survol (*Hover*) des sous-programmes** :
  - Affichage de la signature officielle, de la documentation et des paramètres du sous-programme même s'il est également déclaré dans le TDOG / TDOL.
- **Génération automatique du TDO / TDOG affinée** :
  - Détection circonscrite strictement aux blocs d'instructions exécutables entre `Début` et `Fin` (exclusion des en-têtes de tableaux `TDNT`, `TDOG`, `TDO` et des types personnalisés comme `Tab1`).
  - Détection et ajout automatique des sous-programmes appelés dans l'algorithme mais manquants dans le TDOG (ex : `Remplir : Procédure`).
  - Exclusion des doublons dans l'autocomplétion des variables pour les entrées sous-programmes du TDO.

---

## [2.0.0] - 2026-11-07

### Added
- **Navigation & Productivité LSP (Architecture native 100% en mémoire, 0 latence)** :
  - **Plan de l'algorithme (*Document Symbols / Outline*)** : Affichage hiérarchique dans la vue Plan de la barre latérale de VS Code et via `Ctrl+Shift+O` (Algorithme principal, Fonctions, Procédures, Tableaux TDO, TDOL, TDOG, TDNT avec leurs variables et types respectifs).
  - **Aller à la définition (`F12` / `Ctrl+Clic`)** : Saut instantané depuis n'importe quelle variable dans le code vers sa ligne de déclaration dans le TDO/TDNT, et vers la définition des fonctions et procédures.
  - **Survol informatif (*Hover Provider*)** : Infobulles détaillées au survol d'une variable (`nom : type [TDO]`), d'un sous-programme (signature, paramètres, doc) ou d'un mot-clé algorithmique (explications pédagogiques).
  - **Autocomplétion des variables déclarées dans le TDO** : Proposition automatique de toutes les variables du TDO au fur et à mesure de la saisie dans le corps de l'algorithme.
- **Assistants & Automatisation Intelligente** :
  - **Générateur automatique / Mise à jour du TDO (`algorithme.generateTDO`)** : Analyse statique en mémoire du code, détection des variables utilisées, inférence intelligente de leurs types probables (d'après les affectations, `Pour`, `Lire`, calculs) et génération ou ajout automatique des variables manquantes au TDO.
  - **Actions Rapides (💡 Quick Fix / `Ctrl+.`)** : Proposition automatique d'ajouter les variables manquantes ou de générer le TDO en un clic dès qu'une variable non déclarée est détectée.
- **Export & Outils pour Enseignants & Élèves** :
  - **Générateur de Sujets de Devoir / Examen (`algorithme.createExamTemplate`)** : Commande pour créer en un clic un modèle complet d'épreuve conforme aux normes institutionnelles du Ministère de l'Éducation Tunisien (en-tête officiel, lycée, année scolaire, épreuve, durée, cadre TDO pré-rempli).
  - **Vérification de Conformité Baccalauréat (`algorithme.checkBacCompliance` / touche `F7`)** : Analyse statique instantanée vérifiant la conformité stricte avec le programme officiel du Bac tunisien (présence du TDO, déclaration de toutes les variables, détection de fonctions interdites issues d'autres langages comme `print` ou `len`, validation des types), avec affichage d'un rapport clair côté à côte.

---

## [1.9.1] - 2026-11-06

### Changed
- **Harmonisation et regroupement des outils dans un menu unique** :
  - Combinaison des trois outils d'exécution et de conversion dans le menu déroulant du bouton d'exécution (`editor/title/run`) :
    1. **Interpréter l'algorithme** (action par défaut au clic sur ▶ ou via `F5`).
    2. **Compiler en exécutable** (`Ctrl+F5`).
    3. **Transpiler en Python** (`Shift+F5`).
  - Suppression des boutons séparés redondants dans la barre de titre de l'éditeur pour une interface propre et ergonomique.
  - Regroupement des trois actions dans un sous-menu contextuel unique **« Algorithme »** (clic droit dans l'éditeur et dans l'explorateur de fichiers).

---

## [1.9.0] - 2026-11-06

### Added
- **Compilation d'un algorithme en exécutable autonome (.exe)** :
  - Nouvelle commande `algorithme.compileExe` (*« Algorithme : Compiler en exécutable (.exe) »*).
  - Utilise l'option `--build-exe` du compilateur `algo.exe` pour générer un fichier `.exe` autonome et indépendant.
  - Exécution par défaut préservée en mode interprété (`algo.exe <fichier.alg>`) via le bouton ▶ ou la touche `F5`.
  - Notification de confirmation avec actions directes : **« Exécuter l'exécutable »** (lance le binaire dans le terminal) et **« Ouvrir l'emplacement »** (révèle le `.exe` dans l'explorateur de fichiers).
  - Raccourci clavier dédié **`Ctrl+F5`** pour compiler en un instant le fichier algorithme actif.
- **Intégration dans des sous-menus dédiés** :
  - **Menu contextuel de l'éditeur** : ajout d'un sous-menu **« Algorithme : Compiler »** regroupant la compilation en exécutable (.exe) et la transpilation en Python, avec l'exécution interprétée par défaut directement accessible à la racine.
  - **Menu contextuel de l'explorateur** : sous-menu identique accessible par clic droit sur tout fichier `.alg`, `.algo` ou `.algorithme`.
  - **Barre de titre de l'éditeur (`editor/title/run`)** : menu déroulant attaché au bouton d'exécution permettant de basculer entre l'exécution interprétée (par défaut) et la compilation en binaire autonome.

---

## [1.8.1] - 2026-11-06

### Added
- **Tolérance des mots-clés de structure en un seul mot** :
  - Support complet de `FinSi` (équivalent à `Fin Si`).
  - Support complet de `FinPour` (équivalent à `Fin Pour`).
  - Support complet de `TantQue` (équivalent à `Tant Que`).
  - Support complet de `FinTantQue` (équivalent à `Fin Tant Que`).
  - Support complet de `FinSelon` (équivalent à `Fin Selon`).
  - Tolérance également de `FinEnregistrement`.
- **Mise à jour de la coloration syntaxique (TextMate grammar)** :
  - Détection et mise en évidence des mots-clés avec ou sans espaces intermédiaires.
- **Mise à jour du validateur de blocs et de l'auto-fermeture** :
  - Appariement exact des blocs qu'ils soient fermés avec `Fin Si` / `FinSi`, `Fin Pour` / `FinPour`, `Fin Tant Que` / `FinTantQue`, `Fin Selon` / `FinSelon`.
  - Prise en charge des ouvertures `TantQue ... Faire` et `Tant Que ... Faire`.
- **Mise à jour du formateur et de l'aperçu dynamique** :
  - Désindentation automatique et coloration adaptées pour les deux formes d'écriture.

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
