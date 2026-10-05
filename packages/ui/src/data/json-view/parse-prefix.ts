import { createScanner } from "jsonc-parser";

export type PrefixResult =
  | { status: "complete"; value: unknown }
  | {
      status: "incomplete" | "invalid";
      message: string;
      offset: number;
      value?: unknown;
    };

const STRING_PREFIX =
  /^"(?:[^"\\]|\\["\\/bfnrt]|\\u[\da-fA-F]{4})*(?:\\(?:u[\da-fA-F]{0,3})?)?$/;
const NUMBER_PREFIX = /^-?(?:0|[1-9]\d*)(?:\.\d+)?(?:[eE][+-]?\d*)?$/;
const FRACTION_PREFIX = /^-?(?:0|[1-9]\d*)\.$/;

function isScalarPrefix(raw: string): boolean {
  if (raw.startsWith('"')) {
    for (const character of raw) {
      if (character.charCodeAt(0) < 0x20) return false;
    }
    return STRING_PREFIX.test(raw);
  }
  return (
    raw === "-" ||
    NUMBER_PREFIX.test(raw) ||
    FRACTION_PREFIX.test(raw) ||
    ["true", "false", "null"].some((literal) => literal.startsWith(raw))
  );
}

export function parseJsonPrefix(source: string): PrefixResult {
  const scanner = createScanner(source);
  const token = () =>
    source.slice(
      scanner.getTokenOffset(),
      scanner.getTokenOffset() + scanner.getTokenLength(),
    );
  const issue = (
    status: "incomplete" | "invalid",
    message: string,
  ): PrefixResult => ({
    status,
    message,
    offset: scanner.getTokenOffset(),
  });
  function next() {
    do {
      scanner.scan();
    } while (/^[ \t\r\n]+$/.test(token()));
  }
  function retain(
    result: PrefixResult,
    value: Record<string, unknown> | unknown[],
  ): PrefixResult {
    if (result.status !== "incomplete") return result;
    return { ...result, ...(Object.keys(value).length > 0 ? { value } : {}) };
  }
  function readScalar(): PrefixResult {
    const offset = scanner.getTokenOffset();
    const raw = source.slice(offset, offset + scanner.getTokenLength());
    let value: unknown;
    try {
      value = JSON.parse(raw);
    } catch (error) {
      if (!(error instanceof SyntaxError)) throw error;
      return issue(
        offset + raw.length === source.length && isScalarPrefix(raw)
          ? "incomplete"
          : "invalid",
        "Expected a complete JSON string, number, boolean, or null",
      );
    }
    next();
    return { status: "complete", value };
  }
  function readValue(): PrefixResult {
    if (token() === "")
      return issue("incomplete", "Input ended before a JSON value");
    if (token() === "{") return readObject();
    if (token() === "[") return readArray();
    return readScalar();
  }
  function readObject(): PrefixResult {
    const value: Record<string, unknown> = {};
    next();
    if (token() === "}") {
      next();
      return { status: "complete", value };
    }
    while (true) {
      if (token() === "")
        return retain(
          issue("incomplete", "Input ended before a property name or '}'"),
          value,
        );
      if (!token().startsWith('"'))
        return issue("invalid", "Expected a quoted property name");
      const key = readScalar();
      if (key.status !== "complete") return retain(key, value);
      if (typeof key.value !== "string")
        throw new Error("JSON property scanner returned a non-string key");
      if (token() === "")
        return retain(issue("incomplete", "Input ended before ':'"), value);
      if (token() !== ":")
        return issue("invalid", "Expected ':' after the property name");
      next();
      const child = readValue();
      if ("value" in child)
        Object.defineProperty(value, key.value, {
          value: child.value,
          enumerable: true,
          configurable: true,
          writable: true,
        });
      if (child.status !== "complete") return retain(child, value);
      if (token() === "}") {
        next();
        return { status: "complete", value };
      }
      if (token() === "")
        return retain(issue("incomplete", "Input ended before '}'"), value);
      if (token() !== ",")
        return issue("invalid", "Expected ',' or '}' after the property value");
      next();
    }
  }
  function readArray(): PrefixResult {
    const value: unknown[] = [];
    next();
    if (token() === "]") {
      next();
      return { status: "complete", value };
    }
    while (true) {
      const child = readValue();
      if ("value" in child) value.push(child.value);
      if (child.status !== "complete") return retain(child, value);
      if (token() === "]") {
        next();
        return { status: "complete", value };
      }
      if (token() === "")
        return retain(issue("incomplete", "Input ended before ']'"), value);
      if (token() !== ",")
        return issue("invalid", "Expected ',' or ']' after the array item");
      next();
    }
  }
  next();
  const result = readValue();
  if (result.status === "complete" && token() !== "")
    return issue("invalid", "Unexpected content after the JSON value");
  return result;
}
