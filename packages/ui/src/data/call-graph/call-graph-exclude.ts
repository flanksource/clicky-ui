// Editing the call graph's group exclusions. A pattern is a group name, a name ending in /... (that
// group and every group below it), or `external` (every group outside the indexed scope). A host
// whose source knows more keywords passes a matcher that understands them and falls back to this one.
// No patterns excludes nothing; the host's defaults are asked for with `undefined`, never with [].
import type { CallGraph, CallGraphGroupFact } from "./types";

export const EXCLUDE_EXTERNAL = "external";
/** The URL token for "exclude nothing", since an empty URL value stands for the host's defaults. */
export const EXCLUDE_NONE = "none";

/** Whether one pattern excludes the group. */
export type ExcludeMatcher = (pattern: string, group: CallGraphGroupFact) => boolean;

export const matchesExclude: ExcludeMatcher = (pattern, group) => {
  if (pattern === EXCLUDE_EXTERNAL) return group.external === true;
  if (pattern.endsWith("/...")) {
    const base = pattern.slice(0, -"/...".length);
    return group.name === base || group.name.startsWith(`${base}/`);
  }
  return group.name === pattern;
};

/** A URL value as patterns: empty is undefined, the host's defaults; `none` is no patterns. */
export function parseExclude(text: string): string[] | undefined {
  if (text === "") return undefined;
  return text === EXCLUDE_NONE ? [] : text.split(",");
}

/** The URL value for these patterns: undefined (the defaults) is empty, and no patterns is `none`. */
export function formatExclude(patterns: readonly string[] | undefined): string {
  if (patterns === undefined) return "";
  return patterns.length === 0 ? EXCLUDE_NONE : patterns.join(",");
}

/** Excludes one group by its exact name. */
export function excludeGroup(patterns: readonly string[], name: string): string[] {
  return [...patterns, name];
}

/**
 * Brings a group back. Every pattern that excludes it goes; a keyword or a /... pattern that also
 * covered other reached groups is replaced by their exact names, so they stay excluded.
 */
export function includeGroup(
  patterns: readonly string[],
  target: CallGraphGroupFact,
  groups: readonly CallGraphGroupFact[],
  matches: ExcludeMatcher = matchesExclude,
): string[] {
  if (!target.excluded) throw new Error(`Group ${target.name} is not excluded`);
  const covering = patterns.filter((pattern) => matches(pattern, target));
  if (covering.length === 0) throw new Error(`Group ${target.name} is reported excluded, but none of ${patterns.join(", ")} matches it`);
  const rest = patterns.filter((pattern) => !covering.includes(pattern));
  const replacements = groups.filter(
    (group) =>
      group.name !== target.name && covering.some((pattern) => matches(pattern, group)) && !rest.some((pattern) => matches(pattern, group)),
  );
  return [...rest, ...replacements.map((group) => group.name)];
}

/** Adds or removes the `external` keyword behind "Hide all external". */
export function setExternalHidden(patterns: readonly string[], hidden: boolean): string[] {
  const others = patterns.filter((pattern) => pattern !== EXCLUDE_EXTERNAL);
  return hidden ? [...others, EXCLUDE_EXTERNAL] : others;
}

/** Why a typed pattern cannot be added, or undefined when it can. The host checks the name itself. */
export function excludePatternError(patterns: readonly string[], pattern: string): string | undefined {
  if (pattern === "") return "Enter a name or a name ending in /...";
  if (/[\s,]/.test(pattern)) return `One pattern at a time: ${pattern} has a comma or a space`;
  if (pattern === EXCLUDE_NONE) return "Use Show all to exclude nothing";
  if (patterns.includes(pattern)) return `${pattern} is already excluded`;
  return undefined;
}

export function addExcludePattern(patterns: readonly string[], pattern: string): string[] {
  return [...patterns, pattern];
}

export function removeExcludePattern(patterns: readonly string[], pattern: string): string[] {
  return patterns.filter((candidate) => candidate !== pattern);
}

/**
 * The groups a graph reached, for a host whose responses carry no group facts of their own: each
 * drawn group with its node count, and each group `omitted.excluded` tallies, which is excluded when
 * none of its nodes is drawn.
 */
export function callGraphGroupFacts(graph: CallGraph): CallGraphGroupFact[] {
  const drawn = new Map<string, number>();
  for (const node of graph.nodes) if (node.group !== undefined) drawn.set(node.group, (drawn.get(node.group) ?? 0) + 1);
  const excluded = graph.omitted.excluded ?? {};
  const names = [...new Set([...drawn.keys(), ...Object.keys(excluded)])];
  return names.map((name) => {
    const label = graph.groups?.find((group) => group.id === name)?.label;
    const shown = drawn.get(name) ?? 0;
    return { name, ...(label !== undefined && label !== name ? { label } : {}), nodes: shown + (excluded[name] ?? 0), excluded: shown === 0 };
  });
}
