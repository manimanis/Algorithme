import * as vscode from 'vscode';
import * as path from 'path';
import * as fs from 'fs';
import * as os from 'os';
import { spawn } from 'child_process';
import {
  validateAlgorithmeBlocks,
  getOpeningBlockFromLine,
  isBlockUnclosedFromLine,
  BlockQuickFixProvider
} from './blockValidator';

let isProcessing = false;
let previewPanel: vscode.WebviewPanel | undefined = undefined;
let currentPreviewDocument: vscode.TextDocument | undefined = undefined;
let webviewLoaded = false; // true once the shell HTML has been set on the panel

export function activate(context: vscode.ExtensionContext) {
  console.log('Algorithme extension activated');

  // --- Block Diagnostics (Vérification de l'existence des expressions fermantes) ---
  const diagnosticCollection = vscode.languages.createDiagnosticCollection('algorithme');
  context.subscriptions.push(diagnosticCollection);

  let diagTimeout: NodeJS.Timeout | undefined;
  function updateDiagnostics(doc: vscode.TextDocument) {
    if (doc.languageId !== 'algorithme') return;
    if (diagTimeout) clearTimeout(diagTimeout);
    diagTimeout = setTimeout(() => {
      const diagnostics = validateAlgorithmeBlocks(doc);
      diagnosticCollection.set(doc.uri, diagnostics);
    }, 150);
  }

  // Function to strictly enforce 2-space indentation on Algorithme editors
  function enforceIndentation(editor: vscode.TextEditor | undefined) {
    if (editor && editor.document.languageId === 'algorithme') {
      editor.options.tabSize = 2;
      editor.options.indentSize = 2;
      editor.options.insertSpaces = true;
    }
  }

  // Initial validation & indentation enforcement
  if (vscode.window.activeTextEditor && vscode.window.activeTextEditor.document.languageId === 'algorithme') {
    enforceIndentation(vscode.window.activeTextEditor);
    updateDiagnostics(vscode.window.activeTextEditor.document);
  }

  context.subscriptions.push(
    vscode.workspace.onDidOpenTextDocument(doc => {
      if (doc.languageId === 'algorithme') {
        updateDiagnostics(doc);
        enforceIndentation(vscode.window.activeTextEditor);
      }
    }),
    vscode.workspace.onDidSaveTextDocument(doc => updateDiagnostics(doc)),
    vscode.window.onDidChangeActiveTextEditor(editor => {
      if (editor && editor.document.languageId === 'algorithme') {
        enforceIndentation(editor);
        updateDiagnostics(editor.document);
      }
    }),
    vscode.workspace.onDidCloseTextDocument(doc => diagnosticCollection.delete(doc.uri))
  );

  // Register Quick Fix provider (CodeActionProvider)
  context.subscriptions.push(
    vscode.languages.registerCodeActionsProvider('algorithme', new BlockQuickFixProvider(), {
      providedCodeActionKinds: BlockQuickFixProvider.providedCodeActionKinds
    })
  );

  // --- Auto-replacement on type & Auto-closing of blocks ---
  const replaceDisposable = vscode.workspace.onDidChangeTextDocument((event: vscode.TextDocumentChangeEvent) => {
    if (event.document.languageId !== 'algorithme') return;

    updateDiagnostics(event.document);

    if (isProcessing) return;

    const editor = vscode.window.activeTextEditor;
    if (!editor || editor.document.uri.toString() !== event.document.uri.toString()) return;

    for (const change of event.contentChanges) {
      const text = change.text;
      if (text.length === 0) continue;

      // Auto-closing of blocks on Enter
      if (text.includes('\n')) {
        const prevLineIndex = change.range.start.line;
        if (prevLineIndex >= 0 && prevLineIndex < editor.document.lineCount) {
          const prevLineText = editor.document.lineAt(prevLineIndex).text;
          const opening = getOpeningBlockFromLine(prevLineText);
          if (opening) {
            setTimeout(() => {
              try {
                const currentEditor = vscode.window.activeTextEditor;
                if (!currentEditor || currentEditor.document.uri.toString() !== event.document.uri.toString()) return;

                // Verify that the block is currently unclosed in the document
                if (isBlockUnclosedFromLine(currentEditor.document, prevLineIndex)) {
                  const currentLine = prevLineIndex + 1;
                  if (currentLine < currentEditor.document.lineCount) {
                    const baseIndent = prevLineText.match(/^\s*/)?.[0] || '';
                    const closeText = `\n${baseIndent}${opening.expectedClose}`;
                    const lineEnd = currentEditor.document.lineAt(currentLine).range.end;

                    isProcessing = true;
                    currentEditor.edit(builder => {
                      builder.insert(lineEnd, closeText);
                    }, { undoStopBefore: false, undoStopAfter: false }).then(() => {
                      isProcessing = false;
                      updateDiagnostics(currentEditor.document);
                    }, () => {
                      isProcessing = false;
                    });
                  }
                }
              } catch {
                isProcessing = false;
              }
            }, 30);
          }
        }
      }

      const line = change.range.start.line;
      const lineText = editor.document.lineAt(line).text;
      const col = change.range.start.character + text.length;

      let fromLine = line;
      let fromCol = -1;
      let toLine = line;
      let toCol = -1;
      let replaceWith = '';

      if (text === ' ') {
        const before = lineText.substring(0, col - 1);
        const mDans = before.match(/(?<=^|[^\p{L}\p{N}_])dans$/iu);
        if (mDans && mDans.index !== undefined) {
          fromCol = mDans.index;
          toCol = col;
          replaceWith = '∈ ';
        } else {
          const mGt = before.match(/(?<=^|[^\p{L}\p{N}_])gt$/iu);
          if (mGt && mGt.index !== undefined) {
            fromCol = mGt.index;
            toCol = col;
            replaceWith = '> ';
          } else {
            const mLt = before.match(/(?<=^|[^\p{L}\p{N}_])lt$/iu);
            if (mLt && mLt.index !== undefined) {
              fromCol = mLt.index;
              toCol = col;
              replaceWith = '< ';
            }
          }
        }
      }
      else if (text === '=') {
        if (col >= 2) {
          const prevChar = lineText[col - 2];
          if (prevChar === '>') {
            fromCol = col - 2;
            toCol = col;
            replaceWith = '≥';
          } else if (prevChar === '<') {
            fromCol = col - 2;
            toCol = col;
            replaceWith = '≤';
          } else if (prevChar === '!') {
            fromCol = col - 2;
            toCol = col;
            replaceWith = '≠';
          }
        }
      }
      else if (text === '-') {
        if (col >= 2 && lineText[col - 2] === '<') {
          fromCol = col - 2;
          toCol = col;
          replaceWith = '←';
        }
      }
      else if (text === '>') {
        if (col >= 2 && lineText[col - 2] === '<') {
          fromCol = col - 2;
          toCol = col;
          replaceWith = '≠';
        }
      }
      else if (/^[^a-zA-Z0-9\s=]/.test(text)) {
        const before = lineText.substring(0, col - text.length);
        const m = before.match(/(?<=^|[^\p{L}\p{N}_])dans$/iu);
        if (m && m.index !== undefined) {
          fromCol = m.index;
          toCol = col;
          replaceWith = '∈' + text;
        }
      }

      if (fromCol >= 0 && replaceWith !== '') {
        isProcessing = true;
        const range = new vscode.Range(fromLine, fromCol, toLine, toCol);
        setTimeout(() => {
          try {
            const currentEditor = vscode.window.activeTextEditor;
            if (!currentEditor || currentEditor.document.uri.toString() !== event.document.uri.toString()) {
              isProcessing = false;
              return;
            }
            currentEditor.edit((builder) => {
              builder.replace(range, replaceWith);
            }, { undoStopBefore: false, undoStopAfter: false }).then(() => {
              isProcessing = false;
            }, () => {
              isProcessing = false;
            });
          } catch {
            isProcessing = false;
          }
        }, 0);
        return;
      }
    }
  });

  context.subscriptions.push(replaceDisposable);

  // --- Document Formatter (Format Document) ---
  const openBlockRegex = /(?<=^|[^\p{L}\p{N}_])(début|debut|faire|alors|répéter|repeter|sinon|enregistrement)\s*$|^\s*selon\b/iu;
  const closeBlockRegex = /^\s*([fF][iI][nN](\s*([sS][iI]|[pP][oO][uU][rR]|[tT][aA][nN][tT]\s*[qQ][uU][eE]|[sS][eE][lL][oO][nN]|[eE][nN][rR][eE][gG][iI][sS][tT][rR][eE][mM][eE][nN][tT]))?|[sS][iI][nN][oO][nN])\b|^\s*[jJ][uU][sS][qQ][uU]['’]?[aàAÀ]/iu;
  const middleBlockRegex = /^\s*(sinon|autrement)\b/iu;

  const formatter = vscode.languages.registerDocumentFormattingEditProvider('algorithme', {
    provideDocumentFormattingEdits(document: vscode.TextDocument): vscode.TextEdit[] {
      const edits: vscode.TextEdit[] = [];
      const indentSize = 2;
      let indentLevel = 0;

      for (let i = 0; i < document.lineCount; i++) {
        const line = document.lineAt(i);
        const text = line.text;
        const trimmed = text.trim();

        if (trimmed.length === 0) {
          if (text !== '') {
            edits.push(vscode.TextEdit.replace(line.range, ''));
          }
          continue;
        }

        if (trimmed.startsWith('//') || trimmed.startsWith('/*')) {
          const indent = ' '.repeat(indentLevel * indentSize);
          const newText = indent + trimmed;
          if (newText !== text) {
            edits.push(vscode.TextEdit.replace(line.range, newText));
          }
          continue;
        }

        const codeOnly = trimmed
          .replace(/\/\/.*$/, '')
          .replace(/"[^"]*"/g, '""')
          .trim();

        const isMiddle = middleBlockRegex.test(codeOnly);
        const isClose = closeBlockRegex.test(codeOnly) && !openBlockRegex.test(codeOnly);
        const isOpen = openBlockRegex.test(codeOnly) && !closeBlockRegex.test(codeOnly);

        let currentIndent = indentLevel;

        if (isClose) {
          indentLevel = Math.max(0, indentLevel - 1);
          currentIndent = indentLevel;
        } else if (isMiddle) {
          currentIndent = Math.max(0, indentLevel - 1);
        }

        const indent = ' '.repeat(currentIndent * indentSize);
        const newText = indent + trimmed;

        if (newText !== text) {
          edits.push(vscode.TextEdit.replace(line.range, newText));
        }

        if (isOpen && !isMiddle) {
          indentLevel++;
        }
      }

      return edits;
    }
  });

  context.subscriptions.push(formatter);

  // --- Visual Preview Command (Aperçu avec tableaux TDNT / TDO) ---
  const previewCommand = vscode.commands.registerCommand('algorithme.showPreview', () => {
    const editor = vscode.window.activeTextEditor;
    if (!editor) {
      vscode.window.showInformationMessage("Ouvrez d'abord un fichier d'algorithme (.alg).");
      return;
    }

    currentPreviewDocument = editor.document;
    const fileName = path.basename(editor.document.fileName);

    if (previewPanel) {
      previewPanel.title = `Aperçu : ${fileName}`;
      previewPanel.reveal(vscode.ViewColumn.Beside);
    } else {
      previewPanel = vscode.window.createWebviewPanel(
        'algorithmePreview',
        `Aperçu : ${fileName}`,
        vscode.ViewColumn.Beside,
        {
          enableScripts: true,
          retainContextWhenHidden: true
        }
      );

      // Handle actions sent from the webview
      previewPanel.webview.onDidReceiveMessage(async (message) => {
        if (message.command === 'exportWord') {
          const rawTitle = message.fileName || 'algorithme';
          const baseName = rawTitle.replace(/\.alg$/i, '');
          const docName = `${baseName}.doc`;

          let defaultUri: vscode.Uri;
          if (currentPreviewDocument && currentPreviewDocument.uri.scheme === 'file') {
            const folder = path.dirname(currentPreviewDocument.uri.fsPath);
            defaultUri = vscode.Uri.file(path.join(folder, docName));
          } else if (vscode.workspace.workspaceFolders && vscode.workspace.workspaceFolders.length > 0) {
            defaultUri = vscode.Uri.file(path.join(vscode.workspace.workspaceFolders[0].uri.fsPath, docName));
          } else {
            defaultUri = vscode.Uri.file(docName);
          }

          const saveUri = await vscode.window.showSaveDialog({
            defaultUri: defaultUri,
            filters: {
              'Document Microsoft Word (*.doc)': ['doc']
            },
            title: 'Enregistrer le document Word'
          });

          if (saveUri) {
            try {
              fs.writeFileSync(saveUri.fsPath, '\ufeff' + message.content, 'utf8');
              const choice = await vscode.window.showInformationMessage(
                `Document Word créé : ${path.basename(saveUri.fsPath)}`,
                'Ouvrir dans Word',
                "Afficher dans l'explorateur"
              );
              if (choice === 'Ouvrir dans Word') {
                vscode.env.openExternal(saveUri);
              } else if (choice === "Afficher dans l'explorateur") {
                vscode.commands.executeCommand('revealFileInOS', saveUri);
              }
            } catch (err: any) {
              vscode.window.showErrorMessage(`Erreur lors de l'enregistrement : ${err.message}`);
            }
          }
        } else if (message.command === 'copyWord') {
          try {
            if (process.platform === 'win32') {
              await copyHtmlToWindowsClipboard(message.html, message.text);
            } else if (!message.copiedByWebview) {
              await vscode.env.clipboard.writeText(message.text);
            }
            vscode.window.showInformationMessage('✅ Algorithme copié avec coloration syntaxique ! Collez directement dans Word (Ctrl+V).');
            previewPanel?.webview.postMessage({
              command: 'toast',
              text: '✅ Copié avec coloration ! Collez dans Word avec Ctrl+V.'
            });
          } catch (err: any) {
            await vscode.env.clipboard.writeText(message.text);
            vscode.window.showInformationMessage('Copié dans le presse-papiers (texte brut). Utilisez « Exporter .doc » pour ouvrir directement dans Word avec couleurs et tableaux.');
            previewPanel?.webview.postMessage({
              command: 'toast',
              text: 'Copié ! Pour couleurs et tableaux, utilisez "Exporter .doc".'
            });
          }
        } else if (message.command === 'print') {
          const tempDir = os.tmpdir();
          const tempFile = path.join(tempDir, `algo_print_${Date.now()}.html`);
          const printDoc = `<!DOCTYPE html><html><head><meta charset="utf-8"><title>${message.title || 'Algorithme'}</title><style>body{font-family:'Segoe UI',Arial,sans-serif;padding:24px;color:#000;} table{border-collapse:collapse;width:100%;margin:12px 0;} th,td{border:1.5pt solid black;padding:0.1cm;font-size:\s*12pt;} th{background:#f2f2f2;font-weight:bold;} .code-container{font-family:Consolas,'Courier New',monospace;font-size:\s*12pt;line-height:1.45;margin:12px 0;} .keyword{color:#0000ff;font-weight:bold;} .type{color:#008080;} .string{color:#a31515;} .comment{color:#008000;font-style:italic;} .function{color:#795e26;} .operator{color:#d73a49;font-weight:bold;} @media print{button{display:none;}}</style></head><body><script>window.onload=function(){window.print();};<\/script>${message.html}</body></html>`;
          fs.writeFileSync(tempFile, printDoc, 'utf8');
          vscode.env.openExternal(vscode.Uri.file(tempFile));
        }
      });

      previewPanel.onDidDispose(() => {
        previewPanel = undefined;
        currentPreviewDocument = undefined;
        webviewLoaded = false;
      });
    }

    updatePreview(previewPanel, editor.document);
  });

  context.subscriptions.push(previewCommand);

  // --- Execution Command (Lancement de l'interpréteur algo.exe) ---
  const runCommand = vscode.commands.registerCommand('algorithme.run', async (fileUri?: vscode.Uri) => {
    let document: vscode.TextDocument | undefined;

    if (fileUri && fileUri.fsPath) {
      document = await vscode.workspace.openTextDocument(fileUri);
    } else if (vscode.window.activeTextEditor) {
      document = vscode.window.activeTextEditor.document;
    }

    if (!document) {
      vscode.window.showWarningMessage("Veuillez ouvrir ou sélectionner un fichier d'algorithme (.alg) à exécuter.");
      return;
    }

    if (document.languageId !== 'algorithme' && !/\.(alg|algo|algorithme)$/i.test(document.fileName)) {
      vscode.window.showWarningMessage("Le fichier sélectionné n'est pas un algorithme (.alg, .algo, .algorithme).");
      return;
    }

    if (document.isDirty) {
      await document.save();
    }

    const config = vscode.workspace.getConfiguration('algorithme');
    let interpreterPath = config.get<string>('interpreterPath');
    if (!interpreterPath || interpreterPath.trim() === '') {
      interpreterPath = 'C:\\xampp-school\\htdocs\\MesProjets\\AlgorithmCompiler\\algo.exe';
    }

    if (!fs.existsSync(interpreterPath)) {
      const chooseAction = "Sélectionner algo.exe...";
      const selected = await vscode.window.showErrorMessage(
        `L'interpréteur d'algorithmes est introuvable à l'emplacement configuré : ${interpreterPath}`,
        chooseAction
      );
      if (selected === chooseAction) {
        const picked = await vscode.window.showOpenDialog({
          canSelectMany: false,
          openLabel: "Sélectionner algo.exe",
          filters: { 'Exécutables': ['exe', 'bat', 'cmd', '*'] }
        });
        if (picked && picked[0]) {
          interpreterPath = picked[0].fsPath;
          await config.update('interpreterPath', interpreterPath, vscode.ConfigurationTarget.Global);
          vscode.window.showInformationMessage(`Chemin de l'interpréteur mis à jour : ${interpreterPath}`);
        } else {
          return;
        }
      } else {
        return;
      }
    }

    const filePath = document.fileName;
    const workingDir = path.dirname(filePath);

    let terminal = vscode.window.terminals.find(t => t.name === 'Algorithme');
    if (!terminal) {
      terminal = vscode.window.createTerminal({
        name: 'Algorithme',
        cwd: workingDir
      });
    }

    terminal.show();

    const shell = (vscode.env.shell || '').toLowerCase();
    let runCommandStr: string;

    if (shell.includes('powershell') || shell.includes('pwsh')) {
      runCommandStr = `& "${interpreterPath}" "${filePath}"`;
    } else if (shell.includes('bash') || shell.includes('sh') || shell.includes('zsh')) {
      const escapedExe = interpreterPath.replace(/\\/g, '/');
      const escapedFile = filePath.replace(/\\/g, '/');
      runCommandStr = `"${escapedExe}" "${escapedFile}"`;
    } else {
      // cmd.exe ou autre
      runCommandStr = `"${interpreterPath}" "${filePath}"`;
    }

    terminal.sendText(runCommandStr);
  });

  context.subscriptions.push(runCommand);

  // Live update preview on edits
  const docChangeDisposable = vscode.workspace.onDidChangeTextDocument((e) => {
    if (previewPanel && currentPreviewDocument && e.document.uri.toString() === currentPreviewDocument.uri.toString()) {
      updatePreview(previewPanel, e.document);
    }
  });
  context.subscriptions.push(docChangeDisposable);

  // Update preview when switching active editor to another .alg file
  const editorChangeDisposable = vscode.window.onDidChangeActiveTextEditor((editor) => {
    if (previewPanel && editor && editor.document.languageId === 'algorithme') {
      currentPreviewDocument = editor.document;
      previewPanel.title = `Aperçu : ${path.basename(editor.document.fileName)}`;
      updatePreview(previewPanel, editor.document);
    }
  });
  context.subscriptions.push(editorChangeDisposable);
}

// --- Preview Generation & Parsing ---

interface TableBlock {
  title: string;
  headers: [string, string];
  rows: Array<[string, string]>;
}

type ContentItem =
  | { type: 'code'; lines: string[] }
  | { type: 'table'; data: TableBlock };

function getNonce(): string {
  let text = '';
  const possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  for (let i = 0; i < 32; i++) {
    text += possible.charAt(Math.floor(Math.random() * possible.length));
  }
  return text;
}

function updatePreview(panel: vscode.WebviewPanel, document: vscode.TextDocument) {
  const text = document.getText();
  const title = path.basename(document.fileName);
  const items = parseAlgorithme(text);
  const contentHtml = buildContentHtml(items);

  if (!webviewLoaded) {
    // First load: embed content directly in the HTML (no postMessage dependency)
    webviewLoaded = true;
    const nonce = getNonce();
    panel.webview.html = generateHtml(title, contentHtml, nonce, panel.webview.cspSource);
  } else {
    // Subsequent updates: only update the content div via postMessage (keeps vsCodeApi alive)
    panel.webview.postMessage({
      command: 'update',
      content: contentHtml,
      title: title
    });
  }
}

function parseAlgorithme(text: string): ContentItem[] {
  const lines = text.split(/\r?\n/);
  const items: ContentItem[] = [];
  let currentCodeLines: string[] = [];

  function flushCode() {
    if (currentCodeLines.length > 0) {
      let start = 0;
      while (start < currentCodeLines.length && currentCodeLines[start].trim() === '') start++;
      let end = currentCodeLines.length - 1;
      while (end >= start && currentCodeLines[end].trim() === '') end--;

      if (start <= end) {
        items.push({ type: 'code', lines: currentCodeLines.slice(start, end + 1) });
      }
      currentCodeLines = [];
    }
  }

  let i = 0;
  while (i < lines.length) {
    const line = lines[i];
    const trimmed = line.trim();

    const tableMatch = trimmed.match(/^(TDNT|TDOG|TDOL|TDO)\b/i);
    if (tableMatch) {
      flushCode();
      const tableTitle = tableMatch[1].toUpperCase();
      const isTdnt = tableTitle === 'TDNT';
      const headers: [string, string] = isTdnt
        ? ['Type', 'Définition']
        : ['Objet', 'Type/Nature'];
      const rows: Array<[string, string]> = [];

      i++;
      while (i < lines.length) {
        const rowLine = lines[i];
        const rowTrim = rowLine.trim();

        if (rowTrim.length === 0) {
          let j = i + 1;
          while (j < lines.length && lines[j].trim().length === 0) j++;
          if (j < lines.length) {
            const nextTrim = lines[j].trim();
            if (/^(TDNT|TDOG|TDOL|TDO|Algorithme|Procédure|Procedure|Fonction|Début|Debut)\b/i.test(nextTrim)) {
              i = j;
              break;
            }
          }
          i++;
          continue;
        }

        if (
          /^(TDNT|TDOG|TDOL|TDO|Algorithme|Procédure|Procedure|Fonction|Début|Debut|Fin|Si|Tant\s+que|Pour|Répéter|Repeter|Selon|Écrire|Ecrire|Lire)\b/i.test(rowTrim) ||
          rowTrim.startsWith('//') ||
          rowTrim.includes('←')
        ) {
          break;
        }

        // Ignore border lines (+---+, ┌───┐, ╔═══╗, etc.)
        if (/^[\+\-\|┌┬┐├┼┤└┴┘╔╦╗╠╬╣╚╩╝═║─│\s]+$/.test(rowTrim)) {
          i++;
          continue;
        }

        // Pipe or Box-drawing cells: | Objet | Type | or │ Objet │ Type │
        if (/[\|│]/.test(rowTrim)) {
          const parts = rowTrim.split(/[\|│]/).map(s => s.trim()).filter(s => s.length > 0);
          if (parts.length >= 2) {
            const p0 = parts[0].toLowerCase();
            const p1 = parts[1].toLowerCase();
            if ((p0 === 'objet' || p0 === 'type') && (p1.includes('nature') || p1.includes('déf') || p1.includes('def') || p1.includes('type') || p1.includes('description'))) {
              headers[0] = parts[0];
              headers[1] = parts[1];
            } else {
              rows.push([parts[0], parts.slice(1).join(' ')]);
            }
          }
          i++;
          continue;
        }

        // Colon separator: Nom : Type or Objet : Type/Nature
        if (rowTrim.includes(':')) {
          const colonIdx = rowTrim.indexOf(':');
          const left = rowTrim.substring(0, colonIdx).trim();
          const right = rowTrim.substring(colonIdx + 1).trim();

          if (left.toLowerCase() === 'objet' && (right.toLowerCase().includes('type') || right.toLowerCase().includes('nature'))) {
            headers[0] = left;
            headers[1] = right;
            i++;
            continue;
          } else if (left.toLowerCase() === 'type' && (right.toLowerCase().includes('déf') || right.toLowerCase().includes('def') || right.toLowerCase().includes('description'))) {
            headers[0] = left;
            headers[1] = right;
            i++;
            continue;
          } else if (/^enregistrement\b/i.test(right)) {
            // Multi-line Enregistrement in TDO
            let recordDef = right;
            i++;
            while (i < lines.length) {
              const fLine = lines[i];
              const fTrim = fLine.trim();
              if (fTrim.length === 0) { i++; continue; }
              if (/^fin(\s+enregistrement)?\b/i.test(fTrim)) {
                recordDef += '\n' + fTrim;
                i++;
                break;
              }
              if (/^(TDNT|TDOG|TDOL|TDO|Algorithme|Procédure|Procedure|Fonction|Début|Debut)\b/i.test(fTrim)) {
                break;
              }
              recordDef += '\n  ' + fTrim;
              i++;
            }
            rows.push([left, recordDef]);
            continue;
          } else {
            rows.push([left, right]);
            i++;
            continue;
          }
        }

        // Equal separator for TDNT: Tab1 = Tableau de 50 entier or Nom = Enregistrement
        if (rowTrim.includes('=')) {
          const eqIdx = rowTrim.indexOf('=');
          const left = rowTrim.substring(0, eqIdx).trim();
          const right = rowTrim.substring(eqIdx + 1).trim();

          if (/^enregistrement\b/i.test(right)) {
            // Multi-line Enregistrement in TDNT
            let recordDef = right;
            i++;
            while (i < lines.length) {
              const fLine = lines[i];
              const fTrim = fLine.trim();
              if (fTrim.length === 0) { i++; continue; }
              if (/^fin(\s+enregistrement)?\b/i.test(fTrim)) {
                recordDef += '\n' + fTrim;
                i++;
                break;
              }
              if (/^(TDNT|TDOG|TDOL|TDO|Algorithme|Procédure|Procedure|Fonction|Début|Debut)\b/i.test(fTrim)) {
                break;
              }
              recordDef += '\n  ' + fTrim;
              i++;
            }
            rows.push([left, recordDef]);
            continue;
          } else {
            rows.push([left, right]);
            i++;
            continue;
          }
        }

        rows.push([rowTrim, '']);
        i++;
      }

      items.push({
        type: 'table',
        data: {
          title: tableTitle,
          headers,
          rows
        }
      });
      continue;
    }

    currentCodeLines.push(line);
    i++;
  }

  flushCode();
  return items;
}

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

const KEYWORDS_SET = new Set([
  'algorithme', 'début', 'debut', 'fin', 'si', 'alors', 'sinon', 'faire',
  'répéter', 'repeter', 'pour', 'de', 'pas',
  'procédure', 'procedure', 'fonction', 'tableau', 'selon', 'cas', 'autrement', 'retourner',
  'et', 'ou', 'non', 'vrai', 'faux', 'div', 'mod',
  'enregistrement', 'enregistrements', 'fichier', 'fichiers', 'lignes', 'colonnes', 'ligne', 'colonne', 'type', 'var'
]);

const TYPES_SET = new Set([
  'entier', 'réel', 'reel', 'booléen', 'booleen', 'caractère', 'caractere', 'chaîne', 'chaine', 'matrice', 'enregistrement', 'fichier', 'tableau'
]);

const FUNCTIONS_SET = new Set([
  'lire', 'ecrire', 'écrire', 'ecrire_nl', 'écrire_nl', 'lire_ligne', 'ouvrir', 'fermer', 'fin_fichier', 'finfichier',
  'alea', 'aléa', 'chr', 'ord', 'racine', 'pos', 'sous_chaine', 'souschaine', 'effacer', 'long', 'ent',
  'estnum', 'est_num', 'convch', 'valeur', 'majus', 'minus', 'abs', 'arrondi', 'exp', 'ln', 'log', 'graine'
]);

function highlightAlgorithmeLine(line: string): string {
  const indentMatch = line.match(/^(\s*)/);
  const indentLength = indentMatch ? indentMatch[1].length : 0;
  const indentHtml = '&nbsp;'.repeat(indentLength);

  const text = line.substring(indentLength);

  // Single-pass tokenizer
  const tokenRegex = /(\/\/.*$)|(".*?")|(\b(?:fin\s+si|fin\s+tant\s+que|fin\s+pour|fin\s+selon|fin\s+enregistrement|fichier\s+texte|tant\s+que)\b)|((?<=^|[^\p{L}\p{N}_])(?:jusqu['’]à|jusqu['’]a|jusqua|jusqu_à)(?=[^\p{L}\p{N}_]|$))|((?<=[\s(])à(?=[\s)]|$))|([\p{L}_][\p{L}\p{N}_]*)|(\.\.|←|≤|≥|≠|∈|@)/giu;

  let result = '';
  let lastIndex = 0;
  let match: RegExpExecArray | null;

  while ((match = tokenRegex.exec(text)) !== null) {
    if (match.index > lastIndex) {
      result += escapeHtml(text.substring(lastIndex, match.index));
    }
    lastIndex = tokenRegex.lastIndex;

    const [, comment, str, multiKw, jusqua, prepA, word, op] = match;

    if (comment !== undefined) {
      result += `<span class="comment" style="color:#008000;font-style:italic;"><font color="#008000"><i>${escapeHtml(comment)}</i></font></span>`;
    } else if (str !== undefined) {
      result += `<span class="string" style="color:#a31515;"><font color="#a31515">${escapeHtml(str)}</font></span>`;
    } else if (multiKw !== undefined) {
      result += `<span class="keyword" style="color:#0000ff;font-weight:bold;"><font color="#0000ff"><b>${escapeHtml(multiKw)}</b></font></span>`;
    } else if (jusqua !== undefined) {
      result += `<span class="keyword" style="color:#0000ff;font-weight:bold;"><font color="#0000ff"><b>${escapeHtml(jusqua)}</b></font></span>`;
    } else if (prepA !== undefined) {
      result += `<span class="keyword" style="color:#0000ff;font-weight:bold;"><font color="#0000ff"><b>${escapeHtml(prepA)}</b></font></span>`;
    } else if (word !== undefined) {
      const lower = word.toLowerCase();
      if (KEYWORDS_SET.has(lower)) {
        result += `<span class="keyword" style="color:#0000ff;font-weight:bold;"><font color="#0000ff"><b>${escapeHtml(word)}</b></font></span>`;
      } else if (TYPES_SET.has(lower)) {
        result += `<span class="type" style="color:#008080;"><font color="#008080">${escapeHtml(word)}</font></span>`;
      } else if (FUNCTIONS_SET.has(lower)) {
        result += `<span class="function" style="color:#795e26;"><font color="#795e26">${escapeHtml(word)}</font></span>`;
      } else {
        result += escapeHtml(word);
      }
    } else if (op !== undefined) {
      result += `<span class="operator" style="color:#d73a49;font-weight:bold;"><font color="#d73a49"><b>${escapeHtml(op)}</b></font></span>`;
    }
  }

  if (lastIndex < text.length) {
    result += escapeHtml(text.substring(lastIndex));
  }

  return indentHtml + result;
}

function buildContentHtml(items: ContentItem[]): string {
  let contentHtml = '';

  for (const item of items) {
    if (item.type === 'table') {
      const t = item.data;
      let rowsHtml = '';
      for (const r of t.rows) {
        rowsHtml += `<tr><td>${escapeHtml(r[0])}</td><td>${escapeHtml(r[1]).replace(/\n/g, '<br>').replace(/  /g, '&nbsp;&nbsp;')}</td></tr>`;
      }
      if (t.rows.length === 0) {
        rowsHtml = `<tr><td colspan="2" style="text-align:center;color:#888;font-style:italic;">Aucun élément déclaré</td></tr>`;
      }

      contentHtml += `
            <div class="table-section">
                <div class="table-title">${escapeHtml(t.title)}</div>
                <table class="algo-table">
                    <thead>
                        <tr>
                            <th style="width:38%;">${escapeHtml(t.headers[0])}</th>
                            <th style="width:62%;">${escapeHtml(t.headers[1])}</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${rowsHtml}
                    </tbody>
                </table>
            </div>`;
    } else {
      const formattedLines = item.lines.map(highlightAlgorithmeLine).join('<br>');
      contentHtml += `
            <div class="code-container">${formattedLines}</div>`;
    }
  }

  return contentHtml;
}

function generateHtml(title: string, contentHtml: string, nonce: string, cspSource: string): string {
  return `<!DOCTYPE html>
<html lang="fr">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta http-equiv="Content-Security-Policy" content="default-src 'none'; img-src https: data: http: ${cspSource}; style-src 'unsafe-inline' ${cspSource}; script-src 'nonce-${nonce}';">
    <title>${escapeHtml(title)}</title>
    <style>
        :root {
            --bg-color: #ffffff;
            --text-color: #24292e;
            --table-border: #000000;
            --table-header-bg: #f2f2f2;
            --table-header-color: #000000;
            --code-bg: #f8f9fa;
            --code-border: #e1e4e8;
            --keyword-color: #0000ff;
            --type-color: #008080;
            --string-color: #a31515;
            --comment-color: #008000;
            --function-color: #795e26;
            --operator-color: #d73a49;
        }

        html, body {
            margin: 0;
            padding: 24px 32px;
            background-color: var(--bg-color);
            color: var(--text-color);
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            line-height: 1.5;
            transition: background-color 0.2s, color 0.2s;
        }

        /* Explicit, forceful Dark Mode styling */
        html.dark-mode, html.dark-mode body, body.dark-mode {
            background-color: #1e1e1e !important;
            color: #d4d4d4 !important;
        }

        body.dark-mode .header-bar {
            border-bottom: 2px solid #3c3c3c !important;
        }

        body.dark-mode .doc-title {
            color: #ffffff !important;
        }

        body.dark-mode .btn-secondary {
            background-color: #333333 !important;
            color: #f0f0f0 !important;
            border: 1px solid #555555 !important;
        }

        body.dark-mode .btn-secondary:hover {
            background-color: #444444 !important;
        }

        body.dark-mode .code-container {
            background-color: #252526 !important;
            border-color: #3c3c3c !important;
            color: #d4d4d4 !important;
        }

        body.dark-mode .table-section .table-title {
            color: #ffffff !important;
        }

        body.dark-mode table.algo-table {
            background-color: #1e1e1e !important;
        }

        body.dark-mode table.algo-table th {
            background-color: #2d2d2d !important;
            color: #ffffff !important;
            border: 1.5px solid #666666 !important;
        }

        body.dark-mode table.algo-table td {
            background-color: #1e1e1e !important;
            color: #d4d4d4 !important;
            border: 1.5px solid #666666 !important;
        }

        body.dark-mode table.algo-table tr:hover td {
            background-color: #2a2d2e !important;
        }

        /* Syntax colors in Dark Mode */
        body.dark-mode .keyword,
        body.dark-mode .keyword[style],
        body.dark-mode .keyword font,
        body.dark-mode font[color="#0000ff"] {
            color: #569cd6 !important;
        }

        body.dark-mode .type,
        body.dark-mode .type[style],
        body.dark-mode .type font,
        body.dark-mode font[color="#008080"] {
            color: #4ec9b0 !important;
        }

        body.dark-mode .string,
        body.dark-mode .string[style],
        body.dark-mode .string font,
        body.dark-mode font[color="#a31515"] {
            color: #ce9178 !important;
        }

        body.dark-mode .comment,
        body.dark-mode .comment[style],
        body.dark-mode .comment font,
        body.dark-mode font[color="#008000"] {
            color: #6a9955 !important;
        }

        body.dark-mode .function,
        body.dark-mode .function[style],
        body.dark-mode .function font,
        body.dark-mode font[color="#795e26"] {
            color: #dcdcaa !important;
        }

        body.dark-mode .operator,
        body.dark-mode .operator[style],
        body.dark-mode .operator font,
        body.dark-mode font[color="#d73a49"] {
            color: #d16969 !important;
        }

        .header-bar {
            display: flex;
            justify-content: space-between;
            align-items: center;
            flex-wrap: wrap;
            gap: 12px;
            border-bottom: 2px solid #ddd;
            padding-bottom: 12px;
            margin-bottom: 24px;
        }

        .doc-title {
            font-size: 18px;
            font-weight: bold;
            color: var(--text-color);
        }

        .actions {
            display: flex;
            flex-wrap: wrap;
            gap: 8px;
        }

        .btn {
            background-color: #007acc;
            color: white;
            border: none;
            padding: 6px 14px;
            border-radius: 4px;
            cursor: pointer;
            font-size: 13px;
            font-weight: 500;
            display: inline-flex;
            align-items: center;
            gap: 6px;
            white-space: nowrap;
        }

        .btn:hover {
            background-color: #005999;
        }

        .btn-secondary {
            background-color: #e5e5e5;
            color: #333;
        }

        .btn-secondary:hover {
            background-color: #d0d0d0;
        }

        .toast {
            position: fixed;
            bottom: 24px;
            right: 24px;
            background-color: #323232;
            color: #fff;
            padding: 10px 18px;
            border-radius: 4px;
            font-size: 13px;
            opacity: 0;
            transform: translateY(10px);
            transition: opacity 0.3s, transform 0.3s;
            pointer-events: none;
            z-index: 1000;
        }

        .toast.show {
            opacity: 1;
            transform: translateY(0);
        }

        .table-section {
            margin: 18px 0;
        }

        .table-title {
            font-size: 15px;
            font-weight: bold;
            margin-bottom: 6px;
            color: var(--text-color);
            letter-spacing: 0.5px;
        }

        table.algo-table {
            width: 100%;
            max-width: 600px;
            border-collapse: collapse;
            margin: 4pt 0 12pt 0;
            background: var(--bg-color);
        }

        table.algo-table th, table.algo-table td {
            border: 1.5px solid var(--table-border);
            padding: 0.1cm;
            margin: 0pt;
            text-align: left;
            font-size: 13px;
        }

        table.algo-table th {
            background-color: var(--table-header-bg);
            color: var(--table-header-color);
            font-weight: bold;
        }

        table.algo-table tr:hover td {
            background-color: rgba(0, 122, 204, 0.06);
        }

        .code-container {
            background-color: var(--code-bg);
            border: 1px solid var(--code-border);
            border-radius: 6px;
            padding: 14px 18px;
            margin: 16px 0;
            font-family: 'Consolas', 'Courier New', monospace;
            font-size: 14px;
            line-height: 1.6;
            overflow-x: auto;
        }

        .keyword { font-weight: bold; color: var(--keyword-color); }
        .type { color: var(--type-color); }
        .string { color: var(--string-color); }
        .comment { color: var(--comment-color); font-style: italic; }
        .function { color: var(--function-color); }
        .operator { font-weight: bold; color: var(--operator-color); }

        @media print {
            body {
                background: white !important;
                color: black !important;
                padding: 0 !important;
            }
            .header-bar { display: none !important; }
            table.algo-table {
                box-shadow: none !important;
            }
            table.algo-table th, table.algo-table td {
                border: 1.5px solid black !important;
                padding: 0.1cm !important;
                color: black !important;
            }
            table.algo-table th {
                background-color: #f2f2f2 !important;
                -webkit-print-color-adjust: exact;
                print-color-adjust: exact;
            }
            .code-container {
                border: none !important;
                background: none !important;
                padding: 0 !important;
                color: black !important;
            }
            .keyword, .type, .string, .comment, .function, .operator {
                color: black !important;
            }
            .keyword font, .type font, .string font, .comment font, .function font, .operator font {
                color: black !important;
            }
            .keyword { font-weight: bold !important; }
        }
    </style>
</head>
<body>
    <div class="header-bar">
        <div class="doc-title" id="doc-title">📋 ${escapeHtml(title)}</div>
        <div class="actions">
            <button class="btn btn-secondary" id="btn-copy">📋 Copier pour Word</button>
            <button class="btn btn-secondary" id="btn-export">📄 Exporter .doc (Word)</button>
            <button class="btn btn-secondary" id="btn-theme">🌓 Thème</button>
            <button class="btn" id="btn-print">🖨️ Imprimer / PDF</button>
        </div>
    </div>
    <div id="content">
        ${contentHtml}
    </div>
    <div id="toast" class="toast">Copié avec coloration syntaxique !</div>
    <script nonce="${nonce}">
        (function() {
        'use strict';

        let vsCodeApi;
        try {
            vsCodeApi = acquireVsCodeApi();
        } catch (err) {
            console.warn('acquireVsCodeApi unavailable:', err);
        }

        let currentFileName = ${JSON.stringify(title)};

        function postMsg(msg) {
            if (vsCodeApi) {
                vsCodeApi.postMessage(msg);
            }
        }

        function getState() {
            try { return vsCodeApi && vsCodeApi.getState ? vsCodeApi.getState() : null; } catch(_) { return null; }
        }

        function setState(s) {
            try { if (vsCodeApi && vsCodeApi.setState) vsCodeApi.setState(s); } catch(_) {}
        }

        function showToast(msg) {
            const toast = document.getElementById('toast');
            if (!toast) return;
            toast.textContent = msg;
            toast.classList.add('show');
            setTimeout(() => {
                toast.classList.remove('show');
            }, 3500);
        }

        function applyTheme(isDark) {
            if (isDark) {
                document.documentElement.classList.add('dark-mode');
                document.body.classList.add('dark-mode');
            } else {
                document.documentElement.classList.remove('dark-mode');
                document.body.classList.remove('dark-mode');
            }
            const btnTheme = document.getElementById('btn-theme');
            if (btnTheme) {
                btnTheme.textContent = isDark ? '☀️ Mode clair' : '🌙 Mode sombre';
            }
        }

        function toggleTheme() {
            const isDarkNow = !document.body.classList.contains('dark-mode');
            applyTheme(isDarkNow);
            setState({ isDark: isDarkNow });
            try { localStorage.setItem('algo_dark_mode', isDarkNow ? '1' : '0'); } catch (_) {}
            showToast(isDarkNow ? '🌙 Mode sombre activé' : '☀️ Mode clair activé');
        }

        // Restore saved theme on load
        try {
            let savedDark = false;
            const s = getState();
            if (s && typeof s.isDark === 'boolean') {
                savedDark = s.isDark;
            } else {
                try { savedDark = localStorage.getItem('algo_dark_mode') === '1'; } catch (_) {}
            }
            applyTheme(savedDark);
        } catch (_) {}

        window.addEventListener('message', (event) => {
            const msg = event.data;
            if (!msg) return;
            if (msg.command === 'toast') {
                showToast(msg.text);
            } else if (msg.command === 'update') {
                const contentEl = document.getElementById('content');
                if (contentEl) contentEl.innerHTML = msg.content || '';
                const titleEl = document.getElementById('doc-title');
                if (titleEl && msg.title) titleEl.textContent = '📋 ' + msg.title;
                if (msg.title) currentFileName = msg.title;
            }
        });

        function buildWordHtml() {
            const content = document.getElementById('content');
            if (!content) return '';

            const clone = content.cloneNode(true);

            clone.querySelectorAll('.code-container').forEach(el => {
                el.style.fontFamily = "Consolas, 'Courier New', monospace";
                el.style.fontSize = '12pt';
                el.style.lineHeight = '1.45';
                el.style.backgroundColor = '#ffffff';
                el.style.border = 'none';
                el.style.padding = '4pt 0';
                el.style.margin = '8pt 0';
            });

            clone.querySelectorAll('.table-section').forEach(el => {
                el.style.margin = '14pt 0';
            });

            clone.querySelectorAll('.table-title').forEach(el => {
                el.style.fontFamily = "'Segoe UI', Arial, sans-serif";
                el.style.fontSize = '12pt';
                el.style.fontWeight = 'bold';
                el.style.color = '#000000';
                el.style.marginBottom = '4pt';
            });

            clone.querySelectorAll('table.algo-table').forEach(tbl => {
                tbl.style.borderCollapse = 'collapse';
                tbl.style.width = '100%';
                tbl.style.border = '1.5pt solid black';
                tbl.style.margin = '4pt 0 12pt 0';
                tbl.style.setProperty('mso-table-lspace', '0pt');
                tbl.style.setProperty('mso-table-rspace', '0pt');
                tbl.style.setProperty('mso-table-tspace', '0pt');
                tbl.style.setProperty('mso-table-bspace', '0pt');
                tbl.style.setProperty('mso-padding-alt', '0.1cm 0.1cm 0.1cm 0.1cm');
                tbl.querySelectorAll('th, td').forEach(cell => {
                    cell.style.border = '1.5pt solid black';
                    cell.style.padding = '0.1cm';
                    cell.style.margin = '0pt';
                    cell.style.fontSize = '12pt';
                    cell.style.fontFamily = "'Segoe UI', Arial, sans-serif";
                    cell.style.setProperty('mso-para-margin', '0pt');
                    cell.style.setProperty('mso-para-margin-top', '0pt');
                    cell.style.setProperty('mso-para-margin-bottom', '0pt');
                    cell.style.setProperty('line-height', 'normal');

                    const rawInner = cell.innerHTML;
                    cell.innerHTML = '<p class="MsoNormal" style="margin:0cm;margin-bottom:.0001pt;mso-para-margin:0pt;mso-para-margin-top:0pt;mso-para-margin-bottom:0pt;line-height:normal;font-size:\s*12pt;font-family: Segoe UI, Arial, sans-serif;">' + rawInner + '</p>';
                });
                tbl.querySelectorAll('th').forEach(th => {
                    th.style.backgroundColor = '#f2f2f2';
                    th.style.fontWeight = 'bold';
                });
            });

            return clone.innerHTML;
        }

        function buildFullWordDoc(titleName) {
            const innerHtml = buildWordHtml();
            const docTitle = titleName || 'algorithme';
            return '<html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:w="urn:schemas-microsoft-com:office:word" xmlns="http://www.w3.org/TR/REC-html40">' +
                '<head><meta charset="utf-8"><title>' + docTitle + '</title>' +
                '<!--[if gte mso 9]><xml><w:WordDocument><w:View>Print</w:View><w:Zoom>100</w:Zoom></w:WordDocument></xml><![endif]-->' +
                '<style>' +
                '@page { size: A4; margin: 2cm; }' +
                'p.MsoNormal, li.MsoNormal, div.MsoNormal, p, div {' +
                '    margin: 0cm;' +
                '    margin-bottom: .0001pt;' +
                '    mso-para-margin: 0pt;' +
                '    mso-para-margin-top: 0pt;' +
                '    mso-para-margin-bottom: 0pt;' +
                '    line-height: normal;' +
                '    font-size:\s*12pt;' +
                '    font-family: "Segoe UI", Arial, sans-serif;' +
                '}' +
                'body { font-family: "Segoe UI", Arial, sans-serif; font-size:\s*12pt; color: #000; }' +
                '.code-container { font-family: Consolas, "Courier New", monospace; font-size:\s*12pt; line-height: 1.45; }' +
                'table {' +
                '    border-collapse: collapse;' +
                '    width: 100%;' +
                '    margin: 4pt 0 12pt 0;' +
                '    mso-table-lspace: 0pt;' +
                '    mso-table-rspace: 0pt;' +
                '    mso-table-tspace: 0pt;' +
                '    mso-table-bspace: 0pt;' +
                '    mso-padding-alt: 0.1cm 0.1cm 0.1cm 0.1cm;' +
                '}' +
                'th, td {' +
                '    border: 1.5pt solid black;' +
                '    padding: 0.1cm;' +
                '    margin: 0pt;' +
                '    mso-para-margin: 0pt;' +
                '    mso-para-margin-top: 0pt;' +
                '    mso-para-margin-bottom: 0pt;' +
                '    line-height: normal;' +
                '    font-size:\s*12pt;' +
                '}' +
                'th { background-color: #f2f2f2; font-weight: bold; }' +
                '</style></head><body>' +
                innerHtml +
                '</body></html>';
        }

        async function copyForWord() {
            const content = document.getElementById('content');
            if (!content) return;
            const fullHtml = buildWordHtml();
            const plainText = content.innerText;
            showToast('📋 Copie vers Word en cours...');

            let webClipboardSuccess = false;
            try {
                if (navigator.clipboard && window.ClipboardItem) {
                    const blobHtml = new Blob([fullHtml], { type: 'text/html' });
                    const blobText = new Blob([plainText], { type: 'text/plain' });
                    await navigator.clipboard.write([
                        new ClipboardItem({
                            'text/html': blobHtml,
                            'text/plain': blobText
                        })
                    ]);
                    webClipboardSuccess = true;
                }
            } catch (_) {}

            postMsg({
                command: 'copyWord',
                html: fullHtml,
                text: plainText,
                copiedByWebview: webClipboardSuccess
            });
        }

        function exportToWord() {
            const wordDoc = buildFullWordDoc(currentFileName);
            showToast('📄 Préparation du document Word...');
            postMsg({
                command: 'exportWord',
                fileName: currentFileName,
                content: wordDoc
            });
        }

        function printDoc() {
            showToast("🖨️ Préparation de l'impression...");
            const fullHtml = buildWordHtml();
            postMsg({
                command: 'print',
                title: currentFileName,
                html: fullHtml
            });
        }

        const btnCopy = document.getElementById('btn-copy');
        if (btnCopy) btnCopy.addEventListener('click', copyForWord);

        const btnExport = document.getElementById('btn-export');
        if (btnExport) btnExport.addEventListener('click', exportToWord);

        const btnTheme = document.getElementById('btn-theme');
        if (btnTheme) btnTheme.addEventListener('click', toggleTheme);

        const btnPrint = document.getElementById('btn-print');
        if (btnPrint) btnPrint.addEventListener('click', printDoc);

        })(); // end IIFE
    </script>
</body>
</html>`;
}

function formatCfHtml(fragmentHtml: string): string {
  const preFragment = '<!DOCTYPE html><html><body><!--StartFragment-->';
  const postFragment = '<!--EndFragment--></body></html>';

  const dummyHeader =
    'Version:0.9\r\n' +
    'StartHTML:0000000000\r\n' +
    'EndHTML:0000000000\r\n' +
    'StartFragment:0000000000\r\n' +
    'EndFragment:0000000000\r\n';

  const startHtml = Buffer.byteLength(dummyHeader, 'utf8');
  const startFragment = startHtml + Buffer.byteLength(preFragment, 'utf8');
  const endFragment = startFragment + Buffer.byteLength(fragmentHtml, 'utf8');
  const endHtml = endFragment + Buffer.byteLength(postFragment, 'utf8');

  const pad = (num: number) => num.toString().padStart(10, '0');

  const header =
    'Version:0.9\r\n' +
    'StartHTML:' + pad(startHtml) + '\r\n' +
    'EndHTML:' + pad(endHtml) + '\r\n' +
    'StartFragment:' + pad(startFragment) + '\r\n' +
    'EndFragment:' + pad(endFragment) + '\r\n';

  return header + preFragment + fragmentHtml + postFragment;
}

function copyHtmlToWindowsClipboard(html: string, plainText: string): Promise<boolean> {
  return new Promise((resolve, reject) => {
    const cfHtml = formatCfHtml(html);
    const script = `
Add-Type -AssemblyName PresentationCore, WindowsBase
$cfHtml = Get-Content -Raw -Encoding UTF8 -Path $args[0]
$text = Get-Content -Raw -Encoding UTF8 -Path $args[1]

$obj = New-Object System.Windows.DataObject
$obj.SetData([System.Windows.DataFormats]::Html, $cfHtml)
$obj.SetData([System.Windows.DataFormats]::UnicodeText, $text)
[System.Windows.Clipboard]::SetDataObject($obj, $true)
`;
    const tempDir = os.tmpdir();
    const rand = Math.random().toString(36).substring(2, 9);
    const psFile = path.join(tempDir, `algo_clip_${rand}.ps1`);
    const htmlFile = path.join(tempDir, `algo_clip_${rand}.html`);
    const txtFile = path.join(tempDir, `algo_clip_${rand}.txt`);

    fs.writeFileSync(psFile, script, 'utf8');
    fs.writeFileSync(htmlFile, cfHtml, 'utf8');
    fs.writeFileSync(txtFile, plainText, 'utf8');

    const ps = spawn('powershell.exe', [
      '-NoProfile',
      '-ExecutionPolicy', 'Bypass',
      '-Sta',
      '-File', psFile,
      htmlFile,
      txtFile
    ], { windowsHide: true });

    ps.on('close', (code) => {
      try {
        fs.unlinkSync(psFile);
        fs.unlinkSync(htmlFile);
        fs.unlinkSync(txtFile);
      } catch (_) { }

      if (code === 0) {
        resolve(true);
      } else {
        reject(new Error(`PowerShell exit code: ${code}`));
      }
    });

    ps.on('error', (err) => {
      try {
        fs.unlinkSync(psFile);
        fs.unlinkSync(htmlFile);
        fs.unlinkSync(txtFile);
      } catch (_) { }
      reject(err);
    });
  });
}

export function deactivate() {
  if (previewPanel) {
    previewPanel.dispose();
  }
}