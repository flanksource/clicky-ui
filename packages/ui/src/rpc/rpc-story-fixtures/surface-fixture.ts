// Shared types and tiny node builders for the per-surface story fixtures.
// Each surface fixture contributes its spec paths, a Clicky table list response,
// and per-id detail documents. The builders keep the response literals terse and
// are reused across every surface fixture (widgets / orders / services).

import type { ClickyColumn, ClickyField, ClickyNode, ClickyRow, ClickyStyle } from "../../data/Clicky";
import type { ClickySurface, ExecutionResponse, OpenAPIOperation } from "../types";

/** Page size used when an operation declares no `limit` value. Mirrors the
 *  `dataTablePaginationFromForm` fallback so the footer and the fake backend
 *  agree on the first page. */
export const DEFAULT_PAGE_LIMIT = 25;

export type SurfaceFixture = {
  surface: ClickySurface;
  /** Spec paths contributed by this surface; merged into SAMPLE_SPEC.paths. */
  paths: Record<string, Record<string, OpenAPIOperation>>;
  /** Columns of the collection list table. */
  listColumns: ClickyColumn[];
  /**
   * The full server-side row set. The fake client slices this per the request's
   * `limit`/`offset` rather than returning it whole, so stories exercise the
   * same remote-pagination path as a real clicky-rpc backend.
   */
  listRows: ClickyRow[];
  /** Per-entity-id detail responses (Clicky `map` documents). */
  detailById: Record<string, ExecutionResponse>;
};

/**
 * Builds the Clicky list document for a single page plus the pagination
 * envelope. A real backend reports these as `X-Total-Count` / `X-Page-Limit` /
 * `X-Page-Offset` headers, which `createOperationsApiClient` parses into
 * `ExecutionResponse.pagination`; the fake client sets the field directly.
 */
export function listPage(
  fixture: Pick<SurfaceFixture, "listColumns" | "listRows">,
  limit: number,
  offset: number,
): ExecutionResponse {
  const total = fixture.listRows.length;
  const safeLimit = limit > 0 ? limit : DEFAULT_PAGE_LIMIT;
  const safeOffset = Math.min(Math.max(offset, 0), Math.max(total - 1, 0));
  return {
    ...clickyDoc(table(fixture.listColumns, fixture.listRows.slice(safeOffset, safeOffset + safeLimit))),
    pagination: { total, limit: safeLimit, offset: safeOffset },
  };
}

/** Cyclic pick that satisfies `noUncheckedIndexedAccess`; throws on an empty list
 *  rather than returning a silent placeholder. */
export function pick<T>(values: readonly T[], index: number): T {
  const value = values[index % values.length];
  if (value === undefined) throw new Error("pick() called on an empty list");
  return value;
}

/** Deterministic ISO timestamp `steps` slots after a fixed base — fixtures must
 *  never depend on the wall clock or a story would re-render differently. */
export function fixtureTimestamp(steps: number): string {
  const base = Date.parse("2026-06-01T09:30:00Z");
  return new Date(base + steps * 7 * 3_600_000).toISOString();
}

export function text(value: string, style?: ClickyStyle): ClickyNode {
  return { kind: "text", text: value, plain: value, ...(style ? { style } : {}) };
}

/** Monospace text — for ids, amounts, versions. */
export function mono(value: string): ClickyNode {
  return { kind: "text", text: value, plain: value, style: { monospace: true } };
}

const STATUS_COLOR: Record<string, string> = {
  healthy: "#166534",
  active: "#166534",
  delivered: "#166534",
  shipped: "#1d4ed8",
  pending: "#b45309",
  degraded: "#b45309",
  low: "#b45309",
  down: "#b91c1c",
  cancelled: "#b91c1c",
  archived: "#6b7280",
};

/** Status as colored bold text — the Clicky table convention (see Clicky.fixtures.ts). */
export function status(label: string): ClickyNode {
  const color = STATUS_COLOR[label.toLowerCase()] ?? "#166534";
  return { kind: "text", text: label, plain: label, style: { color, bold: true } };
}

export function badge(label: string, value: string, color: string): ClickyNode {
  return { kind: "badge", badgeLabel: label, badgeValue: value, badgeColor: color };
}

/** Key/value tag chips, rendered by a `kind: "tags"` column. */
export function tags(pairs: Record<string, string>): ClickyNode {
  return {
    kind: "map",
    fields: Object.entries(pairs).map(([name, value]) => ({ name, value: text(value) })),
  };
}

// A clickable cell that navigates to the surface detail page. The command
// resolves to the surface's `get` operation; buildCommandHref turns it into
// `/<surface>/<id>` and the `_clicky` target routes via the app's navigate().
export function detailLink(label: string, operationId: string, id: string): ClickyNode {
  return {
    kind: "link-command",
    text: label,
    plain: label,
    command: operationId.replaceAll("_", "/"),
    args: [id],
    target: "_clicky",
  };
}

export function table(columns: ClickyColumn[], rows: ClickyRow[]): ClickyNode {
  return { kind: "table", autoFilter: true, columns, rows };
}

export function clickyDoc(node: ClickyNode): ExecutionResponse {
  return {
    success: true,
    exit_code: 0,
    contentType: "application/json",
    stdout: JSON.stringify({ version: 1, node }),
  };
}

export function detailDoc(fields: ClickyField[]): ExecutionResponse {
  return clickyDoc({ kind: "map", fields });
}
