import { useMemo } from "react";
import { classifyToolCategory, type SessionCategory } from "./session-categories";
import { summarizeToolInput } from "./SessionViewer.input";
import { normalizeMessages, type SessionEvent } from "./SessionViewer.model";
import type { UnifiedSessionInput } from "./SessionViewer.unified";

/** Messages read for the first load: enough to reach past a run of reasoning
 *  or empty messages to the latest text or tool call. */
export const TAIL_PAGE_SIZE = 20;

/** What a tail line shows: the newest tool call or assistant text. */
export interface TailLatest {
  kind: "tool" | "text";
  tool?: string;
  /** The text itself, or for a tool a short summary of its input. */
  text: string;
  /** Icon category when the producer already classified the call; derived
   *  from the tool name otherwise. */
  category?: SessionCategory;
}

/** The newest assistant text or tool call; reasoning, user, system and error
 *  rows are not part of the tail. */
export function latestTail(events: SessionEvent[]): TailLatest | undefined {
  const event = events.findLast(
    (candidate) =>
      candidate.kind === "tool" || (candidate.kind === "assistant" && Boolean(candidate.text)),
  );
  if (!event) return undefined;
  if (event.kind !== "tool") return { kind: "text", text: event.text ?? "" };
  const tool = event.tool ?? "";
  return {
    kind: "tool",
    tool,
    text: summarizeToolInput(tool, event.toolInput, event.cwd),
    category: classifyToolCategory(tool, event.toolInput),
  };
}

/** The session's newest tail entry, recomputed only when the session changes. */
export function useSessionTail(session: UnifiedSessionInput | undefined): TailLatest | undefined {
  return useMemo(
    () => (session ? latestTail(normalizeMessages(session.messages ?? [])) : undefined),
    [session],
  );
}
