// Services surface — Platform group. Showcases a link-command name cell (detail
// nav), health status text, a version badge, region text, label tag chips, and a
// last-deploy timestamp, with search + env enum + an "unhealthy only" boolean
// filter + limit/offset pagination.
//
// Rows are generated from the row index so the fake backend has enough of them
// to page through and the fixture renders identically on every run.

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
  "/api/v1/services": {
    get: {
      operationId: "service_list",
      summary: "List services",
      tags: ["service"],
      parameters: [
        { name: "q", in: "query", schema: { type: "string" }, description: "Search query", placeholder: "Search services…", "x-clicky": { role: "search" } },
        { name: "env", in: "query", schema: { type: "string", enum: ["prod", "staging", "dev"] }, description: "Environment", "x-clicky": { role: "filter" } },
        { name: "unhealthy", in: "query", schema: { type: "boolean" }, description: "Only unhealthy services", "x-clicky": { role: "filter" } },
        { name: "limit", in: "query", schema: { type: "integer", default: 25 }, description: "Page size", "x-clicky": { role: "limit" } },
        { name: "offset", in: "query", schema: { type: "integer", default: 0 }, description: "Row offset", "x-clicky": { role: "offset" } },
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

const SERVICE_NAMES = [
  "checkout-api",
  "inventory-sync",
  "recommendations",
  "billing-worker",
  "search-indexer",
  "notification-relay",
  "media-transcoder",
  "audit-log",
  "session-store",
  "pricing-engine",
];
const HEALTH = ["healthy", "degraded", "down"];
const REGIONS = ["us-east-1", "eu-west-1", "us-west-2", "ap-south-1"];
const TEAMS = ["payments", "platform", "ml", "growth"];
const TIERS = ["edge", "core", "batch"];

const SERVICE_COUNT = 90;

type ServiceSeed = {
  id: string;
  state: string;
  version: string;
  region: string;
  team: string;
  tier: string;
  replicas: number;
  deployed: string;
};

function serviceSeed(index: number): ServiceSeed {
  // Names repeat every 10 rows, so suffix with the shard index to keep ids unique.
  const shard = Math.floor(index / SERVICE_NAMES.length);
  const base = pick(SERVICE_NAMES, index);
  return {
    id: shard === 0 ? base : `${base}-${shard}`,
    state: pick(HEALTH, index),
    version: `${(index % 4) + 1}.${index % 10}.${index % 7}`,
    region: pick(REGIONS, index),
    team: pick(TEAMS, index),
    tier: pick(TIERS, index),
    replicas: (index % 6) + 1,
    deployed: fixtureTimestamp(index),
  };
}

const SEEDS: ServiceSeed[] = Array.from({ length: SERVICE_COUNT }, (_, index) => serviceSeed(index));

const listColumns = [
  { name: "name", label: "Service", sortable: true, grow: true },
  { name: "status", label: "Health", kind: "status" as const, sortable: true, shrink: true },
  { name: "version", label: "Version", shrink: true },
  { name: "region", label: "Region", sortable: true, shrink: true },
  { name: "labels", label: "Labels", kind: "tags" as const, filterable: true, grow: true },
  { name: "deployed", label: "Last deploy", kind: "timestamp" as const, sortable: true, shrink: true },
];

const listRows: ClickyRow[] = SEEDS.map((seed) => ({
  cells: {
    name: detailLink(seed.id, "service_get", seed.id),
    status: status(seed.state),
    version: badge("v", seed.version, "#0f766e"),
    region: text(seed.region),
    labels: tags({ team: seed.team, tier: seed.tier }),
    deployed: text(seed.deployed),
  },
}));

const detailById: Record<string, ReturnType<typeof detailDoc>> = Object.fromEntries(
  SEEDS.map((seed) => [
    seed.id,
    detailDoc([
      { name: "id", value: text(seed.id) },
      { name: "status", value: status(seed.state) },
      { name: "version", value: badge("v", seed.version, "#0f766e") },
      { name: "region", value: text(seed.region) },
      { name: "replicas", value: text(String(seed.replicas)) },
      { name: "deployed", value: text(seed.deployed) },
    ]),
  ]),
);

export const SERVICES_FIXTURE: SurfaceFixture = {
  surface: {
    key: "services",
    entity: "service",
    title: "Services",
    parent: "platform",
    description: "Runtime services and their deploy health.",
  },
  paths,
  listColumns,
  listRows,
  detailById,
};
