import * as vscode from 'vscode';

export interface ParamInfo {
  name: string;
  type?: string;
  description?: string;
  defaultValue?: string;
}

export interface SubprogramDef {
  name: string;
  kind: 'function' | 'procedure';
  signature: string;
  returnType?: string;
  params: ParamInfo[];
  description: string;
  snippetBody?: string;
}

export const BUILTIN_SUBPROGRAMS: SubprogramDef[] = [
  {
    name: 'Ecrire',
    kind: 'procedure',
    signature: 'Ecrire(message, [sep = " "], [fin = "\\n"])',
    params: [
      { name: 'message', description: "Valeur(s) ou expression(s) à afficher à l'écran ou dans la console." },
      { name: 'sep', description: "Séparateur affiché entre chaque paramètre (défaut : espace).", defaultValue: '" "' },
      { name: 'fin', description: "Caractère de fin ajouté à la fin de l'affichage (défaut : retour à la ligne '\\n').", defaultValue: '"\\n"' }
    ],
    snippetBody: 'Ecrire(${1:message})',
    description: "Affiche un ou plusieurs messages ou valeurs dans la console avec retour à la ligne par défaut."
  },
  {
    name: 'Ecrire (avec séparateur et fin)',
    kind: 'procedure',
    signature: 'Ecrire(message, sep = " ", fin = "\\n")',
    params: [
      { name: 'message', description: "Valeur(s) ou expression(s) à afficher." },
      { name: 'sep', description: "Séparateur utilisé entre les valeurs affichées.", defaultValue: '" "' },
      { name: 'fin', description: "Caractère de fin de ligne.", defaultValue: '"\\n"' }
    ],
    snippetBody: 'Ecrire(${1:message}, sep="${2: }", fin="${3:\\n}")',
    description: "Affiche des valeurs en spécifiant un séparateur 'sep' et un caractère de terminaison 'fin'."
  },
  {
    name: 'Lire',
    kind: 'procedure',
    signature: 'Lire(variable)',
    params: [
      { name: 'variable', description: "Variable(s) destinataire(s) de la saisie utilisateur au clavier." }
    ],
    snippetBody: 'Lire(${1:variable})',
    description: "Lit une valeur saisie au clavier par l'utilisateur et l'enregistre dans la variable."
  },
  {
    name: 'Ouvrir',
    kind: 'procedure',
    signature: 'Ouvrir(chemin, f, mode)',
    params: [
      { name: 'chemin', description: "Nom ou chemin physique du fichier à ouvrir (ex : 'notes.txt')." },
      { name: 'f', description: "Variable fichier logique déclarée dans le TDO." },
      { name: 'mode', description: "Mode d'ouverture : 'r' (lecture texte), 'w' (écriture), 'a' (ajout), 'rb', 'wb', 'ab'." }
    ],
    snippetBody: 'Ouvrir("${1:fichier.txt}", ${2:f}, "${3|r,w,a,rb,wb,ab|}")',
    description: "Associe et ouvre un fichier physique avec une variable fichier logique selon le mode spécifié."
  },
  {
    name: 'Fermer',
    kind: 'procedure',
    signature: 'Fermer(f)',
    params: [
      { name: 'f', description: "Variable fichier logique à fermer." }
    ],
    snippetBody: 'Fermer(${1:f})',
    description: "Ferme un fichier logique préalablement ouvert avec Ouvrir."
  },
  {
    name: 'Lire_ligne',
    kind: 'procedure',
    signature: 'Lire_ligne(f, ch)',
    params: [
      { name: 'f', description: "Fichier logique texte ouvert en mode lecture ('r')." },
      { name: 'ch', description: "Variable chaîne qui recevra le contenu de la ligne lue." }
    ],
    snippetBody: 'Lire_ligne(${1:f}, ${2:ligne})',
    description: "Lit toute une ligne de texte depuis le fichier et l'assigne à la chaîne."
  },
  {
    name: 'Ecrire_nl',
    kind: 'procedure',
    signature: 'Ecrire_nl(f, message)',
    params: [
      { name: 'f', description: "Fichier logique texte ouvert en écriture ou en ajout." },
      { name: 'message', description: "Valeur ou chaîne à écrire dans le fichier avec un saut de ligne." }
    ],
    snippetBody: 'Ecrire_nl(${1:f}, ${2:message})',
    description: "Écrit une ligne dans le fichier logique spécifié avec ajout automatique d'un retour à la ligne."
  },
  {
    name: 'Fin_fichier',
    kind: 'function',
    returnType: 'booléen',
    signature: 'Fin_fichier(f) : booléen',
    params: [
      { name: 'f', description: "Variable fichier logique ouvert en lecture." }
    ],
    snippetBody: 'Fin_fichier(${1:f})',
    description: "Indique si la fin du fichier logique est atteinte (retourne Vrai ou Faux)."
  },
  {
    name: 'Sous_chaine',
    kind: 'function',
    returnType: 'chaîne',
    signature: 'Sous_chaine(ch, d, f) : chaîne',
    params: [
      { name: 'ch', description: "Chaîne source." },
      { name: 'd', description: "Position de début (indice 0-indexé)." },
      { name: 'f', description: "Position de fin (ou longueur selon convention)." }
    ],
    snippetBody: 'Sous_chaine(${1:ch}, ${2:debut}, ${3:fin})',
    description: "Extrait une sous-chaîne de caractères à partir de la position début."
  },
  {
    name: 'Effacer',
    kind: 'function',
    returnType: 'chaîne',
    signature: 'Effacer(ch, d, f) : chaîne',
    params: [
      { name: 'ch', description: "Chaîne d'origine." },
      { name: 'd', description: "Position de début de suppression." },
      { name: 'f', description: "Position de fin de suppression." }
    ],
    snippetBody: 'Effacer(${1:ch}, ${2:debut}, ${3:fin})',
    description: "Supprime les caractères compris entre les positions début et fin."
  },
  {
    name: 'Pos',
    kind: 'function',
    returnType: 'entier',
    signature: 'Pos(motif, ch) : entier',
    params: [
      { name: 'motif', description: "Sous-chaîne ou caractère recherché." },
      { name: 'ch', description: "Chaîne dans laquelle effectuer la recherche." }
    ],
    snippetBody: 'Pos(${1:motif}, ${2:ch})',
    description: "Recherche la première occurrence d'un motif dans une chaîne (-1 si non trouvé)."
  },
  {
    name: 'Convch',
    kind: 'function',
    returnType: 'chaîne',
    signature: 'Convch(nombre) : chaîne',
    params: [
      { name: 'nombre', description: "Nombre entier ou réel à convertir." }
    ],
    snippetBody: 'Convch(${1:nombre})',
    description: "Convertit une valeur numérique en chaîne de caractères."
  },
  {
    name: 'Valeur',
    kind: 'function',
    returnType: 'entier / réel',
    signature: 'Valeur(ch) : entier ou réel',
    params: [
      { name: 'ch', description: "Chaîne représentant un nombre à convertir." }
    ],
    snippetBody: 'Valeur(${1:ch})',
    description: "Convertit une chaîne numérique en entier ou en réel."
  },
  {
    name: 'Long',
    kind: 'function',
    returnType: 'entier',
    signature: 'Long(ch) : entier',
    params: [
      { name: 'ch', description: "Chaîne de caractères ou tableau." }
    ],
    snippetBody: 'Long(${1:ch})',
    description: "Renvoie le nombre de caractères d'une chaîne ou la taille d'un tableau."
  },
  {
    name: 'Majus',
    kind: 'function',
    returnType: 'chaîne',
    signature: 'Majus(ch) : chaîne',
    params: [
      { name: 'ch', description: "Chaîne de caractères à convertir." }
    ],
    snippetBody: 'Majus(${1:ch})',
    description: "Convertit tous les caractères alphabétiques d'une chaîne en majuscules."
  },
  {
    name: 'Minus',
    kind: 'function',
    returnType: 'chaîne',
    signature: 'Minus(ch) : chaîne',
    params: [
      { name: 'ch', description: "Chaîne de caractères à convertir." }
    ],
    snippetBody: 'Minus(${1:ch})',
    description: "Convertit tous les caractères alphabétiques d'une chaîne en minuscules."
  },
  {
    name: 'Chr',
    kind: 'function',
    returnType: 'caractère',
    signature: 'Chr(code) : caractère',
    params: [
      { name: 'code', description: "Code ASCII entier (0 à 255)." }
    ],
    snippetBody: 'Chr(${1:code})',
    description: "Retourne le caractère correspondant au code ASCII spécifié."
  },
  {
    name: 'Ord',
    kind: 'function',
    returnType: 'entier',
    signature: 'Ord(caractère) : entier',
    params: [
      { name: 'caractère', description: "Caractère dont on souhaite obtenir le code ASCII." }
    ],
    snippetBody: 'Ord(${1:caractere})',
    description: "Retourne le code ASCII entier associé au caractère."
  },
  {
    name: 'Alea',
    kind: 'function',
    returnType: 'entier',
    signature: 'Alea(min, max) : entier',
    params: [
      { name: 'min', description: "Borne inférieure inclusive." },
      { name: 'max', description: "Borne supérieure inclusive." }
    ],
    snippetBody: 'Alea(${1:min}, ${2:max})',
    description: "Génère un entier pseudo-aléatoire compris entre min et max inclus."
  },
  {
    name: 'Racine',
    kind: 'function',
    returnType: 'réel',
    signature: 'Racine(x) : réel',
    params: [
      { name: 'x', description: "Nombre réel ou entier positif." }
    ],
    snippetBody: 'Racine(${1:x})',
    description: "Calcule la racine carrée d'un nombre positif."
  },
  {
    name: 'Ent',
    kind: 'function',
    returnType: 'entier',
    signature: 'Ent(x) : entier',
    params: [
      { name: 'x', description: "Nombre réel." }
    ],
    snippetBody: 'Ent(${1:reel})',
    description: "Retourne la partie entière d'un nombre réel (arrondi vers le bas)."
  },
  {
    name: 'Arrondi',
    kind: 'function',
    returnType: 'entier',
    signature: 'Arrondi(x) : entier',
    params: [
      { name: 'x', description: "Nombre réel à arrondir." }
    ],
    snippetBody: 'Arrondi(${1:reel})',
    description: "Retourne l'arrondi arithmétique d'un nombre réel à l'entier le plus proche."
  },
  {
    name: 'Abs',
    kind: 'function',
    returnType: 'entier / réel',
    signature: 'Abs(x) : nombre',
    params: [
      { name: 'x', description: "Nombre entier ou réel." }
    ],
    snippetBody: 'Abs(${1:nombre})',
    description: "Retourne la valeur absolue d'un nombre."
  },
  {
    name: 'Estnum',
    kind: 'function',
    returnType: 'booléen',
    signature: 'Estnum(ch) : booléen',
    params: [
      { name: 'ch', description: "Chaîne à analyser." }
    ],
    snippetBody: 'Estnum(${1:ch})',
    description: "Vérifie si la chaîne de caractères représente un nombre valide (Vrai ou Faux)."
  },
  {
    name: 'Exp',
    kind: 'function',
    returnType: 'réel',
    signature: 'Exp(x) : réel',
    params: [
      { name: 'x', description: "Exposant réel." }
    ],
    snippetBody: 'Exp(${1:x})',
    description: "Calcule la fonction exponentielle e^x."
  },
  {
    name: 'Ln',
    kind: 'function',
    returnType: 'réel',
    signature: 'Ln(x) : réel',
    params: [
      { name: 'x', description: "Nombre réel strictement positif." }
    ],
    snippetBody: 'Ln(${1:x})',
    description: "Calcule le logarithme népérien d'un réel strictement positif."
  },
  {
    name: 'Graine',
    kind: 'procedure',
    signature: 'Graine(valeur)',
    params: [
      { name: 'valeur', description: "Entier utilisé pour initialiser le générateur aléatoire." }
    ],
    snippetBody: 'Graine(${1:valeur})',
    description: "Initialise la graine du générateur de nombres aléatoires."
  }
];

/**
 * Scans the given document to discover user-defined Fonctions and Procédures.
 */
export function getUserSubprograms(document: vscode.TextDocument): SubprogramDef[] {
  const result: SubprogramDef[] = [];
  const procRegex = /^\s*(?:Proc[eé]dure)\s+([a-zA-Z_][\w]*)\s*(?:\(([^)]*)\))?/i;
  const funcRegex = /^\s*(?:Fonction)\s+([a-zA-Z_][\w]*)\s*(?:\(([^)]*)\))?\s*(?::\s*([a-zA-Z_][\w]*))?/i;

  for (let i = 0; i < document.lineCount; i++) {
    const line = document.lineAt(i).text.trim();
    if (!line || line.startsWith('//') || line.startsWith('/*')) continue;

    const funcMatch = line.match(funcRegex);
    if (funcMatch) {
      const name = funcMatch[1];
      const rawParams = funcMatch[2] ? funcMatch[2].trim() : '';
      const retType = funcMatch[3] ? funcMatch[3].trim() : undefined;
      const params = parseRawParams(rawParams);
      const snippetBody = buildSnippet(name, params);

      result.push({
        name,
        kind: 'function',
        signature: `${line}`,
        returnType: retType,
        params,
        snippetBody,
        description: `Fonction définie ligne ${i + 1} du document.`
      });
      continue;
    }

    const procMatch = line.match(procRegex);
    if (procMatch) {
      const name = procMatch[1];
      const rawParams = procMatch[2] ? procMatch[2].trim() : '';
      const params = parseRawParams(rawParams);
      const snippetBody = buildSnippet(name, params);

      result.push({
        name,
        kind: 'procedure',
        signature: `${line}`,
        params,
        snippetBody,
        description: `Procédure définie ligne ${i + 1} du document.`
      });
    }
  }

  return result;
}

function parseRawParams(raw: string): ParamInfo[] {
  if (!raw || !raw.trim()) return [];
  const params: ParamInfo[] = [];

  // Split by ';' first
  const semiParts = raw.split(';').map(s => s.trim()).filter(s => s.length > 0);

  for (const part of semiParts) {
    // If the part contains colons: e.g. "@res : Tableau, n : Entier" or "x, y : Entier"
    // Each group is: <identifiers> : <type>
    const groupRegex = /([^:]+):\s*([^,;]+)(?:,|$)/g;
    let match: RegExpExecArray | null;
    let foundGroup = false;

    while ((match = groupRegex.exec(part)) !== null) {
      foundGroup = true;
      const namesPart = match[1].trim();
      const typePart = match[2].trim();
      const names = namesPart.split(',').map(n => n.trim().replace(/^@/, '')).filter(Boolean);
      for (const n of names) {
        params.push({ name: n, type: typePart });
      }
    }

    if (!foundGroup) {
      // Untyped parameters: e.g. "a, b, c"
      const names = part.split(',').map(n => n.trim().replace(/^@/, '')).filter(Boolean);
      for (const n of names) {
        params.push({ name: n });
      }
    }
  }

  return params;
}

function buildSnippet(name: string, params: ParamInfo[]): string {
  if (params.length === 0) {
    return `${name}()`;
  }
  const args = params.map((p, idx) => `\${${idx + 1}:${p.name}}`).join(', ');
  return `${name}(${args})`;
}

/**
 * CompletionItemProvider proposing subprogram names with default parameter snippets.
 */
export class SubprogramCompletionProvider implements vscode.CompletionItemProvider {
  provideCompletionItems(
    document: vscode.TextDocument,
    position: vscode.Position
  ): vscode.ProviderResult<vscode.CompletionItem[]> {
    const linePrefix = document.lineAt(position).text.substring(0, position.character);

    // Skip inside comments
    if (/\/\/.*$/.test(linePrefix)) return undefined;

    // Skip inside strings
    const quoteCount = (linePrefix.match(/"/g) || []).length;
    if (quoteCount % 2 !== 0) return undefined;

    const items: vscode.CompletionItem[] = [];

    // 1. Built-in subprograms
    for (const def of BUILTIN_SUBPROGRAMS) {
      const item = new vscode.CompletionItem(def.name, def.kind === 'function' ? vscode.CompletionItemKind.Function : vscode.CompletionItemKind.Method);
      item.detail = def.signature;
      const doc = new vscode.MarkdownString();
      doc.appendMarkdown(`**${def.signature}**\n\n${def.description}\n\n`);
      if (def.params.length > 0) {
        doc.appendMarkdown('**Paramètres :**\n');
        for (const p of def.params) {
          doc.appendMarkdown(`- \`${p.name}\`${p.type ? ` (*${p.type}*)` : ''} : ${p.description || ''}${p.defaultValue ? ` *(défaut : \`${p.defaultValue}\`)*` : ''}\n`);
        }
      }
      item.documentation = doc;
      item.insertText = new vscode.SnippetString(def.snippetBody || `${def.name}()`);
      items.push(item);
    }

    // 2. User-defined subprograms in the current document
    const userDefs = getUserSubprograms(document);
    for (const def of userDefs) {
      const item = new vscode.CompletionItem(def.name, def.kind === 'function' ? vscode.CompletionItemKind.Function : vscode.CompletionItemKind.Method);
      item.detail = def.signature;
      const doc = new vscode.MarkdownString();
      doc.appendMarkdown(`**${def.signature}**\n\n${def.description}\n\n`);
      if (def.params.length > 0) {
        doc.appendMarkdown('**Paramètres :**\n');
        for (const p of def.params) {
          doc.appendMarkdown(`- \`${p.name}\`${p.type ? ` (*${p.type}*)` : ''}\n`);
        }
      }
      item.documentation = doc;
      item.insertText = new vscode.SnippetString(def.snippetBody || `${def.name}()`);
      // Prioritize user functions slightly higher or equal
      item.sortText = '0_' + def.name;
      items.push(item);
    }

    return items;
  }
}

/**
 * SignatureHelpProvider displaying the parameter tooltip as the user types arguments.
 */
export class SubprogramSignatureHelpProvider implements vscode.SignatureHelpProvider {
  provideSignatureHelp(
    document: vscode.TextDocument,
    position: vscode.Position
  ): vscode.ProviderResult<vscode.SignatureHelp> {
    const textBefore = document.lineAt(position).text.substring(0, position.character);

    // Look backward for an unmatched open parenthesis
    let parenDepth = 0;
    let openParenIndex = -1;
    let commaCount = 0;

    for (let i = textBefore.length - 1; i >= 0; i--) {
      const ch = textBefore[i];
      if (ch === ')') parenDepth++;
      else if (ch === '(') {
        if (parenDepth === 0) {
          openParenIndex = i;
          break;
        } else {
          parenDepth--;
        }
      } else if (ch === ',' && parenDepth === 0) {
        commaCount++;
      }
    }

    if (openParenIndex === -1) return undefined;

    // Find function name before openParenIndex
    const beforeParen = textBefore.substring(0, openParenIndex).trimEnd();
    const match = beforeParen.match(/([a-zA-Z_][\w]*)$/);
    if (!match) return undefined;

    const fnName = match[1];
    const fnNorm = fnName.toLowerCase();

    // Match against builtins or user subprograms
    const allDefs = [...getUserSubprograms(document), ...BUILTIN_SUBPROGRAMS];
    const def = allDefs.find(d => d.name.toLowerCase() === fnNorm);
    if (!def) return undefined;

    const sigHelp = new vscode.SignatureHelp();
    const sigInfo = new vscode.SignatureInformation(def.signature, new vscode.MarkdownString(def.description));

    for (const p of def.params) {
      const pDoc = `${p.name}${p.type ? ` : ${p.type}` : ''}${p.description ? ` - ${p.description}` : ''}`;
      sigInfo.parameters.push(new vscode.ParameterInformation(p.name, new vscode.MarkdownString(pDoc)));
    }

    sigHelp.signatures = [sigInfo];
    sigHelp.activeSignature = 0;
    sigHelp.activeParameter = Math.min(commaCount, Math.max(0, def.params.length - 1));

    return sigHelp;
  }
}
