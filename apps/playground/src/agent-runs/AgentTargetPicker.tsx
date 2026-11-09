import { useEffect, useRef, useState } from "react";
import {
  familyForModel,
  familiesFromRuntimeCatalog,
} from "@flanksource/clicky-ui/ai";
import { fetchModelCatalog, fetchRuntimeCatalog } from "./runtime-catalog";
import {
  Badge,
  Button,
  Combobox,
  Select,
  type ComboboxOption,
} from "@flanksource/clicky-ui";
import { CreateAgentSessionDialog } from "./CreateAgentSessionDialog";
import { AgentIdentity, shortContextModelName } from "@flanksource/clicky-ui/chat";

import { type AgentTarget, type CaptainSessionOption } from "./agent-runs-api";
import { useAgentRuns } from "./AgentRunsProvider";
import { captainAgentTarget, rememberedAgentTarget } from "./agent-targets";
import { useCaptainSessions } from "./useCaptainSessions";

const PLAYGROUND = "playground";
const CAPTAIN_PREFIX = "captain:";

function sessionDescription(session: CaptainSessionOption): string {
  const folder = session.cwd?.split("/").filter(Boolean).at(-1);
  return [folder, session.model ? shortContextModelName(session.model) : undefined].filter(Boolean).join(" · ");
}

/**
 * Chooses where the provider's page sends its threads: the playground's own
 * agent session, or a live captain session (a Claude Code or Codex agent the
 * user already runs), which captain delivers into through its own channel.
 */
export function AgentTargetPicker() {
  const { data, target, setTarget } = useAgentRuns();
  const { sessions, error: loadError } = useCaptainSessions();
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [project, setProject] = useState("");
  const [agent, setAgent] = useState("");
  const [query, setQuery] = useState("");
  const [creating, setCreating] = useState(false);
  const [agentFamilies, setAgentFamilies] = useState<Record<string, string>>(
    {},
  );
  const hasManaged =
    data?.sessions.some((entry) => entry.purpose === "target") ?? false;
  useEffect(() => {
    if (!hasManaged) return;
    let active = true;
    Promise.all([fetchModelCatalog(), fetchRuntimeCatalog()])
      .then(([models, runtimes]) => {
        const families = familiesFromRuntimeCatalog(runtimes);
        const names: Record<string, string> = {};
        for (const model of models) {
          const family = familyForModel(families, models, model.id);
          if (family) {
            names[model.id] = family.id;
            if (model.runtime?.model) names[model.runtime.model] = family.id;
          }
        }
        if (active) setAgentFamilies(names);
      })
      .catch((cause: unknown) => {
        if (active) setError(String(cause));
      });
    return () => {
      active = false;
    };
  }, [hasManaged]);

  const managed = (data?.sessions ?? []).filter(
    (entry) => entry.purpose === "target" && entry.state === "running",
  );
  const live: CaptainSessionOption[] = [
    ...managed.map((entry) => ({
      id: entry.sessionId,
      source: agentFamilies[entry.runtime.spec.model] ?? "Unavailable runtime",
      title: entry.label!,
      ...(entry.cwd ? { cwd: entry.cwd } : {}),
      model: entry.runtime.spec.model,
      inCmux: false,
    })),
    ...(sessions ?? []).filter(
      (entry) => !managed.some((session) => session.sessionId === entry.id),
    ),
  ];
  const stale =
    target !== undefined &&
    (target.kind === "managed" || sessions !== null) &&
    !live.some((session) => session.id === target.sessionId);
  const options: ComboboxOption[] = [
    {
      value: PLAYGROUND,
      label: "Playground agent",
      description: "The playground's own captain session",
    },
    ...live
      .filter(
        (session) =>
          session.id === target?.sessionId ||
          ((!project || session.cwd === project) &&
            (!agent || session.source === agent) &&
            `${session.title} ${session.cwd} ${session.source} ${session.model}`
              .toLowerCase()
              .includes(query.toLowerCase())),
      )
      .map((session) => ({
        value: `${CAPTAIN_PREFIX}${session.id}`,
        label: managed.some((entry) => entry.sessionId === session.id)
          ? session.title
          : captainAgentTarget(session).label,
        description: sessionDescription(session),
        group: "Live captain sessions",
        title: session.cwd ?? session.id,
        trailing: <span className="flex items-center gap-2"><AgentIdentity {...(session.model ? { model: session.model } : { provider: session.source })} identityId={session.id} />
          {session.inCmux && <Badge variant="soft" clickToCopy={false}>cmux</Badge>}
        </span>,
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
    const session = live.find(
      (entry) => `${CAPTAIN_PREFIX}${entry.id}` === value,
    );
    if (value !== PLAYGROUND && !session) {
      setError(
        `Unknown agent session ${JSON.stringify(value)}. Choose a live session.`,
      );
      return;
    }
    apply(session
      ? managed.some((entry) => entry.sessionId === session.id)
        ? { kind: "managed", sessionId: session.id, label: session.title }
        : captainAgentTarget(session)
      : { kind: "playground" });
  };
  const apply = (next: AgentTarget) => {
    setSaving(true);
    setTarget(next)
      .then(() => setError(null))
      .catch((cause: unknown) =>
        setError(cause instanceof Error ? cause.message : String(cause)),
      )
      .finally(() => setSaving(false));
  };

  // A page nobody pointed anywhere yet starts on the session last chosen for any page, while it is live.
  const restored = useRef(false);
  useEffect(() => {
    if (restored.current || data === null || sessions === null) return;
    restored.current = true;
    if (target !== undefined) return;
    try {
      const remembered = rememberedAgentTarget();
      if (remembered && live.some((session) => session.id === remembered.sessionId)) apply(remembered);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : String(cause));
    }
  });

  return (
    <div className="space-y-1">
      <Combobox
        label="Send comments to"
        searchPlacement="menu"
        menuWidth={480}
        onSearch={setQuery}
        menuHeader={
          <div className="space-y-2 border-b border-border p-2">
            <div className="grid grid-cols-2 gap-2">
              <label className="min-w-0 text-xs">
                Project
                <Select
                  aria-label="Filter sessions by project"
                  value={project}
                  onChange={(event) => setProject(event.target.value)}
                  options={[
                    { value: "", label: "All projects" },
                    ...Array.from(
                      new Set(
                        live.flatMap((entry) => (entry.cwd ? [entry.cwd] : [])),
                      ),
                    )
                      .sort()
                      .map((path) => ({ value: path, label: path })),
                  ]}
                />
              </label>
              <label className="min-w-0 text-xs">
                Agent
                <Select
                  aria-label="Filter sessions by agent"
                  value={agent}
                  onChange={(event) => setAgent(event.target.value)}
                  options={[
                    { value: "", label: "All agents" },
                    ...Array.from(new Set(live.map((entry) => entry.source)))
                      .sort()
                      .map((source) => ({ value: source, label: source })),
                  ]}
                />
              </label>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCreating(true)}
            >
              New session…
            </Button>
          </div>
        }
        ariaLabel="Send comments to"
        options={options}
        value={target ? `${CAPTAIN_PREFIX}${target.sessionId}` : PLAYGROUND}
        onChange={change}
        allowCustomValue={false}
        required
        invalid={stale}
        loading={
          data === null || (sessions === null && loadError === null) || saving
        }
        disabled={data === null || saving}
        size="sm"
      />
      {stale && (
        <p role="alert" className="text-xs text-destructive">
          {target.label} is no longer live. Its threads cannot be delivered;
          choose another target.
        </p>
      )}
      {(error || loadError) && (
        <p role="alert" className="text-xs text-destructive">
          {error ?? loadError}
        </p>
      )}
      {creating && (
        <CreateAgentSessionDialog
          project={project}
          onClose={() => setCreating(false)}
        />
      )}
    </div>
  );
}
