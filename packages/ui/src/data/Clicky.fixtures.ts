import type { ClickyDocument } from "./Clicky";

export const clickyFixture: ClickyDocument = {
  version: 1,
  node: {
    kind: "map",
    fields: [
      {
        name: "title",
        label: "Title",
        value: {
          kind: "text",
          text: "Cluster Status",
          plain: "Cluster Status",
          style: { bold: true },
        },
      },
      {
        name: "status",
        label: "Status",
        value: {
          kind: "text",
          text: "Healthy",
          plain: "Healthy",
          style: { bold: true, color: "#166534" },
          children: [
            {
              kind: "text",
              text: " in ",
              plain: " in ",
            },
            {
              kind: "text",
              text: "production",
              plain: "production",
              style: { italic: true },
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
              id: "restart",
              payload: "{\"service\":\"api\"}",
              label: { kind: "text", text: "Restart", plain: "Restart" },
            },
          ],
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
            { name: "latency", label: "Latency", align: "right" },
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
                latency: { kind: "text", text: "42", plain: "42", style: { monospace: true } },
              },
              detail: {
                kind: "map",
                fields: [
                  {
                    name: "owner",
                    label: "Owner",
                    value: { kind: "text", text: "platform", plain: "platform" },
                  },
                  {
                    name: "manifest",
                    label: "Manifest",
                    value: {
                      kind: "code",
                      language: "yaml",
                      source: "apiVersion: v1\nkind: Service\nmetadata:\n  name: api",
                      plain: "apiVersion: v1\nkind: Service\nmetadata:\n  name: api",
                    },
                  },
                ],
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
                latency: { kind: "text", text: "91", plain: "91", style: { monospace: true } },
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
              label: {
                kind: "text",
                text: "cluster",
                plain: "cluster",
                children: [{ kind: "text", text: " / prod-eu", plain: " / prod-eu" }],
              },
              children: [
                {
                  id: "api",
                  label: { kind: "text", text: "api", plain: "api" },
                },
                {
                  id: "worker",
                  label: { kind: "text", text: "worker", plain: "worker" },
                },
              ],
            },
          ],
        },
      },
      {
        name: "logs",
        label: "Logs",
        value: {
          kind: "collapsed",
          label: { kind: "text", text: "Show rollout notes", plain: "Show rollout notes" },
          content: {
            kind: "list",
            items: [
              { kind: "text", text: "Deployment paused during database migration", plain: "Deployment paused during database migration" },
              { kind: "text", text: "Worker pool drained before restart", plain: "Worker pool drained before restart" },
            ],
          },
        },
      },
      {
        name: "html_note",
        label: "HTML Note",
        value: {
          kind: "html",
          plain: "sanitized html note",
          html: '<strong>Heads up</strong>: <span class="text-amber-600">manual approval required</span>',
        },
      },
    ],
  },
};
