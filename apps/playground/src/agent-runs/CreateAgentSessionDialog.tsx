import { useEffect, useState } from "react";
import { Combobox } from "@flanksource/clicky-ui";
import {
  fetchAgentProjects,
  type AgentProject,
  type AgentSessionRuntime,
} from "./agent-runs-api";
import { useAgentRuns } from "./AgentRunsProvider";
import { RunAgentDialog } from "./RunAgentDialog";

export function CreateAgentSessionDialog({
  project: initialProject,
  onClose,
}: {
  project: string;
  onClose: () => void;
}) {
  const { data, createSession } = useAgentRuns();
  const [projects, setProjects] = useState<AgentProject[]>([]);
  const [project, setProject] = useState(initialProject);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  useEffect(() => {
    let active = true;
    fetchAgentProjects()
      .then((result) => {
        if (!active) return;
        setProjects(result.projects);
        setProject(initialProject || result.defaultProject);
      })
      .catch((cause: unknown) => {
        if (active) setError(String(cause));
      });
    return () => {
      active = false;
    };
  }, [initialProject]);
  const submit = async (runtime: AgentSessionRuntime) => {
    setBusy(true);
    setError(null);
    try {
      await createSession(project, runtime);
      onClose();
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : String(cause));
    } finally {
      setBusy(false);
    }
  };
  return (
    <RunAgentDialog
      open
      mode="create"
      grouping="page"
      current={data?.settings.runtime}
      error={error}
      busy={busy}
      onRun={(runtime) => void submit(runtime)}
      onClose={() => {
        if (!busy) onClose();
      }}
      canSubmit={projects.some((entry) => entry.path === project)}
      fields={
        <div className="mb-4 space-y-2">
          <Combobox
            label="Project"
            ariaLabel="Session project"
            value={project}
            onChange={setProject}
            options={projects.map((entry) => ({
              value: entry.path,
              label: entry.label,
              description: entry.path,
            }))}
            allowCustomValue={false}
            required
            disabled={busy}
          />
          {error && projects.length === 0 && (
            <p role="alert" className="text-sm text-destructive">
              {error}
            </p>
          )}
          {!projects.length && !error && <p role="status">Loading projects…</p>}
        </div>
      }
    />
  );
}
