import { useCallback, useEffect, useState } from "react";
import { Badge, Combobox, type ComboboxOption } from "@flanksource/clicky-ui";

import {
  fetchCaptainSessions,
  type AgentTarget,
  type CaptainSessionOption,
} from "./agent-runs-api";
import { useAgentRuns } from "./AgentRunsProvider";

const PLAYGROUND = "playground";
const CAPTAIN_PREFIX = "captain:";
const REFRESH_MS = 10_000;

function sessionLabel(session: CaptainSessionOption): string {
  return `${session.title} · ${session.source}`;
}

function sessionDescription(session: CaptainSessionOption): string {
  const folder = session.cwd?.split("/").filter(Boolean).at(-1);
  return [folder, session.model].filter(Boolean).join(" · ");
}

/**
 * Chooses where the provider's page sends its threads: the playground's own
 * agent session, or a live captain session (a Claude Code or Codex agent the
 * user already runs), which captain delivers into through its own channel.
 */
export function AgentTargetPicker() {
  const { target, setTarget } = useAgentRuns();
  const [sessions, setSessions] = useState<CaptainSessionOption[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    try {
      setSessions(await fetchCaptainSessions());
      setError(null);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : String(cause));
    }
  }, []);

  useEffect(() => {
    void load();
    const timer = window.setInterval(() => {
      if (document.visibilityState === "visible") void load();
    }, REFRESH_MS);
    return () => window.clearInterval(timer);
  }, [load]);

  const live = sessions ?? [];
  const stale =
    target !== undefined &&
    sessions !== null &&
    !live.some((session) => session.id === target.sessionId);
  const options: ComboboxOption[] = [
    { value: PLAYGROUND, label: "Playground agent", description: "The playground's own captain session" },
    ...live.map((session) => ({
      value: `${CAPTAIN_PREFIX}${session.id}`,
      label: sessionLabel(session),
      description: sessionDescription(session),
      group: "Live captain sessions",
      title: session.cwd ?? session.id,
      ...(session.inCmux
        ? { trailing: <Badge variant="soft" clickToCopy={false}>cmux</Badge> }
        : {}),
    })),
    ...(stale
      ? [
          {
            value: `${CAPTAIN_PREFIX}${target.sessionId}`,
            label: target.label,
            description: "No longer live",
            group: "Live captain sessions",
            disabled: true,
          },
        ]
      : []),
  ];

  const change = (value: string) => {
    const session = live.find((entry) => `${CAPTAIN_PREFIX}${entry.id}` === value);
    const next: AgentTarget = session
      ? { kind: "captain", sessionId: session.id, label: sessionLabel(session) }
      : { kind: "playground" };
    setSaving(true);
    setTarget(next)
      .then(() => setError(null))
      .catch((cause: unknown) => setError(cause instanceof Error ? cause.message : String(cause)))
      .finally(() => setSaving(false));
  };

  return (
    <div className="space-y-1">
      <Combobox
        label="Send comments to"
        ariaLabel="Send comments to"
        options={options}
        value={target ? `${CAPTAIN_PREFIX}${target.sessionId}` : PLAYGROUND}
        onChange={change}
        allowCustomValue={false}
        required
        invalid={stale}
        loading={sessions === null || saving}
        disabled={saving}
        size="sm"
      />
      {stale && (
        <p role="alert" className="text-xs text-destructive">
          {target.label} is no longer live. Its threads cannot be delivered; choose another target.
        </p>
      )}
      {error && (
        <p role="alert" className="text-xs text-destructive">
          {error}
        </p>
      )}
    </div>
  );
}
