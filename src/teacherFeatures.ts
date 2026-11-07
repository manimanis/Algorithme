import * as vscode from 'vscode';
import { parseTdoEntries, parseTdntEntries } from './lspFeatures';
import { detectAllUndeclaredItems } from './assistantFeatures';
import { BUILTIN_SUBPROGRAMS, getUserSubprograms } from './subprogramCompletion';

const OFFICIAL_BAC_TYPES = new Set([
  'entier', 'réel', 'reel', 'booléen', 'booleen', 'caractère', 'caractere', 'chaîne', 'chaine', 'matrice', 'enregistrement', 'fichier', 'tableau'
]);

const FORBIDDEN_FOREIGN_FUNCTIONS: Record<string, string> = {
  'print': 'Utiliser `Ecrire(...)` ou `Ecrire_nl(...)`',
  'println': 'Utiliser `Ecrire(...)`',
  'input': 'Utiliser `Lire(...)`',
  'len': 'Utiliser `Long(ch)`',
  'length': 'Utiliser `Long(ch)`',
  'str': 'Utiliser `Convch(n, ch)`',
  'int': 'Utiliser `Valeur(ch, n, e)` ou `Ent(x)`',
  'float': 'Utiliser `Valeur(ch, x, e)`',
  'sqrt': 'Utiliser `Racine(x)`',
  'random': 'Utiliser `Alea(min, max)`',
  'rand': 'Utiliser `Alea(min, max)`',
  'upper': 'Utiliser `Majus(ch)`',
  'lower': 'Utiliser `Minus(ch)`',
  'append': 'Non autorisé au Bac en algorithme (utiliser un tableau de taille déterminée)',
  'push': 'Non autorisé au Bac en algorithme'
};

/**
 * Creates a complete exam / assignment template conforme to Tunisian educational standards.
 */
export async function createExamTemplate(): Promise<void> {
  const title = await vscode.window.showInputBox({
    prompt: "Titre de l'épreuve / devoir",
    value: "Devoir de Synthèse N°2"
  }) || "Devoir de Synthèse N°2";

  const level = await vscode.window.showInputBox({
    prompt: "Niveau / Section",
    value: "4ème Année Sciences de l'Informatique"
  }) || "4ème Année Sciences de l'Informatique";

  const schoolYear = await vscode.window.showInputBox({
    prompt: "Année scolaire",
    value: "2026 / 2027"
  }) || "2026 / 2027";

  const exTitle = await vscode.window.showInputBox({
    prompt: "Titre de l'algorithme / exercice",
    value: "Exercice1"
  }) || "Exercice1";

  const content = `// ==============================================================================
//  RÉPUBLIQUE TUNISIENNE - MINISTÈRE DE L'ÉDUCATION
//  Lycée : ....................................   Année Scolaire : ${schoolYear}
//  Épreuve : ${title}      Section : ${level}
//  Durée : 2 Heures                               Coefficient : 3
//  Nom & Prénom : ..............................  Classe : ......  Note : .... / 20
// ==============================================================================

// --- ÉNONCÉ DE L'EXERCICE ---
// Rédiger l'algorithme '${exTitle}' permettant de :
// 1. Saisir les données nécessaires (avec contrôle de saisie).
// 2. Effectuer le traitement demandé.
// 3. Afficher les résultats obtenus.

Algorithme ${exTitle}
Début
  // 1. Saisie des données
  Ecrire("Donner n : ")
  Lire(n)

  // 2. Traitements
  // TODO: Insérer les traitements ici

  // 3. Affichage des résultats
  Ecrire("Résultat = ", n)
Fin

TDO
Objet : Type/Nature
n : entier
`;

  const doc = await vscode.workspace.openTextDocument({
    language: 'algorithme',
    content
  });

  await vscode.window.showTextDocument(doc);
  vscode.window.showInformationMessage(`Modèle de sujet '${title}' généré avec succès !`);
}

/**
 * Performs strict in-memory static compliance verification according to official Tunisian Baccalauréat specifications.
 */
export async function checkBacCompliance(document: vscode.TextDocument): Promise<void> {
  if (document.languageId !== 'algorithme' && !/\.(alg|algo|algorithme)$/i.test(document.fileName)) {
    vscode.window.showWarningMessage("Veuillez ouvrir un fichier algorithme (.alg) pour lancer la vérification Bac.");
    return;
  }

  const issues: { type: 'success' | 'warning' | 'error'; message: string; line?: number }[] = [];
  const text = document.getText();

  // 1. Check Algorithme header
  const hasAlgoHeader = /^Algorithme\s+([a-zA-Z_]\w*)/im.test(text);
  if (hasAlgoHeader) {
    issues.push({ type: 'success', message: "Entête 'Algorithme <Nom>' présente et conforme." });
  } else {
    issues.push({ type: 'error', message: "Entête manquante : Chaque algorithme doit commencer par 'Algorithme <Nom>'." });
  }

  // 2. Check Début ... Fin structure
  const hasDebut = /(?<=^|[^\p{L}\p{N}_])d[eé]but(?=[^\p{L}\p{N}_]|$)/iu.test(text);
  const hasFin = /(?<=^|[^\p{L}\p{N}_])fin(?=[^\p{L}\p{N}_]|$)/iu.test(text);

  if (hasDebut && hasFin) {
    issues.push({ type: 'success', message: "Blocs principaux 'Début' et 'Fin' bien délimités." });
  } else {
    if (!hasDebut) issues.push({ type: 'error', message: "Mot-clé 'Début' manquant dans l'algorithme." });
    if (!hasFin) issues.push({ type: 'error', message: "Mot-clé 'Fin' manquant à la clôture de l'algorithme." });
  }

  // 3. Check TDO Presence & Completeness
  const hasTdo = /^(TDO|TDOL|TDOG)\b/im.test(text);
  if (hasTdo) {
    issues.push({ type: 'success', message: "Tableau de Déclaration des Objets (TDO / TDOG / TDOL) présent." });
    const allScopesDetection = detectAllUndeclaredItems(document);
    let anyMissing = false;
    for (const { scope, missingVariables, missingSubprograms } of allScopesDetection) {
      const missingTotal = [...missingVariables.map(v => v.name), ...missingSubprograms.map(s => s.name)];
      if (missingTotal.length > 0) {
        anyMissing = true;
        issues.push({
          type: 'error',
          line: scope.startLine + 1,
          message: `Dans '${scope.name}' : Objets utilisés mais non déclarés dans le ${scope.tableName} : ${missingTotal.map(m => `'${m}'`).join(', ')}.`
        });
      }
    }
    if (!anyMissing) {
      issues.push({ type: 'success', message: "Tous les objets utilisés (variables et sous-programmes) sont dûment déclarés dans leurs tableaux respectifs." });
    }
  } else {
    issues.push({
      type: 'error',
      message: "Tableau TDO manquant : Le Tableau de Déclaration des Objets est obligatoire au Baccalauréat."
    });
  }

  // 4. Check for unauthorized foreign language functions (Python/C habits)
  for (let i = 0; i < document.lineCount; i++) {
    const line = document.lineAt(i).text;
    if (line.trim().startsWith('//') || line.trim().startsWith('/*')) continue;

    for (const [forbidden, suggestion] of Object.entries(FORBIDDEN_FOREIGN_FUNCTIONS)) {
      const reg = new RegExp(`(?<=^|[^\\p{L}\\p{N}_])${forbidden}\\s*\\(`, 'iu');
      if (reg.test(line)) {
        issues.push({
          type: 'error',
          line: i + 1,
          message: `Ligne ${i + 1} : Fonction '${forbidden}(...)' interdite au Bac. ${suggestion}.`
        });
      }
    }
  }

  // 5. Check data types and subprogram declarations in TDO / TDOG / TDOL
  const tdoEntries = parseTdoEntries(document);
  const tdntEntries = parseTdntEntries(document);
  const tdntTypes = new Set(tdntEntries.map(e => e.name.toLowerCase()));
  const userSubprograms = getUserSubprograms(document);
  const userSubNames = new Set(userSubprograms.map(s => s.name.toLowerCase()));
  const builtinSubNames = new Set(BUILTIN_SUBPROGRAMS.map(s => s.name.toLowerCase()));

  for (const entry of tdoEntries) {
    if (entry.isSubprogram) {
      // It is a subprogram declared in TDO/TDOG/TDOL (Procédure or Fonction)
      const subLower = entry.name.toLowerCase();
      if (!userSubNames.has(subLower) && !builtinSubNames.has(subLower)) {
        issues.push({
          type: 'warning',
          line: entry.line + 1,
          message: `Ligne ${entry.line + 1} : Sous-programme '${entry.name}' déclaré dans le ${entry.table} mais sa définition est manquante dans l'algorithme.`
        });
      }
      continue;
    }

    const rawType = entry.type.toLowerCase().trim();
    const baseType = rawType
      .replace(/^tableau\s*(?:de\s*\d+\s*)?/i, '')
      .replace(/^matrice\s*(?:de\s*\d+\s*\*\s*\d+\s*)?/i, '')
      .trim();

    if (
      !OFFICIAL_BAC_TYPES.has(baseType) &&
      !tdntTypes.has(baseType) &&
      !baseType.startsWith('enregistrement') &&
      !baseType.startsWith('fichier')
    ) {
      issues.push({
        type: 'warning',
        line: entry.line + 1,
        message: `Ligne ${entry.line + 1} : Type '${entry.type}' pour '${entry.name}' non standard dans le programme officiel.`
      });
    }
  }

  // Build and show Compliance Report
  const totalErrors = issues.filter(i => i.type === 'error').length;
  const totalWarnings = issues.filter(i => i.type === 'warning').length;
  const totalSuccess = issues.filter(i => i.type === 'success').length;

  let report = `# 🎓 Rapport de Conformité Pédagogique (Norme Bac Tunisien)\n\n`;
  report += `**Fichier analysé :** \`${document.fileName}\`\n\n`;

  if (totalErrors === 0 && totalWarnings === 0) {
    report += `### 🏆 Résultat : 100% Conforme au Standard Officiel du Baccalauréat !\n\n`;
  } else if (totalErrors === 0) {
    report += `### ⚠️ Résultat : Algorithme Valide avec quelques avertissements (${totalWarnings} avertissement(s))\n\n`;
  } else {
    report += `### ❌ Résultat : Non Conforme (${totalErrors} erreur(s) bloquante(s), ${totalWarnings} avertissement(s))\n\n`;
  }

  report += `---\n\n`;
  report += `## 📋 Détail des vérifications :\n\n`;

  for (const item of issues) {
    const icon = item.type === 'success' ? '✅' : item.type === 'warning' ? '⚠️' : '❌';
    report += `- ${icon} ${item.message}\n`;
  }

  report += `\n---\n`;
  report += `\n*Vérification statique instantanée exécutée sans altération du code.*`;

  const reportDoc = await vscode.workspace.openTextDocument({
    language: 'markdown',
    content: report
  });

  await vscode.window.showTextDocument(reportDoc, {
    viewColumn: vscode.ViewColumn.Beside,
    preview: true
  });
}
