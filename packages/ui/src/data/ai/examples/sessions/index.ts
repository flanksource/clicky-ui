import type { UnifiedSessionInput } from "../../SessionViewer.unified";
import { CLAUDE_SESSION_EXAMPLE } from "./claude";
import { CODEX_SESSION_EXAMPLE } from "./codex";
import { CLAUDE_COMPLETE_SESSION } from "./claude-complete";
import { CODEX_COMPLETE_SESSION } from "./codex-complete";

export { CLAUDE_SESSION_EXAMPLE, CODEX_SESSION_EXAMPLE };
export { CLAUDE_COMPLETE_SESSION, CODEX_COMPLETE_SESSION };

// Sanitized, recent-shape examples (guarded by sessions.test.ts to stay clean).
export const EXAMPLE_SESSIONS = [
  CODEX_SESSION_EXAMPLE,
  CLAUDE_SESSION_EXAMPLE,
] satisfies UnifiedSessionInput[];

// Complete, un-anonymized coverage transcripts — one per provider, each
// exercising every turn / tool / state / part / event type the viewer renders.
export const COMPLETE_EXAMPLE_SESSIONS = [
  CLAUDE_COMPLETE_SESSION,
  CODEX_COMPLETE_SESSION,
] satisfies UnifiedSessionInput[];
