// Widgets surface — Inventory group. Showcases a link-command name cell (detail
// nav), colored status text, tag chips, and a timestamp column, with search +
// enum + limit filters.

import {
  badge,
  clickyDoc,
  detailDoc,
  detailLink,
  status,
  table,
  tags,
  text,
  type SurfaceFixture,
} from "./surface-fixture";

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

const listResponse = clickyDoc(
  table(
    [
      { name: "name", label: "Name", sortable: true, grow: true },
      { name: "kind", label: "Kind", shrink: true },
      { name: "status", label: "Status", kind: "status", sortable: true, shrink: true },
      { name: "labels", label: "Labels", kind: "tags", filterable: true, grow: true },
      { name: "updated", label: "Updated", kind: "timestamp", sortable: true, shrink: true },
    ],
    [
      {
        cells: {
          name: detailLink("Hex bolt", "widget_get", "wgt_42"),
          kind: text("small"),
          status: status("active"),
          labels: tags({ material: "steel", grade: "8.8" }),
          updated: text("2026-06-02T09:30:00Z"),
        },
      },
      {
        cells: {
          name: detailLink("Flange gasket", "widget_get", "wgt_77"),
          kind: text("big"),
          status: status("low"),
          labels: tags({ material: "rubber", seal: "epdm" }),
          updated: text("2026-06-11T16:05:00Z"),
        },
      },
    ],
  ),
);

const detailById: Record<string, ReturnType<typeof detailDoc>> = {
  wgt_42: detailDoc([
    { name: "id", value: text("wgt_42") },
    { name: "name", value: text("Hex bolt") },
    { name: "kind", value: text("small") },
    { name: "status", value: status("active") },
    { name: "material", value: badge("material", "steel", "#475569") },
    { name: "stock", value: text("1240") },
    { name: "updated", value: text("2026-06-02T09:30:00Z") },
  ]),
  wgt_77: detailDoc([
    { name: "id", value: text("wgt_77") },
    { name: "name", value: text("Flange gasket") },
    { name: "kind", value: text("big") },
    { name: "status", value: status("low") },
    { name: "material", value: badge("material", "rubber", "#475569") },
    { name: "stock", value: text("38") },
    { name: "updated", value: text("2026-06-11T16:05:00Z") },
  ]),
};

export const WIDGETS_FIXTURE: SurfaceFixture = {
  surface: {
    key: "widgets",
    entity: "widget",
    title: "Widgets",
    parent: "inventory",
    description: "Demo widget surface.",
  },
  paths,
  listResponse,
  detailById,
};
