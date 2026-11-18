import type { RuntimeError, RuntimePhase } from "../schema.ts";
import type { LinkActivity } from "./link-activity.ts";

export class RuntimeFailure extends Error {
  readonly detail: RuntimeError;
  activity?: LinkActivity;
  constructor(options: RuntimeError) { super(options.message); this.name = "RuntimeFailure"; this.detail = options; }
}

export function runtimeError(options: { error: unknown; phase: RuntimePhase; file: string }): RuntimeError {
  if (options.error instanceof RuntimeFailure) return options.error.detail;
  const message = options.error instanceof Error ? options.error.message : String(options.error);
  if (options.error instanceof Error) {
    for (const token of (options.error.stack ?? "").split(/\s+/)) {
      const start = token.search(/\/(?:src|npm)\//);
      if (start === -1) continue;
      const frame = token.slice(start + 5).replace(/\)$/, "");
      const columnAt = frame.lastIndexOf(":");
      const lineAt = frame.lastIndexOf(":", columnAt - 1);
      if (lineAt < 0) continue;
      const line = frame.slice(lineAt + 1, columnAt);
      const column = frame.slice(columnAt + 1);
      if (!/^\d+$/.test(line) || !/^\d+$/.test(column)) continue;
      const file = frame.slice(0, lineAt).split("?")[0]!;
      return { phase: options.phase, file: decodeURIComponent(file), message, line: Number(line), column: Number(column) };
    }
  }
  const location = /(?:\(|:)(\d+):(\d+)\)?/.exec(message);
  return { phase: options.phase, file: options.file, message, ...(location ? { line: Number(location[1]), column: Number(location[2]) } : {}) };
}
