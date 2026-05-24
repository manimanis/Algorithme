# Algorithme Syntax Highlighting for VS Code

Syntax highlighting for the **Algorithme** language — an algorithmic pseudocode language used in Tunisian computer science education.

## Features

- Keywords highlighting: `algorithme`, `début`, `fin`, `si`, `alors`, `sinon`, `fin si`, `tant que`, `faire`, `fin tant que`, `répéter`, `jusqu'à`, `pour`, `de`, `à`, `faire`, `pas`, `procédure`, `fonction`, `tableau`
- Data types: `entier`, `réel`, `booléen`, `caractère`, `chaine`, `matrice`
- Arithmetic operators: `+`, `-`, `*`, `/`, `div`, `mod`
- Comparison operators: `>`, `<`, `>=`, `<=`, `=`, `≠`, `∈`
- Assignment operator: `←`
- Predefined functions: `lire`, `écrire`, `aléa`, `chr`, `ord`, `sous_chaine`, `effacer`, `long`, `ent`, `estnum`, `convch`, `valeur`
- String literals (double-quoted)
- Line comments (`//`)
- Array/matrix indexing (`[` and `]`)
- Numeric constants (integers and reals)

## File Extensions

- `.alg` — Recommended
- `.algo`
- `.algorithme`

## Installation

### From VSIX (recommended)

1. Download the `.vsix` file from the [releases page](https://github.com/example/tunisian-algorithms-highlighter/releases)
2. In VS Code, press `Ctrl+Shift+P` and run: `Extensions: Install from VSIX...`
3. Select the downloaded `.vsix` file

### Manual Installation

1. Copy the `tunisian-algorithms-highlighter` folder into `~/.vscode/extensions/`
2. Restart VS Code

## Example

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

## License

MIT