import type { TaskSnapshot } from "./TaskSnapshot";

/**
 * A task's stdout/stderr arrive as append-only deltas on their own SSE frames,
 * never on the task frames — clicky strips them there deliberately, so the tail
 * of a long-running process is not re-sent every time a duration ticks over.
 *
 * That makes where a client keeps the accumulated text a correctness question,
 * not a style one. Kept on the snapshot object, it is destroyed the next time a
 * task frame replaces that object, and since the server only sends what a client
 * has not seen it is never sent again — the output appears, vanishes a moment
 * later, and only flickers back when the process happens to write more. So it is
 * kept here instead, beside the snapshots rather than inside them, and merged in
 * at the boundary.
 */
export interface TaskStreams {
  stdout?: string;
  stderr?: string;
  stdoutTruncated: boolean;
  stderrTruncated: boolean;
  /** Absolute stream offset one past the last byte held, per stream. */
  stdoutEnd: number;
  stderrEnd: number;
}

export const emptyTaskStreams: TaskStreams = {
  stdoutTruncated: false,
  stderrTruncated: false,
  stdoutEnd: 0,
  stderrEnd: 0,
};

/**
 * One `event: output` frame. `offset` is an ABSOLUTE position in the task's
 * stream, not a length into what this client holds: on an append it is where
 * `data` belongs, and on a `reset` it is where the server's retained tail now
 * begins. `truncated` says bytes ahead of that point are gone for good.
 */
export interface TaskOutputDelta {
  id: string;
  groupId?: string;
  stream: "stdout" | "stderr";
  data: string;
  offset: number;
  reset?: boolean;
  truncated?: boolean;
}

/**
 * Applies one delta to what a task's streams already hold.
 *
 * Appending is only correct where the two actually meet — the client's own end
 * is exactly the delta's start. Anything else is a replacement: an explicit
 * `reset`, or a gap opened by a retained window that rolled past what this
 * client last saw. Concatenating across such a gap would silently splice
 * together two pieces of output that never ran together.
 */
export function applyTaskOutputDelta(current: TaskStreams, delta: TaskOutputDelta): TaskStreams {
  const held = delta.stream === "stdout" ? current.stdout : current.stderr;
  const end = delta.stream === "stdout" ? current.stdoutEnd : current.stderrEnd;
  const continues = delta.reset !== true && held !== undefined && end === delta.offset;
  const text = continues ? `${held}${delta.data}` : delta.data;
  const truncated = delta.truncated ?? false;
  const streamEnd = delta.offset + delta.data.length;

  return delta.stream === "stdout"
    ? { ...current, stdout: text, stdoutTruncated: truncated, stdoutEnd: streamEnd }
    : { ...current, stderr: text, stderrTruncated: truncated, stderrEnd: streamEnd };
}

/**
 * Projects accumulated streams back onto a snapshot for rendering. The offset
 * bookkeeping stays here: it is how this client tracks its own position, not
 * something a consumer of a snapshot has any use for.
 */
export function withTaskStreams(snapshot: TaskSnapshot, streams: TaskStreams | undefined): TaskSnapshot {
  if (!streams) return snapshot;
  const merged: TaskSnapshot = { ...snapshot };
  if (streams.stdout !== undefined) {
    merged.stdout = streams.stdout;
    merged.stdoutTruncated = streams.stdoutTruncated;
  }
  if (streams.stderr !== undefined) {
    merged.stderr = streams.stderr;
    merged.stderrTruncated = streams.stderrTruncated;
  }
  return merged;
}
