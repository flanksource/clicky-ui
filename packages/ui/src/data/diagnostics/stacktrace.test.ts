import { describe, expect, it } from "vitest";
import type { StackRecord } from "../traces/types";
import { countGoroutinesByState, goroutinesFromRecords, parseGoroutineDump } from "./stacktrace";

const dump = `goroutine 1 [running]:
main.main()
\t/home/user/go/src/app/main.go:42 +0x1a2
runtime.main()
\truntime/proc.go:250 +0x204

goroutine 17 [chan receive, 2 minutes]:
app/server.(*Server).serve(0xc0001b2000)
\t/home/user/go/src/app/server/server.go:118 +0xa5
created by app/server.New
\t/home/user/go/src/app/server/server.go:58 +0xe0

goroutine 22 [select]:
database/sql.(*DB).connectionOpener(0xc000110000)
\tdatabase/sql/sql.go:1196 +0x88
`;

describe("parseGoroutineDump", () => {
  it("returns empty array for empty input", () => {
    expect(parseGoroutineDump("")).toEqual([]);
    expect(parseGoroutineDump("   \n  ")).toEqual([]);
  });

  it("parses header id and state", () => {
    const goroutines = parseGoroutineDump(dump);
    expect(goroutines.map((g) => g.id)).toEqual([1, 17, 22]);
    expect(goroutines.map((g) => g.state)).toEqual(["running", "chan receive", "select"]);
    expect(goroutines[1].rawState).toBe("chan receive, 2 minutes");
  });

  it("attaches file:line to the preceding frame", () => {
    const [first] = parseGoroutineDump(dump);
    expect(first.frames[0].functionName).toBe("main.main()");
    expect(first.frames[0].file).toBe("app/main.go");
    expect(first.frames[0].line).toBe(42);
    expect(first.frames[0].location).toBe("app/main.go:42");
  });

  it("marks runtime frames and counts user frames", () => {
    const [first] = parseGoroutineDump(dump);
    const runtimeFrame = first.frames.find((f) => f.functionName.startsWith("runtime."));
    expect(runtimeFrame?.runtime).toBe(true);
    expect(first.userFrameCount).toBe(1);
  });

  it("recognizes created_by frames", () => {
    const [, g17] = parseGoroutineDump(dump);
    const createdBy = g17.frames.find((f) => f.kind === "created_by");
    expect(createdBy?.functionName).toBe("app/server.New");
  });

  it("counts goroutines by state", () => {
    const counts = countGoroutinesByState(parseGoroutineDump(dump));
    expect(counts.get("running")).toBe(1);
    expect(counts.get("chan receive")).toBe(1);
    expect(counts.get("select")).toBe(1);
  });

  it("skips blocks without a header line", () => {
    const input = "not a header\nrandom text\n\ngoroutine 5 [idle]:\nfoo.Bar()\n\tfoo.go:1 +0x0";
    const goroutines = parseGoroutineDump(input);
    expect(goroutines).toHaveLength(1);
    expect(goroutines[0].id).toBe(5);
  });

  it("parses Windows file locations and uppercase offsets", () => {
    const input = "goroutine 1 [running]:\nfoo.Bar()\n\tC:\\src\\foo.go:42 +0XABC";
    const [goroutine] = parseGoroutineDump(input);
    expect(goroutine.frames[0].file).toBe("C:\\src\\foo.go");
    expect(goroutine.frames[0].line).toBe(42);
  });

  describe("goroutinesFromRecords", () => {
    const base = {
      checkpointId: "c1",
      takenAt: "2026-10-01T09:00:00.000Z",
      reason: "timeout",
      transport: "inprocess",
      key: "1:0",
      pid: 1,
      format: "go" as const,
      raw: "goroutine 17 [chan receive, 2 minutes]:",
    };
    const record: StackRecord = {
      ...base,
      goroutineId: 17,
      state: "chan receive",
      waitMinutes: 2,
      lockedToThread: true,
      frames: [
        { func: "app/server.(*Server).serve", file: "/home/user/go/src/app/server/server.go", line: 118 },
        { func: "runtime.gopark", file: "/usr/local/go1.22/src/runtime/proc.go", line: 400 },
      ],
      createdBy: { func: "app/server.New", file: "/home/user/go/src/app/server/server.go", line: 58 },
    };

    it("builds the same goroutine the text parser builds from the equivalent dump", () => {
      const [fromRecord] = goroutinesFromRecords([record]);
      const [fromText] = parseGoroutineDump(
        `goroutine 17 [chan receive, 2 minutes, locked to thread]:
app/server.(*Server).serve(0xc0001b2000)
\t/home/user/go/src/app/server/server.go:118 +0xa5
runtime.gopark(0x0)
\t/usr/local/go1.22/src/runtime/proc.go:400 +0xce
created by app/server.New
\t/home/user/go/src/app/server/server.go:58 +0xe0
`,
      );
      expect(fromRecord).toMatchObject({
        id: fromText!.id,
        state: fromText!.state,
        rawState: fromText!.rawState,
        userFrameCount: fromText!.userFrameCount,
      });
      expect(fromRecord!.frames.map((f) => [f.kind, f.runtime, f.location])).toEqual(
        fromText!.frames.map((f) => [f.kind, f.runtime, f.location]),
      );
    });

    it("keeps a method receiver in the display name and strips only the package path", () => {
      const [goroutine] = goroutinesFromRecords([record]);
      expect(goroutine!.frames.map((f) => f.displayName)).toEqual(["server.(*Server).serve", "runtime.gopark", "server.New"]);
    });

    it("carries the raw text and a searchable header", () => {
      const [goroutine] = goroutinesFromRecords([record]);
      expect(goroutine!.raw).toBe(base.raw);
      expect(goroutine!.searchText).toContain("goroutine 17 [chan receive, 2 minutes, locked to thread]");
    });

    it("throws on a record that is not a Go goroutine", () => {
      expect(() => goroutinesFromRecords([{ ...base, format: "native" }])).toThrow(/not a Go goroutine record/);
      expect(() => goroutinesFromRecords([{ ...record, error: "boom" }])).toThrow(/error "boom"/);
    });
  });

  it("handles long blank separators and malformed frame lines", () => {
    const malformedLocation = `foo.go:1${" ".repeat(20_000)}!`;
    const input = `goroutine 1 [running]:\n${".(*".repeat(20_000)}\n${malformedLocation}\n${" \n".repeat(20_000)}goroutine 2 [idle]:\nfoo.Bar()`;
    const goroutines = parseGoroutineDump(input);
    expect(goroutines.map((goroutine) => goroutine.id)).toEqual([1, 2]);
    expect(goroutines[0].frames.every((frame) => frame.file === undefined)).toBe(true);
  });
});
