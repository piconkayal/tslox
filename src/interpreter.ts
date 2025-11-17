import type {
  Assign,
  Binary,
  Call,
  Expr,
  ExprVisitor,
  Get,
  Grouping,
  Literal,
  Logical,
  Set,
  Super,
  This,
  Unary,
  Variable,
} from "./ast/expr.js";
import type {
  Block,
  Class,
  Expression,
  Function,
  If,
  Print,
  Return,
  Stmt,
  StmtVisitor,
  Var,
  While,
} from "./ast/stmt.js";
import { Environment } from "./environment.js";
import { RuntimeError, type Token, TokenType } from "./error.js";
import { LoxClass, LoxInstance } from "./loxClass.js";
import { type LoxCallable, LoxFunction } from "./loxFunction.js";

export type LoxValue = string | number | boolean | null | LoxCallable | LoxInstance;

export class Interpreter implements ExprVisitor<LoxValue>, StmtVisitor<void> {
  globals = new Environment();
  private environment = this.globals;
  private readonly locals: Map<Expr, number> = new Map();

  constructor() {
    this.globals.define("clock", {
      arity: () => 0,
      call: () => Date.now() / 1000.0,
      toString: () => "<native fn>",
    } as LoxCallable);
  }

  interpret(statements: Stmt[]): void {
    try {
      for (const statement of statements) {
        this.execute(statement);
      }
    } catch (error) {
      if (error instanceof RuntimeError) {
        throw error;
      }
      throw error;
    }
  }

  resolve(expr: Expr, depth: number): void {
    this.locals.set(expr, depth);
  }

  visitBinaryExpr(expr: Binary): LoxValue {
    const left = this.evaluate(expr.left);
    const right = this.evaluate(expr.right);

    switch (expr.operator.type) {
      case TokenType.GREATER:
        this.checkNumberOperands(expr.operator, left, right);
        return (left as number) > (right as number);
      case TokenType.GREATER_EQUAL:
        this.checkNumberOperands(expr.operator, left, right);
        return (left as number) >= (right as number);
      case TokenType.LESS:
        this.checkNumberOperands(expr.operator, left, right);
        return (left as number) < (right as number);
      case TokenType.LESS_EQUAL:
        this.checkNumberOperands(expr.operator, left, right);
        return (left as number) <= (right as number);
      case TokenType.BANG_EQUAL:
        return !this.isEqual(left, right);
      case TokenType.EQUAL_EQUAL:
        return this.isEqual(left, right);
      case TokenType.MINUS:
        this.checkNumberOperands(expr.operator, left, right);
        return (left as number) - (right as number);
      case TokenType.PLUS:
        if (typeof left === "number" && typeof right === "number") {
          return left + right;
        }
        if (typeof left === "string" && typeof right === "string") {
          return left + right;
        }
        throw new RuntimeError("Operands must be two numbers or two strings.", expr.operator);
      case TokenType.SLASH:
        this.checkNumberOperands(expr.operator, left, right);
        if (right === 0) {
          throw new RuntimeError("Division by zero.", expr.operator);
        }
        return (left as number) / (right as number);
      case TokenType.STAR:
        this.checkNumberOperands(expr.operator, left, right);
        return (left as number) * (right as number);
      default:
        return null;
    }
  }

  visitUnaryExpr(expr: Unary): LoxValue {
    const right = this.evaluate(expr.right);

    switch (expr.operator.type) {
      case TokenType.BANG:
        return !this.isTruthy(right);
      case TokenType.MINUS:
        this.checkNumberOperand(expr.operator, right);
        return -(right as number);
      default:
        return null;
    }
  }

  visitLiteralExpr(expr: Literal): LoxValue {
    return expr.value as LoxValue;
  }

  visitGroupingExpr(expr: Grouping): LoxValue {
    return this.evaluate(expr.expression);
  }

  visitVariableExpr(expr: Variable): LoxValue {
    return this.lookUpVariable(expr.name, expr);
  }

  visitAssignExpr(expr: Assign): LoxValue {
    const value = this.evaluate(expr.value);

    const distance = this.locals.get(expr);
    if (distance !== undefined) {
      this.environment.assignAt(distance, expr.name, value);
    } else {
      this.globals.assign(expr.name, value);
    }

    return value;
  }

  visitLogicalExpr(expr: Logical): LoxValue {
    const left = this.evaluate(expr.left);

    if (expr.operator.type === TokenType.OR) {
      if (this.isTruthy(left)) {
        return left;
      }
    } else {
      if (!this.isTruthy(left)) {
        return left;
      }
    }

    return this.evaluate(expr.right);
  }

  visitCallExpr(expr: Call): LoxValue {
    const callee = this.evaluate(expr.callee);

    const args: LoxValue[] = [];
    for (const arg of expr.args) {
      args.push(this.evaluate(arg));
    }

    if (!this.isCallable(callee)) {
      throw new RuntimeError("Can only call functions and classes.", expr.paren);
    }

    const function_ = callee as LoxCallable;
    if (args.length !== function_.arity()) {
      throw new RuntimeError(
        `Expected ${function_.arity()} arguments but got ${args.length}.`,
        expr.paren
      );
    }

    return function_.call(this, args);
  }

  visitGetExpr(expr: Get): LoxValue {
    const object = this.evaluate(expr.object);
    if (object instanceof LoxInstance) {
      return object.get(expr.name);
    }

    throw new RuntimeError("Only instances have properties.", expr.name);
  }

  visitSetExpr(expr: Set): LoxValue {
    const object = this.evaluate(expr.object);

    if (!(object instanceof LoxInstance)) {
      throw new RuntimeError("Only instances have fields.", expr.name);
    }

    const value = this.evaluate(expr.value);
    object.set(expr.name, value);
    return value;
  }

  visitThisExpr(expr: This): LoxValue {
    return this.lookUpVariable(expr.keyword, expr);
  }

  visitSuperExpr(expr: Super): LoxValue {
    const distance = this.locals.get(expr);
    if (distance === undefined) {
      throw new RuntimeError("Invalid super reference.", expr.keyword);
    }

    const superclass = this.environment.getAt(distance, "super") as LoxClass;
    const object = this.environment.getAt(distance - 1, "this") as LoxInstance;

    const method = superclass.findMethod(expr.method.lexeme);

    if (method === null) {
      throw new RuntimeError(`Undefined property '${expr.method.lexeme}'.`, expr.method);
    }

    return method.bind(object);
  }

  visitExpressionStmt(stmt: Expression): void {
    this.evaluate(stmt.expression);
  }

  visitPrintStmt(stmt: Print): void {
    const value = this.evaluate(stmt.expression);
    console.log(this.stringify(value));
  }

  visitVarStmt(stmt: Var): void {
    let value: LoxValue = null;
    if (stmt.initializer !== null) {
      value = this.evaluate(stmt.initializer);
    }

    this.environment.define(stmt.name.lexeme, value);
  }

  visitBlockStmt(stmt: Block): void {
    this.executeBlock(stmt.statements, new Environment(this.environment));
  }

  visitIfStmt(stmt: If): void {
    if (this.isTruthy(this.evaluate(stmt.condition))) {
      this.execute(stmt.thenBranch);
    } else if (stmt.elseBranch !== null) {
      this.execute(stmt.elseBranch);
    }
  }

  visitWhileStmt(stmt: While): void {
    while (this.isTruthy(this.evaluate(stmt.condition))) {
      this.execute(stmt.body);
    }
  }

  visitFunctionStmt(stmt: Function): void {
    const function_ = new LoxFunction(stmt, this.environment, false);
    this.environment.define(stmt.name.lexeme, function_);
  }

  visitReturnStmt(stmt: Return): void {
    let value: LoxValue = null;
    if (stmt.value !== null) {
      value = this.evaluate(stmt.value);
    }

    throw new ReturnValue(value);
  }

  visitClassStmt(stmt: Class): void {
    let superclass: LoxClass | null = null;
    if (stmt.superclass !== null) {
      const superclassValue = this.evaluate(stmt.superclass);
      if (!(superclassValue instanceof LoxClass)) {
        throw new RuntimeError("Superclass must be a class.", (stmt.superclass as Variable).name);
      }
      superclass = superclassValue;
    }

    this.environment.define(stmt.name.lexeme, null);

    if (stmt.superclass !== null) {
      this.environment = new Environment(this.environment);
      this.environment.define("super", superclass);
    }

    const methods: Map<string, LoxFunction> = new Map();
    for (const method of stmt.methods) {
      const function_ = new LoxFunction(method, this.environment, method.name.lexeme === "init");
      methods.set(method.name.lexeme, function_);
    }

    const klass = new LoxClass(stmt.name.lexeme, superclass, methods);

    if (superclass !== null) {
      this.environment = this.environment.enclosing!;
    }

    this.environment.assign(stmt.name, klass);
  }

  executeBlock(statements: Stmt[], environment: Environment): void {
    const previous = this.environment;
    try {
      this.environment = environment;

      for (const statement of statements) {
        this.execute(statement);
      }
    } finally {
      this.environment = previous;
    }
  }

  private evaluate(expr: Expr): LoxValue {
    return expr.accept(this);
  }

  private execute(stmt: Stmt): void {
    stmt.accept(this);
  }

  private lookUpVariable(name: Token, expr: Expr): LoxValue {
    const distance = this.locals.get(expr);
    if (distance !== undefined) {
      return this.environment.getAt(distance, name.lexeme) as LoxValue;
    }
    return this.globals.get(name) as LoxValue;
  }

  private isTruthy(value: LoxValue): boolean {
    if (value === null) {
      return false;
    }
    if (typeof value === "boolean") {
      return value;
    }
    return true;
  }

  private isEqual(a: LoxValue, b: LoxValue): boolean {
    if (a === null && b === null) {
      return true;
    }
    if (a === null) {
      return false;
    }
    return a === b;
  }

  private checkNumberOperand(operator: Token, operand: LoxValue): void {
    if (typeof operand === "number") {
      return;
    }
    throw new RuntimeError("Operand must be a number.", operator);
  }

  private checkNumberOperands(operator: Token, left: LoxValue, right: LoxValue): void {
    if (typeof left === "number" && typeof right === "number") {
      return;
    }
    throw new RuntimeError("Operands must be numbers.", operator);
  }

  private isCallable(value: LoxValue): boolean {
    return typeof value === "object" && value !== null && "call" in value && "arity" in value;
  }

  private stringify(value: LoxValue): string {
    if (value === null) {
      return "nil";
    }
    if (typeof value === "number") {
      let text = value.toString();
      if (text.endsWith(".0")) {
        text = text.substring(0, text.length - 2);
      }
      return text;
    }
    return String(value);
  }
}

export class ReturnValue extends Error {
  constructor(public readonly value: LoxValue) {
    super();
  }
}
