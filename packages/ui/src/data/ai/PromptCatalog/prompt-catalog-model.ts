import type {
  PromptCatalogEntry,
  PromptCatalogLayer,
  PromptCatalogRuntime,
  PromptCatalogSource,
} from "./types";

// Layer origins the hosts emit, with the labels the UI shows for them. An
// unknown origin is shown as-is.
const LAYER_LABELS: Record<string, string> = {
  "user-home": "Home (~/.gavel.yaml)",
  "git-root": "Repository root",
  "target-directory": "Project directory",
};

export function layerLabel(origin: string): string {
  return LAYER_LABELS[origin] ?? origin;
}

// effectiveLayer is the layer whose override actually runs: the highest layer
// that sets a source. Undefined means the built-in default runs.
export function effectiveLayer(
  entry: PromptCatalogEntry,
): PromptCatalogLayer | undefined {
  for (let i = entry.layers.length - 1; i >= 0; i -= 1) {
    const layer = entry.layers[i];
    if (layer && layer.source !== "none") return layer;
  }
  return undefined;
}

// defaultEditLayer picks where an edit should land when the user has not
// chosen: the effective layer when it is editable (edit what runs), otherwise
// the highest editable layer (the most specific place that can hold an
// override). Undefined when nothing is editable.
export function defaultEditLayer(
  entry: PromptCatalogEntry,
): PromptCatalogLayer | undefined {
  const effective = effectiveLayer(entry);
  if (effective?.editable) return effective;
  for (let i = entry.layers.length - 1; i >= 0; i -= 1) {
    const layer = entry.layers[i];
    if (layer?.editable) return layer;
  }
  return undefined;
}

// layersAbove lists the layers that would shadow an override written to
// `layer` — a save there changes nothing while a higher layer sets the prompt.
export function layersAbove(
  entry: PromptCatalogEntry,
  layer: PromptCatalogLayer,
): PromptCatalogLayer[] {
  const index = entry.layers.findIndex(
    (candidate) => candidate.origin === layer.origin,
  );
  if (index < 0) return [];
  return entry.layers
    .slice(index + 1)
    .filter((candidate) => candidate.source !== "none");
}

export type SourceTone = "neutral" | "info" | "success" | "warning" | "danger";

export function sourceTone(
  source: PromptCatalogSource | "default",
): SourceTone {
  switch (source) {
    case "inline":
      return "info";
    case "file":
      return "success";
    case "none":
      return "warning";
    default:
      return "neutral";
  }
}

export function sourceLabel(source: PromptCatalogSource | "default"): string {
  switch (source) {
    case "builtin":
    case "default":
      return "Built-in";
    case "inline":
      return "Inline";
    case "file":
      return "File";
    default:
      return "Unset";
  }
}

// runtimeSummary renders the effective model as one line (`claude-opus-4-6 ·
// claude-agent · high`), or the reason there is none.
export function runtimeSummary(runtime: PromptCatalogRuntime): string {
  if (runtime.error) return runtime.error;
  if (!runtime.model) return `inherited at run time (${runtime.modelSource})`;
  return [runtime.model, runtime.backend, runtime.effort]
    .filter(Boolean)
    .join(" · ");
}

// provenanceSummary condenses the per-field provenance to the layers that
// override something, e.g. "model ← Home; body ← Project directory".
export function provenanceSummary(entry: PromptCatalogEntry): string {
  const provenance = entry.provenance ?? {};
  const overridden = Object.entries(provenance).filter(
    ([, origin]) => !["prompt default", "ai base", "runtime"].includes(origin),
  );
  if (overridden.length === 0) return "";
  return overridden
    .map(([field, origin]) => `${field} ← ${layerLabel(origin)}`)
    .join("; ");
}

export interface PromptCatalogFilterOptions {
  owners: string[];
  sources: PromptCatalogSource[];
  commands: string[];
  models: string[];
}

// catalogFilterOptions derives the distinct values the table's filter bar
// offers, so the controls only show what is actually present.
export function catalogFilterOptions(
  entries: PromptCatalogEntry[],
): PromptCatalogFilterOptions {
  const owners = new Set<string>();
  const sources = new Set<PromptCatalogSource>();
  const commands = new Set<string>();
  const models = new Set<string>();
  for (const entry of entries) {
    owners.add(entry.owner);
    sources.add(entry.source);
    for (const command of entry.usedBy ?? []) commands.add(command);
    if (entry.effective.model) models.add(entry.effective.model);
  }
  const sorted = (values: Iterable<string>) =>
    [...values].sort((a, b) => a.localeCompare(b));
  return {
    owners: sorted(owners),
    sources: [...sources].sort(),
    commands: sorted(commands),
    models: sorted(models),
  };
}

export interface PromptCatalogFilter {
  query?: string | undefined;
  owners?: string[] | undefined;
  sources?: PromptCatalogSource[] | undefined;
  commands?: string[] | undefined;
  models?: string[] | undefined;
  overriddenOnly?: boolean | undefined;
}

function matchesAny(
  values: string[] | undefined,
  selected: string[] | undefined,
): boolean {
  if (!selected || selected.length === 0) return true;
  return (values ?? []).some((value) => selected.includes(value));
}

// entryMatches applies the table's filter state to one entry: a free-text
// query over id/title/description/commands/body, plus the facet selections.
export function entryMatches(
  entry: PromptCatalogEntry,
  filter: PromptCatalogFilter,
): boolean {
  const query = filter.query?.trim().toLowerCase();
  if (query) {
    const haystack = [
      entry.id,
      entry.title,
      entry.description ?? "",
      entry.configPath ?? "",
      ...(entry.usedBy ?? []),
      entry.body ?? "",
    ]
      .join("\n")
      .toLowerCase();
    if (!haystack.includes(query)) return false;
  }
  if (!matchesAny([entry.owner], filter.owners)) return false;
  if (!matchesAny([entry.source], filter.sources)) return false;
  if (!matchesAny(entry.usedBy, filter.commands)) return false;
  if (
    !matchesAny(
      entry.effective.model ? [entry.effective.model] : [],
      filter.models,
    )
  )
    return false;
  if (
    filter.overriddenOnly &&
    entry.source !== "inline" &&
    entry.source !== "file"
  )
    return false;
  return true;
}

// previewText is the first meaningful line of a prompt body, for the table.
export function previewText(body: string | undefined, maxLength = 140): string {
  const line = (body ?? "")
    .split("\n")
    .map((part) => part.trim())
    .find((part) => part.length > 0 && !part.startsWith("{{"));
  if (!line) return "";
  return line.length > maxLength ? `${line.slice(0, maxLength - 1)}…` : line;
}
