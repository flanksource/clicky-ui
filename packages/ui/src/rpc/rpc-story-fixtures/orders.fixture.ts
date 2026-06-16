// Orders surface — Inventory group. Showcases a monospace order number that
// links to the detail page, status text, a priority badge, a monospace total,
// channel tag chips, and a placed-at timestamp, with search + status enum +
// channel filter + a placed time-range + limit.

import {
  badge,
  clickyDoc,
  detailDoc,
  detailLink,
  mono,
  status,
  table,
  tags,
  text,
  type SurfaceFixture,
} from "./surface-fixture";

const PRIORITY_COLOR = {
  high: "#b91c1c",
  normal: "#475569",
  low: "#6b7280",
} as const;

const paths: SurfaceFixture["paths"] = {
  "/api/v1/orders": {
    get: {
      operationId: "order_list",
      summary: "List orders",
      tags: ["order"],
      parameters: [
        { name: "q", in: "query", schema: { type: "string" }, description: "Search query", placeholder: "Search orders…", "x-clicky": { role: "search" } },
        { name: "status", in: "query", schema: { type: "string", enum: ["pending", "shipped", "delivered", "cancelled"] }, description: "Order status", "x-clicky": { role: "filter" } },
        { name: "channel", in: "query", schema: { type: "string" }, description: "Sales channel", "x-clicky": { role: "filter" } },
        { name: "from", in: "query", schema: { type: "string", format: "date-time" }, description: "Placed after", "x-clicky": { role: "time-from" } },
        { name: "to", in: "query", schema: { type: "string", format: "date-time" }, description: "Placed before", "x-clicky": { role: "time-to" } },
        { name: "limit", in: "query", schema: { type: "integer", default: 25 }, description: "Page size", "x-clicky": { role: "limit" } },
      ],
      responses: { "200": { description: "OK" } },
      "x-clicky": { surface: "orders", verb: "list", scope: "collection" },
    },
  },
  "/api/v1/orders/{id}": {
    get: {
      operationId: "order_get",
      summary: "Get order",
      tags: ["order"],
      parameters: [{ name: "id", in: "path", required: true, schema: { type: "string" } }],
      responses: { "200": { description: "OK" } },
      "x-clicky": { surface: "orders", verb: "get", scope: "entity", idParam: "id" },
    },
    delete: {
      operationId: "order_cancel",
      summary: "Cancel order",
      tags: ["order"],
      parameters: [{ name: "id", in: "path", required: true, schema: { type: "string" } }],
      responses: { "204": { description: "Cancelled" } },
      "x-clicky": { surface: "orders", verb: "delete", scope: "entity", idParam: "id", actionName: "Cancel order" },
    },
  },
};

const listResponse = clickyDoc(
  table(
    [
      { name: "number", label: "Order #", sortable: true, shrink: true },
      { name: "customer", label: "Customer", sortable: true, grow: true },
      { name: "status", label: "Status", kind: "status", sortable: true, shrink: true },
      { name: "priority", label: "Priority", shrink: true },
      { name: "total", label: "Total", align: "right", sortable: true, shrink: true },
      { name: "channels", label: "Channels", kind: "tags", filterable: true, grow: true },
      { name: "placed", label: "Placed", kind: "timestamp", sortable: true, shrink: true },
    ],
    [
      {
        cells: {
          number: detailLink("ord_1001", "order_get", "ord_1001"),
          customer: text("Acme Robotics"),
          status: status("delivered"),
          priority: badge("priority", "normal", PRIORITY_COLOR.normal),
          total: mono("1,248.00"),
          channels: tags({ source: "web", region: "us-east" }),
          placed: text("2026-05-28T11:02:00Z"),
        },
      },
      {
        cells: {
          number: detailLink("ord_1002", "order_get", "ord_1002"),
          customer: text("Globex Foods"),
          status: status("shipped"),
          priority: badge("priority", "high", PRIORITY_COLOR.high),
          total: mono("18,940.50"),
          channels: tags({ source: "edi", region: "eu-west" }),
          placed: text("2026-06-09T08:45:00Z"),
        },
      },
      {
        cells: {
          number: detailLink("ord_1003", "order_get", "ord_1003"),
          customer: text("Initech"),
          status: status("pending"),
          priority: badge("priority", "low", PRIORITY_COLOR.low),
          total: mono("312.75"),
          channels: tags({ source: "retail", region: "us-west" }),
          placed: text("2026-06-14T19:20:00Z"),
        },
      },
    ],
  ),
);

function orderDetail(id: string, customer: string, statusLabel: string, total: string) {
  return detailDoc([
    { name: "id", value: text(id) },
    { name: "customer", value: text(customer) },
    { name: "status", value: status(statusLabel) },
    { name: "total", value: mono(total) },
    { name: "lines", value: text("3 items") },
    { name: "placed", value: text("2026-06-09T08:45:00Z") },
  ]);
}

const detailById: Record<string, ReturnType<typeof detailDoc>> = {
  ord_1001: orderDetail("ord_1001", "Acme Robotics", "delivered", "1,248.00"),
  ord_1002: orderDetail("ord_1002", "Globex Foods", "shipped", "18,940.50"),
  ord_1003: orderDetail("ord_1003", "Initech", "pending", "312.75"),
};

export const ORDERS_FIXTURE: SurfaceFixture = {
  surface: {
    key: "orders",
    entity: "order",
    title: "Orders",
    parent: "inventory",
    description: "Customer orders across every sales channel.",
  },
  paths,
  listResponse,
  detailById,
};
