import { useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import { CLAUDE_SESSION_EXAMPLE } from "@flanksource/clicky-ui/ai";
import { createTaskSessionFeed, TaskProgress, type TaskSnapshot } from "@flanksource/clicky-ui/data";
import { DemoSection } from "./Section";

const SESSION_HREF = "/api/captain/sessions/demo-run";
const SESSION = { type: "captain", id: "demo-run" } as const;
const STEP_MS = 2_500;

const snapshots = (actions: number, latest: string): TaskSnapshot[] => [
  {
    id: "prompt-run",
    name: "Fix cross-device directory installs",
    type: "group",
    status: "running",
    groupId: "prompt-run",
    kind: "prompt",
    total: 1,
    running: 1,
  },
  {
    id: "prompt-task",
    name: "Run prompt",
    type: "task",
    status: "running",
    groupId: "prompt-run",
    startedAt: new Date(Date.now() - 42_000).toISOString(),
    session: {
      ...SESSION,
      href: SESSION_HREF,
      summary: {
        model: "claude-opus-4-8",
        context: { usedTokens: 24_000 + actions * 3_000, windowTokens: 200_000 },
        actions,
        latest: { kind: "tool", tool: "Bash", text: latest },
      },
    },
  },
  {
    id: "tty-task",
    name: "Attach terminal",
    type: "task",
    status: "success",
    groupId: "prompt-run",
    startedAt: new Date(Date.now() - 60_000).toISOString(),
    finishedAt: new Date(Date.now() - 50_000).toISOString(),
    session: { type: "pty", id: "7", href: "/ptys/7" },
  },
];

// The demo has no captain server: serve the recorded transcript for the demo
// href, as the HTTP read an expanded task makes once. A layout effect installs
// it before any child's passive effect can fetch.
function useRecordedCaptainSession() {
  useLayoutEffect(() => {
    const fallback = globalThis.fetch;
    globalThis.fetch = (input, init) =>
      String(input).startsWith(SESSION_HREF)
        ? Promise.resolve(
            new Response(JSON.stringify({ ...CLAUDE_SESSION_EXAMPLE, lifecycleStatus: "running" }), {
              status: 200,
              headers: { "Content-Type": "application/json" },
            }),
          )
        : fallback(input, init);
    return () => {
      globalThis.fetch = fallback;
    };
  }, []);
}

export function TaskSessionDemo() {
  useRecordedCaptainSession();
  const source = useMemo(createTaskSessionFeed, []);
  const [step, setStep] = useState(0);
  const sent = useRef(0);

  // What the server does on the task stream: a `session` frame for each new
  // transcript message, and a refreshed summary on the next task frame.
  useEffect(() => {
    const timer = setInterval(() => {
      sent.current += 1;
      source.dispatch("session", {
        session: SESSION,
        entry: {
          id: `demo-live-${sent.current}`,
          role: "assistant",
          parts: [{ type: "text", text: `Demo step ${sent.current} arrived on the task stream` }],
        },
      });
      setStep(sent.current);
    }, STEP_MS);
    return () => clearInterval(timer);
  }, [source]);

  return (
    <DemoSection
      id="task-session"
      title="TaskProgress · session"
      description="A task that drives a captain session shows the server-computed summary — model, context gauge, action count and latest tool call — on its row, with no request of its own. Expanding it opens the session inspector in a Session tab: it reads the transcript once, then takes live entries from the task stream's session feed. A session type with no renderer shows as a chip."
    >
      <TaskProgress snapshots={snapshots(6 + step, `go test ./... (run ${step})`)} sessionFeed={source.feed} />
    </DemoSection>
  );
}
