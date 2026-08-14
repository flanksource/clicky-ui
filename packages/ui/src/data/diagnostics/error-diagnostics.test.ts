import { describe, expect, it } from "vitest";
import {
  normalizeErrorDiagnostics,
  parseDiagnosticsStackTrace,
} from "./error-diagnostics";

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

describe("normalizeErrorDiagnostics", () => {
  // Mirrors entity.ErrorResponse on the Go side: hint and details are part of
  // the wire format, so dropping them loses the two fields that most often say
  // what to do next and what actually ran.
  it("keeps the hint and the detail blocks the server sent", () => {
    const diagnostics = normalizeErrorDiagnostics({
      code: "query_failed",
      message: "relation \"sessions\" does not exist",
      trace: "9f2b1c4d5e6a7b8c",
      hint: "Run the migrations before querying this profile",
      context: { profile: "gavel-sessions" },
      details: [
        { label: "Query", value: "SELECT * FROM sessions", content_type: "text/sql" },
      ],
    });

    expect(diagnostics).not.toBeNull();
    expect(diagnostics?.message).toBe("relation \"sessions\" does not exist");
    expect(diagnostics?.trace).toBe("9f2b1c4d5e6a7b8c");
    expect(diagnostics?.context).toEqual([
      ["Hint", "Run the migrations before querying this profile"],
      ["profile", "gavel-sessions"],
    ]);
    expect(diagnostics?.details).toEqual([
      { label: "Query", value: "SELECT * FROM sessions" },
    ]);
  });

  // `details` is overloaded on the wire: an array of blocks from our own
  // envelope, but a bare string in third-party error bodies, where it is the
  // message. Both readings have to keep working.
  it("still reads a string details field as the message", () => {
    const diagnostics = normalizeErrorDiagnostics({
      details: "upstream refused the connection",
    });

    expect(diagnostics?.message).toBe("upstream refused the connection");
    expect(diagnostics?.details).toBeUndefined();
  });

  it("ignores detail entries with no usable value", () => {
    const diagnostics = normalizeErrorDiagnostics({
      message: "render failed",
      details: [{ label: "Query" }, { value: "orphan" }, "not an object"],
    });

    expect(diagnostics?.details).toBeUndefined();
  });
});
