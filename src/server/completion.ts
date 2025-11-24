import type {
  CompletionItem,
  CompletionItemKind,
  Position,
  TextDocument,
} from "vscode-languageserver";
import { CompletionItemKind as Kind } from "vscode-languageserver";
import type { Stmt } from "../ast/stmt.js";
import { Block, Class, Function, Var } from "../ast/stmt.js";

const KEYWORDS = [
  "and",
  "class",
  "else",
  "false",
  "fun",
  "for",
  "if",
  "nil",
  "or",
  "print",
  "return",
  "super",
  "this",
  "true",
  "var",
  "while",
];

interface Symbol {
  name: string;
  kind: "variable" | "function" | "class" | "method" | "parameter";
  line: number;
}

export function getCompletions(
  document: TextDocument,
  position: Position,
  statements: Stmt[]
): CompletionItem[] {
  const completions: CompletionItem[] = [];
  const symbols = extractSymbols(statements, position.line);

  const lineText = document.getText({
    start: { line: position.line, character: 0 },
    end: position,
  });

  const wordStart = findWordStart(lineText, position.character);
  const prefix = lineText.substring(wordStart, position.character).toLowerCase();

  for (const keyword of KEYWORDS) {
    if (keyword.toLowerCase().startsWith(prefix)) {
      completions.push({
        label: keyword,
        kind: Kind.Keyword,
        detail: "keyword",
      });
    }
  }

  for (const symbol of symbols) {
    if (symbol.name.toLowerCase().startsWith(prefix)) {
      let kind: CompletionItemKind;
      switch (symbol.kind) {
        case "variable":
          kind = Kind.Variable;
          break;
        case "function":
          kind = Kind.Function;
          break;
        case "class":
          kind = Kind.Class;
          break;
        case "method":
          kind = Kind.Method;
          break;
        case "parameter":
          kind = Kind.Variable;
          break;
        default:
          kind = Kind.Variable;
      }

      completions.push({
        label: symbol.name,
        kind,
        detail: symbol.kind,
      });
    }
  }

  return completions;
}

function extractSymbols(statements: Stmt[], maxLine: number): Symbol[] {
  const symbols: Symbol[] = [];

  function extractFromStmt(stmt: Stmt): void {
    if (stmt instanceof Var) {
      if (stmt.name.line <= maxLine) {
        symbols.push({
          name: stmt.name.lexeme,
          kind: "variable",
          line: stmt.name.line,
        });
      }
    } else if (stmt instanceof Function) {
      if (stmt.name.line <= maxLine) {
        symbols.push({
          name: stmt.name.lexeme,
          kind: "function",
          line: stmt.name.line,
        });
        for (const param of stmt.params) {
          if (param.line <= maxLine) {
            symbols.push({
              name: param.lexeme,
              kind: "parameter",
              line: param.line,
            });
          }
        }
        for (const bodyStmt of stmt.body) {
          extractFromStmt(bodyStmt);
        }
      }
    } else if (stmt instanceof Class) {
      if (stmt.name.line <= maxLine) {
        symbols.push({
          name: stmt.name.lexeme,
          kind: "class",
          line: stmt.name.line,
        });
        for (const method of stmt.methods) {
          if (method.name.line <= maxLine) {
            symbols.push({
              name: method.name.lexeme,
              kind: "method",
              line: method.name.line,
            });
            for (const bodyStmt of method.body) {
              extractFromStmt(bodyStmt);
            }
          }
        }
      }
    } else if (stmt instanceof Block) {
      for (const bodyStmt of stmt.statements) {
        extractFromStmt(bodyStmt);
      }
    }
  }

  for (const stmt of statements) {
    extractFromStmt(stmt);
  }

  return symbols;
}

function findWordStart(line: string, position: number): number {
  let start = position - 1;
  while (start >= 0 && /[a-zA-Z0-9_]/.test(line[start])) {
    start--;
  }
  return start + 1;
}
