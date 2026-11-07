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
exports.AlgorithmeTdoCodeActionProvider = void 0;
exports.detectUndeclaredItems = detectUndeclaredItems;
exports.detectAllUndeclaredItems = detectAllUndeclaredItems;
exports.generateOrUpdateTDO = generateOrUpdateTDO;
const vscode = __importStar(require("vscode"));
const lspFeatures_1 = require("./lspFeatures");
const subprogramCompletion_1 = require("./subprogramCompletion");
const RESERVED_KEYWORDS = new Set([
    'algorithme', 'début', 'debut', 'fin', 'si', 'alors', 'sinon', 'finsi', 'fin si',
    'pour', 'finpour', 'fin pour', 'de', 'a', 'à', 'pas', 'faire',
    'tant', 'que', 'tant que', 'tantque', 'fintantque', 'fin tant que', 'fin tantque',
    'repeter', 'répéter', 'jusqu', 'jusqua', 'jusqu\'a', 'jusqu\'à',
    'selon', 'finselon', 'fin selon', 'cas', 'autrement',
    'div', 'mod', 'et', 'ou', 'non', 'vrai', 'faux', 'retourner', 'renvoyer',
    'type', 'var', 'const', 'constante', 'procedure', 'procédure', 'fonction', 'enregistrement', 'fichier', 'tableau', 'matrice',
    'entier', 'réel', 'reel', 'booléen', 'booleen', 'caractère', 'caractere', 'chaîne', 'chaine',
    'tdo', 'tdol', 'tdog', 'tdnt', 'objet', 'nature', 'definition', 'définition',
    'ecrire', 'lire', 'afficher', 'sep'
]);
/**
 * Parses all scopes (main algorithm and each subprogram) in the document.
 */
function parseScopeBlocks(document) {
    const scopes = [];
    const allTdo = (0, lspFeatures_1.parseTdoEntries)(document);
    const headers = [];
    for (let i = 0; i < document.lineCount; i++) {
        const raw = document.lineAt(i).text.trim();
        // Subprogram: Fonction or Procédure
        const subMatch = raw.match(/^(?:(Proc[eé]dure)|(Fonction))\s+([\p{L}_][\p{L}\p{N}_]*)\s*(?:\(([^)]*)\))?/iu);
        if (subMatch) {
            const name = subMatch[3];
            const rawParams = subMatch[4] || '';
            const params = rawParams
                .split(/[;,]/)
                .map(p => p.trim().replace(/^@/, '').split(':')[0].trim())
                .filter(p => /^[\p{L}_][\p{L}\p{N}_]*$/u.test(p))
                .map(p => p.toLowerCase());
            headers.push({
                kind: 'subprogram',
                name,
                line: i,
                params
            });
            continue;
        }
        // Main algorithm: Algorithme <Nom>
        const algoMatch = raw.match(/^Algorithme\s+([\p{L}_][\p{L}\p{N}_]*)/iu);
        if (algoMatch) {
            headers.push({
                kind: 'main',
                name: algoMatch[1] || 'Algorithme Principal',
                line: i,
                params: []
            });
            continue;
        }
    }
    // If no "Algorithme <Nom>" header was found, find the main algorithm's start
    const hasMain = headers.some(h => h.kind === 'main');
    if (!hasMain) {
        headers.push({
            kind: 'main',
            name: 'Algorithme Principal',
            line: 0,
            params: []
        });
    }
    // Sort all headers by line number
    headers.sort((a, b) => a.line - b.line);
    // 2. Build each scope block
    for (let idx = 0; idx < headers.length; idx++) {
        const h = headers[idx];
        const startLine = h.line;
        const nextHeaderLine = idx + 1 < headers.length ? headers[idx + 1].line : document.lineCount;
        const endLine = nextHeaderLine - 1;
        let debutLine = -1;
        let finLine = -1;
        for (let i = startLine; i < nextHeaderLine; i++) {
            const raw = document.lineAt(i).text.trim();
            if (debutLine === -1 && /^(d[eé]but)\b/iu.test(raw)) {
                debutLine = i;
            }
            else if (debutLine !== -1 && finLine === -1) {
                const isFin = /^fin(?:\s+[\p{L}_][\p{L}\p{N}_]*)?\s*$/iu.test(raw) && !/^fin\s*(?:si|pour|tant|selon)\b/iu.test(raw);
                if (isFin) {
                    finLine = i;
                    break;
                }
            }
        }
        // Search for table in [finLine >= 0 ? finLine : startLine, nextHeaderLine]
        let tableName = h.kind === 'main' ? 'TDO' : 'TDOL';
        let tableHeaderLine = -1;
        let tableInsertLine = -1;
        for (let i = (finLine >= 0 ? finLine : startLine); i < nextHeaderLine; i++) {
            const raw = document.lineAt(i).text.trim();
            const tm = raw.match(/^(TDOG|TDOL|TDO)\b/i);
            if (tm) {
                tableName = tm[1].toUpperCase();
                tableHeaderLine = i;
                let nextLine = i + 1;
                while (nextLine < nextHeaderLine) {
                    const nextText = document.lineAt(nextLine).text.trim();
                    if (/^\|?\s*objet\s*[:|]/i.test(nextText) || /^[\+\-\|─┌┬┐├┼┤└┴┘╔╦╗╠╬╣╚╩╝═║\s]+$/.test(nextText)) {
                        nextLine++;
                        continue;
                    }
                    break;
                }
                tableInsertLine = nextLine;
                break;
            }
        }
        const declaredSet = new Set();
        for (const entry of allTdo) {
            if (tableHeaderLine >= 0 && entry.line >= tableHeaderLine && entry.line < nextHeaderLine) {
                declaredSet.add(entry.name.toLowerCase());
            }
        }
        if (debutLine !== -1 && finLine !== -1) {
            scopes.push({
                kind: h.kind,
                name: h.name,
                startLine,
                endLine,
                debutLine,
                finLine,
                tableName,
                tableHeaderLine,
                tableInsertLine,
                declaredSet,
                formalParams: new Set(h.params)
            });
        }
    }
    return scopes;
}
/**
 * Finds the active scope from the cursor line.
 */
function getActiveScope(document, cursorLine) {
    const scopes = parseScopeBlocks(document);
    if (scopes.length === 0)
        return undefined;
    // Find scope containing cursorLine
    for (const s of scopes) {
        if (cursorLine >= s.startLine && cursorLine <= s.endLine) {
            return s;
        }
    }
    // Default to main algorithm or first scope
    const mainScope = scopes.find(s => s.kind === 'main');
    return mainScope || scopes[0];
}
/**
 * Scans a specific scope and detects missing variables and subprograms.
 */
function detectUndeclaredItemsInScope(document, scope, tdntTypes, userSubMap, builtinSubNames) {
    const missingVariablesMap = new Map();
    const missingSubprogramsMap = new Map();
    // Track multi-line block comment state from document start up to this scope
    let inBlockComment = false;
    for (let i = 0; i <= scope.debutLine; i++) {
        let line = document.lineAt(i).text;
        while (true) {
            if (inBlockComment) {
                const endCommentIdx = line.indexOf('*/');
                if (endCommentIdx !== -1) {
                    line = line.substring(endCommentIdx + 2);
                    inBlockComment = false;
                }
                else {
                    break;
                }
            }
            else {
                const startCommentIdx = line.indexOf('/*');
                if (startCommentIdx !== -1) {
                    const endCommentIdx = line.indexOf('*/', startCommentIdx + 2);
                    if (endCommentIdx !== -1) {
                        line = line.substring(0, startCommentIdx) + ' ' + line.substring(endCommentIdx + 2);
                    }
                    else {
                        inBlockComment = true;
                        break;
                    }
                }
                else {
                    break;
                }
            }
        }
    }
    // Scan ONLY between Début and Fin of this scope
    for (let i = scope.debutLine + 1; i < scope.finLine; i++) {
        let line = document.lineAt(i).text;
        // Handle multi-line block comments /* ... */
        if (inBlockComment) {
            const endCommentIdx = line.indexOf('*/');
            if (endCommentIdx !== -1) {
                line = line.substring(endCommentIdx + 2);
                inBlockComment = false;
            }
            else {
                continue;
            }
        }
        while (true) {
            const startCommentIdx = line.indexOf('/*');
            if (startCommentIdx !== -1) {
                const endCommentIdx = line.indexOf('*/', startCommentIdx + 2);
                if (endCommentIdx !== -1) {
                    line = line.substring(0, startCommentIdx) + ' ' + line.substring(endCommentIdx + 2);
                }
                else {
                    line = line.substring(0, startCommentIdx);
                    inBlockComment = true;
                    break;
                }
            }
            else {
                break;
            }
        }
        // Strip single-line comments
        line = line.replace(/\/\/.*$/, '');
        // Strip string literals and character literals
        line = line.replace(/"(?:[^"\\]|\\.)*"/g, '""');
        line = line.replace(/'(?:[^'\\]|\\.)*'/g, "''");
        // Strip keywords that contain accents, apostrophes or composite words before token extraction
        line = line.replace(/jusqu['’]?[aà]/giu, ' ');
        line = line.replace(/\bfin\s*(?:si|pour|tant\s*que|selon)\b/giu, ' ');
        line = line.replace(/\b(?:finsi|finpour|fintantque|finselon|tantque)\b/giu, ' ');
        line = line.replace(/\btant\s*que\b/giu, ' ');
        line = line.replace(/\b(?:sep|fin)\s*=/giu, ' ');
        const trimmed = line.trim();
        if (!trimmed)
            continue;
        // 1. Detect subprogram calls: e.g. "Remplir(t, n)" or "Calc(n)"
        const callRegex = /(?<=^|[^\p{L}\p{N}_])([\p{L}_][\p{L}\p{N}_]*)\s*\(/gu;
        let callMatch;
        while ((callMatch = callRegex.exec(trimmed)) !== null) {
            const callName = callMatch[1];
            const callLower = callName.toLowerCase();
            // Check if it's a user subprogram defined in the document
            if (userSubMap.has(callLower)) {
                const subDef = userSubMap.get(callLower);
                // Check if declared in this scope's table
                if (!scope.declaredSet.has(callLower)) {
                    missingSubprogramsMap.set(callLower, {
                        name: subDef.name,
                        kind: 'subprogram',
                        type: subDef.kind === 'function' ? 'Fonction' : 'Procédure',
                        line: i
                    });
                }
            }
        }
        // 2. Detect loop counter in 'Pour <var> de ...'
        const pourMatch = trimmed.match(/(?<=^|[^\p{L}\p{N}_])pour\s+([\p{L}_][\p{L}\p{N}_]*)\s+de\b/iu);
        if (pourMatch) {
            const varName = pourMatch[1];
            const varLower = varName.toLowerCase();
            if (isValidVar(varLower, scope, tdntTypes, builtinSubNames, userSubMap)) {
                if (!scope.declaredSet.has(varLower) && !missingVariablesMap.has(varLower)) {
                    missingVariablesMap.set(varLower, { name: varName, kind: 'variable', type: 'entier', line: i });
                }
            }
        }
        // 3. Detect assignments '<var> ← <expr>'
        const assignMatch = trimmed.match(/^([\p{L}_][\p{L}\p{N}_]*)(?:\[[^\]]*\])?\s*←\s*(.+)$/u);
        if (assignMatch) {
            const varName = assignMatch[1];
            const varLower = varName.toLowerCase();
            const expr = assignMatch[2].trim();
            if (isValidVar(varLower, scope, tdntTypes, builtinSubNames, userSubMap)) {
                if (!scope.declaredSet.has(varLower) && !missingVariablesMap.has(varLower)) {
                    const inferredType = inferTypeFromExpression(expr, userSubMap);
                    missingVariablesMap.set(varLower, { name: varName, kind: 'variable', type: inferredType, line: i });
                }
            }
        }
        // 4. Detect variables in 'Lire(<var1>, <var2>, ...)'
        const lireMatch = trimmed.match(/(?<=^|[^\p{L}\p{N}_])lire\s*\(([^)]+)\)/iu);
        if (lireMatch) {
            const args = lireMatch[1].split(',').map(v => v.trim().replace(/\[.*?\]/g, '')).filter(Boolean);
            for (const a of args) {
                if (/^[\p{L}_][\p{L}\p{N}_]*$/u.test(a)) {
                    const varLower = a.toLowerCase();
                    if (isValidVar(varLower, scope, tdntTypes, builtinSubNames, userSubMap)) {
                        if (!scope.declaredSet.has(varLower) && !missingVariablesMap.has(varLower)) {
                            missingVariablesMap.set(varLower, { name: a, kind: 'variable', type: 'entier', line: i });
                        }
                    }
                }
            }
        }
        // 5. Scan remaining identifiers inside expressions
        const tokenRegex = /(?<=^|[^\p{L}\p{N}_])([\p{L}_][\p{L}\p{N}_]*)(?=[^\p{L}\p{N}_]|$)/gu;
        let match;
        while ((match = tokenRegex.exec(trimmed)) !== null) {
            const token = match[1];
            const tokenLower = token.toLowerCase();
            if (isValidVar(tokenLower, scope, tdntTypes, builtinSubNames, userSubMap)) {
                if (!scope.declaredSet.has(tokenLower) && !missingVariablesMap.has(tokenLower)) {
                    missingVariablesMap.set(tokenLower, { name: token, kind: 'variable', type: 'entier', line: i });
                }
            }
        }
    }
    return {
        missingVariables: Array.from(missingVariablesMap.values()),
        missingSubprograms: Array.from(missingSubprogramsMap.values())
    };
}
/**
 * Scans the active scope and detects missing variables and subprograms.
 */
function detectUndeclaredItems(document, cursorLine = 0) {
    const scope = getActiveScope(document, cursorLine);
    if (!scope)
        return { missingVariables: [], missingSubprograms: [] };
    const tdntEntries = (0, lspFeatures_1.parseTdntEntries)(document);
    const tdntTypes = new Set(tdntEntries.map(e => e.name.toLowerCase()));
    const userSubprograms = (0, subprogramCompletion_1.getUserSubprograms)(document);
    const userSubMap = new Map();
    for (const sub of userSubprograms) {
        userSubMap.set(sub.name.toLowerCase(), sub);
    }
    const builtinSubNames = new Set(subprogramCompletion_1.BUILTIN_SUBPROGRAMS.map(s => s.name.toLowerCase()));
    const result = detectUndeclaredItemsInScope(document, scope, tdntTypes, userSubMap, builtinSubNames);
    return {
        scope,
        missingVariables: result.missingVariables,
        missingSubprograms: result.missingSubprograms
    };
}
/**
 * Scans ALL scopes in the document (main and each subprogram).
 */
function detectAllUndeclaredItems(document) {
    const scopes = parseScopeBlocks(document);
    if (scopes.length === 0)
        return [];
    const tdntEntries = (0, lspFeatures_1.parseTdntEntries)(document);
    const tdntTypes = new Set(tdntEntries.map(e => e.name.toLowerCase()));
    const userSubprograms = (0, subprogramCompletion_1.getUserSubprograms)(document);
    const userSubMap = new Map();
    for (const sub of userSubprograms) {
        userSubMap.set(sub.name.toLowerCase(), sub);
    }
    const builtinSubNames = new Set(subprogramCompletion_1.BUILTIN_SUBPROGRAMS.map(s => s.name.toLowerCase()));
    return scopes.map(scope => {
        const result = detectUndeclaredItemsInScope(document, scope, tdntTypes, userSubMap, builtinSubNames);
        return {
            scope,
            missingVariables: result.missingVariables,
            missingSubprograms: result.missingSubprograms
        };
    });
}
function isValidVar(nameLower, scope, tdntTypes, builtinSubs, userSubs) {
    if (RESERVED_KEYWORDS.has(nameLower))
        return false;
    if (tdntTypes.has(nameLower))
        return false;
    if (builtinSubs.has(nameLower))
        return false;
    if (userSubs.has(nameLower))
        return false;
    if (scope.formalParams.has(nameLower))
        return false; // Formal parameter of subprogram is already declared in signature
    if (/^\d+$/.test(nameLower))
        return false;
    return true;
}
function inferTypeFromExpression(expr, userSubs) {
    // Check if expression is a call to a function with known return type: e.g. "Calc(n)"
    const fnCallMatch = expr.match(/^([\p{L}_][\p{L}\p{N}_]*)\s*\(/u);
    if (fnCallMatch) {
        const fnName = fnCallMatch[1].toLowerCase();
        const sub = userSubs.get(fnName);
        if (sub && sub.returnType) {
            const rtLower = sub.returnType.toLowerCase();
            if (rtLower === 'reel' || rtLower === 'réel')
                return 'Réel';
            if (rtLower === 'entier')
                return 'entier';
            if (rtLower === 'chaine' || rtLower === 'chaîne')
                return 'chaîne';
            if (rtLower === 'booleen' || rtLower === 'booléen')
                return 'booléen';
            if (rtLower === 'caractere' || rtLower === 'caractère')
                return 'caractère';
            return sub.returnType;
        }
    }
    // String
    if (/^".*"$/.test(expr) || /\b(sous_chaine|convch|majus|minus)\b/i.test(expr)) {
        return 'chaîne';
    }
    // Char
    if (/^'.*'$/.test(expr) || /\bchr\b/i.test(expr)) {
        return 'caractère';
    }
    // Boolean
    if (/^(vrai|faux)$/i.test(expr) || /[≤≥≠=<>]|(?:\b(et|ou|non|estnum)\b)/i.test(expr)) {
        return 'booléen';
    }
    // Real
    if (/\//.test(expr) || /\b(racine|arrondi|exp|ln|log)\b/i.test(expr)) {
        return 'Réel';
    }
    // Integer
    if (/\b(div|mod|long|ord|ent|valeur|alea)\b/i.test(expr)) {
        return 'entier';
    }
    return 'entier';
}
/**
 * Command and Quick Fix to generate or update the TDO / TDOG / TDOL table.
 */
async function generateOrUpdateTDO(document) {
    const activeEditor = vscode.window.activeTextEditor;
    const cursorLine = activeEditor ? activeEditor.selection.active.line : 0;
    const { scope, missingVariables, missingSubprograms } = detectUndeclaredItems(document, cursorLine);
    if (!scope) {
        vscode.window.showWarningMessage("Aucun bloc d'algorithme détecté dans ce fichier.");
        return;
    }
    const totalMissing = missingVariables.length + missingSubprograms.length;
    if (totalMissing === 0) {
        vscode.window.showInformationMessage(`Tous les objets de '${scope.name}' sont déjà déclarés dans le ${scope.tableName} !`);
        return;
    }
    // Prepare lines to insert
    const linesToAdd = [];
    // 1. Variables grouped by type: e.g. "x : entier"
    const typeGroups = new Map();
    for (const v of missingVariables) {
        const list = typeGroups.get(v.type) || [];
        list.push(v.name);
        typeGroups.set(v.type, list);
    }
    for (const [type, names] of typeGroups) {
        linesToAdd.push(`${names.join(', ')} : ${type}`);
    }
    // 2. Subprograms: e.g. "Remplir : Procédure" or "Calc : Fonction"
    for (const sub of missingSubprograms) {
        linesToAdd.push(`${sub.name} : ${sub.type}`);
    }
    const editor = await vscode.window.showTextDocument(document);
    if (scope.tableHeaderLine >= 0 && scope.tableInsertLine >= 0) {
        // Insert into existing table
        const insertionText = linesToAdd.join('\n') + '\n';
        await editor.edit(builder => {
            builder.insert(new vscode.Position(scope.tableInsertLine, 0), insertionText);
        });
        const details = [];
        if (missingVariables.length > 0)
            details.push(`${missingVariables.length} variable(s) (${missingVariables.map(v => v.name).join(', ')})`);
        if (missingSubprograms.length > 0)
            details.push(`${missingSubprograms.length} sous-programme(s) (${missingSubprograms.map(s => s.name).join(', ')})`);
        vscode.window.showInformationMessage(`${details.join(' et ')} ajouté(s) avec succès au ${scope.tableName} de '${scope.name}'.`);
    }
    else {
        // Create a new table right after the finLine
        const tableHeader = scope.tableName || (scope.kind === 'main' ? 'TDO' : 'TDOL');
        const newTableText = `\n${tableHeader}\nObjet : Type/Nature\n${linesToAdd.join('\n')}\n`;
        const insertPos = new vscode.Position(scope.finLine + 1, 0);
        await editor.edit(builder => {
            builder.insert(insertPos, newTableText);
        });
        vscode.window.showInformationMessage(`Tableau ${tableHeader} généré avec succès pour '${scope.name}' avec ${totalMissing} élément(s).`);
    }
}
/**
 * CodeActionProvider: Quick Fix proposals when missing variables or subprograms are detected.
 */
class AlgorithmeTdoCodeActionProvider {
    provideCodeActions(document, range) {
        const cursorLine = range.start.line;
        const { scope, missingVariables, missingSubprograms } = detectUndeclaredItems(document, cursorLine);
        if (!scope)
            return undefined;
        const totalMissing = missingVariables.length + missingSubprograms.length;
        if (totalMissing === 0)
            return undefined;
        const missingNames = [...missingVariables.map(v => v.name), ...missingSubprograms.map(s => s.name)];
        const title = scope.tableHeaderLine >= 0
            ? `Ajouter les éléments manquants (${missingNames.join(', ')}) au ${scope.tableName}`
            : `Générer le tableau ${scope.kind === 'main' ? 'TDOG' : 'TDOL'} automatiquement (${totalMissing} élément(s))`;
        const action = new vscode.CodeAction(title, vscode.CodeActionKind.QuickFix);
        action.command = {
            command: 'algorithme.generateTDO',
            title: 'Générer / Mettre à jour le TDO'
        };
        action.isPreferred = true;
        return [action];
    }
}
exports.AlgorithmeTdoCodeActionProvider = AlgorithmeTdoCodeActionProvider;
//# sourceMappingURL=assistantFeatures.js.map