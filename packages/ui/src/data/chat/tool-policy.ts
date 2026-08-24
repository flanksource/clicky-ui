import type { ToolMeta, ToolPolicy } from "./types";
import { normalizeToolPolicy } from "./types";

/** The client half of Captain's ordered tool-permission policy.
 *
 *  A tool's authority is decided by an ordered rule list evaluated
 *  last-match-wins: weakest rule first, strongest last. The layers this file
 *  composes are the surface's rules (what the page the chat opened on declares)
 *  followed by the user's own (what they toggled in the preferences popover), so
 *  a toggle beats the surface and the surface beats the application's baseline —
 *  which the server appends underneath both.
 *
 *  The matching is a port of Go's `commons/collections.MatchItems`, and it is a
 *  port rather than a re-interpretation on purpose: the same rule list is
 *  evaluated on both sides of the wire — here to render what a tool will do, and
 *  on the server to enforce it — and a client that disagreed would show a state
 *  the request does not produce. */

/** A glob pattern list. A bare string is one pattern, so a rule can be written
 *  `{ group: "provider.xero.*" }` without list ceremony. */
export type MatchPatterns = string | string[];

/** Which tools a rule applies to. Every declared facet must match (AND across
 *  facets); within one facet the patterns are alternatives (OR). An undeclared
 *  facet does not constrain. */
export type ToolMatch = {
  name?: MatchPatterns;
  group?: MatchPatterns;
  parent?: MatchPatterns;
  entity?: MatchPatterns;
  action?: MatchPatterns;
  verb?: MatchPatterns;
  method?: MatchPatterns;
  scope?: MatchPatterns;
  /** A declared hint requires the tool to declare the same hint with the same
   *  value. An undeclared hint on the tool does NOT match: "this tool never said
   *  whether it is read-only" and "this tool said it is not" are different
   *  claims, and reading the first as the second is how an unannotated tool
   *  would inherit a permissive rule. */
  readOnly?: boolean;
  destructive?: boolean;
  idempotent?: boolean;
};

/** One ordered rule: the tools it selects and the authority they get. */
export type PermissionRule = ToolMatch & { policy: ToolPolicy };

/** The ordered rule list, evaluated last-match-wins. */
export type PermissionPolicy = PermissionRule[];

const MATCH_FACETS = [
  "name",
  "group",
  "parent",
  "entity",
  "action",
  "verb",
  "method",
  "scope",
] as const;

/** Reports whether `item` satisfies these patterns, following MatchItems:
 *  `!` negates and takes precedence over any positive match, `*` wildcards a
 *  prefix, suffix or the whole item, matching is case-insensitive, and one
 *  string may carry comma-separated alternatives. An empty list matches
 *  everything — an undeclared facet imposes no constraint. */
export function matchItems(
  item: string,
  patterns: MatchPatterns | undefined,
): boolean {
  const normalized = normalizePatterns(patterns);
  if (normalized.length === 0) return true;
  // Exclusions are checked first so `!` wins however the rule was written:
  // ["a*", "!abc"] must reject "abc" rather than accept it on the wildcard.
  const sorted = [...normalized].sort(
    (a, b) => exclusionRank(a) - exclusionRank(b),
  );
  for (const pattern of sorted) {
    if (pattern.startsWith("!")) {
      if (matchPattern(item, pattern.slice(1))) return false;
      continue;
    }
    if (matchPattern(item, pattern)) return true;
  }
  // Every pattern excluded and none of them matched, so the item is admitted.
  return sorted.every((pattern) => pattern.startsWith("!"));
}

function normalizePatterns(patterns: MatchPatterns | undefined): string[] {
  if (patterns === undefined) return [];
  const list = typeof patterns === "string" ? [patterns] : patterns;
  const out: string[] = [];
  for (const raw of list) {
    if (typeof raw !== "string") continue;
    const parts = raw.split(",");
    for (const part of parts) {
      const trimmed = part.trim();
      if (trimmed === "" && parts.length > 1) continue;
      if (trimmed !== "") out.push(trimmed);
    }
  }
  return out;
}

function exclusionRank(pattern: string): number {
  if (pattern === "!*") return 0;
  return pattern.startsWith("!") ? 1 : 2;
}

function matchPattern(item: string, pattern: string): boolean {
  if (pattern === "*") return true;
  const value = item.toLowerCase();
  const glob = pattern.toLowerCase();
  if (value === glob) return true;
  if (glob.startsWith("*") && glob.endsWith("*")) {
    if (value.includes(glob.slice(1, -1))) return true;
  }
  if (glob.startsWith("*") && value.endsWith(glob.slice(1))) return true;
  if (glob.endsWith("*") && value.startsWith(glob.slice(0, -1))) return true;
  return false;
}

/** Resolves the authority for one tool: the policy of the LAST rule that
 *  matches it, or undefined when no rule does.
 *
 *  Last, not first, because the list runs weakest to strongest — a user rule
 *  appended after a surface rule is meant to win. A first-match-wins reading
 *  would invert the whole contract. */
export function resolveToolPolicy(
  policy: PermissionPolicy | undefined,
  tool: ToolMeta,
): ToolPolicy | undefined {
  let resolved: ToolPolicy | undefined;
  for (const rule of policy ?? []) {
    if (matchesTool(rule, tool)) resolved = rule.policy;
  }
  return resolved;
}

export function matchesTool(match: ToolMatch, tool: ToolMeta): boolean {
  const facets: Record<(typeof MATCH_FACETS)[number], string> = {
    name: tool.name ?? "",
    group: tool.group ?? "",
    parent: tool.parent ?? "",
    entity: tool.entity ?? "",
    action: tool.action ?? "",
    verb: tool.verb ?? "",
    method: tool.method ?? "",
    scope: tool.scope ?? "",
  };
  for (const facet of MATCH_FACETS) {
    if (!matchItems(facets[facet], match[facet])) return false;
  }
  return (
    matchesHint(match.readOnly, tool.annotations?.readOnlyHint) &&
    matchesHint(match.destructive, tool.annotations?.destructiveHint) &&
    matchesHint(match.idempotent, tool.annotations?.idempotentHint)
  );
}

function matchesHint(want: boolean | undefined, have: boolean | undefined) {
  if (want === undefined) return true;
  return have !== undefined && have === want;
}

/** Lowers a flat tool→policy map into ordered rules, so the legacy shape and the
 *  rule list share one evaluation path instead of two that can disagree.
 *
 *  A key is ambiguous — it may name a tool or its group — so each key emits both
 *  a group rule and a name rule, with every group rule placed before every name
 *  rule. A key that names a group matches no tool name and vice versa, so the
 *  ambiguity costs nothing; and where a key is both, the name rule comes later
 *  and wins. That is exactly the precedence the popover needs, where a per-tool
 *  toggle must beat the group toggle above it.
 *
 *  Keys are sorted so the request body is stable: an unstable order would make
 *  every render look like a changed request. */
export function toolPolicyFromPreferences(
  prefs: Record<string, ToolPolicy> | undefined,
): PermissionPolicy {
  const keys = Object.keys(prefs ?? {})
    .filter((key) => key.trim() !== "")
    .sort();
  if (keys.length === 0) return [];
  const policies = new Map<string, ToolPolicy>();
  for (const key of keys) {
    const policy = normalizeToolPolicy(prefs?.[key]);
    if (policy) policies.set(key, policy);
  }
  const ordered = [...policies.keys()];
  return [
    ...ordered.map((key) => ({ group: key, policy: policies.get(key)! })),
    ...ordered.map((key) => ({ name: key, policy: policies.get(key)! })),
  ];
}

/** Appends `later` onto `earlier`, the later winning. Composition rather than
 *  mutation, so one caller's user rules cannot leak into another's. */
export function appendToolPolicy(
  earlier: PermissionPolicy | undefined,
  later: PermissionPolicy | undefined,
): PermissionPolicy {
  return [...(earlier ?? []), ...(later ?? [])];
}

/** Parses a rule list off the wire, dropping anything malformed rather than
 *  letting it silently become the last word on every tool: a rule with no facet
 *  matches everything, and being last-match-wins that is the one mistake with
 *  unbounded reach. */
export function normalizeToolPolicyRules(value: unknown): PermissionPolicy {
  if (!Array.isArray(value)) return [];
  const rules: PermissionPolicy = [];
  for (const raw of value) {
    if (!raw || typeof raw !== "object" || Array.isArray(raw)) continue;
    const item = raw as Record<string, unknown>;
    const policy = normalizeToolPolicy(item.policy);
    if (!policy) continue;
    const match: ToolMatch = {};
    for (const facet of MATCH_FACETS) {
      const patterns = normalizePatterns(item[facet] as MatchPatterns);
      if (patterns.length > 0) match[facet] = patterns;
    }
    for (const hint of ["readOnly", "destructive", "idempotent"] as const) {
      if (typeof item[hint] === "boolean") match[hint] = item[hint] as boolean;
    }
    if (Object.keys(match).length === 0) continue;
    rules.push({ ...match, policy });
  }
  return rules;
}
