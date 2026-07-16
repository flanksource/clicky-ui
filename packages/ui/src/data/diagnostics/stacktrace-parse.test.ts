import { describe, expect, it } from "vitest";
import { parseJavaStackTrace } from "./stacktrace-parse";

describe("parseJavaStackTrace", () => {
  it("parses an exception header and frames", () => {
    const parsed = parseJavaStackTrace(
      "java.lang.IllegalStateException: failed\n\tat com.example.App.run(App.java:42)",
    );
    expect(parsed.exceptionClass).toBe("java.lang.IllegalStateException");
    expect(parsed.message).toBe("failed");
    expect(parsed.frames[0]).toMatchObject({
      functionName: "com.example.App.run",
      file: "App.java",
      line: 42,
    });
  });

  it("handles exception headers with long whitespace suffixes", () => {
    const parsed = parseJavaStackTrace(`$Error:${" ".repeat(50_000)}`);
    expect(parsed.exceptionClass).toBe("$Error");
    expect(parsed.message).toBeUndefined();
  });
});
