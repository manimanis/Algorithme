import * as vscode from 'vscode';

let isProcessing = false;

export function activate(context: vscode.ExtensionContext) {
    console.log('Algorithme extension activated');

    // --- Auto-replacement on type ---
    const replaceDisposable = vscode.workspace.onDidChangeTextDocument((event: vscode.TextDocumentChangeEvent) => {
        if (isProcessing) return;
        if (event.document.languageId !== 'algorithme') return;

        const editor = vscode.window.activeTextEditor;
        if (!editor || editor.document.uri.toString() !== event.document.uri.toString()) return;

        for (const change of event.contentChanges) {
            const text = change.text;
            if (text.length === 0) continue;

            const line = change.range.start.line;
            const lineText = editor.document.lineAt(line).text;
            const col = change.range.start.character + text.length;

            let fromLine = line;
            let fromCol = -1;
            let toLine = line;
            let toCol = -1;
            let replaceWith = '';

            if (text === ' ') {
                if (col >= 3) {
                    const before = lineText.substring(0, col - 1);
                    if (before.match(/\bgt$/i)) {
                        fromCol = col - 2; toCol = col; replaceWith = '> ';
                    }
                }
                if (fromCol < 0 && col >= 3) {
                    const before = lineText.substring(0, col - 1);
                    if (before.match(/\blt$/i)) {
                        fromCol = col - 2; toCol = col; replaceWith = '< ';
                    }
                }
                if (fromCol < 0 && col >= 5) {
                    const before = lineText.substring(0, col - 1);
                    const m = before.match(/\bdans$/i);
                    if (m && m.index !== undefined) {
                        fromCol = m.index; toCol = col; replaceWith = '∈ ';
                    }
                }
            }
            else if (text === '=') {
                if (col >= 2 && lineText[col - 2] === '>') {
                    fromCol = col - 2; toCol = col; replaceWith = '≥';
                }
                else if (col >= 2 && lineText[col - 2] === '<') {
                    fromCol = col - 2; toCol = col; replaceWith = '≤';
                }
                else if (col >= 2 && lineText[col - 2] === '!') {
                    fromCol = col - 2; toCol = col; replaceWith = '≠';
                }
            }
            else if (/^[^a-zA-Z0-9\s=]/.test(text) && text !== '=') {
                if (col >= 5) {
                    const before = lineText.substring(0, col - 1);
                    const m = before.match(/\bdans$/i);
                    if (m && m.index !== undefined) {
                        fromCol = m.index; toCol = col; replaceWith = '∈' + text;
                    }
                }
            }

            if (fromCol >= 0 && replaceWith !== '') {
                isProcessing = true;
                const range = new vscode.Range(fromLine, fromCol, toLine, toCol);
                setTimeout(() => {
                    editor.edit((builder) => {
                        builder.replace(range, replaceWith);
                    }).then(() => {
                        isProcessing = false;
                    }, () => {
                        isProcessing = false;
                    });
                }, 0);
                return;
            }
        }
    });

    context.subscriptions.push(replaceDisposable);

    // --- Document Formatter (Format Document) ---
    // Keywords that open a block (next lines should be indented)
    const openBlockRegex = /\b(Début|DEBUT|debut|Faire|FAIRE|faire|Alors|ALORS|alors)\b/;
    // Keywords that close a block (current line should be unindented)
    const closeBlockRegex = /\b(Fin|fin|FIN|Jusqu'à|jusqu'à|jusqua|JUSQUA)\b/;
    // Keywords that contain "Fin" but also start a block (e.g., "Fin Si" closes, don't treat as open)
    const closeOnlyRegex = /\b(Fin\s+Si|fin\s+si|Fin\s+Tant\s+Que|fin\s+tant\s+que)\b/;

    const formatter = vscode.languages.registerDocumentFormattingEditProvider('algorithme', {
        provideDocumentFormattingEdits(document: vscode.TextDocument): vscode.TextEdit[] {
            const edits: vscode.TextEdit[] = [];
            const indentSize = 2;
            let indentLevel = 0;

            for (let i = 0; i < document.lineCount; i++) {
                const line = document.lineAt(i);
                const text = line.text;
                const trimmed = text.trim();

                // Preserve empty lines as empty
                if (trimmed.length === 0) {
                    if (text !== '') {
                        edits.push(vscode.TextEdit.replace(line.range, ''));
                    }
                    continue;
                }

                // Check if this line itself is a closing keyword → reduce indent before formatting
                if (closeBlockRegex.test(trimmed) && !openBlockRegex.test(trimmed)) {
                    indentLevel = Math.max(0, indentLevel - 1);
                }

                const indent = ' '.repeat(indentLevel * indentSize);
                const newText = indent + trimmed;

                if (newText !== text) {
                    edits.push(vscode.TextEdit.replace(line.range, newText));
                }

                // After formatting, check if this line opens a block → increase indent for next lines
                if (openBlockRegex.test(trimmed) && !closeOnlyRegex.test(trimmed)) {
                    indentLevel++;
                }
            }

            return edits;
        }
    });

    context.subscriptions.push(formatter);
}

export function deactivate() {}