import { Clicky, type ClickyDocument, type ClickyTreeItem } from "@flanksource/clicky-ui";
import { DemoSection } from "./Section";

const topologyRoots: ClickyTreeItem[] = [
  {
    id: "cluster-prod-eu",
    label: { kind: "text", text: "cluster / prod-eu", plain: "cluster / prod-eu" },
    children: [
      {
        id: "payments-namespace",
        label: { kind: "text", text: "namespace / payments", plain: "namespace / payments" },
        children: [
          {
            id: "payments-api",
            label: {
              kind: "text",
              text: "deployment / payments-api",
              plain: "deployment / payments-api",
            },
          },
          {
            id: "payments-worker",
            label: {
              kind: "text",
              text: "deployment / payments-worker",
              plain: "deployment / payments-worker",
            },
          },
          {
            id: "payments-ledger",
            label: { kind: "text", text: "job / ledger-sync", plain: "job / ledger-sync" },
          },
          {
            id: "payments-db",
            label: {
              kind: "text",
              text: "statefulset / payments-db",
              plain: "statefulset / payments-db",
            },
          },
        ],
      },
      {
        id: "edge-namespace",
        label: { kind: "text", text: "namespace / edge", plain: "namespace / edge" },
        children: [
          {
            id: "edge-gateway",
            label: { kind: "text", text: "deployment / gateway", plain: "deployment / gateway" },
          },
          {
            id: "edge-cache",
            label: {
              kind: "text",
              text: "deployment / edge-cache",
              plain: "deployment / edge-cache",
            },
          },
          {
            id: "edge-worker",
            label: {
              kind: "text",
              text: "deployment / cache-warmer",
              plain: "deployment / cache-warmer",
            },
          },
          {
            id: "edge-cert",
            label: { kind: "text", text: "job / cert-rotator", plain: "job / cert-rotator" },
          },
        ],
      },
      {
        id: "ops-namespace",
        label: { kind: "text", text: "namespace / ops", plain: "namespace / ops" },
        children: [
          {
            id: "ops-alerts",
            label: { kind: "text", text: "deployment / alerts", plain: "deployment / alerts" },
          },
          {
            id: "ops-metrics",
            label: {
              kind: "text",
              text: "deployment / metrics-scraper",
              plain: "deployment / metrics-scraper",
            },
          },
          {
            id: "ops-reports",
            label: {
              kind: "text",
              text: "cronjob / nightly-report",
              plain: "cronjob / nightly-report",
            },
          },
          {
            id: "ops-backups",
            label: {
              kind: "text",
              text: "cronjob / backup-check",
              plain: "cronjob / backup-check",
            },
          },
        ],
      },
    ],
  },
  {
    id: "cluster-staging-us",
    label: { kind: "text", text: "cluster / staging-us", plain: "cluster / staging-us" },
    children: [
      {
        id: "preview-namespace",
        label: { kind: "text", text: "namespace / preview", plain: "namespace / preview" },
        children: [
          {
            id: "preview-api",
            label: {
              kind: "text",
              text: "deployment / preview-api",
              plain: "deployment / preview-api",
            },
          },
          {
            id: "preview-web",
            label: {
              kind: "text",
              text: "deployment / preview-web",
              plain: "deployment / preview-web",
            },
          },
          {
            id: "preview-jobs",
            label: { kind: "text", text: "job / preview-seed", plain: "job / preview-seed" },
          },
          {
            id: "preview-search",
            label: {
              kind: "text",
              text: "deployment / search-indexer",
              plain: "deployment / search-indexer",
            },
          },
        ],
      },
      {
        id: "staging-qa",
        label: { kind: "text", text: "namespace / qa", plain: "namespace / qa" },
        children: [
          {
            id: "qa-payments",
            label: {
              kind: "text",
              text: "deployment / qa-payments",
              plain: "deployment / qa-payments",
            },
          },
          {
            id: "qa-worker",
            label: {
              kind: "text",
              text: "deployment / qa-worker",
              plain: "deployment / qa-worker",
            },
          },
          {
            id: "qa-reports",
            label: { kind: "text", text: "job / report-replay", plain: "job / report-replay" },
          },
          {
            id: "qa-smoke",
            label: { kind: "text", text: "job / smoke-suite", plain: "job / smoke-suite" },
          },
        ],
      },
    ],
  },
];

const demo: ClickyDocument = {
  version: 1,
  node: {
    kind: "map",
    fields: [
      {
        name: "summary",
        label: "Summary",
        value: {
          kind: "text",
          text: "Clicky rich text rendered by native clicky-ui components",
          plain: "Clicky rich text rendered by native clicky-ui components",
          style: { bold: true },
        },
      },
      {
        name: "services",
        label: "Services",
        value: {
          kind: "table",
          autoFilter: true,
          columns: [
            { name: "name", label: "Name", grow: true },
            { name: "status", label: "Status", shrink: true },
            { name: "restarts", label: "Restarts", align: "right", shrink: true },
          ],
          rows: [
            {
              cells: {
                name: { kind: "text", text: "api", plain: "api" },
                status: {
                  kind: "text",
                  text: "healthy",
                  plain: "healthy",
                  style: { color: "#166534", bold: true },
                },
                restarts: { kind: "text", text: "0", plain: "0", style: { monospace: true } },
              },
              detail: {
                kind: "code",
                language: "yaml",
                source: "apiVersion: apps/v1\nkind: Deployment\nmetadata:\n  name: api",
                plain: "apiVersion: apps/v1\nkind: Deployment\nmetadata:\n  name: api",
              },
            },
            {
              cells: {
                name: { kind: "text", text: "worker", plain: "worker" },
                status: {
                  kind: "text",
                  text: "degraded",
                  plain: "degraded",
                  style: { color: "#b45309", bold: true },
                },
                restarts: { kind: "text", text: "3", plain: "3", style: { monospace: true } },
              },
            },
          ],
        },
      },
      {
        name: "topology",
        label: "Topology",
        value: {
          kind: "tree",
          roots: topologyRoots,
        },
      },
      {
        name: "actions",
        label: "Actions",
        value: {
          kind: "button-group",
          items: [
            {
              kind: "button",
              href: "https://example.com/docs",
              label: { kind: "text", text: "Docs", plain: "Docs" },
            },
            {
              kind: "button",
              id: "restart-worker",
              payload: '{"service":"worker"}',
              label: { kind: "text", text: "Restart Worker", plain: "Restart Worker" },
            },
          ],
        },
      },
    ],
  },
};

export function ClickyDemo() {
  return (
    <DemoSection
      id="clicky"
      title="Clicky"
      description="Versioned Clicky AST renderer with native tree, shared table filters, code blocks, and an optional URL-backed fetch mode. The topology tree is large enough to exercise the built-in tree filter."
    >
      <div className="space-y-density-4">
        <div className="space-y-density-2">
          <p className="text-sm text-muted-foreground">
            This example renders a local fallback payload immediately, then refreshes from a fetched
            URL using the remote Clicky mode.
          </p>
          <div className="rounded-md border border-border bg-background p-density-3">
            <Clicky
              url="/samples/clicky/services.json"
              data={demo}
              view={{ pdf: false, json: true }}
              download={{ all: true }}
            />
          </div>
        </div>

        <div className="space-y-density-2">
          <p className="text-sm text-muted-foreground">
            This remote example uses `view={[]}` to suppress the mode switcher and only expose the
            download action.
          </p>
          <div className="rounded-md border border-border bg-background p-density-3">
            <Clicky
              url="/samples/clicky/services.json"
              data={demo}
              view={[]}
              download={{ all: true, label: "report" }}
            />
          </div>
        </div>

        <div className="space-y-density-2">
          <p className="text-sm text-muted-foreground">
            This remote example keeps the rendered output fixed while the split download menu still
            exposes every supported format.
          </p>
          <div className="rounded-md border border-border bg-background p-density-3">
            <Clicky
              url="/samples/clicky/services.json"
              data={demo}
              view={[]}
              download={{ all: true, label: "artifact" }}
            />
          </div>
        </div>
      </div>
    </DemoSection>
  );
}
