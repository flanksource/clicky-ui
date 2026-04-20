import { describe, expect, it } from "vitest";
import { countThreadsByState, parseJvmThreadDump } from "./jvm-stacktrace";

const dump = `"main" #1 prio=5 os_prio=31 tid=0x00007f9c43009000 nid=0x1903 waiting on condition [0x0000700002d0a000]
   java.lang.Thread.State: TIMED_WAITING (sleeping)
        at java.lang.Thread.sleep(Native Method)
        at com.example.App.main(App.java:15)

"worker-1" #12 daemon prio=10 os_prio=0 tid=0x00007f9c44800800 nid=0x2a01 runnable [0x0000700003a0b000]
   java.lang.Thread.State: RUNNABLE
        at sun.nio.ch.EPoll.wait(Native Method)
        at sun.nio.ch.EPollSelectorImpl.doSelect(EPollSelectorImpl.java:120)
        at com.example.Server.accept(Server.java:88)

"blocked-thread" #42 prio=5 tid=0x00007f9c45000000 nid=0x3b02 waiting for monitor entry [0x0000700004b0c000]
   java.lang.Thread.State: BLOCKED (on object monitor)
        at com.example.Cache.get(Cache.java:55)
        - waiting to lock <0x00000000c0001234> (a java.util.HashMap)
        at com.example.Cache.load(Cache.java:70)
`;

describe("parseJvmThreadDump", () => {
  it("returns empty for blank input", () => {
    expect(parseJvmThreadDump("")).toEqual([]);
    expect(parseJvmThreadDump("   \n  ")).toEqual([]);
  });

  it("parses name, id, priority, daemon, nid", () => {
    const threads = parseJvmThreadDump(dump);
    expect(threads.map((t) => t.name)).toEqual(["main", "worker-1", "blocked-thread"]);
    expect(threads.map((t) => t.id)).toEqual([1, 12, 42]);
    expect(threads[0].priority).toBe(5);
    expect(threads[1].daemon).toBe(true);
    expect(threads[0].daemon).toBe(false);
    expect(threads[0].nid).toBe("0x1903");
  });

  it("normalizes Thread.State to lowercase canonical form", () => {
    const threads = parseJvmThreadDump(dump);
    expect(threads.map((t) => t.state)).toEqual(["timed_waiting", "runnable", "blocked"]);
    expect(threads[0].rawState).toBe("TIMED_WAITING (sleeping)");
  });

  it("parses frames with file:line and location", () => {
    const [main] = parseJvmThreadDump(dump);
    expect(main.frames[1].functionName).toBe("com.example.App.main");
    expect(main.frames[1].displayName).toBe("App.main");
    expect(main.frames[1].file).toBe("App.java");
    expect(main.frames[1].line).toBe(15);
    expect(main.frames[1].location).toBe("App.java:15");
    expect(main.frames[1].runtime).toBe(false);
  });

  it("flags native methods and runtime frames", () => {
    const [main, worker] = parseJvmThreadDump(dump);
    expect(main.frames[0].nativeMethod).toBe(true);
    expect(main.frames[0].runtime).toBe(true);
    expect(main.frames[0].location).toBe("Native Method");
    expect(worker.frames[0].runtime).toBe(true); // sun.nio.ch.EPoll.wait
    expect(worker.frames[2].runtime).toBe(false); // com.example.Server.accept
  });

  it("counts user frames excluding runtime and annotations", () => {
    const [main, worker, blocked] = parseJvmThreadDump(dump);
    expect(main.userFrameCount).toBe(1);
    expect(worker.userFrameCount).toBe(1);
    expect(blocked.userFrameCount).toBe(2);
  });

  it("captures monitor annotations as pseudo-frames", () => {
    const [, , blocked] = parseJvmThreadDump(dump);
    const anno = blocked.frames.find((f) => f.kind === "waiting_to_lock");
    expect(anno).toBeDefined();
    expect(anno?.annotationText).toContain("0x00000000c0001234");
  });

  it("counts threads by state", () => {
    const counts = countThreadsByState(parseJvmThreadDump(dump));
    expect(counts.get("timed_waiting")).toBe(1);
    expect(counts.get("runnable")).toBe(1);
    expect(counts.get("blocked")).toBe(1);
  });

  it("skips blocks that don't start with a quoted name header", () => {
    const input = `garbage line
"only-thread" #99 prio=5 tid=0x1 nid=0x2 runnable
   java.lang.Thread.State: RUNNABLE
        at com.example.Main.run(Main.java:1)
`;
    const threads = parseJvmThreadDump(input);
    expect(threads).toHaveLength(1);
    expect(threads[0].name).toBe("only-thread");
  });

  it("handles threads without an explicit #id by deriving one", () => {
    const input = `"anon" prio=5 tid=0x00007fabcd001234 nid=0xff runnable
   java.lang.Thread.State: RUNNABLE
        at com.example.X.y(X.java:1)
`;
    const [t] = parseJvmThreadDump(input);
    expect(t.id).toBeGreaterThan(0);
    expect(t.name).toBe("anon");
  });
});
