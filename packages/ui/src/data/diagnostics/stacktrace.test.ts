import { describe, expect, it } from "vitest";
import { countGoroutinesByState, parseGoroutineDump } from "./stacktrace";

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
});
