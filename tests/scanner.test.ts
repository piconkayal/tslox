import { TokenType } from "../src/error";
import { Scanner } from "../src/scanner";

describe("Scanner", () => {
  test("scans single character tokens", () => {
    const scanner = new Scanner("(){}");
    const tokens = scanner.scanTokens();

    expect(tokens[0].type).toBe(TokenType.LEFT_PAREN);
    expect(tokens[1].type).toBe(TokenType.RIGHT_PAREN);
    expect(tokens[2].type).toBe(TokenType.LEFT_BRACE);
    expect(tokens[3].type).toBe(TokenType.RIGHT_BRACE);
    expect(tokens[4].type).toBe(TokenType.EOF);
  });

  test("scans numbers", () => {
    const scanner = new Scanner("123 45.67");
    const tokens = scanner.scanTokens();

    expect(tokens[0].type).toBe(TokenType.NUMBER);
    expect(tokens[0].literal).toBe(123);
    expect(tokens[1].type).toBe(TokenType.NUMBER);
    expect(tokens[1].literal).toBe(45.67);
  });

  test("scans strings", () => {
    const scanner = new Scanner('"hello" "world"');
    const tokens = scanner.scanTokens();

    expect(tokens[0].type).toBe(TokenType.STRING);
    expect(tokens[0].literal).toBe("hello");
    expect(tokens[1].type).toBe(TokenType.STRING);
    expect(tokens[1].literal).toBe("world");
  });

  test("scans keywords", () => {
    const scanner = new Scanner("var fun class");
    const tokens = scanner.scanTokens();

    expect(tokens[0].type).toBe(TokenType.VAR);
    expect(tokens[1].type).toBe(TokenType.FUN);
    expect(tokens[2].type).toBe(TokenType.CLASS);
  });

  test("scans identifiers", () => {
    const scanner = new Scanner("foo bar123");
    const tokens = scanner.scanTokens();

    expect(tokens[0].type).toBe(TokenType.IDENTIFIER);
    expect(tokens[0].lexeme).toBe("foo");
    expect(tokens[1].type).toBe(TokenType.IDENTIFIER);
    expect(tokens[1].lexeme).toBe("bar123");
  });
});
