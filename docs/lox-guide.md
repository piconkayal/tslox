# Lox Language Guide

A comprehensive guide to the Lox programming language with examples.

## Table of Contents

1. [Introduction](#introduction)
2. [Basic Syntax](#basic-syntax)
3. [Data Types](#data-types)
4. [Variables](#variables)
5. [Expressions](#expressions)
6. [Statements](#statements)
7. [Control Flow](#control-flow)
8. [Functions](#functions)
9. [Classes](#classes)
10. [Inheritance](#inheritance)
11. [Examples](#examples)

## Introduction

Lox is a dynamically typed, object-oriented scripting language. It supports:
- Numbers (integers and floating-point)
- Strings
- Booleans (`true`, `false`)
- `nil` (null value)
- Functions
- Classes and instances
- Closures

## Basic Syntax

### Comments

```lox
// This is a single-line comment
// Comments start with // and continue to the end of the line
```

### Semicolons

Statements must end with a semicolon:

```lox
print "Hello";
var x = 10;
```

## Data Types

### Numbers

Lox supports both integers and floating-point numbers:

```lox
var integer = 42;
var decimal = 3.14;
var negative = -10;
var scientific = 1.5e2; // 150.0
```

### Strings

Strings are enclosed in double quotes:

```lox
var greeting = "Hello, World!";
var empty = "";
var multiline = "Line 1\nLine 2";
```

### Booleans

```lox
var isTrue = true;
var isFalse = false;
```

### Nil

The `nil` value represents the absence of a value:

```lox
var nothing = nil;
```

## Variables

### Declaration

Variables are declared using the `var` keyword:

```lox
var name = "Lox";
var age = 25;
var isActive = true;
```

### Assignment

Variables can be reassigned:

```lox
var x = 10;
x = 20;
x = x + 5;
```

### Undefined Variables

Accessing an undefined variable is an error:

```lox
// This will cause a runtime error:
print undefinedVar;
```

## Expressions

### Arithmetic Operations

```lox
var sum = 10 + 5;        // 15
var difference = 10 - 5;  // 5
var product = 10 * 5;     // 50
var quotient = 10 / 5;    // 2.0
var remainder = 10 % 3;   // 1
```

### Comparison Operators

```lox
var equal = 5 == 5;           // true
var notEqual = 5 != 3;        // true
var lessThan = 3 < 5;         // true
var lessEqual = 5 <= 5;       // true
var greaterThan = 10 > 5;     // true
var greaterEqual = 10 >= 10;  // true
```

### Logical Operators

```lox
var andResult = true and false;  // false
var orResult = true or false;    // true
var notResult = !true;            // false
```

### String Concatenation

Strings can be concatenated with the `+` operator:

```lox
var greeting = "Hello" + ", " + "World!";  // "Hello, World!"
var number = 42;
var message = "The answer is " + number;    // "The answer is 42"
```

### Grouping

Parentheses can be used to group expressions:

```lox
var result = (2 + 3) * 4;  // 20
var complex = (1 + 2) * (3 + 4);  // 21
```

## Statements

### Print Statement

The `print` statement outputs values:

```lox
print "Hello, World!";
print 42;
print true;
print nil;
```

### Expression Statements

Any expression can be used as a statement:

```lox
"Hello";  // Evaluates but doesn't print
10 + 20;  // Evaluates but doesn't print
```

### Block Statements

Multiple statements can be grouped in a block:

```lox
{
  var x = 10;
  var y = 20;
  print x + y;
}
```

## Control Flow

### If Statements

```lox
if (condition) {
  print "Condition is true";
} else {
  print "Condition is false";
}
```

Example:

```lox
var age = 18;
if (age >= 18) {
  print "You are an adult";
} else {
  print "You are a minor";
}
```

### While Loops

```lox
var count = 0;
while (count < 5) {
  print count;
  count = count + 1;
}
```

### For Loops

For loops are syntactic sugar for while loops:

```lox
for (var i = 0; i < 10; i = i + 1) {
  print i;
}
```

This is equivalent to:

```lox
{
  var i = 0;
  while (i < 10) {
    print i;
    i = i + 1;
  }
}
```

For loop with initialization:

```lox
for (var i = 0; i < 5; i = i + 1) {
  print i;
}
```

For loop without initialization:

```lox
var i = 0;
for (; i < 5; i = i + 1) {
  print i;
}
```

For loop without increment:

```lox
for (var i = 0; i < 5;) {
  print i;
  i = i + 1;
}
```

Infinite loop:

```lox
for (;;) {
  print "Infinite loop";
  // Break with Ctrl+C
}
```

## Functions

### Function Declaration

Functions are declared using the `fun` keyword:

```lox
fun greet(name) {
  print "Hello, " + name + "!";
}

greet("Alice");
greet("Bob");
```

### Function Parameters

Functions can take multiple parameters:

```lox
fun add(a, b) {
  return a + b;
}

print add(5, 3);  // 8
```

### Return Statements

Functions can return values:

```lox
fun multiply(x, y) {
  return x * y;
}

var result = multiply(6, 7);
print result;  // 42
```

Functions without a return statement return `nil`:

```lox
fun doNothing() {
  // No return statement
}

var result = doNothing();
print result;  // nil
```

### Closures

Functions can capture variables from their enclosing scope:

```lox
fun makeCounter() {
  var count = 0;
  fun counter() {
    count = count + 1;
    return count;
  }
  return counter;
}

var counter1 = makeCounter();
var counter2 = makeCounter();

print counter1();  // 1
print counter1();  // 2
print counter2();  // 1
print counter1();  // 3
```

### Native Functions

Lox provides a built-in `clock` function that returns the current time:

```lox
var start = clock();
// ... do some work ...
var elapsed = clock() - start;
print "Elapsed time: " + elapsed;
```

## Classes

### Class Declaration

Classes are declared using the `class` keyword:

```lox
class Person {
  init(name) {
    this.name = name;
  }

  greet() {
    print "Hello, I'm " + this.name;
  }
}
```

### Creating Instances

Instances are created by calling the class:

```lox
var person = Person("Alice");
person.greet();  // "Hello, I'm Alice"
```

### Properties

Properties are accessed and set using dot notation:

```lox
class Point {
  init(x, y) {
    this.x = x;
    this.y = y;
  }
}

var point = Point(3, 4);
print point.x;  // 3
print point.y;  // 4

point.x = 10;
print point.x;  // 10
```

### Methods

Methods are functions defined within a class:

```lox
class Rectangle {
  init(width, height) {
    this.width = width;
    this.height = height;
  }

  area() {
    return this.width * this.height;
  }

  perimeter() {
    return 2 * (this.width + this.height);
  }
}

var rect = Rectangle(5, 10);
print rect.area();       // 50
print rect.perimeter();  // 30
```

### This Keyword

The `this` keyword refers to the current instance:

```lox
class Counter {
  init() {
    this.value = 0;
  }

  increment() {
    this.value = this.value + 1;
    return this.value;
  }

  getValue() {
    return this.value;
  }
}

var counter = Counter();
counter.increment();
counter.increment();
print counter.getValue();  // 2
```

## Inheritance

### Superclass

Classes can inherit from other classes using `<`:

```lox
class Animal {
  init(name) {
    this.name = name;
  }

  speak() {
    print this.name + " makes a sound";
  }
}

class Dog < Animal {
  speak() {
    print this.name + " barks";
  }
}

class Cat < Animal {
  speak() {
    print this.name + " meows";
  }
}
```

### Method Overriding

Subclasses can override methods from their superclass:

```lox
var dog = Dog("Rex");
dog.speak();  // "Rex barks"

var cat = Cat("Whiskers");
cat.speak();  // "Whiskers meows"
```

### Super Keyword

The `super` keyword calls methods from the superclass:

```lox
class Animal {
  init(name) {
    this.name = name;
  }

  speak() {
    print this.name + " makes a sound";
  }
}

class Dog < Animal {
  speak() {
    super.speak();
    print this.name + " barks loudly";
  }
}

var dog = Dog("Rex");
dog.speak();
// Output:
// Rex makes a sound
// Rex barks loudly
```

### Constructor Inheritance

Subclasses can call the superclass constructor:

```lox
class Vehicle {
  init(brand) {
    this.brand = brand;
  }
}

class Car < Vehicle {
  init(brand, model) {
    super.init(brand);
    this.model = model;
  }
}

var car = Car("Toyota", "Camry");
print car.brand;  // "Toyota"
print car.model;  // "Camry"
```

## Examples

### Example 1: Fibonacci Sequence

```lox
fun fibonacci(n) {
  if (n <= 1) {
    return n;
  }
  return fibonacci(n - 1) + fibonacci(n - 2);
}

for (var i = 0; i < 10; i = i + 1) {
  print fibonacci(i);
}
```

### Example 2: Factorial

```lox
fun factorial(n) {
  if (n <= 1) {
    return 1;
  }
  return n * factorial(n - 1);
}

print factorial(5);  // 120
```

### Example 3: Simple Calculator

```lox
class Calculator {
  init() {
    this.result = 0;
  }

  add(value) {
    this.result = this.result + value;
    return this;
  }

  subtract(value) {
    this.result = this.result - value;
    return this;
  }

  multiply(value) {
    this.result = this.result * value;
    return this;
  }

  divide(value) {
    this.result = this.result / value;
    return this;
  }

  getResult() {
    return this.result;
  }
}

var calc = Calculator();
calc.add(10).multiply(2).subtract(5);
print calc.getResult();  // 15
```

### Example 4: Bank Account

```lox
class BankAccount {
  init(owner, initialBalance) {
    this.owner = owner;
    this.balance = initialBalance;
  }

  deposit(amount) {
    this.balance = this.balance + amount;
    print "Deposited " + amount + ". New balance: " + this.balance;
  }

  withdraw(amount) {
    if (amount > this.balance) {
      print "Insufficient funds";
      return;
    }
    this.balance = this.balance - amount;
    print "Withdrew " + amount + ". New balance: " + this.balance;
  }

  getBalance() {
    return this.balance;
  }
}

var account = BankAccount("Alice", 1000);
account.deposit(500);
account.withdraw(200);
print "Final balance: " + account.getBalance();
```

### Example 5: Shape Hierarchy

```lox
class Shape {
  init(name) {
    this.name = name;
  }

  area() {
    return 0;
  }

  describe() {
    print "I am a " + this.name + " with area " + this.area();
  }
}

class Rectangle < Shape {
  init(width, height) {
    super.init("Rectangle");
    this.width = width;
    this.height = height;
  }

  area() {
    return this.width * this.height;
  }
}

class Circle < Shape {
  init(radius) {
    super.init("Circle");
    this.radius = radius;
  }

  area() {
    return 3.14159 * this.radius * this.radius;
  }
}

var rect = Rectangle(5, 10);
rect.describe();  // "I am a Rectangle with area 50"

var circle = Circle(3);
circle.describe();  // "I am a Circle with area 28.27431"
```

### Example 6: Higher-Order Functions

```lox
fun map(list, fn) {
  var result = [];
  for (var i = 0; i < list.length; i = i + 1) {
    result[i] = fn(list[i]);
  }
  return result;
}

fun square(x) {
  return x * x;
}

// Note: Arrays are not built-in, but you can simulate with objects
// This is a conceptual example
```

### Example 7: Counter with Closure

```lox
fun createCounter(start, step) {
  var current = start;
  fun counter() {
    var value = current;
    current = current + step;
    return value;
  }
  return counter;
}

var counter1 = createCounter(0, 1);
var counter2 = createCounter(10, 5);

print counter1();  // 0
print counter1();  // 1
print counter2();  // 10
print counter2();  // 15
print counter1();  // 2
```

### Example 8: Simple Stack

```lox
class Stack {
  init() {
    this.items = [];
    this.top = 0;
  }

  push(item) {
    this.items[this.top] = item;
    this.top = this.top + 1;
  }

  pop() {
    if (this.top == 0) {
      print "Stack is empty";
      return nil;
    }
    this.top = this.top - 1;
    return this.items[this.top];
  }

  peek() {
    if (this.top == 0) {
      return nil;
    }
    return this.items[this.top - 1];
  }

  isEmpty() {
    return this.top == 0;
  }
}

var stack = Stack();
stack.push(1);
stack.push(2);
stack.push(3);
print stack.pop();  // 3
print stack.pop();  // 2
print stack.peek(); // 1
```

## Language Limitations

Lox is a simple language and has some limitations:

1. **No Arrays**: Arrays are not built-in, though you can simulate them with objects
2. **No Modules**: There's no module system or imports
3. **No Standard Library**: Only the `clock` function is provided
4. **No Exception Handling**: Errors stop execution
5. **No Generics**: No generic types or templates
6. **No Pattern Matching**: No switch/case or pattern matching
7. **No Operator Overloading**: Cannot define custom operators

## Best Practices

1. **Use meaningful variable names**: `var userName` is better than `var u`
2. **Keep functions small**: Each function should do one thing
3. **Use classes for related data**: Group related properties and methods
4. **Leverage closures**: Use closures for encapsulation and state management
5. **Document complex logic**: Use comments to explain non-obvious code
6. **Handle edge cases**: Check for nil values and boundary conditions

## Running Examples

Save any example to a `.lox` file and run it:

```bash
pnpm start example.lox
```

Or use the interactive REPL:

```bash
pnpm dev
```

Then type your code directly:

```
> var x = 10;
> print x;
10
> fun add(a, b) { return a + b; }
> print add(5, 3);
8
```

