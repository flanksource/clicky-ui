import { Badge, Button } from "@flanksource/clicky-ui";
import { AgentIdentity } from "@flanksource/clicky-ui/chat";
import { SessionTail } from "@flanksource/clicky-ui/ai";
import { useAgentRuns } from "./AgentRunsProvider";
import { agentSessionSrc, type CaptainSessionOption } from "./agent-runs-api";
import { useCaptainSessions } from "./useCaptainSessions";
import { pageInSessionScope } from "./session-scope";

export function RunningSessionBars({ page }: { page: string }) {
  const { data, error: managedError, openPanel } = useAgentRuns();
  const { sessions, error } = useCaptainSessions(page);
  const visible = new Map<string, CaptainSessionOption>();
  for (const session of sessions ?? []) visible.set(session.captainId ?? session.id, session);
  for (const session of data?.sessions ?? []) {
    const targeted = Object.entries(data?.settings.targets ?? {}).some(([key, target]) => pageInSessionScope(key, page) && target.sessionId === session.sessionId);
    if (session.state !== "running" || !(targeted || (session.page ? pageInSessionScope(session.page, page) : session.purpose !== "target" && data?.settings.grouping === "shared"))) continue;
    if ([...visible.values()].some(live => live.id === session.sessionId || live.captainId === session.sessionId)) continue;
    visible.set(session.sessionId, {
      id: session.sessionId, source: "agent", title: session.label ?? session.page ?? "Shared session",
      model: session.runtime.spec.model, status: session.state, inCmux: false,
    });
  }
  if (!visible.size && !error && !managedError) return null;
  return <section aria-label="Running sessions" className="shrink-0 space-y-1 border-b border-border bg-background px-density-3 py-1.5 sm:px-density-4 sm:py-2">
    {(error || managedError) && <p role="alert" className="text-xs text-destructive">Sessions unavailable: {error ?? managedError}</p>}
    {[...visible.values()].map(session => <div key={session.captainId ?? session.id} className="flex min-w-0 flex-wrap items-center gap-x-3 gap-y-1 rounded-md border border-border px-2 py-1 text-xs">
      <Button variant="ghost" size="sm" className="h-auto min-w-0 max-w-full justify-start gap-2 px-0 py-1" onClick={() => openPanel(data?.sessions.find(managed => managed.sessionId === session.id || managed.sessionId === session.captainId)?.sessionId ?? session.captainId ?? session.id)} aria-label={`Inspect session ${session.id}`} title={`${session.title}\n${session.cwd ?? ""}\n${session.id}`}>
        {session.model ? <AgentIdentity model={session.model} /> : <span>{session.source}</span>}
        <Badge tone="info" variant="soft" clickToCopy={false}>{session.status ?? "running"}</Badge>
        <span className="truncate font-mono text-muted-foreground">{session.id.slice(0, 12)}</span>
      </Button>
      <div className="hidden min-w-0 sm:block sm:flex-1">
        {session.detailAvailable === false ? <span className="text-muted-foreground">Transcript unavailable</span> : <SessionTail src={agentSessionSrc(session.captainId ?? session.id)} emptyLabel="Waiting for activity…" />}
      </div>
    </div>)}
  </section>;
}
