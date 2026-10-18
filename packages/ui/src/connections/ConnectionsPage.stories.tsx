import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import type { Decorator, Meta, StoryObj } from "@storybook/react-vite";
import { useEffect, useRef, useState } from "react";
import { expect, userEvent, within } from "storybook/test";
import {
  cacheConnectionFixture,
  connectionDashboardFixture,
  connectionSchemaFixture,
} from "../test/connections.test-utils";
import { ConnectionsPage, type ConnectionsPageProps } from "./ConnectionsPage";

const API_BASE = "/api/v1";

function json(body: unknown, status = 200, contentType = "application/json"): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": contentType },
  });
}

const READ_ONLY_REFUSAL = {
  code: "read_only",
  message: "connections are read-only: no connection store is configured",
};

/**
 * The commons-db connections service, in memory: the dashboard, the schema,
 * one editable connection, test/resolve on drafts, and a delete that answers
 * 409 because a database module still references the connection — the FK
 * conflict a host such as uir surfaces.
 */
const fakeConnectionsApi: typeof fetch = async (input, init) => {
  const method = (init?.method ?? "GET").toUpperCase();
  const url = String(input);
  const accept = new Headers(init?.headers).get("Accept") ?? "";
  if (method === "GET" && url === `${API_BASE}/connections/dashboard`) {
    return json({ connections: connectionDashboardFixture, generatedAt: new Date().toISOString() });
  }
  if (method === "POST" && url === `${API_BASE}/connections/health`) {
    const { ids } = JSON.parse(String(init?.body)) as { ids: string[] };
    return json({
      generatedAt: new Date().toISOString(),
      results: ids.map((id) => ({
        id,
        state: id === "cache-id" ? "unreachable" : "healthy",
        detail: id === "cache-id" ? "dial tcp cache:6379: connection refused" : "PostgreSQL 17.2",
        checkedAt: new Date().toISOString(),
        cached: false,
        durationMs: 42,
      })),
    });
  }
  if (method === "GET" && url === `${API_BASE}/connection` && accept.includes("schema")) {
    return json(connectionSchemaFixture, 200, "application/schema+json");
  }
  if (method === "GET" && url === `${API_BASE}/connection/cache-id`) {
    return json(cacheConnectionFixture);
  }
  if (method === "GET" && url === `${API_BASE}/connection/warehouse-id`) {
    return json({
      id: "warehouse-id",
      name: "warehouse",
      namespace: "analytics",
      type: "postgres",
      url: "postgres://warehouse.analytics:5432/orders",
    });
  }
  if (method === "POST" && url === `${API_BASE}/connection/test`) {
    return json({ ok: true, message: "TCP connect succeeded in 12ms", url: "redis://cache:6379/0" });
  }
  if (method === "POST" && url === `${API_BASE}/connection/resolve`) {
    return json({ url: "redis://cache:6379/0", password: "••••" });
  }
  if (method === "DELETE" && url === `${API_BASE}/connection/cache-id`) {
    return json(
      {
        code: "conflict",
        message:
          'connection "cache" is still referenced by database_modules_connection_id_fkey; remove the dependent database modules first',
      },
      409,
    );
  }
  if ((method === "POST" || method === "PUT") && url.startsWith(`${API_BASE}/connection`)) {
    return json(JSON.parse(String(init?.body)));
  }
  if (method === "DELETE") return new Response(null, { status: 204 });
  return new Response(`no fake route for ${method} ${url}`, { status: 404 });
};

/**
 * The same service with no connection store, serving a host's config-file
 * connections as virtual ones: every row is read-only and writes answer 405.
 */
const fakeReadOnlyConnectionsApi: typeof fetch = async (input, init) => {
  const method = (init?.method ?? "GET").toUpperCase();
  const url = String(input);
  if (method === "GET" && url === `${API_BASE}/connections/dashboard`) {
    return json({
      connections: connectionDashboardFixture.map((item) => ({ ...item, readOnly: true })),
      generatedAt: new Date().toISOString(),
      readOnly: true,
    });
  }
  if (method === "GET" && url === `${API_BASE}/connection/cache-id`) {
    return json({ ...cacheConnectionFixture, virtual: true, read_only: true });
  }
  if (
    method === "PUT" ||
    method === "DELETE" ||
    (method === "POST" && url === `${API_BASE}/connection`)
  ) {
    return json(READ_ONLY_REFUSAL, 405);
  }
  return fakeConnectionsApi(input, init);
};

const withFakeConnectionsApi: Decorator = (Story, context) => {
  const fake = context.parameters.readOnlyCatalog ? fakeReadOnlyConnectionsApi : fakeConnectionsApi;
  const original = useRef<typeof globalThis.fetch | undefined>(undefined);
  if (globalThis.fetch !== fake) {
    original.current = globalThis.fetch;
    globalThis.fetch = fake;
  }
  useEffect(
    () => () => {
      if (original.current) globalThis.fetch = original.current;
    },
    [],
  );
  const [queryClient] = useState(
    () => new QueryClient({ defaultOptions: { queries: { retry: false } } }),
  );
  return (
    <QueryClientProvider client={queryClient}>
      <Story />
    </QueryClientProvider>
  );
};

/** Holds `selected` the way a host keeps it in its route. */
function ConnectionsPageHost({ selected: initial, onSelect, ...props }: ConnectionsPageProps) {
  const [selected, setSelected] = useState(initial);
  return (
    <ConnectionsPage
      {...props}
      {...(selected ? { selected } : {})}
      onSelect={(id) => {
        setSelected(id);
        onSelect(id);
      }}
    />
  );
}

const meta = {
  title: "Connections/ConnectionsPage",
  component: ConnectionsPage,
  decorators: [withFakeConnectionsApi],
  render: (args) => <ConnectionsPageHost {...args} />,
  args: {
    apiBase: API_BASE,
    onSelect: () => {},
    connectionHref: (id: string) => `?connection=${encodeURIComponent(id)}`,
  },
  parameters: {
    docs: {
      description: {
        component:
          "The connections screen for a host without EntityExplorerApp: namespace lanes with on-demand health, an Add Connection dialog over the served connection schema, and the same dialog editing the selected connection with Delete. Test / Resolve work on the unsaved draft. A catalog without a connection store hides Add Connection, and a virtual connection opens as a view with the host's `readOnlyHint`.",
      },
    },
  },
} satisfies Meta<typeof ConnectionsPage>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Fleet: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(await canvas.findByText("warehouse")).toBeInTheDocument();
    await userEvent.click(canvas.getByRole("button", { name: "Add Connection" }));
    const body = within(canvasElement.ownerDocument.body);
    await expect(await body.findByRole("dialog", { name: "Add Connection" })).toBeInTheDocument();
  },
};

export const EditingSelected: Story = {
  args: { selected: "cache-id" },
};

export const DeleteConflict: Story = {
  args: { selected: "cache-id" },
  play: async ({ canvasElement }) => {
    const body = within(canvasElement.ownerDocument.body);
    const editor = await body.findByRole("dialog", { name: "Edit cache" });
    await userEvent.click(await within(editor).findByRole("button", { name: "Delete" }));
    const confirm = await body.findByRole("dialog", { name: "Delete connection?" });
    await userEvent.click(within(confirm).getByRole("button", { name: "Delete" }));
    await expect(
      await within(editor).findByText(/still referenced by database_modules_connection_id_fkey/),
    ).toBeInTheDocument();
  },
};

export const ReadOnlyCatalog: Story = {
  args: {
    selected: "cache-id",
    readOnlyHint: <a href="?section=environments">Edit in the environment config</a>,
  },
  parameters: { readOnlyCatalog: true },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const body = within(canvasElement.ownerDocument.body);
    const view = await body.findByRole("dialog", { name: "View cache" });
    await expect(
      within(view).getByRole("link", { name: "Edit in the environment config" }),
    ).toBeInTheDocument();
    await expect(await within(view).findByRole("button", { name: "Test" })).toBeInTheDocument();
    await expect(within(view).queryByRole("button", { name: "Save" })).toBeNull();
    await expect(within(view).queryByRole("button", { name: "Delete" })).toBeNull();
    await expect(canvas.queryByRole("button", { name: "Add Connection" })).toBeNull();
  },
};
