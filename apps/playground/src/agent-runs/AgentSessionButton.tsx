import {
  Badge,
  Button,
  DropdownMenu,
  SegmentedControl,
  Switch,
} from "@flanksource/clicky-ui";
import { AgentIdentity } from "@flanksource/clicky-ui/chat";
import { UiChevronDown, UiRobotAi } from "@flanksource/clicky-ui/icons";
import { useAgentRuns } from "./AgentRunsProvider";
import { useCaptainSessions } from "./useCaptainSessions";
import { RuntimeIdentity } from "./RuntimeIdentity";
import type { CaptainSessionOption } from "./agent-runs-api";

export function AgentSessionButton({ compact = false }: { compact?: boolean }) {
  const {
    data,
    error: managedError,
    busy,
    changeSettings,
    configureRuntime,
    openPanel,
  } = useAgentRuns();
  const { sessions, error } = useCaptainSessions();
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
    });
  }
  return (
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
                {active.size}
              </Badge>
              <UiChevronDown className="size-3" />
            </>
          )}
        </Button>
      }
    >
      {(close) => (
        <div className="space-y-3 p-3 text-xs">
          <h2 className="font-semibold">Playground agent</h2>
          {data ? (
            <>
              <div className="flex flex-wrap items-center justify-between gap-2">
                <span>Sessions</span>
                <SegmentedControl
                  size="sm"
                  aria-label="Session grouping"
                  value={data.settings.grouping}
                  options={[
                    { id: "shared", label: "Shared", disabled: busy },
                    { id: "page", label: "Per page", disabled: busy },
                  ]}
                  onChange={(grouping) => changeSettings({ grouping })}
                />
              </div>
              <div className="flex flex-wrap items-center justify-between gap-2">
                <span>Model</span>
                <Button
                  size="sm"
                  variant="ghost"
                  disabled={busy}
                  aria-label="Choose playground model"
                  onClick={() => {
                    close();
                    configureRuntime();
                  }}
                >
                  {data.settings.runtime ? (
                    <RuntimeIdentity runtime={data.settings.runtime} />
                  ) : (
                    "Choose model…"
                  )}
                </Button>
              </div>
              <Switch
                label="Auto-run new comments"
                checked={data.settings.autoRun}
                disabled={busy}
                onChange={(autoRun) => changeSettings({ autoRun })}
              />
            </>
          ) : (
            !managedError && (
              <p role="status" className="text-muted-foreground">
                Loading playground settings…
              </p>
            )
          )}
          {(error || managedError) && (
            <p role="alert" className="break-words text-destructive">
              Sessions unavailable: {error ?? managedError}
            </p>
          )}
          <hr className="border-border" />
          <h2 className="font-semibold">Active sessions</h2>
          {!sessions && !error && (
            <p role="status" className="text-muted-foreground">
              Loading active sessions…
            </p>
          )}
          {!active.size && sessions !== null && (
            <p className="text-muted-foreground">No active sessions.</p>
          )}
          {[...active.values()].map((session) => (
            <Button
              key={session.captainId ?? session.id}
              variant="ghost"
              size="sm"
              className="h-auto w-full justify-start gap-2 py-2 text-left"
              aria-label={`Inspect session ${session.id}`}
              title={`${session.title}\n${session.cwd ?? ""}\n${session.id}`}
              onClick={() => {
                close();
                openPanel(
                  data?.sessions.find(
                    (managed) =>
                      managed.sessionId === session.id ||
                      managed.sessionId === session.captainId,
                  )?.sessionId ??
                    session.captainId ??
                    session.id,
                );
              }}
            >
              <span className="flex min-w-0 flex-1 flex-col gap-1">
                <span className="truncate">{session.title}</span>
                <span className="flex min-w-0 flex-wrap items-center gap-2 text-xs text-muted-foreground">
                  <AgentIdentity
                    {...(session.model
                      ? { model: session.model }
                      : { provider: session.source })}
                    identityId={session.id}
                  />
                  <span className="truncate">
                    {session.cwd?.split("/").filter(Boolean).at(-1) ??
                      session.id.slice(0, 12)}
                  </span>
                </span>
              </span>
              <Badge variant="soft" tone="info" clickToCopy={false}>
                {session.status ?? "running"}
              </Badge>
            </Button>
          ))}
          <Button
            size="sm"
            variant="outline"
            className="w-full"
            onClick={() => {
              close();
              openPanel();
            }}
          >
            All sessions…
          </Button>
        </div>
      )}
    </DropdownMenu>
  );
}
