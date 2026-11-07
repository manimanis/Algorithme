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
    'ecrire', 'lire', 'afficher'
]);
/**
 * Parses all scopes (main algorithm and each subprogram) in the document.
 */
function parseScopeBlocks(document) {
    const scopes = [];
    const allTdo = (0, lspFeatures_1.parseTdoEntries)(document);
    const subprograms = (0, subprogramCompletion_1.getUserSubprograms)(document);
    // 1. Identify subprogram blocks
    const subBlocks = [];
    for (let i = 0; i < document.lineCount; i++) {
        const raw = document.lineAt(i).text.trim();
        const match = raw.match(/^(?:(Proc[eé]dure)|(Fonction))\s+([\p{L}_][\p{L}\p{N}_]*)\s*(?:\(([^)]*)\))?/iu);
        if (match) {
            const isProc = Boolean(match[1]);
            const name = match[3];
            const rawParams = match[4] || '';
            const params = rawParams
                .split(/[;,]/)
                .map(p => p.trim().replace(/^@/, '').split(':')[0].trim())
                .filter(p => /^[\p{L}_][\p{L}\p{N}_]*$/u.test(p))
                .map(p => p.toLowerCase());
            subBlocks.push({
                name,
                kind: isProc ? 'procedure' : 'function',
                headerLine: i,
                params
            });
        }
    }
    // 2. Main Algorithm scope
    let mainAlgoStart = 0;
    let mainAlgoDebut = -1;
    let mainAlgoFin = -1;
    for (let i = 0; i < document.lineCount; i++) {
        const raw = document.lineAt(i).text.trim();
        if (/^Algorithme\s+/i.test(raw)) {
            mainAlgoStart = i;
        }
        else if (mainAlgoDebut === -1 && /^(d[eé]but)\b/iu.test(raw)) {
            mainAlgoDebut = i;
        }
        else if (mainAlgoDebut !== -1 && mainAlgoFin === -1) {
            const isFin = /^fin(?:\s+[\p{L}_][\p{L}\p{N}_]*)?\s*$/iu.test(raw) && !/^fin\s*(?:si|pour|tant|selon)\b/iu.test(raw);
            if (isFin) {
                mainAlgoFin = i;
                break;
            }
        }
    }
    const firstSubLine = subBlocks.length > 0 ? subBlocks[0].headerLine : document.lineCount;
    // Find the table associated with the main algorithm (before first subprogram)
    let mainTableName = 'TDO';
    let mainTableHeaderLine = -1;
    let mainTableInsertLine = -1;
    for (let i = (mainAlgoFin >= 0 ? mainAlgoFin : mainAlgoStart); i < firstSubLine; i++) {
        const raw = document.lineAt(i).text.trim();
        const tm = raw.match(/^(TDOG|TDO)\b/i);
        if (tm) {
            mainTableName = tm[1].toUpperCase();
            mainTableHeaderLine = i;
            // Skip header line (e.g. "Objet : Type/Nature")
            let nextLine = i + 1;
            while (nextLine < firstSubLine) {
                const nextText = document.lineAt(nextLine).text.trim();
                if (/^\|?\s*objet\s*[:|]/i.test(nextText) || /^[\+\-\|─┌┬┐├┼┤└┴┘╔╦╗╠╬╣╚╩╝═║\s]+$/.test(nextText)) {
                    nextLine++;
                    continue;
                }
                break;
            }
            mainTableInsertLine = nextLine;
            break;
        }
    }
    const mainDeclared = new Set();
    for (const entry of allTdo) {
        if (mainTableHeaderLine >= 0 && entry.line >= mainTableHeaderLine && entry.line < firstSubLine) {
            mainDeclared.add(entry.name.toLowerCase());
        }
    }
    if (mainAlgoDebut !== -1 && mainAlgoFin !== -1) {
        scopes.push({
            kind: 'main',
            name: 'Algorithme Principal',
            startLine: mainAlgoStart,
            endLine: firstSubLine - 1,
            debutLine: mainAlgoDebut,
            finLine: mainAlgoFin,
            tableName: mainTableName,
            tableHeaderLine: mainTableHeaderLine,
            tableInsertLine: mainTableInsertLine,
            declaredSet: mainDeclared,
            formalParams: new Set()
        });
    }
    // 3. Subprogram scopes
    for (let idx = 0; idx < subBlocks.length; idx++) {
        const sub = subBlocks[idx];
        const nextSubLine = idx + 1 < subBlocks.length ? subBlocks[idx + 1].headerLine : document.lineCount;
        let subDebut = -1;
        let subFin = -1;
        for (let i = sub.headerLine; i < nextSubLine; i++) {
            const raw = document.lineAt(i).text.trim();
            if (subDebut === -1 && /^(d[eé]but)\b/iu.test(raw)) {
                subDebut = i;
            }
            else if (subDebut !== -1 && subFin === -1) {
                const isFin = /^fin(?:\s+[\p{L}_][\p{L}\p{N}_]*)?\s*$/iu.test(raw) && !/^fin\s*(?:si|pour|tant|selon)\b/iu.test(raw);
                if (isFin) {
                    subFin = i;
                    break;
                }
            }
        }
        let subTableName = 'TDOL';
        let subTableHeaderLine = -1;
        let subTableInsertLine = -1;
        for (let i = (subFin >= 0 ? subFin : sub.headerLine); i < nextSubLine; i++) {
            const raw = document.lineAt(i).text.trim();
            const tm = raw.match(/^(TDOL|TDO)\b/i);
            if (tm) {
                subTableName = tm[1].toUpperCase();
                subTableHeaderLine = i;
                let nextLine = i + 1;
                while (nextLine < nextSubLine) {
                    const nextText = document.lineAt(nextLine).text.trim();
                    if (/^\|?\s*objet\s*[:|]/i.test(nextText) || /^[\+\-\|─┌┬┐├┼┤└┴┘╔╦╗╠╬╣╚╩╝═║\s]+$/.test(nextText)) {
                        nextLine++;
                        continue;
                    }
                    break;
                }
                subTableInsertLine = nextLine;
                break;
            }
        }
        const subDeclared = new Set();
        for (const entry of allTdo) {
            if (subTableHeaderLine >= 0 && entry.line >= subTableHeaderLine && entry.line < nextSubLine) {
                subDeclared.add(entry.name.toLowerCase());
            }
        }
        if (subDebut !== -1 && subFin !== -1) {
            scopes.push({
                kind: 'subprogram',
                name: sub.name,
                startLine: sub.headerLine,
                endLine: nextSubLine - 1,
                debutLine: subDebut,
                finLine: subFin,
                tableName: subTableName,
                tableHeaderLine: subTableHeaderLine,
                tableInsertLine: subTableInsertLine,
                declaredSet: subDeclared,
                formalParams: new Set(sub.params)
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
    // Scan ONLY between Début and Fin of this scope
    for (let i = scope.debutLine + 1; i < scope.finLine; i++) {
        let line = document.lineAt(i).text;
        // Strip comments
        line = line.replace(/\/\/.*$/, '');
        line = line.replace(/\/\*.*?\*\//g, ' ');
        // Strip string literals and character literals
        line = line.replace(/"(?:[^"\\]|\\.)*"/g, '""');
        line = line.replace(/'(?:[^'\\]|\\.)*'/g, "''");
        // Strip keywords that contain accents, apostrophes or composite words before token extraction
        line = line.replace(/jusqu['’]?[aà]/giu, ' ');
        line = line.replace(/\bfin\s*(?:si|pour|tant\s*que|selon)\b/giu, ' ');
        line = line.replace(/\b(?:finsi|finpour|fintantque|finselon|tantque)\b/giu, ' ');
        line = line.replace(/\btant\s*que\b/giu, ' ');
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
        return 'réel';
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
        const tableHeader = scope.kind === 'main' ? 'TDOG' : 'TDOL';
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