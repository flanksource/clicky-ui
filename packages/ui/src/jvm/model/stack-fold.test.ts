import { describe, expect, it } from "vitest";
import { countStackFrames, foldRepeatedFrames } from "./stack-fold";

const HEADER = `"worker-1" #7 prio=5\n   java.lang.Thread.State: RUNNABLE`;
const head = ["\tat com.example.Pool.run(Pool.java:10)", "\tat com.example.Job.execute(Job.java:20)"];
const tail = ["\tat com.example.Main.main(Main.java:5)", "\tat java.lang.Thread.run(Thread.java:840)"];

function frame(name: string, line: number) {
  return `\tat com.example.${name}(${name}.java:${line})`;
}

function recursion(repeats: number, withAddresses = false) {
  return Array.from({ length: repeats }, (_, level) => [
    frame("Undo.step", 30),
    ...(withAddresses ? [`\t- locked <0x${(0x1000 + level).toString(16)}> (a com.example.Account)`] : []),
    frame("Undo.recurse", 31),
  ]).flat();
}

describe("foldRepeatedFrames", () => {
  it("folds a block repeated back to back to its first copy and reports the fold", () => {
    const text = [HEADER, ...head, ...recursion(5), ...tail].join("\n");
    const folded = foldRepeatedFrames(text);
    expect(folded.folds).toEqual([{ unitFrames: 2, repeats: 5 }]);
    expect(folded.foldedFrames).toBe(8);
    expect(folded.text).toBe([HEADER, ...head, ...recursion(1), ...tail].join("\n"));
  });

  it("compares lock lines without their object addresses", () => {
    const folded = foldRepeatedFrames([HEADER, ...head, ...recursion(6, true), ...tail].join("\n"));
    expect(folded.folds).toEqual([{ unitFrames: 2, repeats: 6 }]);
    expect(folded.text.split("\n").filter((line) => line.includes("locked"))).toHaveLength(1);
  });

  it("leaves a block seen only twice alone", () => {
    const text = [HEADER, ...head, ...recursion(2), ...tail].join("\n");
    expect(foldRepeatedFrames(text)).toEqual({ text, folds: [], foldedFrames: 0 });
  });

  it("returns the input untouched when nothing repeats", () => {
    const text = [HEADER, ...head, ...tail].join("\n");
    expect(foldRepeatedFrames(text)).toEqual({ text, folds: [], foldedFrames: 0 });
  });

  it("folds two separate recursions, largest first", () => {
    const text = [HEADER, ...recursion(4), frame("Mid.work", 1), ...Array.from({ length: 6 }, () => frame("Other.loop", 9)), ...tail].join("\n");
    const folded = foldRepeatedFrames(text);
    expect(folded.folds).toEqual([
      { unitFrames: 2, repeats: 4 },
      { unitFrames: 1, repeats: 6 },
    ]);
    expect(folded.foldedFrames).toBe(6 + 5);
  });

  it("folds a 10k-line recursion without a noticeable delay", () => {
    const text = [HEADER, ...head, ...recursion(5000), ...tail].join("\n");
    const started = performance.now();
    const folded = foldRepeatedFrames(text);
    expect(folded.folds).toEqual([{ unitFrames: 2, repeats: 5000 }]);
    expect(performance.now() - started).toBeLessThan(5000);
  });
});

describe("countStackFrames", () => {
  it("counts only `at` lines", () => {
    expect(countStackFrames([HEADER, ...head, "\t- locked <0x1> (a X)", ...tail].join("\n"))).toBe(4);
  });
});
