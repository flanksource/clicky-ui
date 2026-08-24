/**
 * The data layer behind every query browser: the descriptor and inspection
 * shapes the server serves, and the hook that turns a selection (database,
 * index) into the catalog and completion a browser renders. All three hosts —
 * the connection browser, the profile wizard and the profile builder — drive
 * the same plumbing from here so the surfaces cannot drift apart.
 */

import type { ComboboxOption } from "../../components/Combobox";
import type { WorkloadKind } from "../../components/workload-picker-utils";
import type { JsonSchemaObject } from "../../components/json-schema-form-types";
import { normalizeErrorDiagnostics } from "../../data/diagnostics/error-diagnostics";
import type { QueryBrowserCompletion } from "../../data/query-browser/QueryBrowser.completion";
import type { QueryBrowserDiagnostics } from "../../data/query-browser/QueryBrowser.types";
import { profileApiPath } from "../profileApi";
import { QueryBrowserExecutionError } from "../../data/query-browser/QueryBrowser.types";
import type { ReactNode } from "react";

export type BrowserDescriptor = {
  kind: "query" | "cache";
  provider?: string;
  language?: "sql" | "json" | "text";
  queryLabel?: string;
  defaultQuery?: string;
  resultView?: "table" | "logs" | "timeseries";
  optionsSchema?: JsonSchemaObject;
  initialOptions?: Record<string, unknown>;
  catalog?: boolean;
  /** Allows providers whose request is entirely structural to run without editor text. */
  allowEmptyQuery?: boolean;
  /** The typed resource a query runs against instead of a catalog tree. */
  target?: BrowserTarget;
  /**
   * The row caps that apply when a profile declares none of its own: the page a
   * caller gets by default, the largest page it may ask for, and where an
   * all-row export stops. The query's own `limit` option is none of them.
   */
  rowLimits?: BrowserRowLimits;
  /**
   * The order the provider already returned these rows in.
   *
   * A browser query is a bounded top-N rather than a whole result, so the cut
   * and the order are the same decision: re-sorting the rows the server chose
   * shows them as though the cut had been made the other way round. Kubernetes
   * is the case that proves it — its API only resumes forward, so a limit
   * returns the oldest lines, and newest-first would read as "the latest logs".
   */
  resultSort?: BrowserResultSort;
};

/** A column a result is already ordered by, and which way. */
export type BrowserResultSort = { key: string; dir: "asc" | "desc" };

export type BrowserTarget =
  | { kind: "index"; label: string; option: string }
  | {
      kind: "kubernetes-workload";
      label: string;
      kinds: WorkloadKind[];
    };

/** The defaults the server serves, shown as what an unset cap inherits. */
export type BrowserRowLimits = {
  pageSize: number;
  maxPageSize: number;
  maxExportRows: number;
};

/** The caps a profile sets for itself; each unset one takes its default. */
export type ProfileRowLimits = {
  pageSize?: number;
  maxPageSize?: number;
  maxExportRows?: number;
};

export type TargetKind =
  | "group"
  | "index"
  | "alias"
  | "data_stream"
  | "pattern";

export type InspectionTarget = {
  name: string;
  kind: TargetKind;
  /** The rotation wildcard this concrete index rolls up into. */
  pattern?: string;
  /** How many rotations a `pattern` target covers. */
  count?: number;
  members?: string[];
};

export type InspectionCache = {
  policy: string;
  state: "fresh" | "stale";
  cached: boolean;
  refreshing?: boolean;
  loadedAt: string;
  freshUntil: string;
  lastChangedAt: string;
  lastRefreshAttempt?: string;
  lastRefreshError?: string;
  ageMs: number;
  retryAfterMs?: number;
  unchangedRefreshes?: number;
};

export type CatalogNode = {
  id: string;
  label: string;
  kind: string;
  query?: string;
  options?: Record<string, unknown>;
  children?: CatalogNode[];
};

export type InspectionField = {
  name: string;
  dataType?: string;
  types?: string[];
  searchable?: boolean;
  aggregatable?: boolean;
  conflicting?: boolean;
};

export type BrowserInspection = {
  kind: "sql" | "opensearch";
  dialect?: "postgresql" | "mysql" | "mssql" | "standard";
  database?: string;
  databases?: string[];
  defaultSchema?: string;
  schemas?: {
    name: string;
    relations: {
      name: string;
      type?: "table" | "view";
      columns: InspectionField[];
    }[];
  }[];
  targets?: InspectionTarget[];
  nodes?: CatalogNode[];
  selected?: {
    target: InspectionTarget;
    fields: InspectionField[];
  };
  truncated?: boolean;
  truncateReason?: string;
  cache?: InspectionCache;
};

export type ConnectionProfileActionRenderer = (context: {
  connectionName: string;
  providerType: string;
  providerOptions?: Record<string, unknown>;
  profileQuery?: string;
}) => ReactNode;

/**
 * savedConnectionID reads the id out of a `connection://<id>` reference. An
 * inline URL has no id, and so no catalog to browse — hence null rather than a
 * guess.
 */
export function savedConnectionID(value: string | undefined): string | null {
  const prefix = "connection://";
  if (!value?.startsWith(prefix)) return null;
  return value.slice(prefix.length).trim() || null;
}

export function browserBaseUrl(connectionID: string): string {
  return profileApiPath(
    `connection/${encodeURIComponent(connectionID)}/browser`,
  );
}

export async function fetchJSON<T>(
  url: string,
  init?: RequestInit,
): Promise<T> {
  const response = await fetch(url, init);
  if (!response.ok) {
    const body = await response.text();
    const fallback = body.trim() || `request failed: ${response.status}`;
    try {
      const parsed = JSON.parse(body) as {
        error?: unknown;
        diagnostics?: QueryBrowserDiagnostics;
      };
      if (typeof parsed.error === "string") {
        const errorDetails = normalizeErrorDiagnostics(parsed, parsed.error);
        throw new QueryBrowserExecutionError(
          errorDetails?.message ?? parsed.error,
          parsed.diagnostics,
          errorDetails ?? undefined,
        );
      }
    } catch (error) {
      if (error instanceof QueryBrowserExecutionError) throw error;
    }
    throw new Error(fallback);
  }
  return response.json() as Promise<T>;
}

/**
 * Rotations lead: a cluster with fifty-three daily jaeger indexes has one
 * target an author actually means, and it is `jaeger-span-*`. The concrete
 * indexes stay listed last so a single day is still reachable.
 */
const targetGroups: { kind: TargetKind; label: string }[] = [
  { kind: "group", label: "Index groups" },
  { kind: "pattern", label: "Index patterns" },
  { kind: "alias", label: "Aliases" },
  { kind: "data_stream", label: "Data streams" },
  { kind: "index", label: "Indexes" },
];

export function openSearchIndexOptions(
  inspection?: BrowserInspection,
): ComboboxOption[] {
  if (inspection?.kind !== "opensearch") return [];
  const targets = inspection.targets ?? [];
  return targetGroups.flatMap(({ kind, label }) =>
    targets
      .filter((target) => target.kind === kind)
      .map((target) => ({
        value: target.name,
        label: target.count
          ? `${target.pattern ?? target.name} · ${target.count} indexes`
          : target.name,
        selectedLabel: target.pattern ?? target.name,
        group: label,
        title: target.count
          ? `${target.name} · ${target.count} rotated indexes`
          : `${target.name} · ${target.kind.replace("_", " ")}`,
      })),
  );
}

/**
 * openSearchTargetKind resolves how to inspect a picked target. An undiscovered
 * name containing a wildcard is a pattern by construction — the server inspects
 * it without requiring it to have been enumerated.
 */
export function openSearchTargetKind(
  inspection: BrowserInspection | undefined,
  name: string,
): string {
  const discovered = (inspection?.targets ?? []).find(
    (target) => target.name === name,
  );
  if (discovered) return discovered.kind;
  return name.includes("*") ? "pattern" : "";
}

/**
 * withTarget applies a picked target over a host's options, clearing both keys
 * when the picker is emptied so a stale index cannot survive the selection.
 */
export function withTarget(
  options: Record<string, unknown>,
  target: { option: string; value: string; targetKind: string } | undefined,
): Record<string, unknown> {
  if (!target) return options;
  const next = { ...options };
  if (target.value) {
    next[target.option] = target.value;
    if (target.targetKind) next.targetKind = target.targetKind;
    else delete next.targetKind;
  } else {
    delete next[target.option];
    delete next.targetKind;
  }
  return next;
}

/**
 * queryBrowserOptionsSchema is what the inline options form edits — the leftover
 * options, once the navigator has claimed the ones that belong with the query.
 * The target has its own combobox, and where the source has a structured search
 * the builder owns both the search and the limit it returns, so none of the
 * three is rendered a second time as a generic field.
 */
export function queryBrowserOptionsSchema(
  descriptor: BrowserDescriptor,
): JsonSchemaObject | undefined {
  if (!descriptor.optionsSchema) return undefined;
  const properties = { ...descriptor.optionsSchema.properties };
  if (properties.search) {
    delete properties.search;
    delete properties.limit;
  }
  if (descriptor.target?.kind === "index") {
    delete properties[descriptor.target.option];
  }
  if (descriptor.target?.kind === "kubernetes-workload") {
    delete properties.kind;
    delete properties.namespace;
    delete properties.name;
  }
  return { ...descriptor.optionsSchema, properties };
}

export function completionForInspection(
  inspection?: BrowserInspection,
  selectedInspection?: BrowserInspection,
): QueryBrowserCompletion | undefined {
  if (inspection?.kind === "sql" && inspection.dialect) {
    return {
      kind: "sql",
      dialect: inspection.dialect,
      ...(inspection.defaultSchema
        ? { defaultSchema: inspection.defaultSchema }
        : {}),
      schemas: (inspection.schemas ?? []).map((schema) => ({
        name: schema.name,
        relations: schema.relations.map((relation) => ({
          name: relation.name,
          ...(relation.type ? { type: relation.type } : {}),
          columns: relation.columns.map((column) => ({
            name: column.name,
            types: column.dataType ? [column.dataType] : [],
          })),
        })),
      })),
    };
  }
  if (
    selectedInspection?.kind === "opensearch" &&
    selectedInspection.selected
  ) {
    return {
      kind: "json-fields",
      vocabulary: "opensearch",
      fields: selectedInspection.selected.fields,
    };
  }
  return undefined;
}

/**
 * mergeProviderOptions layers the option sources a browser draws on, in
 * increasing precedence, and pins the active database when there is one.
 * `targetKind` only tells the inspection endpoint which field mappings to
 * fetch, so it is dropped unless the caller is feeding the browser itself.
 */
export function mergeProviderOptions(input: {
  layers: Array<Record<string, unknown> | undefined>;
  database?: string;
  keepTargetKind?: boolean;
}): Record<string, unknown> {
  const merged: Record<string, unknown> = {};
  for (const layer of input.layers) Object.assign(merged, layer ?? {});
  if (input.database) merged.database = input.database;
  if (!input.keepTargetKind) delete merged.targetKind;
  return merged;
}
