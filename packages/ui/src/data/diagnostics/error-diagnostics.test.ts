import { describe, expect, it } from "vitest";
import { parseDiagnosticsStackTrace } from "./error-diagnostics";

describe("parseDiagnosticsStackTrace", () => {
  it("parses file, line, and function names", () => {
    const parsed = parseDiagnosticsStackTrace(
      "failure\n--- at github.com/flanksource/app/main.go:42 main.run",
    );
    expect(parsed.headline).toBe("failure");
    expect(parsed.frames).toEqual([
      {
        raw: "--- at github.com/flanksource/app/main.go:42 main.run",
        file: "github.com/flanksource/app/main.go",
        line: 42,
        functionName: "main.run",
      },
    ]);
  });

  it("handles long whitespace after a line number", () => {
    const line = `--- at a:9${" ".repeat(50_000)}fn`;
    const parsed = parseDiagnosticsStackTrace(line);
    expect(parsed.frames).toEqual([
      { raw: line, file: "a", line: 9, functionName: "fn" },
    ]);
  });
});
