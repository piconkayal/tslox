import type { Stmt } from "../ast/stmt.js";
import { Block, Class, Function, Var } from "../ast/stmt.js";
import type { Token } from "../error.js";
import { Parser } from "../parser.js";
import { Resolver } from "../resolver.js";
import { Scanner } from "../scanner.js";
import type { Interpreter } from "../interpreter.js";

export interface DocumentInfo {
  uri: string;
  text: string;
  tokens: Token[];
  statements: Stmt[];
  errors: DiagnosticError[];
  symbols: SymbolInfo[];
}

export interface DiagnosticError {
  line: number;
  column?: number;
  message: string;
  severity: "error" | "warning";
}

export interface SymbolInfo {
  name: string;
  kind: "variable" | "function" | "class" | "method" | "parameter";
  line: number;
  column?: number;
  scope?: string;
}

export class DocumentManager {
  private documents: Map<string, DocumentInfo> = new Map();
  private interpreter: Interpreter;

  constructor(interpreter: Interpreter) {
    this.interpreter = interpreter;
  }

  updateDocument(uri: string, text: string): DocumentInfo {
    const errors: DiagnosticError[] = [];
    const symbols: SymbolInfo[] = [];

    try {
      const scanner = new Scanner(text);
      const tokens = scanner.scanTokens();

      const parser = new Parser(tokens);
      const statements = parser.parse();

      const resolver = new Resolver(this.interpreter);
      try {
        resolver.resolve(statements);
      } catch (error) {
        if (error instanceof Error && "line" in error) {
          errors.push({
            line: (error as { line: number }).line,
            message: error.message,
            severity: "error",
          });
        }
      }

      this.extractSymbols(statements, symbols);
    } catch (error) {
      if (error instanceof Error && "line" in error) {
        errors.push({
          line: (error as { line: number }).line,
          message: error.message,
          severity: "error",
        });
      }
    }

    const info: DocumentInfo = {
      uri,
      text,
      tokens: [],
      statements: [],
      errors,
      symbols,
    };

    try {
      const scanner = new Scanner(text);
      info.tokens = scanner.scanTokens();

      const parser = new Parser(info.tokens);
      info.statements = parser.parse();
    } catch {
      // Errors already collected
    }

    this.documents.set(uri, info);
    return info;
  }

  getDocument(uri: string): DocumentInfo | undefined {
    return this.documents.get(uri);
  }

  removeDocument(uri: string): void {
    this.documents.delete(uri);
  }

  private extractSymbols(statements: Stmt[], symbols: SymbolInfo[]): void {
    for (const stmt of statements) {
      if (stmt instanceof Var) {
        symbols.push({
          name: stmt.name.lexeme,
          kind: "variable",
          line: stmt.name.line,
        });
      } else if (stmt instanceof Function) {
        symbols.push({
          name: stmt.name.lexeme,
          kind: "function",
          line: stmt.name.line,
        });
        for (const param of stmt.params) {
          symbols.push({
            name: param.lexeme,
            kind: "parameter",
            line: param.line,
          });
        }
        this.extractSymbols(stmt.body, symbols);
      } else if (stmt instanceof Class) {
        symbols.push({
          name: stmt.name.lexeme,
          kind: "class",
          line: stmt.name.line,
        });
        for (const method of stmt.methods) {
          symbols.push({
            name: method.name.lexeme,
            kind: "method",
            line: method.name.line,
          });
          this.extractSymbols(method.body, symbols);
        }
      } else if (stmt instanceof Block) {
        this.extractSymbols(stmt.statements, symbols);
      }
    }
  }
}
