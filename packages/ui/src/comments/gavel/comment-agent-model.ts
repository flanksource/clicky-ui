import { DEFAULT_RUN_PROMPT, type CommentAgent, type CommentAgentPatch, type CommentAgentSettings, type GavelAgentSession, type SettingsRef } from "./gavel-delivery";

/** The settings layers and positions gavel resolved a target's comment agent over. */
export type CommentAgentLayers = CommentAgentSettings["settings"];

/** Where each resolved comment agent field came from: the layer label, and the page entry key when the layer's entry for the page set it. */
export type CommentAgentProvenance = CommentAgentSettings["agent"]["provenance"];

export const COMMENT_AGENT_FIELDS = ["enabled", "assign", "edits", "prompt", "presets", "spec", "variables", "instructions", "group"] as const;
export type CommentAgentField = (typeof COMMENT_AGENT_FIELDS)[number];

/** How gavel's `settings.Layer.Label` names a layer in provenance. */
export function layerLabelOf(layer: CommentAgentLayers["layers"][number]): string {
  return layer.file ? layer.location : `db:${layer.kind}:${layer.path ?? ""}`;
}

const sameLayer = (a: SettingsRef, b: SettingsRef) => a.kind === b.kind && (a.path ?? "") === (b.path ?? "") && (a.file ?? "") === (b.file ?? "");

/** The provenance label of the layer `ref` names, if the chain has it. */
export function ownLayerLabel(settings: CommentAgentLayers, ref: SettingsRef): string | undefined {
  const layer = settings.layers.find((candidate) => sameLayer(candidate, ref));
  return layer && layerLabelOf(layer);
}

/**
 * The layer the picker saves the target's comment agent to: the project's
 * `.gavel.yaml` when the project has one (gavel refuses the database layer
 * beside a settings file), otherwise the project's database layer. A chain
 * that offers neither throws, since saving elsewhere would not be what was asked.
 */
export function ownLayerOf(settings: CommentAgentLayers): SettingsRef {
  const position = settings.positions.find((candidate) => candidate.kind === "project");
  if (!position) throw new Error("the target's settings chain has no project position, so its comment agent has nowhere to be saved");
  const [file] = position.files;
  if (file !== undefined) return { kind: "project", file };
  if (!position.db) throw new Error(`the project's settings at ${position.dir} cannot be saved: it has neither a settings file nor a database layer`);
  return { kind: "project" };
}

/** The chip that says which settings layer a field was resolved from. */
export type ProvenanceChip = {
  label: string;
  /** The full layer label, and the page entry key when the page's own entry set it. */
  title: string;
  /** A settings layer set the field; otherwise gavel's built-in default applies. */
  set: boolean;
};

/**
 * Names the layer entry that set `field`: the file's basename or "DB", "(page)"
 * for a page entry. A provenance entry naming a layer outside the chain is a
 * gavel contract break and throws.
 */
export function provenanceChipOf(input: { settings: CommentAgentLayers; provenance: CommentAgentProvenance; field: CommentAgentField }): ProvenanceChip {
  const { settings, provenance, field } = input;
  const source = provenance[field];
  if (!source) return { label: "default", title: "No settings layer sets this field, so gavel's built-in default applies", set: false };
  const layer = settings.layers.find((candidate) => layerLabelOf(candidate) === source.layer);
  if (!layer) throw new Error(`the ${field} of the comment agent comes from ${source.layer}, which is not one of the target's settings layers`);
  const name = layer.file ? layer.location.split("/").pop()! : "DB";
  return { label: `${name}${source.page ? " (page)" : ""}`, title: source.page ? `${source.layer} · ${source.page}` : source.layer, set: true };
}

/** The text the picker shows for `field` beside its chip. */
export function agentFieldValue(agent: CommentAgent, field: CommentAgentField): string {
  switch (field) {
    case "enabled":
      return agent.enabled ? "on" : "off";
    case "assign":
      return agent.assign ? "yes" : "no";
    case "edits":
      return agent.edits ?? "direct";
    case "prompt":
      return agent.prompt ?? DEFAULT_RUN_PROMPT;
    case "presets":
      return (agent.presets ?? []).join(", ");
    case "spec":
      return typeof agent.spec?.["model"] === "string" ? agent.spec["model"] : Object.keys(agent.spec ?? {}).length ? JSON.stringify(agent.spec) : "";
    case "variables":
      return Object.keys(agent.variables ?? {}).length ? JSON.stringify(agent.variables) : "";
    case "instructions":
      return agent.instructions ?? "";
    case "group":
      return agent.group ?? "";
  }
}

/** The run fields of a comment agent the picker edits in one form. */
export type RunSettingsDraft = { prompt: string; presets: string[]; spec: Record<string, unknown>; variables: Record<string, unknown>; instructions: string };

/** The form's starting values: what the agent already sets, and the default prompt where it names none. */
export function draftOfAgent(agent: CommentAgent): RunSettingsDraft {
  return { prompt: agent.prompt ?? DEFAULT_RUN_PROMPT, presets: agent.presets ?? [], spec: agent.spec ?? {}, variables: agent.variables ?? {}, instructions: agent.instructions ?? "" };
}

const isEmpty = (value: unknown): boolean => (typeof value === "string" ? value.trim() === "" : Array.isArray(value) ? value.length === 0 : Object.keys(value as object).length === 0);

/**
 * The fields `draft` changes from `agent`: a changed field carries its new
 * value, and one the draft emptied is `null`, which the merge patch gavel
 * applies removes so the field inherits again.
 */
export function runSettingsPatch(agent: CommentAgent, draft: RunSettingsDraft): CommentAgentPatch {
  const seed = draftOfAgent(agent);
  const changed = (Object.keys(draft) as (keyof RunSettingsDraft)[]).filter((field) => JSON.stringify(draft[field]) !== JSON.stringify(seed[field]));
  return Object.fromEntries(changed.map((field) => [field, isEmpty(draft[field]) ? null : draft[field]])) as CommentAgentPatch;
}

/** The patch that removes `field` from a layer's entry so it inherits again. */
export function inheritPatch(field: CommentAgentField): CommentAgentPatch {
  return { [field]: null };
}

/** What a session row's badge says: that delivering resumes it, its status, or that gavel cannot reach it through cmux. */
export function sessionBadgeOf(session: GavelAgentSession): string {
  if (session.resumable) return "resumes";
  if (session.status !== "ended" && !session.managed && !session.inCmux) return "not in cmux";
  return session.status ?? "running";
}

/** How full the session's context window is, as a whole percentage; undefined when gavel has no reading. */
export function sessionContextPercent(session: GavelAgentSession): number | undefined {
  return session.context ? Math.round((session.context.usedTokens / session.context.windowTokens) * 100) : undefined;
}
