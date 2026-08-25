import {
  matchesTool,
  type MatchPatterns,
  type PermissionRule,
  type ToolMeta,
} from "@flanksource/clicky-ui/ai";

export const PATTERN_FIELDS = [
  "name",
  "group",
  "parent",
  "entity",
  "action",
  "verb",
  "method",
  "scope",
] as const;
export const HINT_FIELDS = ["readOnly", "destructive", "idempotent"] as const;
export const MATCH_FIELDS = [...PATTERN_FIELDS, ...HINT_FIELDS] as const;

export type MatchField = (typeof MATCH_FIELDS)[number];
export type StrategyPreset =
  | "all"
  | "read-only"
  | "destructive"
  | "idempotent"
  | "custom";

export const STRATEGY_PRESETS: Array<{
  value: StrategyPreset;
  label: string;
  description: string;
}> = [
  {
    value: "all",
    label: "All tools",
    description: "Match every tool in the catalog.",
  },
  {
    value: "read-only",
    label: "Read-only tools",
    description: "Match tools explicitly marked read-only.",
  },
  {
    value: "destructive",
    label: "Destructive tools",
    description: "Match tools explicitly marked destructive.",
  },
  {
    value: "idempotent",
    label: "Idempotent tools",
    description: "Match tools safe to repeat.",
  },
  {
    value: "custom",
    label: "Custom conditions",
    description: "Combine tool metadata and safety annotations.",
  },
];

export const MATCH_FIELD_OPTIONS: Array<{ value: MatchField; label: string }> =
  [
    { value: "name", label: "Tool name" },
    { value: "group", label: "Group" },
    { value: "parent", label: "Parent" },
    { value: "entity", label: "Entity" },
    { value: "action", label: "Action" },
    { value: "verb", label: "Verb" },
    { value: "method", label: "HTTP method" },
    { value: "scope", label: "Scope" },
    { value: "readOnly", label: "Read only" },
    { value: "destructive", label: "Destructive" },
    { value: "idempotent", label: "Idempotent" },
  ];

export function strategyPreset(rule: PermissionRule): StrategyPreset {
  const fields = activeMatchFields(rule);
  if (fields.length !== 1) return "custom";
  if (fields[0] === "name" && patternsText(rule.name) === "*") return "all";
  if (fields[0] === "readOnly" && rule.readOnly === true) return "read-only";
  if (fields[0] === "destructive" && rule.destructive === true) {
    return "destructive";
  }
  if (fields[0] === "idempotent" && rule.idempotent === true) {
    return "idempotent";
  }
  return "custom";
}

export function applyStrategyPreset(
  rule: PermissionRule,
  preset: Exclude<StrategyPreset, "custom">,
): PermissionRule {
  if (preset === "all") return { name: "*", policy: rule.policy };
  if (preset === "read-only") return { readOnly: true, policy: rule.policy };
  if (preset === "destructive")
    return { destructive: true, policy: rule.policy };
  return { idempotent: true, policy: rule.policy };
}

export function activeMatchFields(rule: PermissionRule): MatchField[] {
  return MATCH_FIELDS.filter((field) => rule[field] !== undefined);
}

export function patternsText(value: MatchPatterns | undefined): string {
  return typeof value === "string" ? value : (value ?? []).join(", ");
}

export function patternValues(value: MatchPatterns | undefined): string[] {
  return typeof value === "string" ? (value ? [value] : []) : (value ?? []);
}

export function updatePatternCondition({
  rule,
  field,
  value,
}: {
  rule: PermissionRule;
  field: (typeof PATTERN_FIELDS)[number];
  value: MatchPatterns;
}): PermissionRule {
  return { ...rule, [field]: value };
}

export function conditionText(rule: PermissionRule, field: MatchField): string {
  if (isHintField(field)) return String(rule[field]);
  return patternsText(rule[field]);
}

export function replaceMatchField(
  rule: PermissionRule,
  current: MatchField,
  next: MatchField,
): PermissionRule {
  if (current === next) return rule;
  const match = { ...rule } as Record<string, unknown>;
  const previous = match[current];
  delete match[current];
  match[next] = isHintField(next)
    ? typeof previous === "boolean"
      ? previous
      : true
    : typeof previous === "string" || Array.isArray(previous)
      ? previous
      : "*";
  return match as PermissionRule;
}

export function updateCondition(
  rule: PermissionRule,
  field: MatchField,
  value: string,
): PermissionRule {
  if (isHintField(field)) return { ...rule, [field]: value === "true" };
  const patterns = value
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
  return {
    ...rule,
    [field]: patterns.length <= 1 ? (patterns[0] ?? "") : patterns,
  };
}

export function removeCondition(
  rule: PermissionRule,
  field: MatchField,
): PermissionRule {
  const next = { ...rule } as Record<string, unknown>;
  delete next[field];
  if (activeMatchFields(next as PermissionRule).length === 0) next.name = "*";
  return next as PermissionRule;
}

export function addCondition(
  rule: PermissionRule,
  field: MatchField,
): PermissionRule {
  if (rule[field] !== undefined) return rule;
  return { ...rule, [field]: isHintField(field) ? true : "*" };
}

export function isHintField(
  field: MatchField,
): field is (typeof HINT_FIELDS)[number] {
  return (HINT_FIELDS as readonly MatchField[]).includes(field);
}

export function matchingTools(rule: PermissionRule, tools: ToolMeta[]) {
  return tools.filter((tool) => matchesTool(rule, tool));
}

export function toolFieldSuggestions(
  tools: ToolMeta[],
  field: Exclude<MatchField, (typeof HINT_FIELDS)[number]>,
) {
  const values = new Set<string>();
  for (const tool of tools) {
    const value = tool[field === "name" ? "name" : field];
    if (typeof value === "string" && value.trim()) values.add(value);
  }
  return Array.from(values).sort((left, right) => left.localeCompare(right));
}
