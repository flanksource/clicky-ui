// Services surface — Platform group. Showcases a link-command name cell (detail
// nav), health status text, a version badge, region text, label tag chips, and a
// last-deploy timestamp, with search + env enum + an "unhealthy only" boolean
// filter.

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
  "/api/v1/services": {
    get: {
      operationId: "service_list",
      summary: "List services",
      tags: ["service"],
      parameters: [
        { name: "q", in: "query", schema: { type: "string" }, description: "Search query", placeholder: "Search services…", "x-clicky": { role: "search" } },
        { name: "env", in: "query", schema: { type: "string", enum: ["prod", "staging", "dev"] }, description: "Environment", "x-clicky": { role: "filter" } },
        { name: "unhealthy", in: "query", schema: { type: "boolean" }, description: "Only unhealthy services", "x-clicky": { role: "filter" } },
      ],
      responses: { "200": { description: "OK" } },
      "x-clicky": { surface: "services", verb: "list", scope: "collection" },
    },
    post: {
      operationId: "service_restart",
      summary: "Restart service",
      tags: ["service"],
      parameters: [{ name: "name", in: "query", required: true, schema: { type: "string" }, description: "Service name" }],
      responses: { "202": { description: "Accepted" } },
      "x-clicky": { surface: "services", verb: "action", scope: "collection", actionName: "Restart" },
    },
  },
  "/api/v1/services/{id}": {
    get: {
      operationId: "service_get",
      summary: "Get service",
      tags: ["service"],
      parameters: [{ name: "id", in: "path", required: true, schema: { type: "string" } }],
      responses: { "200": { description: "OK" } },
      "x-clicky": { surface: "services", verb: "get", scope: "entity", idParam: "id" },
    },
  },
};

const listResponse = clickyDoc(
  table(
    [
      { name: "name", label: "Service", sortable: true, grow: true },
      { name: "status", label: "Health", kind: "status", sortable: true, shrink: true },
      { name: "version", label: "Version", shrink: true },
      { name: "region", label: "Region", sortable: true, shrink: true },
      { name: "labels", label: "Labels", kind: "tags", filterable: true, grow: true },
      { name: "deployed", label: "Last deploy", kind: "timestamp", sortable: true, shrink: true },
    ],
    [
      {
        cells: {
          name: detailLink("checkout-api", "service_get", "checkout-api"),
          status: status("healthy"),
          version: badge("v", "2.4.1", "#0f766e"),
          region: text("us-east-1"),
          labels: tags({ team: "payments", tier: "edge" }),
          deployed: text("2026-06-13T07:12:00Z"),
        },
      },
      {
        cells: {
          name: detailLink("inventory-sync", "service_get", "inventory-sync"),
          status: status("degraded"),
          version: badge("v", "1.9.0", "#0f766e"),
          region: text("eu-west-1"),
          labels: tags({ team: "platform", tier: "core" }),
          deployed: text("2026-06-10T22:40:00Z"),
        },
      },
      {
        cells: {
          name: detailLink("recommendations", "service_get", "recommendations"),
          status: status("down"),
          version: badge("v", "0.7.3", "#0f766e"),
          region: text("us-west-2"),
          labels: tags({ team: "ml", tier: "batch" }),
          deployed: text("2026-06-15T03:18:00Z"),
        },
      },
    ],
  ),
);

function serviceDetail(id: string, statusLabel: string, version: string, region: string) {
  return detailDoc([
    { name: "id", value: text(id) },
    { name: "status", value: status(statusLabel) },
    { name: "version", value: badge("v", version, "#0f766e") },
    { name: "region", value: text(region) },
    { name: "replicas", value: text("3") },
    { name: "deployed", value: text("2026-06-13T07:12:00Z") },
  ]);
}

const detailById: Record<string, ReturnType<typeof detailDoc>> = {
  "checkout-api": serviceDetail("checkout-api", "healthy", "2.4.1", "us-east-1"),
  "inventory-sync": serviceDetail("inventory-sync", "degraded", "1.9.0", "eu-west-1"),
  recommendations: serviceDetail("recommendations", "down", "0.7.3", "us-west-2"),
};

export const SERVICES_FIXTURE: SurfaceFixture = {
  surface: {
    key: "services",
    entity: "service",
    title: "Services",
    parent: "platform",
    description: "Runtime services and their deploy health.",
  },
  paths,
  listResponse,
  detailById,
};
