import type { Function } from "./ast/stmt.js";
import { Environment } from "./environment.js";
import { type Interpreter, type LoxValue, ReturnValue } from "./interpreter.js";
import type { LoxInstance } from "./loxClass.js";

export interface LoxCallable {
  arity(): number;
  call(interpreter: Interpreter, args: LoxValue[]): LoxValue;
  toString(): string;
}

export class LoxFunction implements LoxCallable {
  constructor(
    private readonly declaration: Function,
    private readonly closure: Environment,
    private readonly isInitializer: boolean
  ) {}

  arity(): number {
    return this.declaration.params.length;
  }

  call(interpreter: Interpreter, args: LoxValue[]): LoxValue {
    const environment = new Environment(this.closure);
    for (let i = 0; i < this.declaration.params.length; i++) {
      environment.define(this.declaration.params[i].lexeme, args[i]);
    }

    try {
      interpreter.executeBlock(this.declaration.body, environment);
    } catch (returnValue) {
      if (returnValue instanceof ReturnValue) {
        if (this.isInitializer) {
          return this.closure.getAt(0, "this") as LoxValue;
        }
        return returnValue.value;
      }
      throw returnValue;
    }

    if (this.isInitializer) {
      return this.closure.getAt(0, "this") as LoxValue;
    }

    return null;
  }

  bind(instance: LoxInstance): LoxFunction {
    const environment = new Environment(this.closure);
    environment.define("this", instance);
    return new LoxFunction(this.declaration, environment, this.isInitializer);
  }

  toString(): string {
    return `<fn ${this.declaration.name.lexeme}>`;
  }
}
