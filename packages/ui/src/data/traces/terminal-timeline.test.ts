import { describe, expect, it } from "vitest";
import { terminalEvents } from "./fixtures";
import { buildTimeline, replayTo, stepCountAt } from "./terminal-timeline";
import { screenText } from "./terminal-screen";
import type { TerminalEvent } from "./types";

const output = (offset: number, data: string): TerminalEvent => ({ offset, kind: "o", data, width: 20, height: 3 });

describe("buildTimeline", () => {
  it("orders output and resizes by offset, whatever order the rows arrived in", () => {
    const timeline = buildTimeline([output(2, "b"), output(1, "a"), { ...output(1.5, ""), kind: "r", width: 30 }]);
    expect(timeline.steps.map((s) => [s.offset, s.kind])).toEqual([[1, "o"], [1.5, "r"], [2, "o"]]);
  });

  it("keeps rows of equal offset in arrival order", () => {
    const timeline = buildTimeline([output(1, "a"), output(1, "b"), output(1, "c")]);
    expect(timeline.steps.map((s) => s.data)).toEqual(["a", "b", "c"]);
  });

  it("takes the size of the first row, the last snapshot as the settled screen, and the exit row", () => {
    const timeline = buildTimeline(terminalEvents);
    expect(timeline.width).toBe(40);
    expect(timeline.height).toBe(6);
    expect(timeline.settled).toBe("$ make build\ncompiling 3/3\nwarning: 1 unused import\ndone");
    expect(timeline.exit).toMatchObject({ exitCode: 0, command: "make build" });
    expect(timeline.duration).toBe(3);
  });

  it("is empty for no events", () => {
    expect(buildTimeline([])).toMatchObject({ steps: [], duration: 0 });
  });

  it("throws on an event of unknown kind", () => {
    expect(() => buildTimeline([{ ...output(0, "x"), kind: "bogus" as TerminalEvent["kind"] }])).toThrow(/kind "bogus"/);
  });

  it("throws when events carry no terminal size", () => {
    expect(() => buildTimeline([{ ...output(0, "x"), width: 0 }])).toThrow(/size/);
  });
});

describe("stepCountAt", () => {
  const steps = buildTimeline([output(1, "a"), output(2, "b"), output(2, "c"), output(5, "d")]).steps;

  it.each([
    [0, 0],
    [1, 1],
    [1.9, 1],
    [2, 3],
    [4.99, 3],
    [5, 4],
    [99, 4],
  ])("counts the steps at or before %s seconds", (position, count) => {
    expect(stepCountAt(steps, position)).toBe(count);
  });
});

describe("replayTo", () => {
  const timeline = buildTimeline(terminalEvents);

  it("replays the steps up to a position onto the screen", () => {
    const replay = replayTo(undefined, timeline, stepCountAt(timeline.steps, 1.1));
    expect(screenText(replay.screen)).toBe("$ make build\ncompiling 2/3\n\n\n\n");
  });

  it("continues from the cached screen when moving forward and rebuilds when moving back", () => {
    const first = replayTo(undefined, timeline, 2);
    const forward = replayTo(first, timeline, 4);
    expect(forward.screen).toBe(first.screen);
    const back = replayTo(forward, timeline, 1);
    expect(back.screen).not.toBe(first.screen);
    expect(screenText(back.screen)).toBe("$ make build\n\n\n\n\n");
  });

  it("honours a resize step", () => {
    const replay = replayTo(undefined, timeline, timeline.steps.length);
    expect(replay.screen.width).toBe(60);
    expect(screenText(replay.screen)).toBe("$ make build\ncompiling 3/3\nwarning: 1 unused import\ndone\n\n");
  });
});
