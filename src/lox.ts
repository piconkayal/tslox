import { readFileSync } from "node:fs";
import { createInterface } from "node:readline";
import { LoxError, RuntimeError } from "./error.js";
import { Interpreter } from "./interpreter.js";
import { Parser } from "./parser.js";
import { Resolver } from "./resolver.js";
import { Scanner } from "./scanner.js";

export class Lox {
  static hadError = false;
  static hadRuntimeError = false;
  private readonly interpreter = new Interpreter();

  run(source: string): void {
    Lox.hadError = false;
    Lox.hadRuntimeError = false;

    try {
      const scanner = new Scanner(source);
      const tokens = scanner.scanTokens();
      const parser = new Parser(tokens);
      const statements = parser.parse();

      if (Lox.hadError) {
        return;
      }

      const resolver = new Resolver(this.interpreter);
      resolver.resolve(statements);

      if (Lox.hadError) {
        return;
      }

      this.interpreter.interpret(statements);
    } catch (error) {
      if (error instanceof RuntimeError) {
        this.runtimeError(error);
      } else if (error instanceof LoxError) {
        Lox.error(error.line, error.message);
      } else {
        throw error;
      }
    }
  }

  static error(line: number, message: string): void {
    Lox.report(line, "", message);
  }

  static parseError(token: { line: number; lexeme: string }, message: string): void {
    if (token.lexeme === "") {
      Lox.report(token.line, " at end", message);
    } else {
      Lox.report(token.line, ` at '${token.lexeme}'`, message);
    }
  }

  static runtimeError(error: RuntimeError): void {
    console.error(`${error.message}\n[line ${error.token?.line ?? "?"}]`);
    Lox.hadRuntimeError = true;
  }

  private runtimeError(error: RuntimeError): void {
    Lox.runtimeError(error);
  }

  private static report(line: number, where: string, message: string): void {
    console.error(`[line ${line}] Error${where}: ${message}`);
    Lox.hadError = true;
  }
}

function main(): void {
  const args = process.argv.slice(2);

  if (args.length > 1) {
    console.error("Usage: tslox [script]");
    process.exit(64);
  } else if (args.length === 1) {
    runFile(args[0]);
  } else {
    runPrompt();
  }
}

function runFile(path: string): void {
  try {
    const source = readFileSync(path, "utf-8");
    const lox = new Lox();
    lox.run(source);

    if (Lox.hadError) {
      process.exit(65);
    }
    if (Lox.hadRuntimeError) {
      process.exit(70);
    }
  } catch (error) {
    console.error(`Error reading file: ${error}`);
    process.exit(1);
  }
}

function runPrompt(): void {
  const rl = createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  const lox = new Lox();

  rl.setPrompt("> ");
  rl.prompt();

  rl.on("line", (line: string) => {
    if (line.trim() === "") {
      rl.prompt();
      return;
    }

    Lox.hadError = false;
    Lox.hadRuntimeError = false;

    lox.run(line);
    rl.prompt();
  });

  rl.on("close", () => {
    console.log("\nGoodbye!");
    process.exit(0);
  });
}

if (require.main === module) {
  main();
}
