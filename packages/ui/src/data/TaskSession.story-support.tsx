import { useEffect, useRef } from "react";
import type { Decorator } from "@storybook/react-vite";
import { CLAUDE_SESSION_EXAMPLE } from "./ai/examples/sessions";
import type { SessionUIMessage } from "./ai/SessionViewer.unified";
import type { TaskSessionRef, TaskSessionSummary } from "./TaskSnapshot";

// Story fixtures for a task that drives a captain session: the session ref the
// server would put on the task (summary included), a fetch that serves a
// recorded transcript for its href, and the entry the task stream multiplexes
// afterwards. Not part of the library's public surface.

export const CAPTAIN_SESSION_HREF = "/api/captain/sessions/df7aa36e";

export const CAPTAIN_SESSION_SUMMARY: TaskSessionSummary = {
  model: "claude-opus-4-8",
  context: { usedTokens: 16_000, windowTokens: 200_000 },
  actions: 6,
  latest: { kind: "tool", tool: "Bash", text: "go test ./task/..." },
};

export const CAPTAIN_SESSION_REF: TaskSessionRef = {
  type: "captain",
  id: "df7aa36e",
  href: CAPTAIN_SESSION_HREF,
  summary: CAPTAIN_SESSION_SUMMARY,
};

export const CAPTAIN_SESSION_LIVE_TEXT = "Streamed over the shared task stream";

/** The wire shape of a `session` frame for the story session. */
export const captainSessionFrame = (entry: SessionUIMessage) => ({
  session: { type: CAPTAIN_SESSION_REF.type, id: CAPTAIN_SESSION_REF.id },
  entry,
});

export const CAPTAIN_SESSION_LIVE_ENTRY: SessionUIMessage = {
  id: "story-live-1",
  role: "assistant",
  parts: [{ type: "text", text: CAPTAIN_SESSION_LIVE_TEXT }],
  provenance: { sessionId: CAPTAIN_SESSION_REF.id, timestamp: "2026-06-02T12:00:05Z" },
};

const sessionResponse = () =>
  new Response(JSON.stringify({ ...CLAUDE_SESSION_EXAMPLE, lifecycleStatus: "running" }), {
    status: 200,
    headers: { "Content-Type": "application/json" },
  });

/** Serves the recorded session for the captain href; every other request goes
 *  to the fetch that was installed before. */
export const withCaptainSessionFetch: Decorator = (Story) => {
  const original = useRef<typeof globalThis.fetch | undefined>(undefined);
  const stub = useRef<typeof globalThis.fetch | undefined>(undefined);
  if (!original.current) {
    const fallback = globalThis.fetch;
    original.current = fallback;
    stub.current = (input, init) =>
      String(input).startsWith(CAPTAIN_SESSION_HREF) ? Promise.resolve(sessionResponse()) : fallback(input, init);
    globalThis.fetch = stub.current;
  }
  useEffect(
    () => () => {
      if (original.current) globalThis.fetch = original.current;
    },
    [],
  );
  return <Story />;
};
