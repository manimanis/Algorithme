import * as vscode from 'vscode';

export interface BlockOpening {
  kind: 'debut' | 'si' | 'tantque' | 'pour' | 'repeter' | 'selon';
  label: string;
  expectedClose: string;
  line: number;
  col: number;
  length: number;
}

export const DIAGNOSTIC_CODE_MISSING_CLOSE = 'algorithme-missing-close';
export const DIAGNOSTIC_CODE_UNEXPECTED_CLOSE = 'algorithme-unexpected-close';

/**
 * Checks a line and returns whether it opens a new block.
 */
export function getOpeningBlockFromLine(rawText: string): { kind: BlockOpening['kind']; label: string; expectedClose: string } | null {
  // Strip comments and strings
  const code = rawText
    .replace(/\/\/.*$/, '')
    .replace(/"(?:[^"\\]|\\.)*"/g, '""')
    .trim();

  if (!code) return null;

  // Single-line block checks: if the line opens AND closes on the same line, return null
  if (/(?<=^|[^\p{L}\p{N}_])si(?=[^\p{L}\p{N}_]|$).*?(?<=^|[^\p{L}\p{N}_])alors(?=[^\p{L}\p{N}_]|$).*?(?<=^|[^\p{L}\p{N}_])fin\s+si(?=[^\p{L}\p{N}_]|$)/iu.test(code)) {
    return null;
  }
  if (/(?<=^|[^\p{L}\p{N}_])tant\s+que(?=[^\p{L}\p{N}_]|$).*?(?<=^|[^\p{L}\p{N}_])faire(?=[^\p{L}\p{N}_]|$).*?(?<=^|[^\p{L}\p{N}_])fin\s+tant\s+que(?=[^\p{L}\p{N}_]|$)/iu.test(code)) {
    return null;
  }
  if (/(?<=^|[^\p{L}\p{N}_])pour(?=[^\p{L}\p{N}_]|$).*?(?<=^|[^\p{L}\p{N}_])faire(?=[^\p{L}\p{N}_]|$).*?(?<=^|[^\p{L}\p{N}_])fin\s+pour(?=[^\p{L}\p{N}_]|$)/iu.test(code)) {
    return null;
  }
  if (/(?<=^|[^\p{L}\p{N}_])(r[eé]p[eé]ter)(?=[^\p{L}\p{N}_]|$).*?(?<=^|[^\p{L}\p{N}_])jusqu['’]?[aà](?=[^\p{L}\p{N}_]|$)/iu.test(code)) {
    return null;
  }

  // 1. Début
  if (/(?<=^|[^\p{L}\p{N}_])(d[eé]but)(?=[^\p{L}\p{N}_]|$)/iu.test(code)) {
    if (!/(?<=^|[^\p{L}\p{N}_])fin(?=[^\p{L}\p{N}_]|$)/iu.test(code)) {
      return { kind: 'debut', label: 'Début', expectedClose: 'Fin' };
    }
  }

  // 2. Si ... Alors (excluding 'Sinon Si ... Alors')
  if (/(?<=^|[^\p{L}\p{N}_])si(?=[^\p{L}\p{N}_]|$).*?(?<=^|[^\p{L}\p{N}_])alors(?=[^\p{L}\p{N}_]|$)/iu.test(code)) {
    if (!/(?<=^|[^\p{L}\p{N}_])sinon\s+si(?=[^\p{L}\p{N}_]|$)/iu.test(code)) {
      return { kind: 'si', label: 'Si ... Alors', expectedClose: 'Fin Si' };
    }
  }

  // 3. Tant Que ... Faire
  if (/(?<=^|[^\p{L}\p{N}_])tant\s+que(?=[^\p{L}\p{N}_]|$).*?(?<=^|[^\p{L}\p{N}_])faire(?=[^\p{L}\p{N}_]|$)/iu.test(code)) {
    return { kind: 'tantque', label: 'Tant Que ... Faire', expectedClose: 'Fin Tant Que' };
  }

  // 4. Pour ... Faire
  if (/(?<=^|[^\p{L}\p{N}_])pour(?=[^\p{L}\p{N}_]|$).*?(?<=^|[^\p{L}\p{N}_])faire(?=[^\p{L}\p{N}_]|$)/iu.test(code)) {
    return { kind: 'pour', label: 'Pour ... Faire', expectedClose: 'Fin Pour' };
  }

  // 5. Répéter
  if (/(?<=^|[^\p{L}\p{N}_])(r[eé]p[eé]ter)(?=[^\p{L}\p{N}_]|$)/iu.test(code)) {
    return { kind: 'repeter', label: 'Répéter', expectedClose: "Jusqu'à " };
  }

  // 6. Selon
  if (/(?<=^|[^\p{L}\p{N}_])selon(?=[^\p{L}\p{N}_]|$)/iu.test(code)) {
    return { kind: 'selon', label: 'Selon', expectedClose: 'Fin Selon' };
  }

  return null;
}

/**
 * Checks if the block opened at lineIndex is unclosed in the document.
 */
export function isBlockUnclosedFromLine(document: vscode.TextDocument, startLineIndex: number): boolean {
  const diagnostics = validateAlgorithmeBlocks(document);
  return diagnostics.some(diag => diag.range.start.line === startLineIndex && diag.code === DIAGNOSTIC_CODE_MISSING_CLOSE);
}

/**
 * Parses the document and returns diagnostics for unclosed or unexpected closing expressions.
 */
export function validateAlgorithmeBlocks(document: vscode.TextDocument): vscode.Diagnostic[] {
  const diagnostics: vscode.Diagnostic[] = [];
  const stack: BlockOpening[] = [];

  let inBlockComment = false;
  let inTableSection = false;

  const tokenRegex = /(?<=^|[^\p{L}\p{N}_])(fin\s+si|fin\s+tant\s+que|fin\s+pour|fin\s+selon|jusqu['’]?[aà]|d[eé]but|sinon\s+si|si|alors|tant\s+que|pour|faire|r[eé]p[eé]ter|selon|fin)(?=[^\p{L}\p{N}_]|$)/giu;

  for (let lineIndex = 0; lineIndex < document.lineCount; lineIndex++) {
    const rawLine = document.lineAt(lineIndex).text;
    let line = rawLine;

    // Handle block comments /* ... */
    if (inBlockComment) {
      const endCommentIdx = line.indexOf('*/');
      if (endCommentIdx !== -1) {
        line = line.substring(endCommentIdx + 2);
        inBlockComment = false;
      } else {
        continue;
      }
    }

    const startCommentIdx = line.indexOf('/*');
    if (startCommentIdx !== -1) {
      const endCommentIdx = line.indexOf('*/', startCommentIdx + 2);
      if (endCommentIdx !== -1) {
        line = line.substring(0, startCommentIdx) + ' ' + line.substring(endCommentIdx + 2);
      } else {
        line = line.substring(0, startCommentIdx);
        inBlockComment = true;
      }
    }

    // Strip line comment
    const lineCommentIdx = line.indexOf('//');
    if (lineCommentIdx !== -1) {
      line = line.substring(0, lineCommentIdx);
    }

    // Strip string literals
    line = line.replace(/"(?:[^"\\]|\\.)*"/g, '""');

    const trimmed = line.trim();
    if (!trimmed) continue;

    // Check for TDO / TDNT / TDOG / TDOL sections
    if (/^(TDNT|TDOG|TDOL|TDO)\b/i.test(trimmed)) {
      inTableSection = true;
      continue;
    }
    if (inTableSection) {
      if (/^(algorithme|proc[eé]dure|fonction)\b/i.test(trimmed)) {
        inTableSection = false;
      } else {
        continue;
      }
    }

    tokenRegex.lastIndex = 0;
    let match: RegExpExecArray | null;
    const tokens: Array<{ word: string; lower: string; index: number; end: number }> = [];

    while ((match = tokenRegex.exec(line)) !== null) {
      tokens.push({
        word: match[1],
        lower: match[1].toLowerCase().replace(/\s+/g, ' '),
        index: match.index,
        end: match.index + match[1].length
      });
    }

    let i = 0;
    while (i < tokens.length) {
      const tok = tokens[i];
      const lower = tok.lower;

      // Skip 'Sinon Si ... Alors' branches
      if (lower === 'sinon si') {
        i++;
        while (i < tokens.length && tokens[i].lower !== 'alors') i++;
        if (i < tokens.length && tokens[i].lower === 'alors') i++;
        continue;
      }

      // 1. Début
      if (lower === 'd\u00e9but' || lower === 'debut') {
        stack.push({
          kind: 'debut',
          label: 'Début',
          expectedClose: 'Fin',
          line: lineIndex,
          col: tok.index,
          length: tok.word.length
        });
        i++;
        continue;
      }

      // 2. Si
      if (lower === 'si') {
        let j = i + 1;
        while (j < tokens.length && tokens[j].lower !== 'alors') j++;
        if (j < tokens.length && tokens[j].lower === 'alors') {
          stack.push({
            kind: 'si',
            label: 'Si ... Alors',
            expectedClose: 'Fin Si',
            line: lineIndex,
            col: tok.index,
            length: tokens[j].end - tok.index
          });
          i = j + 1;
          continue;
        } else {
          stack.push({
            kind: 'si',
            label: 'Si ... Alors',
            expectedClose: 'Fin Si',
            line: lineIndex,
            col: tok.index,
            length: tok.word.length
          });
          i++;
          continue;
        }
      }

      if (lower === 'alors') {
        i++;
        continue;
      }

      // 3. Tant Que
      if (lower === 'tant que') {
        let j = i + 1;
        while (j < tokens.length && tokens[j].lower !== 'faire') j++;
        if (j < tokens.length && tokens[j].lower === 'faire') {
          stack.push({
            kind: 'tantque',
            label: 'Tant Que ... Faire',
            expectedClose: 'Fin Tant Que',
            line: lineIndex,
            col: tok.index,
            length: tokens[j].end - tok.index
          });
          i = j + 1;
          continue;
        } else {
          stack.push({
            kind: 'tantque',
            label: 'Tant Que ... Faire',
            expectedClose: 'Fin Tant Que',
            line: lineIndex,
            col: tok.index,
            length: tok.word.length
          });
          i++;
          continue;
        }
      }

      // 4. Pour
      if (lower === 'pour') {
        let j = i + 1;
        while (j < tokens.length && tokens[j].lower !== 'faire') j++;
        if (j < tokens.length && tokens[j].lower === 'faire') {
          stack.push({
            kind: 'pour',
            label: 'Pour ... Faire',
            expectedClose: 'Fin Pour',
            line: lineIndex,
            col: tok.index,
            length: tokens[j].end - tok.index
          });
          i = j + 1;
          continue;
        } else {
          stack.push({
            kind: 'pour',
            label: 'Pour ... Faire',
            expectedClose: 'Fin Pour',
            line: lineIndex,
            col: tok.index,
            length: tok.word.length
          });
          i++;
          continue;
        }
      }

      // 5. Répéter
      if (lower === 'r\u00e9p\u00e9ter' || lower === 'repeter') {
        stack.push({
          kind: 'repeter',
          label: 'Répéter',
          expectedClose: "Jusqu'à",
          line: lineIndex,
          col: tok.index,
          length: tok.word.length
        });
        i++;
        continue;
      }

      // 6. Selon
      if (lower === 'selon') {
        stack.push({
          kind: 'selon',
          label: 'Selon',
          expectedClose: 'Fin Selon',
          line: lineIndex,
          col: tok.index,
          length: tok.word.length
        });
        i++;
        continue;
      }

      // Closing tokens
      if (lower === 'fin si') {
        matchClosing('si', 'Fin Si', lineIndex, tok);
        i++;
        continue;
      }
      if (lower === 'fin tant que') {
        matchClosing('tantque', 'Fin Tant Que', lineIndex, tok);
        i++;
        continue;
      }
      if (lower === 'fin pour') {
        matchClosing('pour', 'Fin Pour', lineIndex, tok);
        i++;
        continue;
      }
      if (lower === 'fin selon') {
        matchClosing('selon', 'Fin Selon', lineIndex, tok);
        i++;
        continue;
      }
      if (/^jusqu['’]?[aà]$/i.test(lower)) {
        matchClosing('repeter', "Jusqu'à", lineIndex, tok);
        i++;
        continue;
      }

      // Standalone 'Fin' for 'Début'
      if (lower === 'fin') {
        const beforeToken = line.substring(0, tok.index).trim();
        const afterToken = line.substring(tok.end).trim();

        // Discard if preceded by operator or expression keyword
        if (/[≤≥≠=+\-*\/,(\[<>]|(?:\b(?:de|[aà]|dans|et|ou|non)\b)\s*$/i.test(beforeToken)) {
          i++;
          continue;
        }

        // Discard if followed by colon or operator
        if (/^:\s*\w+|^[≤≥≠=+\-*\/)\]<>]/.test(afterToken)) {
          i++;
          continue;
        }

        matchClosing('debut', 'Fin', lineIndex, tok);
        i++;
        continue;
      }

      i++;
    }
  }

  function matchClosing(kind: BlockOpening['kind'], closeKeyword: string, lineIndex: number, tok: { word: string; index: number }) {
    if (stack.length === 0) {
      const range = new vscode.Range(lineIndex, tok.index, lineIndex, tok.index + tok.word.length);
      const diag = new vscode.Diagnostic(
        range,
        `Expression fermante '${closeKeyword}' inattendue (aucun bloc ouvert correspondant).`,
        vscode.DiagnosticSeverity.Error
      );
      diag.source = 'Algorithme';
      diag.code = DIAGNOSTIC_CODE_UNEXPECTED_CLOSE;
      diagnostics.push(diag);
      return;
    }

    const top = stack[stack.length - 1];
    if (top.kind === kind) {
      stack.pop();
      return;
    }

    // Search deeper in the stack
    let foundIndex = -1;
    for (let k = stack.length - 1; k >= 0; k--) {
      if (stack[k].kind === kind) {
        foundIndex = k;
        break;
      }
    }

    if (foundIndex !== -1) {
      // Pop all blocks opened after foundIndex as unclosed
      while (stack.length > foundIndex + 1) {
        const unclosed = stack.pop()!;
        const range = new vscode.Range(unclosed.line, unclosed.col, unclosed.line, unclosed.col + unclosed.length);
        const diag = new vscode.Diagnostic(
          range,
          `Expression fermante manquante : '${unclosed.expectedClose}' pour le bloc '${unclosed.label}' ouvert à la ligne ${unclosed.line + 1}.`,
          vscode.DiagnosticSeverity.Error
        );
        diag.source = 'Algorithme';
        diag.code = DIAGNOSTIC_CODE_MISSING_CLOSE;
        diagnostics.push(diag);
      }
      // Pop the matched block
      stack.pop();
    } else {
      const range = new vscode.Range(lineIndex, tok.index, lineIndex, tok.index + tok.word.length);
      const diag = new vscode.Diagnostic(
        range,
        `Expression fermante '${closeKeyword}' inattendue alors que le bloc '${top.label}' (ligne ${top.line + 1}) est en cours.`,
        vscode.DiagnosticSeverity.Error
      );
      diag.source = 'Algorithme';
      diag.code = DIAGNOSTIC_CODE_UNEXPECTED_CLOSE;
      diagnostics.push(diag);
    }
  }

  // Any remaining items on stack at EOF are unclosed
  while (stack.length > 0) {
    const unclosed = stack.pop()!;
    const range = new vscode.Range(unclosed.line, unclosed.col, unclosed.line, unclosed.col + unclosed.length);
    const diag = new vscode.Diagnostic(
      range,
      `Expression fermante manquante : '${unclosed.expectedClose}' pour le bloc '${unclosed.label}'.`,
      vscode.DiagnosticSeverity.Error
    );
    diag.source = 'Algorithme';
    diag.code = DIAGNOSTIC_CODE_MISSING_CLOSE;
    diagnostics.push(diag);
  }

  return diagnostics;
}

/**
 * Quick Fix CodeActionProvider for automatically inserting missing closing expressions.
 */
export class BlockQuickFixProvider implements vscode.CodeActionProvider {
  public static readonly providedCodeActionKinds = [vscode.CodeActionKind.QuickFix];

  provideCodeActions(
    document: vscode.TextDocument,
    range: vscode.Range | vscode.Selection,
    context: vscode.CodeActionContext
  ): vscode.CodeAction[] {
    const actions: vscode.CodeAction[] = [];

    for (const diagnostic of context.diagnostics) {
      if (diagnostic.code === DIAGNOSTIC_CODE_MISSING_CLOSE && diagnostic.source === 'Algorithme') {
        const match = diagnostic.message.match(/Expression fermante manquante\s*:\s*['"]([^'"]+)['"]/i);
        if (match) {
          const closeKeyword = match[1];
          const action = new vscode.CodeAction(`Insérer '${closeKeyword}'`, vscode.CodeActionKind.QuickFix);
          action.diagnostics = [diagnostic];
          action.isPreferred = true;

          const openLine = document.lineAt(diagnostic.range.start.line);
          const indent = openLine.text.match(/^\s*/)?.[0] || '';

          // Determine insertion position: after the last line of the block or before outer closing
          const insertLine = Math.min(document.lineCount - 1, diagnostic.range.start.line + 1);
          const edit = new vscode.WorkspaceEdit();
          edit.insert(document.uri, new vscode.Position(insertLine, 0), `${indent}${closeKeyword}\n`);
          action.edit = edit;

          actions.push(action);
        }
      }
    }

    return actions;
  }
}
