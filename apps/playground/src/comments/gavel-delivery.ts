/*
 * Gavel's agent delivery contract (`POST /api/v1/comments/{id}/deliver`,
 * `/agent-sessions`, `/routes`). Browser safe: the playground server and the
 * Chrome extension's gavel client share these shapes.
 */

/**
 * The Captain prompt a gavel-managed session runs. Gavel's library has no
 * generic comment prompt; `editor-comments` is the closest (it works comment
 * threads in a project directory with `list_threads`, `reply_to_thread` and
 * `resolve_thread`), and its file-specific wording is not load-bearing.
 */
export const DEFAULT_RUN_PROMPT = "editor-comments";

/** A run target's `runOptions`, in Captain's run-request shape. */
export type RunOptions = {
  presets?: string[];
  spec?: Record<string, unknown>;
  variables?: Record<string, unknown>;
  /** Appended to the thread the new session is given. */
  instructions?: string;
};

export type DeliverTarget =
  | { kind: "session"; sessionId: string }
  | {
      kind: "run";
      prompt: string;
      runOptions?: RunOptions;
      groupKey?: string;
      /** Skips the group's recorded session, launches a new one and records it for the group. */
      fresh?: boolean;
    };

export type Route = {
  id: string;
  scopeUri: string;
  targetPrefix: string;
  workflowId: string;
  target: DeliverTarget;
  enabled: boolean;
};

/** A route to create (no `id`) or replace. */
export type RouteInput = Omit<Route, "id"> & { id?: string };

/** A live Claude or Codex session gavel can deliver a thread to. */
export type GavelAgentSession = {
  id: string;
  source: string;
  title: string;
  model?: string;
  cwd?: string;
  status?: string;
  inCmux: boolean;
  /** How much of the model's context window the session fills; absent when gavel has no reading. */
  context?: { usedTokens: number; windowTokens: number };
};
