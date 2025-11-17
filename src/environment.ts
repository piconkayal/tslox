import { RuntimeError, type Token } from "./error.js";

export class Environment {
  private readonly values: Map<string, unknown> = new Map();

  constructor(public readonly enclosing: Environment | null = null) {}

  define(name: string, value: unknown): void {
    this.values.set(name, value);
  }

  get(name: Token): unknown {
    if (this.values.has(name.lexeme)) {
      return this.values.get(name.lexeme);
    }

    if (this.enclosing !== null) {
      return this.enclosing.get(name);
    }

    throw new RuntimeError(`Undefined variable '${name.lexeme}'.`, name);
  }

  getAt(distance: number, name: string): unknown {
    return this.ancestor(distance).values.get(name);
  }

  assign(name: Token, value: unknown): void {
    if (this.values.has(name.lexeme)) {
      this.values.set(name.lexeme, value);
      return;
    }

    if (this.enclosing !== null) {
      this.enclosing.assign(name, value);
      return;
    }

    throw new RuntimeError(`Undefined variable '${name.lexeme}'.`, name);
  }

  assignAt(distance: number, name: Token, value: unknown): void {
    this.ancestor(distance).values.set(name.lexeme, value);
  }

  private ancestor(distance: number): Environment {
    let environment: Environment = this;
    for (let i = 0; i < distance; i++) {
      if (environment.enclosing === null) {
        throw new Error("Invalid environment distance.");
      }
      environment = environment.enclosing;
    }
    return environment;
  }
}
