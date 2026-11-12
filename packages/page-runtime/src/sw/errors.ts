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
  const source = options.error instanceof Error ? /\/(?:src|npm)\/([^?\s):]+)(?:\?[^)\s]*)?:(\d+):(\d+)/.exec(options.error.stack ?? "") : null;
  if (source) return { phase: options.phase, file: decodeURIComponent(source[1]!), message, line: Number(source[2]), column: Number(source[3]) };
  const location = /(?:\(|:)(\d+):(\d+)\)?/.exec(message);
  return { phase: options.phase, file: options.file, message, ...(location ? { line: Number(location[1]), column: Number(location[2]) } : {}) };
}
