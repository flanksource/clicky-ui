// Shared types and tiny node builders for the per-surface story fixtures.
// Each surface fixture contributes its spec paths, a Clicky table list response,
// and per-id detail documents. The builders keep the response literals terse and
// are reused across every surface fixture (widgets / orders / services).

import type { ClickyColumn, ClickyField, ClickyNode, ClickyRow, ClickyStyle } from "../../data/Clicky";
import type { ClickySurface, ExecutionResponse, OpenAPIOperation } from "../types";

export type SurfaceFixture = {
  surface: ClickySurface;
  /** Spec paths contributed by this surface; merged into SAMPLE_SPEC.paths. */
  paths: Record<string, Record<string, OpenAPIOperation>>;
  /** The collection list response (a Clicky `table` document). */
  listResponse: ExecutionResponse;
  /** Per-entity-id detail responses (Clicky `map` documents). */
  detailById: Record<string, ExecutionResponse>;
};

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
