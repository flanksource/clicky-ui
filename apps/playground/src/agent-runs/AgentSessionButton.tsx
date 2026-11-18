import { useState } from "react";
import { Badge, Button, DropdownMenu } from "@flanksource/clicky-ui";
import { CommentAgentSessions } from "@flanksource/clicky-ui/comments/gavel";
import { UiChevronDown, UiRobotAi } from "@flanksource/clicky-ui/icons";
import { useAgentRuns, type AssignAllChoice } from "./AgentRunsProvider";
import { AgentPicker } from "./AgentPicker";
import { sessionAgentTarget } from "./agent-targets";
import { useCaptainSessions } from "./useCaptainSessions";
import type { CaptainSessionOption } from "./agent-runs-api";
import { CreateAgentSessionDialog } from "./CreateAgentSessionDialog";

export function AgentSessionButton({ compact = false }: { compact?: boolean }) {
  const {
    data,
    error: managedError,
    busy,
    changeSettings,
    configureRuntime,
    openPanel,
    autoRun,
    setAutoRun,
    assignAll,
    openThreads,
    target,
    setTarget,
    project,
    page,
  } = useAgentRuns();
  const { sessions, error } = useCaptainSessions();
  const [assignError, setAssignError] = useState<string | null>(null);
  const [working, setWorking] = useState(false);
  const [creating, setCreating] = useState(false);
  const active = new Map<string, CaptainSessionOption>();
  for (const session of sessions ?? [])
    active.set(session.captainId ?? session.id, session);
  for (const session of data?.sessions ?? []) {
    if (
      session.state !== "running" ||
      [...active.values()].some(
        (live) =>
          live.id === session.sessionId || live.captainId === session.sessionId,
      )
    )
      continue;
    active.set(session.sessionId, {
      id: session.sessionId,
      title: session.label ?? session.page ?? "Shared session",
      source: "agent",
      model: session.runtime.spec.model,
      status: session.state,
      inCmux: false,
      managed: true,
    });
  }
  const failure = error ?? managedError;
  const sessionFor = (id: string) => {
    const session = [...active.values()].find(candidate => candidate.id === id);
    if (!session) throw new Error(`Session ${id} is no longer listed`);
    return session;
  };
  const perform = (work: () => Promise<void>, close: () => void) => {
    setAssignError(null);
    setWorking(true);
    work().then(close, (cause: unknown) => setAssignError(cause instanceof Error ? cause.message : String(cause))).finally(() => setWorking(false));
  };
  const assign = (choice: AssignAllChoice, close: () => void) => perform(async () => {
    if (!assignAll) throw new Error("Open a page to assign its threads");
    await assignAll(choice);
  }, close);
  const selected = target && [...active.values()].find(session => session.id === target.sessionId || session.captainId === target.sessionId);
  const disabled = busy || working;
  return (
    <>
    <DropdownMenu
      role="dialog"
      align="right"
      menuLabel="Agent"
      menuClassName="w-96 max-w-[calc(100vw-16px)] max-h-[80dvh] overflow-auto"
      trigger={
        <Button
          variant={compact ? "ghost" : "outline"}
          size={compact ? "icon" : "sm"}
          aria-label="Agent"
          title="Agent settings and active sessions"
          className={compact ? "shrink-0 [@media(pointer:coarse)]:size-11" : undefined}
        >
          <UiRobotAi className="size-4" />
          {!compact && (
            <>
              Agent
              <Badge variant="soft" clickToCopy={false}>
                {[...active.values()].filter((session) => !session.resumable).length}
              </Badge>
              <UiChevronDown className="size-3" />
            </>
          )}
        </Button>
      }
    >
      {(close) => (
        <div className="divide-y divide-border">
        <AgentPicker
          heading="Auto-assign new threads"
          busy={disabled}
          {...(data ? {
            grouping: { value: data.settings.grouping, onChange: grouping => changeSettings({ grouping }) },
            runtime: { value: data.settings.runtime, ariaLabel: "Choose playground model", onChoose: () => { close(); configureRuntime(); } },
            autoRun: { checked: autoRun, disabled: !setAutoRun, ...(setAutoRun ? {} : { title: "Open a page to set its auto-run" }), onChange: enabled => setAutoRun?.(enabled) },
          } : { notice: !managedError && <p role="status" className="text-muted-foreground">Loading playground settings…</p> })}
        />
        <div className="space-y-3 p-3 text-xs">
          <Button variant="outline" size="sm" className="w-full" disabled={disabled || !data || !page} onClick={() => { close(); setCreating(true); }}>New session…</Button>
          {failure && <p role="alert" className="break-words text-destructive">Sessions unavailable: {failure}</p>}
          {target && !selected && (
            <div className="space-y-1">
              <Button variant="ghost" size="sm" className="w-full justify-start" aria-pressed disabled>{target.label}</Button>
              <p role="alert" className="text-destructive">Selected session is unavailable. Choose another session.</p>
            </div>
          )}
          <CommentAgentSessions busy={disabled || !page} sessions={{
            items: [...active.values()],
            state: sessions !== null ? "ready" : error ? "error" : "loading",
            selectedId: selected?.id,
            onSelect: picked => perform(() => setTarget(sessionAgentTarget(sessionFor(picked.id))), close),
            ...(assignAll ? { assignAll: {
              count: openThreads,
              emptyLabel: "No open threads on this page",
              onNew: () => assign({ kind: "new" }, close),
              onSession: picked => assign({ kind: "session", target: sessionAgentTarget(sessionFor(picked.id)) }, close),
            } } : {}),
            onAll: () => { close(); openPanel(); },
          }}>
            <Button variant="ghost" size="sm" className="w-full justify-start gap-2 aria-pressed:bg-accent" aria-label="Playground agent" aria-pressed={!target} disabled={disabled || !data || !page} onClick={() => perform(() => setTarget({ kind: "playground" }), close)}>
              Playground agent
              {!target && <span className="text-muted-foreground">Selected</span>}
            </Button>
          </CommentAgentSessions>
          <p className="text-muted-foreground">{page ? "Selection applies to future sends. Assign all sends every open thread on this page." : "Open a page to select a session or assign its threads."}</p>
          {assignError && <p role="alert" className="break-words text-destructive">{assignError}</p>}
        </div>
        </div>
      )}
    </DropdownMenu>
    {creating && <CreateAgentSessionDialog project={project ?? ""} onClose={() => setCreating(false)} />}
    </>
  );
}
