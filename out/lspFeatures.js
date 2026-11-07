"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.AlgorithmeTdoCompletionProvider = exports.AlgorithmeHoverProvider = exports.AlgorithmeDefinitionProvider = exports.AlgorithmeDocumentSymbolProvider = void 0;
exports.parseTdoEntries = parseTdoEntries;
exports.parseTdntEntries = parseTdntEntries;
const vscode = __importStar(require("vscode"));
const subprogramCompletion_1 = require("./subprogramCompletion");
const KEYWORD_DESCRIPTIONS = {
    'algorithme': 'Entête désignant le nom de l\'algorithme principal.',
    'début': 'Point d\'entrée et début du bloc d\'instructions exécutables.',
    'debut': 'Point d\'entrée et début du bloc d\'instructions exécutables.',
    'fin': 'Fin de l\'algorithme, d\'un sous-programme ou d\'une structure de données.',
    'si': 'Structure conditionnelle simple ou alternative (`Si ... Alors ... Sinon ... Fin Si`).',
    'alors': 'Introduit le bloc d\'instructions à exécuter si la condition du `Si` est vraie.',
    'sinon': 'Introduit la branche alternative exécutée si la condition précédente est fausse.',
    'finsi': 'Ferme un bloc conditionnel `Si ... Alors`.',
    'fin si': 'Ferme un bloc conditionnel `Si ... Alors`.',
    'pour': 'Boucle à compteur déterminé (`Pour <compteur> de <début> à <fin> [Pas <p>] Faire`).',
    'finpour': 'Ferme une boucle `Pour ... Faire`.',
    'fin pour': 'Ferme une boucle `Pour ... Faire`.',
    'tant que': 'Boucle conditionnelle avec test préalable (`Tant Que <cond> Faire ... Fin Tant Que`).',
    'tantque': 'Boucle conditionnelle avec test préalable (`Tant Que <cond> Faire ... Fin Tant Que`).',
    'fintantque': 'Ferme une boucle `Tant Que ... Faire`.',
    'fin tant que': 'Ferme une boucle `Tant Que ... Faire`.',
    'répéter': 'Boucle itérative avec test d\'arrêt en fin de boucle (`Répéter ... Jusqu\'à <cond>`).',
    'repeter': 'Boucle itérative avec test d\'arrêt en fin de boucle (`Répéter ... Jusqu\'à <cond>`).',
    'jusqu\'à': 'Condition d\'arrêt de la boucle `Répéter`. La boucle s\'arrête dès que la condition devient Vraie.',
    'selon': 'Structure de sélection à choix multiples (`Selon <variable> Faire ... Fin Selon`).',
    'finselon': 'Ferme une structure conditionnelle multiple `Selon`.',
    'fin selon': 'Ferme une structure conditionnelle multiple `Selon`.',
    'cas': 'Branche de sélection d\'une valeur dans une structure `Selon`.',
    'autrement': 'Clause par défaut exécutée si aucun des cas précédents n\'est satisfait.',
    'procédure': 'Sous-programme autonome ne renvoyant pas directement de valeur par son nom.',
    'procedure': 'Sous-programme autonome ne renvoyant pas directement de valeur par son nom.',
    'fonction': 'Sous-programme qui calcule et retourne un résultat d\'un type donné.',
    'retourner': 'Instruction permettant de spécifier la valeur de retour d\'une fonction.',
    'tdo': 'Tableau de Déclaration des Objets (variables globales ou locales).',
    'tdol': 'Tableau de Déclaration des Objets Locaux à un sous-programme.',
    'tdog': 'Tableau de Déclaration des Objets Globaux.',
    'tdnt': 'Tableau de Déclaration des Nouveaux Types personnalisés.'
};
/**
 * Extracts declared variables from TDO / TDOL / TDOG in the document.
 */
function parseTdoEntries(document) {
    const entries = [];
    let currentTable = '';
    for (let i = 0; i < document.lineCount; i++) {
        const rawLine = document.lineAt(i).text;
        const trimmed = rawLine.trim();
        // Check for table section headers
        const tableMatch = trimmed.match(/^(TDOL|TDOG|TDO)\b/i);
        if (tableMatch) {
            currentTable = tableMatch[1].toUpperCase();
            continue;
        }
        if (/^(TDNT|Algorithme|Procédure|Procedure|Fonction|Début|Debut)\b/i.test(trimmed)) {
            currentTable = '';
            continue;
        }
        if (!currentTable)
            continue;
        // Skip comment lines or empty lines
        if (trimmed.length === 0 || trimmed.startsWith('//') || trimmed.startsWith('/*'))
            continue;
        // Skip table header lines: "Objet : Type/Nature" or "| Objet | Type |"
        if (/^\|?\s*objet\s*[:|]/i.test(trimmed) || /^[\+\-\|─┌┬┐├┼┤└┴┘╔╦╗╠╬╣╚╩╝═║\s]+$/.test(trimmed)) {
            continue;
        }
        // Format 1: "nom1, nom2 : type" (with optional leading/trailing vertical bars)
        const cleanLine = trimmed.replace(/^\|\s*/, '').replace(/\s*\|$/, '');
        if (cleanLine.includes(':')) {
            const colonIdx = cleanLine.indexOf(':');
            const leftPart = cleanLine.substring(0, colonIdx).trim();
            const rightPart = cleanLine.substring(colonIdx + 1).trim();
            if (leftPart && rightPart) {
                const names = leftPart.split(',').map(n => n.trim()).filter(Boolean);
                for (const name of names) {
                    // Find exact range of the name in the original raw line
                    const nameIdx = rawLine.indexOf(name);
                    const range = nameIdx >= 0
                        ? new vscode.Range(i, nameIdx, i, nameIdx + name.length)
                        : new vscode.Range(i, 0, i, rawLine.length);
                    const isSubprogram = /^(?:proc[eé]dure|procedure|fonction)\b/i.test(rightPart);
                    entries.push({
                        name,
                        type: rightPart,
                        table: currentTable,
                        line: i,
                        range,
                        isSubprogram
                    });
                }
            }
        }
    }
    return entries;
}
/**
 * Extracts declared types from TDNT in the document.
 */
function parseTdntEntries(document) {
    const entries = [];
    let inTdnt = false;
    for (let i = 0; i < document.lineCount; i++) {
        const rawLine = document.lineAt(i).text;
        const trimmed = rawLine.trim();
        if (/^TDNT\b/i.test(trimmed)) {
            inTdnt = true;
            continue;
        }
        if (/^(TDO|TDOL|TDOG|Algorithme|Procédure|Procedure|Fonction|Début|Debut)\b/i.test(trimmed)) {
            inTdnt = false;
            continue;
        }
        if (!inTdnt)
            continue;
        if (trimmed.length === 0 || trimmed.startsWith('//') || trimmed.startsWith('/*'))
            continue;
        if (/^\|?\s*type\s*[:|=]/i.test(trimmed) || /^[\+\-\|─┌┬┐├┼┤└┴┘╔╦╗╠╬╣╚╩╝═║\s]+$/.test(trimmed))
            continue;
        const cleanLine = trimmed.replace(/^\|\s*/, '').replace(/\s*\|$/, '');
        const sepIdx = cleanLine.indexOf('=') !== -1 ? cleanLine.indexOf('=') : cleanLine.indexOf(':');
        if (sepIdx !== -1) {
            const typeName = cleanLine.substring(0, sepIdx).trim();
            const typeDef = cleanLine.substring(sepIdx + 1).trim();
            if (typeName) {
                const nameIdx = rawLine.indexOf(typeName);
                const range = nameIdx >= 0
                    ? new vscode.Range(i, nameIdx, i, nameIdx + typeName.length)
                    : new vscode.Range(i, 0, i, rawLine.length);
                entries.push({
                    name: typeName,
                    definition: typeDef,
                    line: i,
                    range
                });
            }
        }
    }
    return entries;
}
/**
 * DocumentSymbolProvider: Builds the hierarchical Outline in the VS Code sidebar.
 */
class AlgorithmeDocumentSymbolProvider {
    provideDocumentSymbols(document) {
        const symbols = [];
        let mainAlgoSymbol = null;
        let currentSubprogramSymbol = null;
        let currentTableSymbol = null;
        for (let i = 0; i < document.lineCount; i++) {
            const line = document.lineAt(i);
            const trimmed = line.text.trim();
            if (!trimmed || trimmed.startsWith('//') || trimmed.startsWith('/*'))
                continue;
            // 1. Algorithme header
            const algoMatch = trimmed.match(/^Algorithme\s+([a-zA-Z_]\w*)/i);
            if (algoMatch) {
                const fullRange = new vscode.Range(i, 0, document.lineCount - 1, 0);
                mainAlgoSymbol = new vscode.DocumentSymbol(algoMatch[1], 'Algorithme principal', vscode.SymbolKind.Package, fullRange, line.range);
                symbols.push(mainAlgoSymbol);
                continue;
            }
            // 2. Subprograms: Fonction or Procédure
            const fnMatch = trimmed.match(/^Fonction\s+([a-zA-Z_]\w*)/i);
            if (fnMatch) {
                const fnSym = new vscode.DocumentSymbol(fnMatch[1], trimmed, vscode.SymbolKind.Function, line.range, line.range);
                symbols.push(fnSym);
                currentSubprogramSymbol = fnSym;
                continue;
            }
            const procMatch = trimmed.match(/^Proc[eé]dure\s+([a-zA-Z_]\w*)/i);
            if (procMatch) {
                const procSym = new vscode.DocumentSymbol(procMatch[1], trimmed, vscode.SymbolKind.Method, line.range, line.range);
                symbols.push(procSym);
                currentSubprogramSymbol = procSym;
                continue;
            }
            // 3. Table sections: TDO, TDOL, TDOG, TDNT
            const tableMatch = trimmed.match(/^(TDNT|TDOL|TDOG|TDO)\b/i);
            if (tableMatch) {
                currentSubprogramSymbol = null;
                const tableName = tableMatch[1].toUpperCase();
                currentTableSymbol = new vscode.DocumentSymbol(tableName, tableName === 'TDNT' ? 'Tableau des Nouveaux Types' : 'Tableau de Déclaration des Objets', vscode.SymbolKind.Namespace, line.range, line.range);
                symbols.push(currentTableSymbol);
                continue;
            }
            // Add child symbols inside TDO / TDNT
            if (currentTableSymbol) {
                if (/^\|?\s*(objet|type)\s*[:|=]/i.test(trimmed) || /^[\+\-\|─┌┬┐├┼┤└┴┘╔╦╗╠╬╣╚╩╝═║\s]+$/.test(trimmed)) {
                    continue;
                }
                const clean = trimmed.replace(/^\|\s*/, '').replace(/\s*\|$/, '');
                const sepIdx = clean.indexOf(':') !== -1 ? clean.indexOf(':') : clean.indexOf('=');
                if (sepIdx !== -1) {
                    const left = clean.substring(0, sepIdx).trim();
                    const right = clean.substring(sepIdx + 1).trim();
                    const names = left.split(',').map(n => n.trim()).filter(Boolean);
                    for (const name of names) {
                        const varSymbol = new vscode.DocumentSymbol(name, right, currentTableSymbol.name === 'TDNT' ? vscode.SymbolKind.Interface : vscode.SymbolKind.Variable, line.range, line.range);
                        currentTableSymbol.children.push(varSymbol);
                    }
                }
            }
        }
        return symbols;
    }
}
exports.AlgorithmeDocumentSymbolProvider = AlgorithmeDocumentSymbolProvider;
/**
 * DefinitionProvider: Allows F12 or Ctrl+Click on an identifier to jump to its TDO declaration or Subprogram definition.
 */
class AlgorithmeDefinitionProvider {
    provideDefinition(document, position) {
        const wordRange = document.getWordRangeAtPosition(position);
        if (!wordRange)
            return undefined;
        const word = document.getText(wordRange);
        const wordLower = word.toLowerCase();
        // 1. Search in user subprograms FIRST! (Procédure / Fonction implementation line)
        const subprograms = (0, subprogramCompletion_1.getUserSubprograms)(document);
        const fnMatch = subprograms.find(s => s.name.toLowerCase() === wordLower);
        if (fnMatch) {
            for (let i = 0; i < document.lineCount; i++) {
                const text = document.lineAt(i).text.trim();
                if (new RegExp(`^(?:Fonction|Proc[eé]dure)\\s+${fnMatch.name}\\b`, 'i').test(text)) {
                    return new vscode.Location(document.uri, new vscode.Position(i, 0));
                }
            }
        }
        // 2. Search in TDNT (Custom types)
        const tdntEntries = parseTdntEntries(document);
        const typeMatch = tdntEntries.find(e => e.name.toLowerCase() === wordLower);
        if (typeMatch) {
            return new vscode.Location(document.uri, typeMatch.range);
        }
        // 3. Search in TDO / TDOL / TDOG (variables)
        const tdoEntries = parseTdoEntries(document);
        const varMatch = tdoEntries.find(e => e.name.toLowerCase() === wordLower);
        if (varMatch) {
            return new vscode.Location(document.uri, varMatch.range);
        }
        return undefined;
    }
}
exports.AlgorithmeDefinitionProvider = AlgorithmeDefinitionProvider;
/**
 * HoverProvider: Shows rich hover tooltips when hovering over variables, functions or keywords.
 */
class AlgorithmeHoverProvider {
    provideHover(document, position) {
        const wordRange = document.getWordRangeAtPosition(position);
        if (!wordRange)
            return undefined;
        const word = document.getText(wordRange);
        const wordLower = word.toLowerCase();
        // 1. Check if it's a built-in or user subprogram FIRST!
        const allSubprograms = [...(0, subprogramCompletion_1.getUserSubprograms)(document), ...subprogramCompletion_1.BUILTIN_SUBPROGRAMS];
        const subMatch = allSubprograms.find(s => s.name.toLowerCase() === wordLower);
        if (subMatch) {
            const md = new vscode.MarkdownString();
            const kindLabel = subMatch.kind === 'function' ? 'Fonction' : 'Procédure';
            md.appendMarkdown(`*(${kindLabel})* **\`${subMatch.signature}\`**\n\n`);
            md.appendMarkdown(`${subMatch.description}\n\n`);
            if (subMatch.params.length > 0) {
                md.appendMarkdown('**Paramètres :**\n');
                for (const p of subMatch.params) {
                    md.appendMarkdown(`- \`${p.name}\`${p.type ? ` (*${p.type}*)` : ''} : ${p.description || ''}${p.defaultValue ? ` *(défaut : \`${p.defaultValue}\`)*` : ''}\n`);
                }
            }
            return new vscode.Hover(md, wordRange);
        }
        // 2. Check if it's a TDO / TDOG / TDOL entry
        const tdoEntries = parseTdoEntries(document);
        const varMatch = tdoEntries.find(e => e.name.toLowerCase() === wordLower);
        if (varMatch) {
            const md = new vscode.MarkdownString();
            if (!varMatch.isSubprogram) {
                md.appendMarkdown(`*(variable)* **\`${varMatch.name}\`** : \`${varMatch.type}\`\n\n`);
            }
            else {
                md.appendMarkdown(`*(${varMatch.type})* **\`${varMatch.name}\`**\n\n`);
            }
            md.appendMarkdown(`Déclarée dans le **${varMatch.table}** *(ligne ${varMatch.line + 1})*`);
            return new vscode.Hover(md, wordRange);
        }
        // 3. Check if it's a TDNT type
        const tdntEntries = parseTdntEntries(document);
        const typeMatch = tdntEntries.find(e => e.name.toLowerCase() === wordLower);
        if (typeMatch) {
            const md = new vscode.MarkdownString();
            md.appendMarkdown(`*(type personnalisé)* **\`${typeMatch.name}\`** = \`${typeMatch.definition}\`\n\n`);
            md.appendMarkdown(`Défini dans le **TDNT** *(ligne ${typeMatch.line + 1})*`);
            return new vscode.Hover(md, wordRange);
        }
        // 4. Check if it's a language keyword
        if (KEYWORD_DESCRIPTIONS[wordLower]) {
            const md = new vscode.MarkdownString();
            md.appendMarkdown(`*(mot-clé)* **\`${word}\`**\n\n`);
            md.appendMarkdown(KEYWORD_DESCRIPTIONS[wordLower]);
            return new vscode.Hover(md, wordRange);
        }
        return undefined;
    }
}
exports.AlgorithmeHoverProvider = AlgorithmeHoverProvider;
/**
 * CompletionItemProvider: Proposes variables declared in TDO / TDOL / TDOG during typing in code.
 */
class AlgorithmeTdoCompletionProvider {
    provideCompletionItems(document, position) {
        const linePrefix = document.lineAt(position).text.substring(0, position.character);
        // Skip inside comments or strings
        if (/\/\/.*$/.test(linePrefix))
            return undefined;
        const quoteCount = (linePrefix.match(/"/g) || []).length;
        if (quoteCount % 2 !== 0)
            return undefined;
        const tdoEntries = parseTdoEntries(document);
        if (tdoEntries.length === 0)
            return undefined;
        const items = [];
        const seen = new Set();
        for (const entry of tdoEntries) {
            // Skip subprogram declarations in TDO (handled by SubprogramCompletionProvider)
            if (entry.isSubprogram)
                continue;
            const key = entry.name.toLowerCase();
            if (seen.has(key))
                continue;
            seen.add(key);
            const item = new vscode.CompletionItem(entry.name, vscode.CompletionItemKind.Variable);
            item.detail = `${entry.type} (${entry.table})`;
            item.documentation = new vscode.MarkdownString(`Variable **\`${entry.name}\`** de type \`${entry.type}\` déclarée dans le **${entry.table}** *(ligne ${entry.line + 1})*.`);
            item.sortText = '1_' + entry.name;
            items.push(item);
        }
        return items;
    }
}
exports.AlgorithmeTdoCompletionProvider = AlgorithmeTdoCompletionProvider;
//# sourceMappingURL=lspFeatures.js.map