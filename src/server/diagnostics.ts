import type { Diagnostic, Range } from "vscode-languageserver";
import { DiagnosticSeverity } from "vscode-languageserver";
import type { Stmt } from "../ast/stmt.js";
import { LoxError, type Token } from "../error.js";
import { Parser, ParseError } from "../parser.js";
import { Resolver } from "../resolver.js";
import { Scanner } from "../scanner.js";
import type { Interpreter } from "../interpreter.js";

export interface ParseResult {
  statements: Stmt[];
  diagnostics: Diagnostic[];
  tokens: Token[];
}

export function parseDocument(
  text: string,
  interpreter: Interpreter
): ParseResult {
  const diagnostics: Diagnostic[] = [];
  let statements: Stmt[] = [];
  let tokens: Token[] = [];

  try {
    const scanner = new Scanner(text);
    tokens = scanner.scanTokens();
  } catch (error) {
    if (error instanceof LoxError) {
      diagnostics.push({
        range: {
          start: { line: error.line - 1, character: 0 },
          end: { line: error.line - 1, character: 0 },
        },
        severity: DiagnosticSeverity.Error,
        message: error.message,
        source: "lox",
      });
    }
    return { statements, diagnostics, tokens: [] };
  }

  try {
    const parser = new Parser(tokens);
    statements = parser.parse();
  } catch (error) {
    if (error instanceof LoxError) {
      diagnostics.push({
        range: {
          start: { line: error.line - 1, character: 0 },
          end: { line: error.line - 1, character: 0 },
        },
        severity: DiagnosticSeverity.Error,
        message: error.message,
        source: "lox",
      });
    } else if (error instanceof ParseError) {
      const lastToken = tokens[tokens.length - 1] || { line: 1, lexeme: "" };
      diagnostics.push({
        range: {
          start: { line: lastToken.line - 1, character: 0 },
          end: { line: lastToken.line - 1, character: 0 },
        },
        severity: DiagnosticSeverity.Error,
        message: error.message,
        source: "lox",
      });
    }
  }

  if (statements.length > 0) {
    try {
      const resolver = new Resolver(interpreter);
      resolver.resolve(statements);
    } catch (error) {
      if (error instanceof LoxError) {
        diagnostics.push({
          range: {
            start: { line: error.line - 1, character: 0 },
            end: { line: error.line - 1, character: 0 },
          },
          severity: DiagnosticSeverity.Error,
          message: error.message,
          source: "lox",
        });
      }
    }
  }

  return { statements, diagnostics, tokens };
}

export function tokenToRange(token: Token): Range {
  return {
    start: { line: token.line - 1, character: 0 },
    end: { line: token.line - 1, character: token.lexeme.length },
  };
}
