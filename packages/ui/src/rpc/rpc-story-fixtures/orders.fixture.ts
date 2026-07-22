// Orders surface — Inventory group. Showcases a monospace order number that
// links to the detail page, status text, a priority badge, a monospace total,
// channel tag chips, and a placed-at timestamp, with search + status enum +
// channel filter + a placed time-range + limit/offset pagination.
//
// Rows are generated from the row index so the fake backend has enough of them
// to page through and the fixture renders identically on every run.

import {
  badge,
  detailDoc,
  detailLink,
  fixtureTimestamp,
  mono,
  pick,
  status,
  tags,
  text,
  type SurfaceFixture,
} from "./surface-fixture";
import type { ClickyRow } from "../../data/Clicky";

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
        { name: "offset", in: "query", schema: { type: "integer", default: 0 }, description: "Row offset", "x-clicky": { role: "offset" } },
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

const CUSTOMERS = [
  "Acme Robotics",
  "Globex Foods",
  "Initech",
  "Umbrella Supply",
  "Soylent Grocers",
  "Vehement Capital",
  "Massive Dynamic",
  "Wayne Industries",
];
const STATES = ["delivered", "shipped", "pending", "cancelled"];
const PRIORITIES = ["normal", "high", "low"] as const;
const SOURCES = ["web", "edi", "retail", "partner"];
const REGIONS = ["us-east", "eu-west", "us-west", "ap-south"];

const ORDER_COUNT = 120;

type OrderSeed = {
  id: string;
  customer: string;
  state: string;
  priority: (typeof PRIORITIES)[number];
  total: string;
  source: string;
  region: string;
  placed: string;
};

function orderSeed(index: number): OrderSeed {
  const cents = ((index * 7919) % 2_000_000) + 31_275;
  return {
    id: `ord_${1001 + index}`,
    customer: pick(CUSTOMERS, index),
    state: pick(STATES, index),
    priority: pick(PRIORITIES, index),
    total: (cents / 100).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 }),
    source: pick(SOURCES, index),
    region: pick(REGIONS, index),
    placed: fixtureTimestamp(index),
  };
}

const SEEDS: OrderSeed[] = Array.from({ length: ORDER_COUNT }, (_, index) => orderSeed(index));

const listColumns = [
  { name: "number", label: "Order #", sortable: true, shrink: true },
  { name: "customer", label: "Customer", sortable: true, grow: true },
  { name: "status", label: "Status", kind: "status" as const, sortable: true, shrink: true },
  { name: "priority", label: "Priority", shrink: true },
  { name: "total", label: "Total", align: "right" as const, sortable: true, shrink: true },
  { name: "channels", label: "Channels", kind: "tags" as const, filterable: true, grow: true },
  { name: "placed", label: "Placed", kind: "timestamp" as const, sortable: true, shrink: true },
];

const listRows: ClickyRow[] = SEEDS.map((seed) => ({
  cells: {
    number: detailLink(seed.id, "order_get", seed.id),
    customer: text(seed.customer),
    status: status(seed.state),
    priority: badge("priority", seed.priority, PRIORITY_COLOR[seed.priority]),
    total: mono(seed.total),
    channels: tags({ source: seed.source, region: seed.region }),
    placed: text(seed.placed),
  },
}));

const detailById: Record<string, ReturnType<typeof detailDoc>> = Object.fromEntries(
  SEEDS.map((seed) => [
    seed.id,
    detailDoc([
      { name: "id", value: text(seed.id) },
      { name: "customer", value: text(seed.customer) },
      { name: "status", value: status(seed.state) },
      { name: "total", value: mono(seed.total) },
      { name: "lines", value: text(`${(seed.id.length % 5) + 1} items`) },
      { name: "placed", value: text(seed.placed) },
    ]),
  ]),
);

export const ORDERS_FIXTURE: SurfaceFixture = {
  surface: {
    key: "orders",
    entity: "order",
    title: "Orders",
    parent: "inventory",
    description: "Customer orders across every sales channel.",
  },
  paths,
  listColumns,
  listRows,
  detailById,
};
