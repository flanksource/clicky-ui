import { useEffect, useState } from "react";
import { Button, Modal } from "@flanksource/clicky-ui";
import {
  SpecRuntimeBar,
  compactAISpecRuntime,
  familiesFromRuntimeCatalog,
  type AISpecRuntimeValue,
  type SpecRuntimeFamily,
} from "@flanksource/clicky-ui/ai";
import type { ChatModel } from "@flanksource/clicky-ui/chat";

import type { AgentSessionGrouping, AgentSessionRuntime } from "./agent-runs-api";
import {
  agentRuntimeCatalog,
  fetchModelCatalog,
  fetchRuntimeCatalog,
} from "./runtime-catalog";

function describeError(cause: unknown): string {
  return cause instanceof Error ? cause.message : String(cause);
}

/** `run` starts a session for a thread; `configure` only saves the runtime new sessions use. */
export type RunAgentDialogMode = "run" | "configure";

const COPY: Record<
  RunAgentDialogMode,
  { title: string; submit: string; busy: string }
> = {
  run: { title: "Run agent", submit: "Start session and run", busy: "Starting…" },
  configure: { title: "Agent runtime", submit: "Save runtime", busy: "Saving…" },
};

function intro(mode: RunAgentDialogMode, grouping: AgentSessionGrouping): string {
  if (mode === "configure") {
    return "Every new agent session starts with this runtime. Sessions already running keep theirs.";
  }
  return grouping === "page"
    ? "No agent session is running for this page. This starts the page's session; later comments on the page are sent into it."
    : "No agent session is running. This starts the playground's one shared session; later comments are sent into it.";
}

type Catalog = { families: SpecRuntimeFamily[]; models: ChatModel[] };

/** The configured runtime when it is still offered, else the first agent runtime's default. */
function initialValue(
  families: SpecRuntimeFamily[],
  current: AgentSessionRuntime | undefined,
): AISpecRuntimeValue {
  if (current) return current.spec as AISpecRuntimeValue;
  const mode = families[0]?.modes[0];
  return { mode: "agent", ...(mode?.defaultModel ? { model: mode.defaultModel } : {}) };
}

function RuntimeChooser({
  catalog,
  current,
  mode,
  grouping,
  busy,
  error,
  onRun,
  onCancel,
}: {
  catalog: Catalog;
  current: AgentSessionRuntime | undefined;
  mode: RunAgentDialogMode;
  grouping: AgentSessionGrouping;
  busy: boolean;
  error: string | null;
  onRun: (runtime: AgentSessionRuntime) => void;
  onCancel: () => void;
}) {
  const [value, setValue] = useState<AISpecRuntimeValue>(() =>
    initialValue(catalog.families, current),
  );
  const spec = compactAISpecRuntime(value);
  const model = spec.model;

  return (
    <div className="space-y-4 text-sm">
      <p className="text-muted-foreground">{intro(mode, grouping)}</p>
      {/* Permissions, workspace and commit settings come from the session prompt, so only the model row is offered. */}
      <SpecRuntimeBar
        value={value}
        onChange={setValue}
        models={catalog.models}
        families={catalog.families}
        sections={["model"]}
        ariaLabel="Agent runtime"
      />
      {error && (
        <p role="alert" className="text-xs text-destructive">
          {error}
        </p>
      )}
      <div className="flex justify-end gap-2">
        <Button variant="outline" onClick={onCancel} disabled={busy}>
          Cancel
        </Button>
        <Button
          disabled={busy || !model}
          onClick={() => {
            if (model) onRun({ spec: { ...spec, model } });
          }}
        >
          {busy ? COPY[mode].busy : COPY[mode].submit}
        </Button>
      </div>
    </div>
  );
}

/**
 * Chooses the runtime new agent sessions start with, through clicky-ui's
 * runtime bar fed by captain's agent-mode runtimes and model catalog.
 */
export function RunAgentDialog({
  open,
  mode,
  grouping,
  current,
  error,
  busy,
  onRun,
  onClose,
}: {
  open: boolean;
  mode: RunAgentDialogMode;
  grouping: AgentSessionGrouping;
  /** The configured runtime, preselected when present. */
  current: AgentSessionRuntime | undefined;
  error: string | null;
  busy: boolean;
  onRun: (runtime: AgentSessionRuntime) => void;
  onClose: () => void;
}) {
  const [catalog, setCatalog] = useState<Catalog | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);

  useEffect(() => {
    if (!open) return;
    setCatalog(null);
    setLoadError(null);
    Promise.all([fetchRuntimeCatalog(), fetchModelCatalog()]).then(
      ([runtimes, models]) => {
        const agents = agentRuntimeCatalog(runtimes);
        setCatalog({
          // familiesFromRuntimeCatalog falls back to built-in families for an
          // empty list, so an empty agent catalog must stay empty here.
          families: agents.length ? familiesFromRuntimeCatalog(agents) : [],
          models,
        });
      },
      (cause: unknown) => setLoadError(describeError(cause)),
    );
  }, [open]);

  return (
    <Modal open={open} onClose={onClose} title={COPY[mode].title} size="lg">
      {loadError ? (
        <p role="alert" className="text-sm text-destructive">
          {loadError}
        </p>
      ) : catalog === null ? (
        <p role="status" className="text-sm text-muted-foreground">
          Loading runtimes from captain…
        </p>
      ) : catalog.families.length === 0 ? (
        <p role="alert" className="text-sm text-destructive">
          Captain reports no available agent runtime.
        </p>
      ) : (
        <RuntimeChooser
          catalog={catalog}
          current={current}
          mode={mode}
          grouping={grouping}
          busy={busy}
          error={error}
          onRun={onRun}
          onCancel={onClose}
        />
      )}
    </Modal>
  );
}
