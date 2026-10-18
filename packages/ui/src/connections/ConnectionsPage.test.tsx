import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { fireEvent, render, screen, waitFor, within } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { ConnectionsPage, type ConnectionsPageProps } from "./ConnectionsPage";
import {
  cacheConnectionFixture,
  connectionDashboardFixture,
  connectionSchemaFixture,
} from "../test/connections.test-utils";

const API_BASE = "/uir/api/v1";
const CONFLICT_MESSAGE =
  'connection "cache" is still referenced by database_modules_connection_id_fkey; remove the dependent database modules first';

const READ_ONLY_HINT = "Edit in the environment config";
const READ_ONLY_HINT_HREF = "/settings?section=environments";

type Route = (init: RequestInit | undefined) => Response;

function json(body: unknown, init: { status?: number; contentType?: string } = {}): Response {
  return new Response(JSON.stringify(body), {
    status: init.status ?? 200,
    headers: { "Content-Type": init.contentType ?? "application/json" },
  });
}

const baseRoutes: Record<string, Route> = {
  [`GET ${API_BASE}/connections/dashboard`]: () =>
    json({ connections: connectionDashboardFixture, generatedAt: "2026-10-16T08:00:00Z" }),
  [`GET ${API_BASE}/connection`]: (init) => {
    const accept = new Headers(init?.headers).get("Accept");
    if (accept !== "application/schema+json") {
      throw new Error(`connection schema requested with Accept ${accept}`);
    }
    return json(connectionSchemaFixture, { contentType: "application/schema+json" });
  },
  [`GET ${API_BASE}/connection/cache-id`]: () => json(cacheConnectionFixture),
};

const readOnlyCatalogRoutes: Record<string, Route> = {
  ...baseRoutes,
  [`GET ${API_BASE}/connections/dashboard`]: () =>
    json({
      connections: connectionDashboardFixture.map((item) => ({ ...item, readOnly: true })),
      generatedAt: "2026-10-16T08:00:00Z",
      readOnly: true,
    }),
};

const virtualCacheRoutes: Record<string, Route> = {
  ...baseRoutes,
  [`GET ${API_BASE}/connection/cache-id`]: () =>
    json({ ...cacheConnectionFixture, virtual: true, read_only: true }),
};

let requests: string[] = [];
let bodies: Record<string, unknown> = {};

function mockApi(routes: Record<string, Route>) {
  requests = [];
  bodies = {};
  vi.stubGlobal(
    "fetch",
    vi.fn(async (input: RequestInfo | URL, init?: RequestInit) => {
      const key = `${(init?.method ?? "GET").toUpperCase()} ${String(input)}`;
      requests.push(key);
      if (typeof init?.body === "string") bodies[key] = JSON.parse(init.body);
      const route = routes[key];
      if (!route) throw new Error(`unexpected request ${key}`);
      return route(init);
    }),
  );
}

function renderPage(props: Partial<ConnectionsPageProps> = {}) {
  const onSelect = vi.fn();
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  render(
    <QueryClientProvider client={queryClient}>
      <ConnectionsPage
        apiBase={API_BASE}
        onSelect={onSelect}
        connectionHref={(id) => `/connections?connection=${id}`}
        {...props}
      />
    </QueryClientProvider>,
  );
  return { onSelect };
}

beforeEach(() => mockApi(baseRoutes));
afterEach(() => vi.unstubAllGlobals());

describe("ConnectionsPage", () => {
  it("opens the schema-driven create form in a modal from Add Connection", async () => {
    renderPage();
    await screen.findByText("warehouse");

    fireEvent.click(screen.getByRole("button", { name: "Add Connection" }));

    const dialog = await screen.findByRole("dialog", { name: "Add Connection" });
    expect(await within(dialog).findByText("Type")).toBeInTheDocument();
    expect(within(dialog).getByRole("button", { name: "Test" })).toBeInTheDocument();
    expect(requests).toContain(`GET ${API_BASE}/connection`);
  });

  it("selects a connection on a plain row click and keeps a real href for new tabs", async () => {
    const { onSelect } = renderPage();

    const link = (await screen.findByText("warehouse")).closest("a");
    expect(link).toHaveAttribute("href", "/connections?connection=warehouse-id");
    fireEvent.click(link!);

    expect(onSelect).toHaveBeenCalledExactlyOnceWith("warehouse-id");
  });

  it("opens the selected connection for editing with k8s-hinted fields as plain inputs", async () => {
    renderPage({ selected: "cache-id" });

    const dialog = await screen.findByRole("dialog", { name: "Edit cache" });
    // No host registered the k8s-url/secret-selector extensions, so those
    // fields must still render as the plain controls their schema type implies.
    expect(await within(dialog).findByDisplayValue(cacheConnectionFixture.url)).toBeInTheDocument();
    expect(within(dialog).getByDisplayValue(cacheConnectionFixture.password)).toHaveAttribute(
      "type",
      "password",
    );
    expect(within(dialog).getByRole("button", { name: "Delete" })).toBeInTheDocument();
    expect(within(dialog).getByRole("button", { name: "Save" })).toBeInTheDocument();
  });

  it("renders the conflict message when deleting a connection that is still referenced", async () => {
    mockApi({
      ...baseRoutes,
      [`DELETE ${API_BASE}/connection/cache-id`]: () =>
        json({ code: "conflict", message: CONFLICT_MESSAGE }, { status: 409 }),
    });
    const { onSelect } = renderPage({ selected: "cache-id" });

    const dialog = await screen.findByRole("dialog", { name: "Edit cache" });
    fireEvent.click(await within(dialog).findByRole("button", { name: "Delete" }));
    const confirm = await screen.findByRole("dialog", { name: "Delete connection?" });
    fireEvent.click(within(confirm).getByRole("button", { name: "Delete" }));

    expect(await within(dialog).findByText(CONFLICT_MESSAGE)).toBeInTheDocument();
    expect(requests).toContain(`DELETE ${API_BASE}/connection/cache-id`);
    expect(onSelect).not.toHaveBeenCalled();
  });

  it("closes the editor once a delete succeeds", async () => {
    mockApi({
      ...baseRoutes,
      [`DELETE ${API_BASE}/connection/cache-id`]: () => new Response(null, { status: 204 }),
    });
    const { onSelect } = renderPage({ selected: "cache-id" });

    const dialog = await screen.findByRole("dialog", { name: "Edit cache" });
    fireEvent.click(await within(dialog).findByRole("button", { name: "Delete" }));
    const confirm = await screen.findByRole("dialog", { name: "Delete connection?" });
    fireEvent.click(within(confirm).getByRole("button", { name: "Delete" }));

    await waitFor(() => expect(onSelect).toHaveBeenCalledExactlyOnceWith(undefined));
  });

  it("keeps the writable editor free of the read-only hint", async () => {
    renderPage({ selected: "cache-id", readOnlyHint: READ_ONLY_HINT });

    const dialog = await screen.findByRole("dialog", { name: "Edit cache" });
    expect(await within(dialog).findByRole("button", { name: "Save" })).toBeInTheDocument();
    expect(within(dialog).queryByText(READ_ONLY_HINT)).not.toBeInTheDocument();
  });

  it("hides Add Connection when the dashboard reports a read-only catalog", async () => {
    mockApi(readOnlyCatalogRoutes);
    renderPage();

    expect(await screen.findByText("warehouse")).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "Add Connection" })).not.toBeInTheDocument();
  });

  it("opens a virtual connection as a view with the host hint and Test, without Save or Delete", async () => {
    mockApi(virtualCacheRoutes);
    renderPage({
      selected: "cache-id",
      readOnlyHint: <a href={READ_ONLY_HINT_HREF}>{READ_ONLY_HINT}</a>,
    });

    const dialog = await screen.findByRole("dialog", { name: "View cache" });
    expect(await within(dialog).findByDisplayValue(cacheConnectionFixture.url)).toBeDisabled();
    expect(within(dialog).queryByRole("tab", { name: "YAML" })).not.toBeInTheDocument();
    expect(within(dialog).getByRole("link", { name: READ_ONLY_HINT })).toHaveAttribute(
      "href",
      READ_ONLY_HINT_HREF,
    );
    expect(within(dialog).getByRole("button", { name: "Test" })).toBeInTheDocument();
    expect(within(dialog).queryByRole("button", { name: "Save" })).not.toBeInTheDocument();
    expect(within(dialog).queryByRole("button", { name: "Delete" })).not.toBeInTheDocument();
  });

  it("tests a virtual connection with its fetched value", async () => {
    mockApi({
      ...virtualCacheRoutes,
      [`POST ${API_BASE}/connection/test`]: () =>
        json({ ok: true, message: "TCP connect succeeded", url: cacheConnectionFixture.url }),
    });
    renderPage({ selected: "cache-id" });

    const dialog = await screen.findByRole("dialog", { name: "View cache" });
    fireEvent.click(await within(dialog).findByRole("button", { name: "Test" }));

    await waitFor(() =>
      expect(bodies[`POST ${API_BASE}/connection/test`]).toEqual({
        ...cacheConnectionFixture,
        virtual: true,
        read_only: true,
      }),
    );
  });

  it("views every connection of a read-only catalog even when the connection carries no flag", async () => {
    mockApi(readOnlyCatalogRoutes);
    renderPage({ selected: "cache-id" });

    const dialog = await screen.findByRole("dialog", { name: "View cache" });
    expect(await within(dialog).findByRole("button", { name: "Test" })).toBeInTheDocument();
    expect(within(dialog).queryByRole("button", { name: "Save" })).not.toBeInTheDocument();
  });
});
