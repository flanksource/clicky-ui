import { useCallback } from "react";
import type {
  ClickyNode,
  ClickyRow,
  ClickyTableRowClick,
  ClickyTableRowHref,
  ClickyTableRowPredicate,
} from "../data/Clicky";
import { getOperationClickyMeta } from "./clickyMetadata";
import { pathParamNames } from "./command-form-utils";
import { useRouter } from "./router";
import type { ResolvedOperation } from "./types";

// clickyNodeText flattens a clicky node to its plain text — used to read an id
// out of a table row cell.
export function clickyNodeText(node: ClickyNode | undefined): string {
  if (!node) return "";
  if (node.plain) return node.plain;
  if (node.text) return node.text;
  if (node.source) return node.source;
  if (node.children) return node.children.map(clickyNodeText).join("");
  if (node.items) return node.items.map(clickyNodeText).join(" ");
  if (node.fields)
    return node.fields.map((field) => clickyNodeText(field.value)).join(" ");
  return "";
}

// getClickyRowId reads a row's identifier from the conventional id columns,
// preferring the synthetic `_id` a clicky surface emits over a displayed `id`.
export function getClickyRowId(row: ClickyRow): string | undefined {
  const candidates = ["_id", "id", "ID", "guid", "GUID"];
  for (const key of candidates) {
    const value = clickyNodeText(row.cells[key]);
    if (value) return value;
  }
  return undefined;
}

// apiPathToRoutePath strips the /api/v1 prefix and turns `{param}` segments into
// `:param`, mapping an OpenAPI path to the explorer's client-side route.
export function apiPathToRoutePath(path: string): string {
  const cliPath = path
    .trim()
    .replace(/^\/api\/v1\/?/, "")
    .replace(/^\/+/, "")
    .replace(/\/+$/, "");
  if (!cliPath) return "/";
  return `/${cliPath.replace(/\{([^}]+)\}/g, ":$1")}`;
}

// hrefForOperation builds the client-side route for an operation, filling path
// params from `flags`/`args` and trailing query params from leftover flags.
// Returns undefined when a required path param is unfilled.
export function hrefForOperation(
  operation: ResolvedOperation,
  args: string[] = [],
  flags: Record<string, string> = {},
): string | undefined {
  let route = apiPathToRoutePath(operation.path);
  const consumedFlags = new Set<string>();

  pathParamNames(operation.path).forEach((name, index) => {
    const value = flags[name] ?? args[index];
    if (!value) return;
    consumedFlags.add(name);
    route = route.replace(`:${name}`, encodeURIComponent(value));
  });

  if (route.includes(":")) return undefined;

  const search = new URLSearchParams();
  for (const [key, value] of Object.entries(flags)) {
    if (value && !consumedFlags.has(key)) search.set(key, value);
  }
  const query = search.toString();
  return query ? `${route}?${query}` : route;
}

// hrefForDetail builds the entity detail route for a row. It prefers the
// surface key the backend tags on the get operation (x-clicky.surface), since
// that is the route key the sidebar and EntityExplorerApp's route resolver use
// (/<surface>/<id>). The surface key is often the singular/plural sibling of the
// API path segment (e.g. surface "connections" vs path /connection/{id}), so
// deriving the route from the path alone yields an unknown-surface route. Falls
// back to the path-derived route when the operation carries no surface meta.
export function hrefForDetail(detailOperation: ResolvedOperation, id: string): string | undefined {
  const surface = getOperationClickyMeta(detailOperation)?.surface;
  if (surface) {
    return `/${encodeURIComponent(surface)}/${encodeURIComponent(id)}`;
  }
  return hrefForOperation(detailOperation, [], { id });
}

export type RowDetailNavigation = {
  getRowHref: ClickyTableRowHref;
  onRowClick: ClickyTableRowClick;
  isRowClickable: ClickyTableRowPredicate;
};

// useRowDetailNavigation wires a clicky table's rows to the entity detail page:
// each row resolves to /<surface>/<id> via the detail operation, navigates on
// click, and is clickable only when a detail href can be built. Shared by the
// list catalog and the operation runner so row navigation behaves identically.
export function useRowDetailNavigation(
  detailOperation: ResolvedOperation | undefined,
): RowDetailNavigation {
  const { navigate } = useRouter();

  const getRowHref = useCallback<ClickyTableRowHref>(
    (row) => {
      if (!detailOperation) return undefined;
      const id = getClickyRowId(row);
      if (!id) return undefined;
      return hrefForDetail(detailOperation, id);
    },
    [detailOperation],
  );

  const onRowClick = useCallback<ClickyTableRowClick>(
    (row) => {
      const href = getRowHref(row);
      if (href) navigate(href);
    },
    [getRowHref, navigate],
  );

  const isRowClickable = useCallback<ClickyTableRowPredicate>(
    (row) => Boolean(getRowHref(row)),
    [getRowHref],
  );

  return { getRowHref, onRowClick, isRowClickable };
}
