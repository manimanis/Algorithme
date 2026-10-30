# Extension pour l'Algorithme Tunisien

[![Version](https://img.shields.io/badge/version-1.2.1-blue)](https://github.com/manimanis/Algorithme)
[![License](https://img.shields.io/badge/license-MIT-green)](LICENSE)

Une extension VS Code complète et moderne pour le langage **Algorithme** — le pseudocode algorithmique standard utilisé dans l'enseignement secondaire et universitaire de l'informatique en Tunisie.

---

## 🌟 Fonctionnalités Principales

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
- **Mots-clés** : `Algorithme`, `Début`, `Fin`, `Si`, `Alors`, `Sinon`, `Fin Si`, `Tant Que`, `Faire`, `Fin Tant Que`, `Répéter`, `Jusqu'à`, `Pour`, `De`, `À`, `Pas`, `Fin Pour`, `Procédure`, `Fonction`, `Tableau`, `Retourner`, `Selon`, `Cas`, `Fin Selon`
- **Types de données** : `entier`, `réel`, `booléen`, `caractère`, `chaîne` / `chaine`, `matrice`
- **Fonctions prédéfinies** : `Lire`, `Ecrire` / `Écrire`, `Aléa`, `Chr`, `Ord`, `Sous_chaine`, `Effacer`, `Long`, `Ent`, `Estnum`, `Convch`, `Valeur`, `Majus`, `Minus`, `Pos`, `Racine`
- **Opérateurs** : `+`, `-`, `*`, `/`, `Div`, `Mod`, `>`, `<`, `≥`, `≤`, `=`, `≠`, `←`, `∈`, `Et`, `Ou`, `Non`
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

### 📝 Formateur Automatique de Document
Indentation automatique et harmonisation des blocs de code :
- Touche de raccourci : `Shift+Alt+F` (Windows) ou `Shift+Option+F` (Mac).
- Les mots-clés ouvrants (`Début`, `Faire`, `Alors`, `Répéter`) incrémentent l'indentation.
- Les mots-clés fermants (`Fin`, `Jusqu'à`, `Sinon`) ajustent l'alignement.
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
