import { Badge, Button, DropdownMenu } from "@flanksource/clicky-ui";
import { UiChevronDown, UiRobotAi } from "@flanksource/clicky-ui/icons";
import { useAgentRuns } from "./AgentRunsProvider";
import { AgentPicker } from "./AgentPicker";
import { useCaptainSessions } from "./useCaptainSessions";
import type { CaptainSessionOption } from "./agent-runs-api";

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
  const failure = error ?? managedError;
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
        <AgentPicker
          heading="Playground agent"
          busy={busy}
          {...(data
            ? {
                grouping: {
                  value: data.settings.grouping,
                  onChange: (grouping) => changeSettings({ grouping }),
                },
                runtime: {
                  value: data.settings.runtime,
                  ariaLabel: "Choose playground model",
                  onChoose: () => {
                    close();
                    configureRuntime();
                  },
                },
                autoRun: {
                  checked: autoRun,
                  disabled: !setAutoRun,
                  ...(setAutoRun ? {} : { title: "Open a page to set its auto-run" }),
                  onChange: (enabled) => setAutoRun?.(enabled),
                },
              }
            : {
                notice: !managedError && (
                  <p role="status" className="text-muted-foreground">
                    Loading playground settings…
                  </p>
                ),
              })}
          error={failure ? `Sessions unavailable: ${failure}` : null}
          sessions={{
            items: [...active.values()],
            state: sessions !== null ? "ready" : error ? "error" : "loading",
            selectLabel: (session) => `Inspect session ${session.id}`,
            onSelect: (picked) => {
              const session = [...active.values()].find((candidate) => candidate.id === picked.id);
              close();
              openPanel(
                data?.sessions.find(
                  (managed) =>
                    managed.sessionId === session?.id ||
                    managed.sessionId === session?.captainId,
                )?.sessionId ??
                  session?.captainId ??
                  picked.id,
              );
            },
            onAll: () => {
              close();
              openPanel();
            },
          }}
        />
      )}
    </DropdownMenu>
  );
}
