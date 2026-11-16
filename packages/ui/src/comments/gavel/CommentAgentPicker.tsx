import { useState, type ReactNode } from "react";
import { Button } from "../../components/button";
import { SegmentedControl } from "../../components/SegmentedControl";
import { Switch } from "../../components/Switch";
import { Badge } from "../../data/Badge";
import { cn } from "../../lib/utils";
import { agentFieldValue, inheritPatch, ownLayerLabel, provenanceChipOf, type CommentAgentField } from "./comment-agent-model";
import { CommentAgentRunSettings, type CommentAgentPromptOption, type CommentAgentRuntimeOptions } from "./CommentAgentRunSettings";
import { CommentAgentSessions, type CommentAgentPickerSessions } from "./CommentAgentSessions";
import type { CommentEdits } from "./gavel-delivery";
import type { GavelAgents } from "./useGavelAgents";

export type { CommentAgentPromptOption, CommentAgentRuntimeOptions } from "./CommentAgentRunSettings";
export type { CommentAgentPickerSessions } from "./CommentAgentSessions";

/** How sessions are shared: one for every page, or one per page. Saved as the agent's `group`. */
export type CommentAgentGrouping = "shared" | "page";

export type CommentAgentPickerProps = {
  /** The target's comment agent and the writes that change it: the result of `useGavelAgents`. */
  agents: GavelAgents;
  heading?: ReactNode;
  /** Disables every control, for a host that is busy with something else. */
  busy?: boolean;
  /** Why auto-run cannot be switched on yet, such as no page being open; it disables the switch and is shown as its tooltip. */
  autoRunUnavailable?: string;
  /** The captain prompts the agent can run; without them the prompt is shown but not chosen. */
  prompts?: CommentAgentPromptOption[];
  /** The runtime and model catalog; without it the runtime, model and preset controls are not offered. */
  runtimes?: CommentAgentRuntimeOptions;
  /** How sessions are grouped, owned by the host. */
  grouping?: { value: CommentAgentGrouping; onChange: (grouping: CommentAgentGrouping) => void };
  /** Omitted where only the agent's settings are edited. */
  sessions?: CommentAgentPickerSessions;
  className?: string;
};

const EDIT_HELP: Record<CommentEdits, string> = {
  direct: "The agent edits the project's files itself.",
  propose: "The agent must not edit project files: it answers with a patch you apply, stage, reject or ask to revise.",
};

/** The run fields shown as a summary beside their chip; the form below edits them. */
const RUN_FIELDS = ["prompt", "presets", "spec", "variables", "instructions"] as const satisfies readonly CommentAgentField[];

/**
 * Everything about a target's comment agent in one body: auto-run, assignment,
 * how the agent edits (settable with auto-run off), the prompt, runtime and
 * instructions, how sessions are grouped, and the live and resumable sessions
 * to deliver to. Each value shows the settings layer it was resolved from and,
 * when the layer it saves to (the project's settings file, or its database
 * layer when it has none) itself sets it, a way to make it inherit again.
 * Data-agnostic: values and writes come from `useGavelAgents`.
 */
export function CommentAgentPicker(props: CommentAgentPickerProps) {
  const { agents, heading, busy = false, autoRunUnavailable, prompts, runtimes, grouping, sessions, className } = props;
  const [pending, setPending] = useState(false);
  const [failure, setFailure] = useState<string | null>(null);
  const rule = agents.agent;
  const layers = agents.settings;
  const disabled = busy || pending;

  const act = async (action: () => Promise<unknown>) => {
    setPending(true);
    setFailure(null);
    try {
      await action();
    } catch (cause) {
      setFailure(cause instanceof Error ? cause.message : String(cause));
    } finally {
      setPending(false);
    }
  };

  const error = failure ?? agents.error;
  const alert = error && (
    <p role="alert" className="break-words text-destructive">
      {error}
    </p>
  );
  const sessionsSection = sessions && (
    <>
      <hr className="border-border" />
      <CommentAgentSessions sessions={sessions} busy={disabled} />
    </>
  );
  const shell = (body: ReactNode) => (
    <div className={cn("space-y-3 p-3 text-xs", className)}>
      {heading && <h2 className="font-semibold">{heading}</h2>}
      {body}
    </div>
  );
  if (!agents.ready || !rule || !layers) {
    return shell(
      <>
        {agents.error ? alert : (
          <p role="status" className="text-muted-foreground">
            Loading the comment agent…
          </p>
        )}
        {sessionsSection}
      </>,
    );
  }

  const ownLabel = agents.ownLayer && ownLayerLabel(layers, agents.ownLayer);
  const chip = (field: CommentAgentField) => {
    const shown = provenanceChipOf({ settings: layers, provenance: rule.provenance, field });
    return (
      <span className="flex shrink-0 items-center gap-1">
        <Badge tone="neutral" variant="soft" clickToCopy={false}>
          <span title={shown.title}>{shown.label}</span>
        </Badge>
        {ownLabel !== undefined && rule.provenance[field]?.layer === ownLabel && (
          <Button size="sm" variant="ghost" aria-label={`Inherit ${field}`} title={`Remove ${field} from the project entry so it inherits again`} disabled={disabled} onClick={() => void act(() => agents.save({ agent: inheritPatch(field) }))}>
            Inherit
          </Button>
        )}
      </span>
    );
  };
  const control = (field: CommentAgentField, content: ReactNode, helper?: ReactNode) => (
    <div data-field={field} className="space-y-1">
      <div className="flex flex-wrap items-center justify-between gap-2">
        {content}
        {chip(field)}
      </div>
      {helper && <p className="text-muted-foreground">{helper}</p>}
    </div>
  );

  return shell(
    <>
      {agents.session && (
        <p data-testid="agent-session-route" className="text-muted-foreground">
          New threads go to the live session <span className="font-mono">{agents.session}</span> (<code>gavel edit --session</code>), ahead of the rule below.
        </p>
      )}
      {control(
        "enabled",
        <span title={autoRunUnavailable}>
          <Switch label="Auto-run new comments" checked={agents.enabled} disabled={disabled || autoRunUnavailable !== undefined} onChange={(on) => void act(() => agents.setEnabled(on))} />
        </span>,
      )}
      {control(
        "assign",
        <Switch label="Show the agent as the thread's assignee" checked={rule.agent.assign === true} disabled={disabled || !agents.enabled} onChange={(assign) => void act(() => agents.save({ agent: { assign } }))} />,
      )}
      {control(
        "edits",
        <SegmentedControl<CommentEdits>
          size="sm"
          aria-label="Agent edits"
          value={agents.edits}
          options={[
            { id: "direct", label: "Edit directly", disabled },
            { id: "propose", label: "Propose patches", disabled },
          ]}
          onChange={(next) => void act(() => agents.setEdits(next))}
        />,
        EDIT_HELP[agents.edits],
      )}
      {grouping &&
        control(
          "group",
          <div className="flex items-center gap-2">
            <span>Sessions</span>
            <SegmentedControl<CommentAgentGrouping>
              size="sm"
              aria-label="Session grouping"
              value={grouping.value}
              options={[
                { id: "shared", label: "Shared", disabled },
                { id: "page", label: "Per page", disabled },
              ]}
              onChange={grouping.onChange}
            />
          </div>,
        )}
      <hr className="border-border" />
      <h2 className="font-semibold">Run settings</h2>
      <dl className="grid grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-x-3 gap-y-1">
        {RUN_FIELDS.map((field) => (
          <div key={field} data-field={field} className="col-span-3 grid grid-cols-subgrid items-center">
            <dt className="text-muted-foreground">{field}</dt>
            <dd className="min-w-0 truncate font-mono" title={agentFieldValue(rule.agent, field)}>
              {agentFieldValue(rule.agent, field) || "—"}
            </dd>
            <dd>{chip(field)}</dd>
          </div>
        ))}
      </dl>
      <CommentAgentRunSettings key={JSON.stringify(rule.agent)} agent={rule.agent} prompts={prompts} runtimes={runtimes} busy={disabled} onSave={(patch) => void act(() => agents.save({ agent: patch }))} />
      {alert}
      {sessionsSection}
    </>,
  );
}
