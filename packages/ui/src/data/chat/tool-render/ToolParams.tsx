// Built-in renderer for a tool call's *input*. Write tools are approval-gated,
// so this table is what a user reads before approving — it is the least
// readable surface in a chat and the main reason this registry exists.
//
// Field labels default to the raw key (mono, muted) rather than a humanised
// one: these are API field names, the exact spelling is what the approver
// needs, and ToolCall.test.tsx pins the raw keys in its text assertions.

import type { ReactNode } from "react";
import { cn } from "../../../lib/utils";
import { UiCheck, UiCircleX } from "../../../icons";
import { CodeBlock } from "../../CodeBlock";
import { Icon } from "../../Icon";
import { JsonView } from "../../JsonView";
import { KeyValueList, type KeyValueListItem } from "../../KeyValueList";
import type { ChatToolInputSchema } from "../types";
import { fieldMetaFromSchema, orderFieldKeys, type ToolFieldMeta } from "./schema";

export type ToolParamsProps = {
  input: unknown;
  schema?: ChatToolInputSchema | undefined;
  emptyMessage?: string;
  className?: string | undefined;
};

const INLINE_TEXT_LIMIT = 200;

// Keys whose values are source text, not a field value — rendered as code.
const CODE_KEYS = new Set([
  "markdown",
  "formula",
  "frontmatter",
  "patch",
  "diff",
  "draft",
  "expr",
  "expression",
  "file",
  "content",
  "body",
  "source",
  "sql",
  "query",
  "yaml",
  "json",
  "template",
  "script",
  "command",
]);

const CODE_LANGUAGES: Record<string, string> = {
  sql: "sql",
  query: "sql",
  yaml: "yaml",
  json: "json",
  markdown: "markdown",
  frontmatter: "yaml",
  patch: "diff",
  diff: "diff",
  script: "bash",
  command: "bash",
};

function codeLanguage(key: string): string {
  return CODE_LANGUAGES[key.toLowerCase()] ?? "text";
}

function isPlainObject(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function isScalar(value: unknown): value is string | number | boolean {
  return typeof value === "string" || typeof value === "number" || typeof value === "boolean";
}

function Chips({ items }: { items: unknown[] }) {
  return (
    <span className="flex flex-wrap gap-1">
      {items.map((item, index) => (
        <span
          key={`${String(item)}-${index}`}
          className="rounded border border-border bg-muted/40 px-1.5 py-0.5 text-[11px] text-foreground"
        >
          {String(item)}
        </span>
      ))}
    </span>
  );
}

/** Renders one field value: booleans as a glyph, source-ish strings as code,
 *  scalar arrays as chips, nested structures as a collapsed JSON tree. */
export function ToolFieldValue({
  fieldKey,
  value,
  field,
}: {
  fieldKey: string;
  value: unknown;
  field?: ToolFieldMeta | undefined;
}): ReactNode {
  if (typeof value === "boolean") {
    return (
      <Icon
        icon={value ? UiCheck : UiCircleX}
        title={String(value)}
        className={cn("size-3.5", value ? "text-emerald-600" : "text-muted-foreground")}
      />
    );
  }

  if (typeof value === "number") {
    return <span className="tabular-nums">{value}</span>;
  }

  if (typeof value === "string") {
    const label = field?.enumLabels?.[value];
    if (label) {
      return (
        <span>
          {label} <span className="text-muted-foreground">({value})</span>
        </span>
      );
    }
    const codeish =
      CODE_KEYS.has(fieldKey.toLowerCase()) ||
      value.length > INLINE_TEXT_LIMIT ||
      value.includes("\n");
    if (codeish) {
      return (
        <div className="overflow-x-auto">
          <CodeBlock bare language={codeLanguage(fieldKey)} source={value} />
        </div>
      );
    }
    return <span className="whitespace-pre-wrap break-words">{value}</span>;
  }

  if (Array.isArray(value)) {
    if (value.every(isScalar)) return <Chips items={value} />;
    return <JsonView data={value} defaultOpenDepth={0} />;
  }

  if (isPlainObject(value)) {
    return <JsonView data={value} defaultOpenDepth={0} />;
  }

  return <span className="text-muted-foreground">—</span>;
}

function paramItems(
  input: Record<string, unknown>,
  fields: Record<string, ToolFieldMeta>,
): KeyValueListItem[] {
  const keys = Object.keys(input).filter((key) => {
    const value = input[key];
    return value !== undefined && value !== null && value !== "";
  });
  return orderFieldKeys(keys, fields).map((key) => {
    const field = fields[key];
    return {
      key,
      label: (
        <span className="font-mono text-[11px]" title={field?.description ?? key}>
          {field?.label ?? key}
        </span>
      ),
      value: <ToolFieldValue fieldKey={key} value={input[key]} field={field} />,
    };
  });
}

/** Two-column parameter list for a tool call's input, schema-informed when the
 *  catalog published an `inputSchema` and key-driven otherwise. */
export function ToolParams({
  input,
  schema,
  emptyMessage = "No parameters",
  className,
}: ToolParamsProps): ReactNode {
  if (input === undefined || input === null) {
    return <div className={cn("text-xs text-muted-foreground", className)}>{emptyMessage}</div>;
  }

  if (!isPlainObject(input)) {
    return (
      <div className={cn("text-xs text-foreground", className)}>
        <ToolFieldValue fieldKey="input" value={input} />
      </div>
    );
  }

  const items = paramItems(input, fieldMetaFromSchema(schema));
  if (items.length === 0) {
    return <div className={cn("text-xs text-muted-foreground", className)}>{emptyMessage}</div>;
  }

  return (
    <KeyValueList
      items={items}
      className={cn("text-xs", className)}
      rowClassName="px-density-2 py-density-1"
      valueClassName="text-xs"
      emptyMessage={emptyMessage}
    />
  );
}
