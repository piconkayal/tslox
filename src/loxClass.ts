import { RuntimeError, type Token } from "./error.js";
import type { Interpreter, LoxValue } from "./interpreter.js";
import type { LoxCallable, LoxFunction } from "./loxFunction.js";

export class LoxClass implements LoxCallable {
  constructor(
    public readonly name: string,
    private readonly superclass: LoxClass | null,
    private readonly methods: Map<string, LoxFunction>
  ) {}

  arity(): number {
    const initializer = this.findMethod("init");
    if (initializer === null) {
      return 0;
    }
    return initializer.arity();
  }

  call(interpreter: Interpreter, args: LoxValue[]): LoxValue {
    const instance = new LoxInstance(this);
    const initializer = this.findMethod("init");
    if (initializer !== null) {
      initializer.bind(instance).call(interpreter, args);
    }
    return instance;
  }

  findMethod(name: string): LoxFunction | null {
    if (this.methods.has(name)) {
      return this.methods.get(name)!;
    }

    if (this.superclass !== null) {
      return this.superclass.findMethod(name);
    }

    return null;
  }

  toString(): string {
    return this.name;
  }
}

export class LoxInstance {
  private readonly fields: Map<string, LoxValue> = new Map();

  constructor(private readonly klass: LoxClass) {}

  get(name: Token): LoxValue {
    if (this.fields.has(name.lexeme)) {
      return this.fields.get(name.lexeme)!;
    }

    const method = this.klass.findMethod(name.lexeme);
    if (method !== null) {
      return method.bind(this);
    }

    throw new RuntimeError(`Undefined property '${name.lexeme}'.`, name);
  }

  set(name: Token, value: LoxValue): void {
    this.fields.set(name.lexeme, value);
  }

  toString(): string {
    return `${this.klass.name} instance`;
  }
}
