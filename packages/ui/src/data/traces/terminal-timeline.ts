import { createScreen, resizeScreen, writeScreen, type TerminalScreen } from "./terminal-screen";
import type { TerminalEvent, TerminalEventKind } from "./types";

const KINDS: readonly TerminalEventKind[] = ["o", "r", "snapshot", "exit"];
const DEFAULT_SIZE = { width: 80, height: 24 };

export type TerminalTimeline = {
  /** Output and resize events in playback order. */
  steps: TerminalEvent[];
  /** The screen of the last snapshot, when the capture settled one. */
  settled: string | undefined;
  exit: TerminalEvent | undefined;
  /** Seconds from the first byte to the last event. */
  duration: number;
  /** The terminal size at the start of the session. */
  width: number;
  height: number;
};

/** Orders a session's rows and splits them into what playback, the settled screen and the badge need. */
export function buildTimeline(events: TerminalEvent[]): TerminalTimeline {
  events.forEach((event, index) => {
    if (!KINDS.includes(event.kind)) throw new Error(`terminal event ${index} has unknown kind "${event.kind}"`);
  });
  const ordered = events
    .map((event, index) => ({ event, index }))
    .sort((a, b) => a.event.offset - b.event.offset || a.index - b.index)
    .map(({ event }) => event);

  const first = ordered[0];
  if (first && !(first.width > 0 && first.height > 0)) {
    throw new Error(`terminal events carry no terminal size (first row is ${first.width}x${first.height})`);
  }
  return {
    steps: ordered.filter((event) => event.kind === "o" || event.kind === "r"),
    settled: ordered.findLast((event) => event.kind === "snapshot")?.data,
    exit: ordered.findLast((event) => event.kind === "exit"),
    duration: ordered.reduce((latest, event) => Math.max(latest, event.offset), 0),
    width: first?.width ?? DEFAULT_SIZE.width,
    height: first?.height ?? DEFAULT_SIZE.height,
  };
}

/** How many steps have happened by `position` seconds (steps are sorted by offset). */
export function stepCountAt(steps: TerminalEvent[], position: number): number {
  let low = 0;
  let high = steps.length;
  while (low < high) {
    const mid = (low + high) >>> 1;
    if (steps[mid]!.offset <= position) low = mid + 1;
    else high = mid;
  }
  return low;
}

/** A screen and how many steps of its timeline it has applied, so playback only feeds the new ones. */
export type ScreenReplay = { screen: TerminalScreen; applied: number };

/** Brings the replay to exactly `count` applied steps, continuing when moving forward and rebuilding when moving back. */
export function replayTo(replay: ScreenReplay | undefined, timeline: TerminalTimeline, count: number): ScreenReplay {
  const reuse = replay !== undefined && replay.applied <= count;
  const screen = reuse ? replay.screen : createScreen(timeline.width, timeline.height);
  for (let i = reuse ? replay.applied : 0; i < count; i++) {
    const step = timeline.steps[i]!;
    if (step.kind === "r") resizeScreen(screen, step.width, step.height);
    else writeScreen(screen, step.data);
  }
  return reuse && replay.applied === count ? replay : { screen, applied: count };
}
