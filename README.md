# Extension pour l'Algorithme Tunisien

<p align="center">
  <img src="icon.png" width="128" height="128" alt="Logo Algorithme Tunisien" />
</p>

[![Version](https://img.shields.io/badge/version-2.0.5-blue)](https://github.com/manimanis/Algorithme)
[![License](https://img.shields.io/badge/license-MIT-green)](LICENSE)

Une extension VS Code complète et moderne pour le langage **Algorithme** — le pseudocode algorithmique standard utilisé dans l'enseignement secondaire et universitaire de l'informatique en Tunisie.

---

## 🌟 Fonctionnalités Principales

### 🧭 Navigation & Productivité LSP (100% Mémoire, 0 latence)
L'extension intègre des fonctionnalités de langage avancées conformes aux standards professionnels du *Language Server Protocol* (LSP), fonctionnant instantanément en mémoire locale :
- **Plan du document (*Outline*)** : Visualisez l'arborescence complète de votre algorithme dans la vue **Plan** de la barre latérale ou via `Ctrl+Shift+O` (algorithme, sous-programmes, tableaux TDO/TDNT avec leurs variables et types respectifs).
- **Aller à la définition (`F12` / `Ctrl+Clic`)** : Sautez instantanément depuis une variable dans le code vers sa déclaration dans le TDO, ou depuis un appel vers la définition de la fonction ou de la procédure correspondante.
- **Survol informatif (*Hover*)** : Survolez n'importe quelle variable pour afficher son type et son emplacement dans le TDO, ou un sous-programme pour consulter sa signature et sa documentation.
- **Autocomplétion des variables TDO** : Les variables déclarées dans le TDO sont automatiquement suggérées dès la frappe dans le corps de l'algorithme.

---

### 🪄 Assistant TDO Automatique (Génération & Synchronisation)
Ne perdez plus de temps à rédiger ou synchroniser votre tableau de déclaration des objets :
- **Génération automatique & multi-blocs** : L'extension analyse le corps de votre algorithme ou de vos sous-programmes, détecte toutes les variables utilisées et infère intelligemment leurs types (`entier`, `réel` / `Réel`, `chaîne`, `booléen`, `caractère`, types TDNT personnalisés).
- **Détection universelle de la portée** : Fonctionne de manière fiable quel que soit l'agencement du fichier (sous-programmes déclarés avant ou après l'algorithme principal).
- **Précision maximale** : Exclusion stricte des commentaires mono ou multi-lignes (`/* ... */`), des paramètres formels et des arguments nommés (`sep`, `fin`).
- **Mise à jour incrémentale** : Si le TDO / TDOL existe déjà, l'assistant y ajoute automatiquement les nouvelles variables manquantes sans toucher aux déclarations existantes.
- **Action Rapide (Quick Fix 💡)** : Accessible en un clic sur l'ampoule ou via `Ctrl+.` dès qu'une variable non déclarée est détectée, ou via la commande *« Algorithme : Générer / Mettre à jour le TDO »*.

---

### 🎨 Icône Dédiée pour les Fichiers d'Algorithmes
L'extension associe automatiquement une icône élégante et officielle à tous vos fichiers `.alg`, `.algo` et `.algorithme` dans l'explorateur VS Code ainsi que dans les onglets de l'éditeur, pour une reconnaissance visuelle instantanée de vos projets.

---

### 🎓 Outils Enseignants & Conformité Baccalauréat
Des outils conçus sur mesure pour les professeurs et les élèves préparant l'épreuve pratique ou théorique du Baccalauréat :
- **Générateur de Sujets de Devoir / Examen** : Crée en un clic un modèle d'épreuve officiel prêt à l'emploi (en-tête officiel du Ministère de l'Éducation Tunisien, Lycée, Année scolaire, Durée, Cadre énoncé, squelette d'algorithme et tableau TDO/TDNT formatés).
- **Vérificateur de Conformité Bac (`F7`)** : Analyse statique instantanée qui inspecte votre algorithme et génère un rapport clair côte à côte validant :
  - La présence et la validité de l'entête et des blocs principaux.
  - La présence obligatoire et la complétude du TDO (toutes les variables déclarées).
  - L'absence de fonctions étrangères interdites issues d'autres langages (`print`, `input`, `len`, `sqrt`, etc.) avec suggestion immédiate de l'équivalent officiel tunisien (`Ecrire`, `Lire`, `Long`, `Racine`).
  - La conformité des types de données au programme officiel.

---

### ⚡ Suite d'Outils Unifiée : Interpréter, Compiler & Transpiler
L'extension intègre une suite d'outils complète directement reliée au compilateur officiel `algo.exe`. Tous les outils sont regroupés dans **un menu déroulant unique `[ ▶ ˅ ]`** dans la barre de titre de l'éditeur ainsi que dans le sous-menu contextuel **« Algorithme »** (clic droit dans l'éditeur ou dans l'explorateur) :

1. **▶ Interpréter l'algorithme (`F5`)** *(Mode par défaut)* :
   - Exécute instantanément l'algorithme via la Machine Virtuelle bytecode ou l'interpréteur AST.
   - Ouvre une console dédiée `Algorithme` dans le répertoire du fichier en cours d'exécution.
   - Prise en charge complète des saisies interactives au clavier (`Lire(...)`) et de l'affichage en temps réel des résultats (`Ecrire(...)`).
   - Sauvegarde automatique du document avant chaque exécution.
   - Compatible avec PowerShell, CMD (Invite de commandes) et Bash/Zsh.

2. **⚙️ Compiler en exécutable autonome (`Ctrl+F5`)** :
   - Compile l'algorithme sous forme d'un programme binaire Windows autonome (`.exe`) indépendant, sans dépendance externe, via l'option `--build-exe`.
   - Notification interactive proposant d'**Exécuter l'exécutable** dans un terminal dédié ou d'**Ouvrir l'emplacement** du binaire généré dans l'explorateur de fichiers.

3. **🐍 Transpiler en Python 3 (`Shift+F5`)** :
   - Convertit instantanément vos algorithmes en code Python 3 propre, structuré et conforme aux programmes officiels via l'option `--to-python`.
   - Le fichier Python généré (`mon_programme.py`) est enregistré dans le même dossier et s'ouvre automatiquement côte à côte (`ViewColumn.Beside`) avec coloration syntaxique complète.
   - Bouton d'action direct **« Exécuter en Python »** pour lancer immédiatement le script dans un terminal dédié.

- **Chemin configurable** : Définissez l'emplacement de `algo.exe` via le paramètre `algorithme.interpreterPath`. Si l'exécutable est déplacé ou introuvable, l'extension vous propose automatiquement de le localiser via un sélecteur de fichier et enregistre votre choix.

---

### 🔀 Structure à Choix Multiples (Selon)
L'extension supporte la syntaxe complète de la structure `Selon` avec cas simples, listes de valeurs, intervalles et clause alternative :
```algorithme
Selon v
  1, 2, 3 : Ecrire("traitement1")
  4 .. 5 : Ecrire("traitement2")
  6, 7, 8..9 : Ecrire("traitement3")
  Sinon
    Ecrire("traitement4")
Fin Selon
```
- Prise en charge avec ou sans le mot-clé `Faire` (`Selon v` ou `Selon v Faire`).
- Intervalles de valeurs avec l'opérateur `..` (`4 .. 5`, `8..9`).
- Clause alternative `Sinon` ou `Autrement` (avec ou sans `:`).
- Fermeture automatique du bloc à la frappe (`Fin Selon` ou `FinSelon`) et vérification syntaxique.
- Exécution directe et fidèle dans l'interpréteur `algo.exe`.

---

### 🛡️ Vérification des Blocs & Fermeture Automatique
L'éditeur analyse en temps réel la structure de votre algorithme pour garantir que chaque structure ouverte est correctement fermée :

- **Paires de blocs vérifiées (syntaxe standard et attachée tolérée)** :
  - `Début` ➔ `Fin`
  - `Si ... Alors` ➔ `Fin Si` ou `FinSi`
  - `Tant Que ... Faire` (ou `TantQue`) ➔ `Fin Tant Que` ou `FinTantQue`
  - `Répéter` ➔ `Jusqu'à`
  - `Pour ... Faire` ➔ `Fin Pour` ou `FinPour`
  - `Selon` ➔ `Fin Selon` ou `FinSelon`
  - `Enregistrement` ➔ `Fin` ou `Fin Enregistrement` / `FinEnregistrement`
- **Fermeture automatique à la frappe** : Lorsque vous tapez l'expression ouvrante et appuyez sur `Entrée`, l'éditeur vérifie si le bloc est déjà fermé. Si ce n'est pas le cas, il insère automatiquement l'expression fermante avec l'indentation adéquate et place le curseur à l'intérieur du bloc.
- **Diagnostic en temps réel** : Si un bloc n'est pas fermé, l'éditeur le signale par un soulignement rouge et un message dans le panneau **Problèmes** (`Expression fermante manquante : 'Fin Si'`).
- **Correction rapide (Quick Fix 💡)** : En cliquant sur l'ampoule ou avec le raccourci `Ctrl+.`, insérez instantanément l'expression fermante manquante en un clic.

---

### 📋 Aperçu Visuel & Export (TDO / TDNT / Word / PDF)
Ouvrez un panneau d'aperçu dynamique à côté de votre code via le raccourci **`Ctrl+Shift+V`** (ou **`Cmd+Shift+V`** sur Mac), ou en cliquant sur l'icône **Ouvrir l'aperçu** dans la barre de titre de l'éditeur.

- **Reconnaissance automatique des tableaux d'objets et de types** :
  - **TDO** (Tableau de Déclaration des Objets)
  - **TDOL** (Objets Locaux)
  - **TDOG** (Objets Globaux)
  - **TDNT** (Tableau de Déclaration des Nouveaux Types)
  - Prise en charge des formats avec deux-points (`Objet : Type/Nature`), avec barres (`| Objet | Type |`) ou avec délimiteurs textuels.
- **Mise à jour en temps réel** : Toute modification apportée à votre fichier `.alg` se répercute instantanément dans l'aperçu.
- **Boutons d'action intégrés** :
  - 📋 **Copier pour Word** : Copie l'algorithme complet avec sa coloration syntaxique et ses tableaux mis en forme directement dans le presse-papiers, prêt à être collé (`Ctrl+V`) dans Microsoft Word ou LibreOffice.
  - 📄 **Exporter .doc (Word)** : Génère un document Microsoft Word (`.doc`) prêt à l'emploi avec bordures de tableaux, polices adaptées et indentation préservée.
  - 🌓 **Thème (Mode Clair / Sombre)** : Bascule l'affichage de l'aperçu entre mode sombre et mode clair avec mémorisation de votre choix.
  - 🖨️ **Imprimer / PDF** : Lance la boîte de dialogue d'impression ou d'enregistrement au format PDF avec un style épuré optimisé pour le papier.

---

### 🎨 Coloration Syntaxique Complète
Coloration intelligente et fidèle aux normes pédagogiques tunisiennes :
- **Mots-clés** : `Algorithme`, `Début`, `Fin`, `Si`, `Alors`, `Sinon`, `Fin Si`, `Tant Que`, `Faire`, `Fin Tant Que`, `Répéter`, `Jusqu'à`, `Pour`, `De`, `À`, `Pas`, `Fin Pour`, `Procédure`, `Fonction`, `Tableau`, `Retourner`, `Selon`, `Cas`, `Autrement`, `Fin Selon`, `Enregistrement`, `Fin Enregistrement`, `Fichier`, `Fichier Texte`, `Lignes`, `Colonnes`
- **Types de données** : `entier`, `réel`, `booléen`, `caractère`, `chaîne` / `chaine`, `matrice`, `enregistrement`, `fichier`, `tableau`
- **Fonctions et procédures prédéfinies** : `Lire`, `Lire_ligne`, `Ecrire` / `Écrire`, `Ecrire_nl` / `Écrire_nl`, `Ouvrir`, `Fermer`, `Fin_fichier`, `Aléa`, `Chr`, `Ord`, `Sous_chaine`, `Effacer`, `Long`, `Ent`, `Estnum`, `Convch`, `Valeur`, `Majus`, `Minus`, `Pos`, `Racine`, `Abs`, `Arrondi`, `Exp`, `Ln`, `Graine`
- **Opérateurs** : `+`, `-`, `*`, `/`, `Div`, `Mod`, `..`, `>`, `<`, `≥`, `≤`, `=`, `≠`, `←`, `∈`, `@` (passage par référence), `. ` (accès aux champs), `Et`, `Ou`, `Non`
- **Littéraux** : Chaînes de caractères (`"..."`), nombres entiers et réels, booléens (`Vrai`, `Faux`)
- **Commentaires** : Commentaires en ligne (`//`) et blocs multi-lignes (`/* ... */`)

---

### 🔄 Remplacement Automatique d'Opérateurs
Pour gagner du temps et respecter les symboles mathématiques et algorithmiques officiels, l'extension remplace automatiquement lors de la frappe :

| Saisie clavier | Résultat | Description |
|:--------------:|:--------:|-------------|
| `<-`           | `←`      | Opérateur d'affectation |
| `<>` ou `!=`   | `≠`      | Différent de |
| `>=`           | `≥`      | Supérieur ou égal |
| `<=`           | `≤`      | Inférieur ou égal |
| `gt ` (espace) | `> `     | Strictement supérieur |
| `lt ` (espace) | `< `     | Strictement inférieur |
| `dans ` (espace) ou `dans` + symbole | `∈` | Opérateur d'appartenance |

---

### ✨ Snippets Intelligents
Des dizaines de raccourcis d'insertion de code pour coder plus vite :

#### Structures et Déclarations
| Préfixe | Description |
|---------|-------------|
| `algorithme` | Squelette complet d'un algorithme |
| `var` | Déclaration d'une variable avec sélection du type |
| `affectation` | Insertion rapide de `←` |
| `tdo` | Modèle de Tableau des Objets |
| `tdnt` | Modèle de Tableau des Nouveaux Types |
| `enreg_tdnt` | Déclaration d'un type Enregistrement dans le TDNT |
| `enreg_tdo` | Déclaration directe d'un Enregistrement dans le TDO |
| `tab_enreg` | Tableau d'enregistrements |
| `matrice_tdnt` | Déclaration d'une Matrice dans le TDNT |
| `matrice_tdo` | Déclaration d'une Matrice dans le TDO |
| `parcours_matrice` | Parcours complet d'une matrice (deux boucles) |
| `fich_lire_texte` | Lecture ligne par ligne d'un fichier texte |
| `fich_ecrire_texte`| Écriture dans un fichier texte (`Ecrire_nl`) |
| `fich_lire_data` | Lecture d'un fichier de données typé |
| `fich_ecrire_data`| Écriture dans un fichier de données typé |

#### Structures de Contrôle & Boucles
| Préfixe | Description |
|---------|-------------|
| `sisimple` | `Si ... Alors ... Fin Si` |
| `sicomplete` | `Si ... Alors ... Sinon ... Fin Si` |
| `sigeneralisee` | `Si ... Alors ... Sinon Si ... Fin Si` |
| `tantque` | `Tant Que ... Faire ... Fin Tant Que` |
| `repeter` / `répéter` | `Répéter ... Jusqu'à ...` |
| `pour` | `Pour ... de ... à ... Faire ... Fin Pour` |
| `pourpas` | `Pour ... avec Pas` |
| `selon` | Structure `Selon ... Cas ... Fin Selon` |

#### Sous-programmes & Algorithmes Classiques
| Préfixe | Description |
|---------|-------------|
| `ecrire_sep` | `Ecrire` avec séparateur `sep` personnalisé |
| `ecrire_fin` | `Ecrire` avec caractère de fin `fin` personnalisé |
| `ecrire_sep_fin` | `Ecrire` avec séparateur et fin personnalisés |
| `comment` | Bloc de commentaire multi-lignes `/* ... */` |
| `procedure` | Définition d'une procédure |
| `fonction` | Définition d'une fonction avec `Retourner` |
| `saisir` | Procédure de saisie contrôlée |
| `remplir` | Remplissage d'un tableau |
| `afficher` | Affichage des éléments d'un tableau |
| `tribulles` | Algorithme de tri à bulles |
| `triselection`| Algorithme de tri par sélection |
| `triinsertion`| Algorithme de tri par insertion |
| `rechercher` | Recherche séquentielle dans un tableau |

---

### 📝 Formateur Automatique & Indentation Intelligente
Indentation automatique et rigoureuse lors de la saisie au kilomètre et harmonisation des blocs de code :
- **À la saisie (touche `Entrée`)** : l'augmentation d'indentation s'applique **uniquement** après une instruction ouvrante en fin de ligne (`Début`, `Alors`, `Faire`, `Répéter`, `Sinon` structure `Selon` ou `Enregistrement`). Les parenthèses et instructions simples telles que `Ecrire("...")` ou `Lire(...)` ne décalent jamais la ligne suivante.
- **Désindentation immédiate** : les instructions fermantes (`Fin`, `Fin Si`, `Fin Pour`, `Fin Tant Que`, `Fin Selon`, `Fin Enregistrement`, `Jusqu'à`, `Sinon`) se réalignent automatiquement dès leur saisie.
- **Formatage global** : raccourci `Shift+Alt+F` (Windows) ou `Shift+Option+F` (Mac) pour réindenter proprement tout le document.
- Taille d'indentation configurable (par défaut : 2 espaces).

---

## 📁 Extensions de Fichiers Reconnues

| Extension | Statut |
|-----------|--------|
| `.alg` | **Recommandée** |
| `.algo` | Alternative |
| `.algorithme` | Alternative longue |

---

## 🚀 Utilisation de l'Aperçu (TDO / TDNT)

Créez un fichier `mon_algo.alg` et structurez vos déclarations comme suit :

```algorithme
Algorithme SommePairs
Début
  Ecrire("Donner n : ")
  Lire(n)
  s ← 0
  Pour i de 1 à n Faire
    Si (i Mod 2 = 0) Alors
      s ← s + i
    Fin Si
  Fin Pour
  Ecrire("Somme des pairs : ", s)
Fin

TDO
Objet : Type/Nature
n, i, s : entier
```

Appuyez sur `Ctrl+Shift+V` pour afficher l'aperçu avec le tableau TDO formaté, puis cliquez sur **📋 Copier pour Word** ou **📄 Exporter .doc** pour intégrer votre travail directement dans un document Word ou un sujet d'examen !

---

## ⌨️ Raccourcis Clavier

| Raccourci | macOS | Action |
|-----------|-------|--------|
| **`F5`** | **`F5`** | **Interpréter l'algorithme** dans le terminal interactif (mode par défaut) |
| **`Ctrl+F5`** | **`Ctrl+F5`** | **Compiler en exécutable autonome (.exe)** via `algo.exe --build-exe` |
| **`Shift+F5`** | **`Shift+F5`** | **Transpiler en Python 3** via `algo.exe --to-python` |
| **`F7`** | **`F7`** | **Vérifier la conformité Baccalauréat** (rapport pédagogique instantané) |
| **`F12`** | **`F12`** | **Aller à la définition** d'une variable (TDO) ou d'un sous-programme |
| **`Ctrl+Shift+V`** | **`Cmd+Shift+V`** | Ouvrir / afficher le volet d'aperçu dynamique (TDO/TDNT) |
| **`Shift+Alt+F`** | **`Shift+Option+F`** | Formater et indenter automatiquement le document |
| **`Ctrl+.`** | **`Cmd+.`** | Actions rapides (Quick Fix / fermer un bloc / générer le TDO) |

---

## ⚙️ Configuration

Vous pouvez personnaliser l'extension dans les paramètres de VS Code (`Ctrl+,` puis recherchez **Algorithme**) :

| Paramètre | Type | Valeur par défaut | Description |
|-----------|------|-------------------|-------------|
| `algorithme.interpreterPath` | `string` | `C:\xampp-school\htdocs\MesProjets\AlgorithmCompiler\algo.exe` | Chemin absolu vers l'exécutable de l'interpréteur / compilateur d'algorithmes |

---

## 💻 Installation

### Depuis le Marketplace VS Code (recommandé)
1. Ouvrez VS Code.
2. Ouvrez la vue Extensions (`Ctrl+Shift+X`).
3. Recherchez **"Algorithme Tunisien"**.
4. Cliquez sur **Installer**.

### Depuis un package VSIX
1. Téléchargez le fichier `.vsix` depuis les [releases GitHub](https://github.com/manimanis/Algorithme/releases).
2. Dans VS Code, ouvrez la palette de commandes (`Ctrl+Shift+P`).
3. Tapez et sélectionnez : `Extensions: Install from VSIX...`.
4. Choisissez le fichier `.vsix`.

---

## 🛠️ Développement & Contribution

```bash
# Cloner le dépôt
git clone https://github.com/manimanis/Algorithme.git

# Installer les dépendances
npm install

# Compiler le code TypeScript
npm run compile

# Lancer le débogage (Appuyez sur F5 dans VS Code)
```

---

## 📜 Licence

Distribué sous licence **MIT**. Voir le fichier [LICENSE](LICENSE) pour plus d'informations.

---

## 👤 Auteur

Conçu et développé par **Mohamed Anis Mani** pour moderniser et faciliter l'apprentissage ainsi que l'enseignement de l'algorithmique en Tunisie.

[![GitHub](https://img.shields.io/badge/GitHub-manimanis-181717?logo=github)](https://github.com/manimanis)
