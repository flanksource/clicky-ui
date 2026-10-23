import { useEffect, useState } from "react";
import { Button, Field, InputField, Modal } from "@flanksource/clicky-ui";
import {
  RuntimeProfilePicker,
  mergeRuntimeSpec,
  useRuntimeProfilePicker,
  type AIPromptRunValue,
  type RuntimeProfile,
} from "@flanksource/clicky-ui/ai";

import type { AgentSessionGrouping, AgentSessionRuntime } from "./agent-runs-api";
import {
  agentRuntimeProfiles,
  fetchRuntimeCatalog,
  resolveRuntimeProfile,
} from "./runtime-profiles";

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

function RuntimeChooser({
  profiles,
  mode,
  grouping,
  busy,
  error,
  onRun,
  onCancel,
}: {
  profiles: RuntimeProfile[];
  mode: RunAgentDialogMode;
  grouping: AgentSessionGrouping;
  busy: boolean;
  error: string | null;
  onRun: (runtime: AgentSessionRuntime) => void;
  onCancel: () => void;
}) {
  const [value, setValue] = useState<AIPromptRunValue>(() =>
    profiles[0] ? { runtimeProfile: profiles[0].id } : {},
  );
  const controller = useRuntimeProfilePicker({
    value,
    onChange: setValue,
    profiles,
    presets: [],
    onResolveProfile: resolveRuntimeProfile,
  });
  const spec = mergeRuntimeSpec(controller.state.draft?.spec ?? {}, value.spec ?? {});
  const model = spec.model?.trim() ?? "";

  return (
    <div className="space-y-4 text-sm">
      <p className="text-muted-foreground">{intro(mode, grouping)}</p>
      <RuntimeProfilePicker controller={controller} profiles={profiles} presets={[]} />
      <Field label="Model" htmlFor="agent-run-model">
        <InputField
          id="agent-run-model"
          value={model}
          onChange={(next) =>
            setValue((current) => ({
              ...current,
              spec: { ...current.spec, model: next },
            }))
          }
        />
      </Field>
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
          disabled={busy || model === ""}
          onClick={() =>
            onRun({
              spec: { ...spec, model },
              ...(value.presets?.length ? { presets: value.presets } : {}),
            })
          }
        >
          {busy ? COPY[mode].busy : COPY[mode].submit}
        </Button>
      </div>
    </div>
  );
}

/**
 * Chooses the runtime new agent sessions start with. Captain's runtime
 * catalog (through the playground's runtime-profile routes) feeds the picker.
 */
export function RunAgentDialog({
  open,
  mode,
  grouping,
  error,
  busy,
  onRun,
  onClose,
}: {
  open: boolean;
  mode: RunAgentDialogMode;
  grouping: AgentSessionGrouping;
  error: string | null;
  busy: boolean;
  onRun: (runtime: AgentSessionRuntime) => void;
  onClose: () => void;
}) {
  const [profiles, setProfiles] = useState<RuntimeProfile[] | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);

  useEffect(() => {
    if (!open) return;
    setProfiles(null);
    setLoadError(null);
    fetchRuntimeCatalog().then(
      (catalog) => setProfiles(agentRuntimeProfiles(catalog)),
      (cause: unknown) => setLoadError(describeError(cause)),
    );
  }, [open]);

  return (
    <Modal open={open} onClose={onClose} title={COPY[mode].title} size="md">
      {loadError ? (
        <p role="alert" className="text-sm text-destructive">
          {loadError}
        </p>
      ) : profiles === null ? (
        <p role="status" className="text-sm text-muted-foreground">
          Loading runtimes from captain…
        </p>
      ) : profiles.length === 0 ? (
        <p role="alert" className="text-sm text-destructive">
          Captain reports no available agent runtime.
        </p>
      ) : (
        <RuntimeChooser
          profiles={profiles}
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
