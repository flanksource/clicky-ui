import { describe, expect, it } from "vitest";

import {
  applyTaskOutputDelta,
  emptyTaskStreams,
  type TaskOutputDelta,
  type TaskStreams,
  withTaskStreams,
} from "./task-streams";
import type { TaskSnapshot } from "./TaskSnapshot";

const stdout = (delta: Partial<TaskOutputDelta>): TaskOutputDelta => ({
  id: "t1",
  stream: "stdout",
  data: "",
  offset: 0,
  ...delta,
});

describe("applyTaskOutputDelta", () => {
  it("starts a stream from the first delta", () => {
    expect(applyTaskOutputDelta(emptyTaskStreams, stdout({ data: "hello\n" }))).toEqual({
      ...emptyTaskStreams,
      stdout: "hello\n",
      stdoutEnd: 6,
    });
  });

  it("appends a delta that begins exactly where the held text ends", () => {
    const held = applyTaskOutputDelta(emptyTaskStreams, stdout({ data: "hello\n" }));

    expect(applyTaskOutputDelta(held, stdout({ data: "world\n", offset: 6 }))).toMatchObject({
      stdout: "hello\nworld\n",
      stdoutEnd: 12,
    });
  });

  // The window rolled past what this client holds. Concatenating would splice
  // together two pieces of output with a hole between them and show the result
  // as if it were continuous.
  it("replaces rather than splices when the delta starts past the held text", () => {
    const held = applyTaskOutputDelta(emptyTaskStreams, stdout({ data: "hello\n" }));

    expect(applyTaskOutputDelta(held, stdout({ data: "later\n", offset: 900, truncated: true }))).toMatchObject({
      stdout: "later\n",
      stdoutTruncated: true,
      stdoutEnd: 906,
    });
  });

  it("replaces on an explicit reset even where the offsets would have met", () => {
    const held = applyTaskOutputDelta(emptyTaskStreams, stdout({ data: "hello\n" }));

    expect(applyTaskOutputDelta(held, stdout({ data: "restarted\n", offset: 6, reset: true }))).toMatchObject({
      stdout: "restarted\n",
      stdoutEnd: 16,
    });
  });

  // Offsets are byte positions in the process's output. Measuring the held text
  // in UTF-16 code units leaves the client's end short of the server's next
  // offset, and every following frame is then mistaken for a gap.
  it("advances the stream end by bytes, not by code units", () => {
    const held = applyTaskOutputDelta(emptyTaskStreams, stdout({ data: "café\n" }));
    expect(held.stdoutEnd).toBe(6);

    expect(applyTaskOutputDelta(held, stdout({ data: "über\n", offset: 6 }))).toMatchObject({
      stdout: "café\nüber\n",
      stdoutEnd: 12,
    });
  });

  // Bytes ahead of the retained window stay gone while the process keeps
  // writing, so a later frame that says nothing about truncation is not
  // reporting that the head came back.
  it("keeps a stream marked truncated across a frame that does not mention it", () => {
    const truncated = applyTaskOutputDelta(emptyTaskStreams, stdout({ data: "later\n", offset: 900, truncated: true }));

    expect(applyTaskOutputDelta(truncated, stdout({ data: "more\n", offset: 906 }))).toMatchObject({
      stdout: "later\nmore\n",
      stdoutTruncated: true,
    });
  });

  it("clears truncation when the server says the retained window holds the whole stream", () => {
    const truncated = applyTaskOutputDelta(emptyTaskStreams, stdout({ data: "later\n", offset: 900, truncated: true }));

    expect(
      applyTaskOutputDelta(truncated, stdout({ data: "restarted\n", offset: 0, reset: true, truncated: false })),
    ).toMatchObject({ stdout: "restarted\n", stdoutTruncated: false });
  });

  it("tracks each stream independently", () => {
    const withOut = applyTaskOutputDelta(emptyTaskStreams, stdout({ data: "out\n" }));
    const both = applyTaskOutputDelta(withOut, { id: "t1", stream: "stderr", data: "err\n", offset: 0 });

    expect(both).toEqual({
      stdout: "out\n",
      stderr: "err\n",
      stdoutTruncated: false,
      stderrTruncated: false,
      stdoutEnd: 4,
      stderrEnd: 4,
    });
  });
});

describe("withTaskStreams", () => {
  const snapshot: TaskSnapshot = { id: "t1", name: "build", type: "task", status: "running" };

  it("leaves a snapshot untouched when nothing has been accumulated for it", () => {
    expect(withTaskStreams(snapshot, undefined)).toBe(snapshot);
  });

  it("merges only the streams that have text, and keeps its bookkeeping to itself", () => {
    const streams: TaskStreams = {
      stdout: "out\n",
      stdoutTruncated: true,
      stderrTruncated: false,
      stdoutEnd: 4,
      stderrEnd: 0,
    };

    expect(withTaskStreams(snapshot, streams)).toEqual({
      ...snapshot,
      stdout: "out\n",
      stdoutTruncated: true,
    });
  });
});
