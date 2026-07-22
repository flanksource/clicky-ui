// Widgets surface — Inventory group. Showcases a link-command name cell (detail
// nav), colored status text, tag chips, and a timestamp column, with search +
// enum filters and limit/offset pagination.
//
// The row set is generated rather than hand-listed so the fake backend has
// enough rows to page through; every value is derived from the row index, so
// the fixture renders identically on every run.

import {
  badge,
  detailDoc,
  detailLink,
  fixtureTimestamp,
  pick,
  status,
  tags,
  text,
  type SurfaceFixture,
} from "./surface-fixture";
import type { ClickyRow } from "../../data/Clicky";

const paths: SurfaceFixture["paths"] = {
  "/api/v1/widgets": {
    get: {
      operationId: "widget_list",
      summary: "List widgets",
      tags: ["widget"],
      parameters: [
        { name: "q", in: "query", schema: { type: "string" }, description: "Search query", placeholder: "Search widgets…", "x-clicky": { role: "search" } },
        { name: "kind", in: "query", schema: { type: "string", enum: ["big", "small"] }, description: "Widget kind", "x-clicky": { role: "filter" } },
        { name: "limit", in: "query", schema: { type: "integer", default: 25 }, description: "Page size", "x-clicky": { role: "limit" } },
        // Both a limit AND an offset role are required before
        // parametersToFormConfig builds a pagination config at all.
        { name: "offset", in: "query", schema: { type: "integer", default: 0 }, description: "Row offset", "x-clicky": { role: "offset" } },
      ],
      responses: { "200": { description: "OK" } },
      "x-clicky": { surface: "widgets", verb: "list", scope: "collection" },
    },
    post: {
      operationId: "widget_create",
      summary: "Create widget",
      tags: ["widget"],
      parameters: [{ name: "name", in: "query", required: true, schema: { type: "string" }, description: "Widget name" }],
      responses: { "201": { description: "Created" } },
      "x-clicky": { surface: "widgets", verb: "create", scope: "collection" },
    },
  },
  "/api/v1/widgets/{id}": {
    get: {
      operationId: "widget_get",
      summary: "Get widget",
      tags: ["widget"],
      parameters: [{ name: "id", in: "path", required: true, schema: { type: "string" } }],
      responses: { "200": { description: "OK" } },
      "x-clicky": { surface: "widgets", verb: "get", scope: "entity", idParam: "id" },
    },
    delete: {
      operationId: "widget_delete",
      summary: "Delete widget",
      tags: ["widget"],
      parameters: [{ name: "id", in: "path", required: true, schema: { type: "string" } }],
      responses: { "204": { description: "Deleted" } },
      "x-clicky": { surface: "widgets", verb: "delete", scope: "entity", idParam: "id" },
    },
  },
};

const NAMES = [
  "Hex bolt",
  "Flange gasket",
  "Thrust washer",
  "Dowel pin",
  "Spring clip",
  "Cap screw",
  "Lock nut",
  "Shim plate",
  "Drive belt",
  "Idler pulley",
  "Seal ring",
  "Bushing",
];
const KINDS = ["small", "big"];
const STATES = ["active", "low", "archived"];
const MATERIALS = ["steel", "rubber", "brass", "nylon"];
const GRADES = ["8.8", "10.9", "12.9"];

const WIDGET_COUNT = 140;

type WidgetSeed = {
  id: string;
  name: string;
  kind: string;
  state: string;
  material: string;
  grade: string;
  stock: number;
  updated: string;
};

function widgetSeed(index: number): WidgetSeed {
  const n = index + 1;
  return {
    id: `wgt_${n}`,
    name: `${pick(NAMES, index)} ${String(n).padStart(3, "0")}`,
    kind: pick(KINDS, index),
    state: pick(STATES, index),
    material: pick(MATERIALS, index),
    grade: pick(GRADES, index),
    stock: ((n * 37) % 900) + 12,
    updated: fixtureTimestamp(index),
  };
}

const SEEDS: WidgetSeed[] = Array.from({ length: WIDGET_COUNT }, (_, index) => widgetSeed(index));

const listColumns = [
  { name: "name", label: "Name", sortable: true, grow: true },
  { name: "kind", label: "Kind", shrink: true },
  { name: "status", label: "Status", kind: "status" as const, sortable: true, shrink: true },
  { name: "labels", label: "Labels", kind: "tags" as const, filterable: true, grow: true },
  { name: "updated", label: "Updated", kind: "timestamp" as const, sortable: true, shrink: true },
];

const listRows: ClickyRow[] = SEEDS.map((seed) => ({
  cells: {
    name: detailLink(seed.name, "widget_get", seed.id),
    kind: text(seed.kind),
    status: status(seed.state),
    labels: tags({ material: seed.material, grade: seed.grade }),
    updated: text(seed.updated),
  },
}));

// Detail documents are derived from the same seeds so a row and its detail page
// can never disagree.
const detailById: Record<string, ReturnType<typeof detailDoc>> = Object.fromEntries(
  SEEDS.map((seed) => [
    seed.id,
    detailDoc([
      { name: "id", value: text(seed.id) },
      { name: "name", value: text(seed.name) },
      { name: "kind", value: text(seed.kind) },
      { name: "status", value: status(seed.state) },
      { name: "material", value: badge("material", seed.material, "#475569") },
      { name: "stock", value: text(String(seed.stock)) },
      { name: "updated", value: text(seed.updated) },
    ]),
  ]),
);

export const WIDGETS_FIXTURE: SurfaceFixture = {
  surface: {
    key: "widgets",
    entity: "widget",
    title: "Widgets",
    parent: "inventory",
    description: "Demo widget surface.",
  },
  paths,
  listColumns,
  listRows,
  detailById,
};
