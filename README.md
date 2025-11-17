# tslox - Lox Tree-Walk Interpreter

A complete implementation of a tree-walk interpreter for the Lox programming language, built in TypeScript following the structure from "Crafting Interpreters" by Robert Nystrom (Part II: A Tree-Walk Interpreter, Chapters 4-13).

## Features

- Complete lexer/tokenizer for Lox source code
- Abstract Syntax Tree (AST) representation
- Recursive descent parser
- Expression evaluation engine
- Variable declarations and assignments
- Control flow (if/else, while loops, for loops)
- Functions with closures
- Static analysis and variable resolution
- Object-oriented programming with classes
- Class inheritance and method overriding

## Requirements

- Node.js (v18 or higher)
- pnpm (v10 or higher)

## Installation

```bash
pnpm install
```

## Usage

### Run a Lox file

```bash
pnpm start path/to/file.lox
```

### Interactive REPL

```bash
pnpm dev
```

### Build

```bash
pnpm build
```

### Run tests

```bash
pnpm test
```

### Linting

```bash
pnpm lint
```

### Formatting

```bash
pnpm format
```

## Project Structure

```
src/
  ast/          # AST node definitions (expressions and statements)
  error.ts      # Error handling and token definitions
  scanner.ts    # Lexer/tokenizer
  parser.ts     # Recursive descent parser
  interpreter.ts # Expression and statement evaluator
  environment.ts # Variable scoping and storage
  resolver.ts   # Static analysis and variable resolution
  loxFunction.ts # Function callable implementation
  loxClass.ts   # Class and instance implementation
  lox.ts        # Main entry point (REPL and file execution)

tests/          # Unit tests
```

## Documentation

- **[lox-guide.md](./docs/lox-guide.md)** - Comprehensive guide to the Lox language with detailed examples

## Example Lox Programs

### Hello World

```lox
print "Hello, World!";
```

### Variables and Functions

```lox
fun greet(name) {
  print "Hello, " + name + "!";
}

greet("World");
```

### Classes and Inheritance

```lox
class Animal {
  init(name) {
    this.name = name;
  }

  speak() {
    print this.name + " makes a sound.";
  }
}

class Dog < Animal {
  speak() {
    print this.name + " barks.";
  }
}

var dog = Dog("Rex");
dog.speak();
```

## Tooling

- **Package Manager**: pnpm
- **Linter**: oxlint
- **Formatter**: biome
- **Testing**: Jest with ts-jest
- **Build Tool**: TypeScript compiler

## License

MIT

