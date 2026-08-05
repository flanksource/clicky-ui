// Built-in renderer for a tool call's *output*. Dispatches on the value shape
// (paged / list / record / counts / scalar), so a tool with no published
// output schema still renders as a table, a record card or a sentence instead
// of a JSON blob.

import type { ReactNode } from "react";
import { cn } from "../../../lib/utils";
import { DataTable } from "../../DataTable";
import { JsonView } from "../../JsonView";
import { KeyValueList, type KeyValueListItem } from "../../KeyValueList";
import type { ChatToolInputSchema } from "../types";
import { ToolFieldValue } from "./ToolParams";
import { fieldMetaFromSchema, listItemsSchema, orderFieldKeys, type ToolFieldMeta } from "./schema";
import {
  classifyToolValue,
  deriveColumns,
  type ClassifiedToolValue,
  type ToolPageInfo,
} from "./shape";

export type ToolValueProps = {
  value: unknown;
  schema?: ChatToolInputSchema | undefined;
  isError?: boolean | undefined;
  /** Entity name for `resolveEntityHref`, from the tool's catalog entry. */
  entity?: string | undefined;
  maxRows?: number | undefined;
  resolveEntityHref?: ((entity: string, id: string) => string | undefined) | undefined;
  className?: string | undefined;
  emptyMessage?: string | undefined;
};

const DEFAULT_MAX_ROWS = 25;
const TITLE_KEYS = ["name", "title", "code", "reference"];
const ID_KEYS = ["id", "code", "key"];

function firstString(record: Record<string, unknown>, keys: string[]): { key: string; value: string } | null {
  for (const key of keys) {
    const value = record[key];
    if (typeof value === "string" && value.trim() !== "") return { key, value };
  }
  return null;
}

function RowsTable({
  rows,
  fields,
  maxRows,
  page,
}: {
  rows: Record<string, unknown>[];
  fields: Record<string, ToolFieldMeta>;
  maxRows: number;
  page?: ToolPageInfo | undefined;
}) {
  const visible = rows.slice(0, maxRows);
  const total = page?.total ?? rows.length;
  const capped = visible.length < rows.length || total > rows.length;
  return (
    <div className="space-y-1">
      <DataTable
        data={visible}
        columns={deriveColumns(rows, { fields })}
        showGlobalFilter={false}
        autoFilter={false}
        scrollContainerClassName="max-h-80"
        emptyMessage="No rows"
      />
      {capped && (
        <div className="text-[11px] text-muted-foreground">
          Showing {visible.length} of {total}
        </div>
      )}
    </div>
  );
}

function Counts({ record }: { record: Record<string, number> }) {
  return (
    <div className="grid grid-cols-2 gap-density-2 sm:grid-cols-3">
      {Object.entries(record).map(([key, count]) => (
        <div key={key} className="rounded-md border border-border bg-muted/40 p-density-2">
          <div className="text-sm font-medium tabular-nums text-foreground">{count}</div>
          <div className="font-mono text-[11px] text-muted-foreground">{key}</div>
        </div>
      ))}
    </div>
  );
}

function RecordCard({
  record,
  fields,
  entity,
  resolveEntityHref,
}: {
  record: Record<string, unknown>;
  fields: Record<string, ToolFieldMeta>;
  entity?: string | undefined;
  resolveEntityHref?: ((entity: string, id: string) => string | undefined) | undefined;
}) {
  const title = firstString(record, TITLE_KEYS);
  const id = firstString(record, ID_KEYS);
  const href = entity && id ? resolveEntityHref?.(entity, id.value) : undefined;

  const consumed = new Set([title?.key, id?.key].filter((key): key is string => !!key));
  const keys = Object.keys(record).filter((key) => {
    const value = record[key];
    return !consumed.has(key) && value !== undefined && value !== null && value !== "";
  });

  const items: KeyValueListItem[] = orderFieldKeys(keys, fields).map((key) => {
    const field = fields[key];
    return {
      key,
      label: <span className="font-mono text-[11px]">{field?.label ?? key}</span>,
      value: <ToolFieldValue fieldKey={key} value={record[key]} field={field} />,
    };
  });

  const heading = title?.value ?? id?.value;

  return (
    <div className="space-y-1">
      {heading && (
        <div className="flex flex-wrap items-baseline gap-2">
          {href ? (
            <a href={href} className="text-sm font-medium text-foreground underline underline-offset-2">
              {heading}
            </a>
          ) : (
            <span className="text-sm font-medium text-foreground">{heading}</span>
          )}
          {id && id.value !== heading && (
            <span className="rounded border border-border bg-muted/40 px-1.5 py-0.5 font-mono text-[11px] text-muted-foreground">
              {id.value}
            </span>
          )}
        </div>
      )}
      {items.length > 0 && (
        <KeyValueList
          items={items}
          className="text-xs"
          rowClassName="px-density-2 py-density-1"
          valueClassName="text-xs"
        />
      )}
    </div>
  );
}

function renderClassified(
  classified: ClassifiedToolValue,
  props: ToolValueProps,
  maxRows: number,
): ReactNode {
  const { schema, entity, resolveEntityHref, emptyMessage = "No result" } = props;

  switch (classified.shape) {
    case "empty":
      return <span className="text-muted-foreground">{emptyMessage}</span>;
    case "scalar":
      return <p className="whitespace-pre-wrap break-words text-sm text-foreground">{String(classified.value)}</p>;
    case "counts":
      return <Counts record={classified.record} />;
    case "record":
      return (
        <RecordCard
          record={classified.record}
          fields={fieldMetaFromSchema(schema)}
          {...(entity ? { entity } : {})}
          {...(resolveEntityHref ? { resolveEntityHref } : {})}
        />
      );
    case "list":
    case "paged": {
      if (!classified.rows) {
        return <ToolFieldValue fieldKey="result" value={classified.items} />;
      }
      return (
        <RowsTable
          rows={classified.rows}
          fields={fieldMetaFromSchema(listItemsSchema(schema))}
          maxRows={maxRows}
          {...(classified.shape === "paged" ? { page: classified.page } : {})}
        />
      );
    }
  }
}

/** Heuristic renderer for a normalized tool result. */
export function ToolValue(props: ToolValueProps): ReactNode {
  const { value, isError, className, maxRows = DEFAULT_MAX_ROWS } = props;
  const classified = classifyToolValue(value);

  // An error payload is usually a bare message or a small object; keep it
  // legible and unmistakably an error rather than shaping it into a table.
  if (isError && classified.shape !== "scalar" && classified.shape !== "record") {
    return (
      <div className={cn("text-destructive", className)}>
        <JsonView data={value} defaultOpenDepth={1} />
      </div>
    );
  }

  return (
    <div className={cn(isError ? "text-destructive" : undefined, className)}>
      {renderClassified(classified, props, maxRows)}
    </div>
  );
}
