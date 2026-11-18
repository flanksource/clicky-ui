import type { AgentTarget, SessionAgentTarget } from "./agent-runs-api";

const KEY = "playground.page-agent-targets";

type PageTargets = Record<string, AgentTarget>;

function isSessionTarget(value: unknown): value is SessionAgentTarget {
  if (typeof value !== "object" || value === null) return false;
  const { kind, sessionId, label } = value as Record<string, unknown>;
  return (kind === "captain" || kind === "managed") && typeof sessionId === "string" && sessionId !== "" && typeof label === "string";
}

/**
 * The live session each page's threads are sent to, by page. It is a browser
 * choice kept in localStorage, never in gavel's settings or a server file; a
 * missing, blocked or malformed store reads as no choices, so a page still
 * renders and sends to the playground's own agent.
 */
export function readPageTargets(): PageTargets {
  try {
    const stored = localStorage.getItem(KEY);
    if (stored === null) return {};
    const value: unknown = JSON.parse(stored);
    if (typeof value !== "object" || value === null || Array.isArray(value)) return {};
    return Object.fromEntries(Object.entries(value).filter(([, target]) => isSessionTarget(target) || (typeof target === "object" && target !== null && "kind" in target && target.kind === "playground")));
  } catch {
    return {};
  }
}

export function readPageChoice(page: string): AgentTarget | undefined {
  return readPageTargets()[page];
}

export function readPageTarget(page: string): SessionAgentTarget | undefined {
  const choice = readPageChoice(page);
  return choice?.kind === "playground" ? undefined : choice;
}

/** Records an explicit choice, including the playground agent instead of a resolved server session. */
export function rememberPageTarget(page: string, target: AgentTarget): void {
  const next = readPageTargets();
  next[page] = target;
  try {
    localStorage.setItem(KEY, JSON.stringify(next));
  } catch (cause) {
    throw new Error(`Cannot remember the agent session for ${page} in this browser: ${cause instanceof Error ? cause.message : String(cause)}`);
  }
}
