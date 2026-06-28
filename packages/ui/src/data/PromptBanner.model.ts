import type { JsonSchemaObject, JsonSchemaProperty } from "../components/json-schema-form-types";
import type { PromptSnapshot } from "../hooks/use-prompts";

export type PromptInlineDecision = "approve" | "reject";

export interface PromptInlineActionSpec {
  field: string;
  approveValue: unknown;
  rejectValue: unknown;
  commentField?: string;
  commentRequired: boolean;
  commentLabel?: string;
}

export interface PromptSummary {
  total: number;
  pending: number;
  answered: number;
  cancelled: number;
  expired: number;
}

const ACTION_FIELD_PRIORITY = ["decision", "choice", "action", "value", "approve", "approved"];
const COMMENT_FIELD_PRIORITY = ["comment", "reason", "message", "note"];

const APPROVE_RE = /\b(approve|approved|allow|allowed|continue|yes|accept|accepted|proceed|run)\b/i;
const REJECT_RE = /\b(reject|rejected|deny|denied|cancel|cancelled|canceled|no|block|stop|decline|declined)\b/i;

function hasType(schema: JsonSchemaProperty | undefined, type: string): boolean {
  if (!schema?.type) return false;
  return Array.isArray(schema.type) ? schema.type.includes(type as never) : schema.type === type;
}

function sortedPropertyEntries(schema: JsonSchemaObject): [string, JsonSchemaProperty][] {
  const entries = Object.entries(schema.properties ?? {});
  return entries.sort(([a], [b]) => {
    const ia = ACTION_FIELD_PRIORITY.indexOf(a);
    const ib = ACTION_FIELD_PRIORITY.indexOf(b);
    if (ia === -1 && ib === -1) return 0;
    if (ia === -1) return 1;
    if (ib === -1) return -1;
    return ia - ib;
  });
}

function optionText(schema: JsonSchemaProperty, value: unknown): string {
  const key = String(value);
  const label = schema["x-enum-labels"]?.[key];
  return [key, label].filter(Boolean).join(" ");
}

function findCommentField(schema: JsonSchemaObject): Pick<
  PromptInlineActionSpec,
  "commentField" | "commentRequired" | "commentLabel"
> {
  const properties = schema.properties ?? {};
  const required = new Set(schema.required ?? []);
  for (const key of COMMENT_FIELD_PRIORITY) {
    const property = properties[key];
    if (!property || !hasType(property, "string") || property.enum) continue;
    return {
      commentField: key,
      commentRequired: required.has(key),
      commentLabel: property.title ?? "Comment",
    };
  }
  return { commentRequired: false };
}

function findEnumAction(schema: JsonSchemaObject): PromptInlineActionSpec | null {
  for (const [field, property] of sortedPropertyEntries(schema)) {
    const values = property.enum ?? [];
    if (values.length === 0) continue;

    const approve = values.find((value) => APPROVE_RE.test(optionText(property, value)));
    const reject = values.find((value) => REJECT_RE.test(optionText(property, value)));
    if (approve === undefined || reject === undefined) continue;

    return {
      field,
      approveValue: approve,
      rejectValue: reject,
      ...findCommentField(schema),
    };
  }
  return null;
}

function findBooleanAction(schema: JsonSchemaObject): PromptInlineActionSpec | null {
  const properties = schema.properties ?? {};
  const preferred = ["value", "approve", "approved", "confirm", "confirmed", "allowed"];
  const field =
    preferred.find((key) => hasType(properties[key], "boolean")) ??
    Object.entries(properties).find(([, property]) => hasType(property, "boolean"))?.[0];

  if (!field) return null;
  return {
    field,
    approveValue: true,
    rejectValue: false,
    ...findCommentField(schema),
  };
}

export function analyzePromptInlineActions(prompt: PromptSnapshot): PromptInlineActionSpec | null {
  const schema = prompt.schema;
  if (!schema?.properties) return null;
  return findEnumAction(schema) ?? findBooleanAction(schema);
}

export function initialPromptComment(prompt: PromptSnapshot, spec: PromptInlineActionSpec | null): string {
  if (!spec?.commentField) return "";
  const value = prompt.value?.[spec.commentField];
  return typeof value === "string" ? value : "";
}

export function buildPromptInlineValues(
  prompt: PromptSnapshot,
  spec: PromptInlineActionSpec,
  decision: PromptInlineDecision,
  comment: string,
): Record<string, unknown> {
  const values: Record<string, unknown> = { ...prompt.value };
  values[spec.field] = decision === "approve" ? spec.approveValue : spec.rejectValue;

  if (spec.commentField) {
    const trimmed = comment.trim();
    if (trimmed || spec.commentRequired) {
      values[spec.commentField] = trimmed;
    } else {
      delete values[spec.commentField];
    }
  }

  return values;
}

export function summarizePrompts(prompts: PromptSnapshot[]): PromptSummary {
  return prompts.reduce<PromptSummary>(
    (acc, prompt) => {
      acc.total += 1;
      if (prompt.state === "pending") acc.pending += 1;
      else if (prompt.state === "answered") acc.answered += 1;
      else if (prompt.state === "cancelled") acc.cancelled += 1;
      else if (prompt.state === "expired") acc.expired += 1;
      return acc;
    },
    { total: 0, pending: 0, answered: 0, cancelled: 0, expired: 0 },
  );
}

export function summarizePromptAnswer(prompt: PromptSnapshot): string {
  if (prompt.cancelled || prompt.state === "cancelled") return "Cancelled";
  if (prompt.state === "expired") return "Expired";
  if (prompt.state === "pending") return prompt.kind ? `Pending ${prompt.kind}` : "Pending";

  const values = prompt.value ?? {};
  const spec = analyzePromptInlineActions(prompt);
  const parts: string[] = [];
  if (spec && spec.field in values) {
    if (Object.is(values[spec.field], spec.approveValue)) parts.push("Approved");
    else if (Object.is(values[spec.field], spec.rejectValue)) parts.push("Rejected");
  }
  if (spec?.commentField) {
    const comment = values[spec.commentField];
    if (typeof comment === "string" && comment) parts.push(comment);
  }
  if (parts.length > 0) return parts.join(" - ");

  const primitive = Object.entries(values)
    .filter(([, value]) => ["string", "number", "boolean"].includes(typeof value))
    .slice(0, 2)
    .map(([key, value]) => `${key}: ${String(value)}`);
  return primitive.join(" - ") || prompt.state;
}
