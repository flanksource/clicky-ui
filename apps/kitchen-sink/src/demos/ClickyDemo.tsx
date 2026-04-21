import { Clicky, type ClickyDocument } from "@flanksource/clicky-ui";
import { DemoSection } from "./Section";

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
          columns: [
            { name: "name", label: "Name" },
            { name: "status", label: "Status" },
            { name: "restarts", label: "Restarts", align: "right" },
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
          roots: [
            {
              id: "cluster",
              label: { kind: "text", text: "cluster / prod-eu", plain: "cluster / prod-eu" },
              children: [
                { id: "api", label: { kind: "text", text: "api", plain: "api" } },
                { id: "worker", label: { kind: "text", text: "worker", plain: "worker" } },
              ],
            },
          ],
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
      description="Versioned Clicky AST renderer with native tree, table, and code blocks."
    >
      <div className="rounded-md border border-border bg-background p-density-3">
        <Clicky data={demo} />
      </div>
    </DemoSection>
  );
}
