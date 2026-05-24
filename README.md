# Extension pour l'Algorithme Tunisien

[![Version](https://img.shields.io/badge/version-1.0.1-blue)](https://github.com/manimanis/Algorithme)
[![License](https://img.shields.io/badge/license-MIT-green)](LICENSE)

Une extension VS Code complète pour le langage **Algorithme** — un pseudocode algorithmique utilisé dans l'enseignement de l'informatique en Tunisie.

---

## Fonctionnalités

### 🎨 Coloration Syntaxique
Coloration intelligente de tous les éléments du langage Algorithme :
- **Mots-clés** : `Algorithme`, `Début`, `Fin`, `Si`, `Alors`, `Sinon`, `Fin Si`, `Tant Que`, `Faire`, `Fin Tant Que`, `Répéter`, `Jusqu'à`, `Pour`, `De`, `À`, `Pas`, `Procédure`, `Fonction`, `Tableau`, `Retourner`, `Selon`, `Cas`, `Fin Selon`
- **Types de données** : `entier`, `réel`, `booléen`, `caractère`, `chaine`, `matrice`
- **Fonctions prédéfinies** : `Lire`, `Ecrire`, `Aléa`, `Chr`, `Ord`, `Sous_chaine`, `Effacer`, `Long`, `Ent`, `Estnum`, `Convch`, `Valeur`, `Majus`, `Minus`, `Pos`
- **Opérateurs** : `+`, `-`, `*`, `/`, `Div`, `Mod`, `>`, `<`, `≥`, `≤`, `=`, `≠`, `←`, `∈`
- **Littéraux** : chaînes de caractères (`"..."`), nombres (entiers et réels), booléens (`Vrai`, `Faux`)
- **Commentaires** : ligne (`//`), bloc (`/* ... */`)
- **Indices de tableau/matrice** : `[` et `]`

### 🔄 Remplacement Automatique d'Opérateurs
L'extension remplace automatiquement certains symboles tapés au clavier par leurs équivalents algorithmiques :

| Saisie clavier | Résultat |
|----------------|----------|
| `>=`           | `≥`      |
| `<=`           | `≤`      |
| `!=`           | `≠`      |
| `gt ` (espace) | `> `     |
| `lt ` (espace) | `< `     |
| `dans ` (espace) ou `dans` + caractère non-alphanumérique | `∈` |

### ✨ Snippets (Extraits de Code)
De nombreux snippets pour accélérer l'écriture du code :

#### Structures de base
| Préfixe | Description |
|---------|-------------|
| `algorithme` | Structure complète d'un algorithme |
| `var` | Déclaration d'une variable (avec sélecteur de type) |
| `affectation` | Opérateur d'affectation `←` |

#### Structures conditionnelles
| Préfixe | Description |
|---------|-------------|
| `sisimple` | `Si...Alors...Fin Si` |
| `sicomplete` | `Si...Alors...Sinon...Fin Si` |
| `sigeneralisee` | `Si...Alors...Sinon Si...Alors...Sinon...Fin Si` |
| `appartient` | Condition avec opérateur `∈` |

#### Boucles
| Préfixe | Description |
|---------|-------------|
| `tantque` | Boucle `Tant Que...Faire...Fin Tant Que` |
| `repeter` / `répéter` | Boucle `Répéter...Jusqu'à` |
| `pour` | Boucle `Pour...de...à...Faire...Fin Pour` |
| `pourpas` | Boucle `Pour...avec Pas` |

#### Sous-programmes
| Préfixe | Description |
|---------|-------------|
| `procedure` | Définition d'une procédure |
| `fonction` | Définition d'une fonction (avec `Retourner`) |

#### Tableaux
| Préfixe | Description |
|---------|-------------|
| `tableau` | Déclaration d'un tableau |
| `tdnt` | Tableau de Nombres / Types |
| `tdo` | Tableau des Objets |

#### Opérations courantes
| Préfixe | Description |
|---------|-------------|
| `lire` | Instruction de lecture |
| `ecrire` | Instruction d'écriture |
| `incrementer` | Incrémentation d'une variable |
| `decrementer` | Décrémentation d'une variable |
| `saisir` | Procédure de saisie avec contrôle |
| `remplir` | Procédure de remplissage d'un tableau |
| `afficher` | Procédure d'affichage d'un tableau |

#### Algorithmes classiques
| Préfixe | Description |
|---------|-------------|
| `tribulles` | Tri à bulles (Bubble Sort) |
| `triselection` | Tri par sélection (Selection Sort) |
| `triinsertion` | Tri par insertion (Insertion Sort) |
| `rechercher` | Recherche séquentielle dans un tableau |
| `verif` | Fonction de vérification de chaîne |

### 📝 Formateur de Document
L'extension inclut un formateur qui indente automatiquement votre code selon les blocs :
- Les mots-clés ouvrants (`Début`, `Faire`, `Alors`) augmentent le niveau d'indentation
- Les mots-clés fermants (`Fin`, `Jusqu'à`) diminuent le niveau d'indentation
- Les lignes vides sont préservées
- Indentation configurable (par défaut : 2 espaces)

### ⚙️ Configuration du Langage
- Commentaires : ligne (`//`) et bloc (`/* */`)
- Paires de délimiteurs auto-fermantes : `()`, `{}`, `[]`, `""`
- Règles d'indentation intelligentes

---

## Extensions de Fichier

| Extension | Usage |
|-----------|-------|
| `.alg` | Recommandée |
| `.algo` | Alternative |
| `.algorithme` | Alternative complète |

---

## Installation

### Depuis le Marketplace VS Code (recommandée)
1. Ouvrez VS Code
2. Allez dans l'onglet **Extensions** (`Ctrl+Shift+X`)
3. Recherchez **"Algorithme Tunisien"**
4. Cliquez sur **Installer**

### Depuis un fichier VSIX
1. Téléchargez le fichier `.vsix` depuis la [page des releases](https://github.com/manimanis/Algorithme/releases)
2. Dans VS Code, appuyez sur `Ctrl+Shift+P` et exécutez : `Extensions: Install from VSIX...`
3. Sélectionnez le fichier `.vsix` téléchargé

---

## Exemple Complet

```algorithme
Algorithme CalculMoyenne
Début
  // Saisie des notes
  Ecrire("Entrez la note 1 : ")
  Lire(note1)

  Ecrire("Entrez la note 2 : ")
  Lire(note2)

  // Calcul de la moyenne
  moyenne ← (note1 + note2) / 2

  // Affichage du résultat
  Ecrire("La moyenne est : ")
  Ecrire(moyenne)
Fin
```

### Exemple avec structures conditionnelles et boucles

```algorithme
Algorithme VerificationNote
Début
  Répéter
    Ecrire("Entrez une note (0-20) : ")
    Lire(note)
  Jusqu'à 0 ≤ note ∈ 20

  Si note ≥ 10 Alors
    Ecrire("Admis")
  Sinon
    Ecrire("Ajourné")
  Fin Si
Fin
```

### Exemple de procédure avec tableau

```algorithme
Procédure RemplirEtAfficher(@t : Tab, n : entier)
Début
  Pour i de 0 à n - 1 Faire
    Ecrire("Entrez t[", i, "] : ")
    Lire(t[i])
  Fin Pour

  Pour i de 0 à n - 1 Faire
    Ecrire(t[i])
  Fin Pour
Fin
```

---

## Développement

### Prérequis
- [Node.js](https://nodejs.org/) (v16 ou supérieur)
- [VS Code](https://code.visualstudio.com/) (v1.60 ou supérieur)

### Construction
```bash
# Cloner le dépôt
git clone https://github.com/manimanis/Algorithme.git

# Installer les dépendances
npm install

# Compiler le code TypeScript
npm run compile

# Lancer le débogage (F5 dans VS Code)
```

### Structure du Projet
```
tunisian-algorithms-highlighter/
├── .vscodeignore
├── CHANGELOG.md
├── language-configuration.json    # Configuration du langage
├── package.json                   # Manifeste de l'extension
├── tsconfig.json                  # Configuration TypeScript
├── snippets/
│   └── algorithme.code-snippets.json  # Snippets de code
├── src/
│   └── extension.ts               # Code principal de l'extension
└── syntaxes/
    └── algorithme.tmLanguage.json # Grammaire TextMate pour la coloration
```

---

## Licence

MIT — voir le fichier [LICENSE](LICENSE) pour plus de détails.

---

## À Propos

Développé par **Mohamed Anis Mani** pour faciliter l'écriture d'algorithmes en langage Algorithme dans VS Code, destiné aux étudiants et enseignants en informatique en Tunisie.

[![GitHub](https://img.shields.io/badge/GitHub-manimanis-181717?logo=github)](https://github.com/manimanis)