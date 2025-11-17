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
import { LoxError, type Token } from "./error.js";
import type { Interpreter } from "./interpreter.js";

enum FunctionType {
  NONE = "NONE",
  FUNCTION = "FUNCTION",
  INITIALIZER = "INITIALIZER",
  METHOD = "METHOD",
}

enum ClassType {
  NONE = "NONE",
  CLASS = "CLASS",
  SUBCLASS = "SUBCLASS",
}

export class Resolver implements ExprVisitor<void>, StmtVisitor<void> {
  private readonly scopes: Map<string, boolean>[] = [];
  private currentFunction = FunctionType.NONE;
  private currentClass = ClassType.NONE;

  constructor(private readonly interpreter: Interpreter) {}

  resolve(stmts: Stmt[]): void {
    for (const stmt of stmts) {
      this.resolveStmt(stmt);
    }
  }

  private resolveStmt(stmt: Stmt): void {
    stmt.accept(this);
  }

  private resolveExpr(expr: Expr): void {
    expr.accept(this);
  }

  private resolveFunction(func: Function, type: FunctionType): void {
    const enclosingFunction = this.currentFunction;
    this.currentFunction = type;

    this.beginScope();
    for (const param of func.params) {
      this.declare(param);
      this.define(param);
    }
    this.resolveStmts(func.body);
    this.endScope();

    this.currentFunction = enclosingFunction;
  }

  private resolveLocal(expr: Expr, name: Token): void {
    for (let i = this.scopes.length - 1; i >= 0; i--) {
      if (this.scopes[i].has(name.lexeme)) {
        this.interpreter.resolve(expr, this.scopes.length - 1 - i);
        return;
      }
    }
  }

  private declare(name: Token): void {
    if (this.scopes.length === 0) {
      return;
    }

    const scope = this.scopes[this.scopes.length - 1];
    if (scope.has(name.lexeme)) {
      throw new LoxError(`Already a variable with this name in this scope.`, name.line);
    }

    scope.set(name.lexeme, false);
  }

  private define(name: Token): void {
    if (this.scopes.length === 0) {
      return;
    }
    this.scopes[this.scopes.length - 1].set(name.lexeme, true);
  }

  private beginScope(): void {
    this.scopes.push(new Map());
  }

  private endScope(): void {
    this.scopes.pop();
  }

  private resolveStmts(statements: Stmt[]): void {
    for (const statement of statements) {
      this.resolveStmt(statement);
    }
  }

  visitBlockStmt(stmt: Block): void {
    this.beginScope();
    this.resolveStmts(stmt.statements);
    this.endScope();
  }

  visitVarStmt(stmt: Var): void {
    this.declare(stmt.name);
    if (stmt.initializer !== null) {
      this.resolveExpr(stmt.initializer);
    }
    this.define(stmt.name);
  }

  visitVariableExpr(expr: Variable): void {
    if (
      this.scopes.length > 0 &&
      this.scopes[this.scopes.length - 1].get(expr.name.lexeme) === false
    ) {
      throw new LoxError("Can't read local variable in its own initializer.", expr.name.line);
    }

    this.resolveLocal(expr, expr.name);
  }

  visitAssignExpr(expr: Assign): void {
    this.resolveExpr(expr.value);
    this.resolveLocal(expr, expr.name);
  }

  visitFunctionStmt(stmt: Function): void {
    this.declare(stmt.name);
    this.define(stmt.name);

    this.resolveFunction(stmt, FunctionType.FUNCTION);
  }

  visitExpressionStmt(stmt: Expression): void {
    this.resolveExpr(stmt.expression);
  }

  visitIfStmt(stmt: If): void {
    this.resolveExpr(stmt.condition);
    this.resolveStmt(stmt.thenBranch);
    if (stmt.elseBranch !== null) {
      this.resolveStmt(stmt.elseBranch);
    }
  }

  visitPrintStmt(stmt: Print): void {
    this.resolveExpr(stmt.expression);
  }

  visitReturnStmt(stmt: Return): void {
    if (this.currentFunction === FunctionType.NONE) {
      throw new LoxError("Can't return from top-level code.", stmt.keyword.line);
    }

    if (stmt.value !== null) {
      if (this.currentFunction === FunctionType.INITIALIZER) {
        throw new LoxError("Can't return a value from an initializer.", stmt.keyword.line);
      }

      this.resolveExpr(stmt.value);
    }
  }

  visitWhileStmt(stmt: While): void {
    this.resolveExpr(stmt.condition);
    this.resolveStmt(stmt.body);
  }

  visitBinaryExpr(expr: Binary): void {
    this.resolveExpr(expr.left);
    this.resolveExpr(expr.right);
  }

  visitCallExpr(expr: Call): void {
    this.resolveExpr(expr.callee);

    for (const arg of expr.args) {
      this.resolveExpr(arg);
    }
  }

  visitGetExpr(expr: Get): void {
    this.resolveExpr(expr.object);
  }

  visitGroupingExpr(expr: Grouping): void {
    this.resolveExpr(expr.expression);
  }

  visitLiteralExpr(_expr: Literal): void {
    // Nothing to resolve
  }

  visitLogicalExpr(expr: Logical): void {
    this.resolveExpr(expr.left);
    this.resolveExpr(expr.right);
  }

  visitSetExpr(expr: Set): void {
    this.resolveExpr(expr.value);
    this.resolveExpr(expr.object);
  }

  visitThisExpr(expr: This): void {
    if (this.currentClass === ClassType.NONE) {
      throw new LoxError("Can't use 'this' outside of a class.", expr.keyword.line);
    }

    this.resolveLocal(expr, expr.keyword);
  }

  visitSuperExpr(expr: Super): void {
    if (this.currentClass === ClassType.NONE) {
      throw new LoxError("Can't use 'super' outside of a class.", expr.keyword.line);
    }
    if (this.currentClass !== ClassType.SUBCLASS) {
      throw new LoxError("Can't use 'super' in a class with no superclass.", expr.keyword.line);
    }

    this.resolveLocal(expr, expr.keyword);
  }

  visitUnaryExpr(expr: Unary): void {
    this.resolveExpr(expr.right);
  }

  visitClassStmt(stmt: Class): void {
    const enclosingClass = this.currentClass;
    this.currentClass = ClassType.CLASS;

    this.declare(stmt.name);
    this.define(stmt.name);

    if (
      stmt.superclass !== null &&
      stmt.name.lexeme === (stmt.superclass as Variable).name.lexeme
    ) {
      throw new LoxError("A class can't inherit from itself.", stmt.name.line);
    }

    if (stmt.superclass !== null) {
      this.currentClass = ClassType.SUBCLASS;
      this.resolveExpr(stmt.superclass);
    }

    if (stmt.superclass !== null) {
      this.beginScope();
      this.scopes[this.scopes.length - 1].set("super", true);
    }

    this.beginScope();
    this.scopes[this.scopes.length - 1].set("this", true);

    for (const method of stmt.methods) {
      const declaration = FunctionType.INITIALIZER;
      if (method.name.lexeme === "init") {
        this.resolveFunction(method, declaration);
      } else {
        this.resolveFunction(method, FunctionType.METHOD);
      }
    }

    this.endScope();

    if (stmt.superclass !== null) {
      this.endScope();
    }

    this.currentClass = enclosingClass;
  }
}
