import type { StatusSegment } from "@flanksource/clicky-ui";

// One fixture for every collection style on the page. The same eight services
// are drawn as a table, as rows, as cards, as a tree and as an aggregate, so the
// comparison is about the presentation and never about the data.

export interface ServiceRow extends Record<string, unknown> {
  service: string;
  namespace: string;
  status: "Healthy" | "Warning" | "Failed";
  owner: string;
  checked: string;
  summary: string;
}

export const SERVICES: ServiceRow[] = [
  { service: "config-api", namespace: "platform", status: "Healthy", owner: "Platform", checked: "2m ago", summary: "Serves the configuration graph to every product surface." },
  { service: "canary-runner", namespace: "monitoring", status: "Healthy", owner: "Reliability", checked: "4m ago", summary: "Runs synthetic checks against public endpoints." },
  { service: "notification-hub", namespace: "platform", status: "Warning", owner: "Platform", checked: "8m ago", summary: "Fans notifications out to email, chat and webhooks." },
  { service: "evidence-store", namespace: "compliance", status: "Healthy", owner: "Trust", checked: "11m ago", summary: "Immutable store for audit evidence and attestations." },
  { service: "asset-indexer", namespace: "inventory", status: "Failed", owner: "Inventory", checked: "14m ago", summary: "Indexes discovered assets into the searchable catalog." },
  { service: "policy-engine", namespace: "compliance", status: "Healthy", owner: "Trust", checked: "16m ago", summary: "Evaluates policy rules against collected configuration." },
  { service: "topology-sync", namespace: "inventory", status: "Warning", owner: "Inventory", checked: "18m ago", summary: "Reconciles relationships between discovered resources." },
  { service: "audit-export", namespace: "reporting", status: "Healthy", owner: "Reporting", checked: "21m ago", summary: "Ships signed audit bundles to long-term storage." },
];

export type ServiceNode = {
  key: string;
  label: string;
  meta?: string;
  status?: ServiceRow["status"];
  children?: ServiceNode[];
};

/** Namespaces with their services beneath — derived, so the tree cannot drift. */
export const SERVICE_TREE: ServiceNode[] = [
  ...new Set(SERVICES.map((row) => row.namespace)),
].map((namespace) => {
  const children = SERVICES.filter((row) => row.namespace === namespace);
  return {
    key: namespace,
    label: namespace,
    meta: `${children.length} ${children.length === 1 ? "service" : "services"}`,
    children: children.map((row) => ({
      key: row.service,
      label: row.service,
      meta: row.owner,
      status: row.status,
    })),
  };
});

export const STATUS_TONE: Record<ServiceRow["status"], "success" | "warning" | "danger"> = {
  Healthy: "success",
  Warning: "warning",
  Failed: "danger",
};

const SEGMENT_CLASS: Record<ServiceRow["status"], string> = {
  Healthy: "bg-emerald-500",
  Warning: "bg-amber-500",
  Failed: "bg-rose-500",
};

export const STATUS_SEGMENTS: StatusSegment[] = (
  ["Healthy", "Warning", "Failed"] as const
).map((status) => ({
  key: status,
  label: status,
  count: SERVICES.filter((row) => row.status === status).length,
  className: SEGMENT_CLASS[status],
}));

export type ServiceEvent = {
  id: string;
  actor: string;
  action: string;
  timestamp: string;
  tone: "success" | "warning" | "danger" | "info";
  body?: string;
};

export const SERVICE_EVENTS: ServiceEvent[] = [
  { id: "e1", actor: "asset-indexer", action: "started failing readiness probes", timestamp: "14m ago", tone: "danger", body: "3 of 3 replicas restarted within 90 seconds." },
  { id: "e2", actor: "topology-sync", action: "fell behind its reconcile budget", timestamp: "18m ago", tone: "warning" },
  { id: "e3", actor: "policy-engine", action: "deployed v2.9.1", timestamp: "42m ago", tone: "info" },
  { id: "e4", actor: "evidence-store", action: "completed nightly compaction", timestamp: "3h ago", tone: "success" },
];
