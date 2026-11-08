import { fireEvent, render, screen, waitFor, within } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { describe, expect, it } from "vitest";
import type { ReactNode } from "react";
import type { OpenAPISpec } from "./types";
import type { OperationsApiClient } from "./useOperations";
import { EntityExplorerApp } from "./EntityExplorerApp";
import { ExplorerNavPortal } from "./ExplorerNav";
import { useMemoryRouter } from "./router";
import { RouterProvider } from "./RouterProvider";
import { ThemeProvider } from "../hooks/theme-provider";

function makeClient(): OperationsApiClient {
  const spec: OpenAPISpec = {
    openapi: "3.0.0",
    info: { title: "test", version: "1" },
    "x-clicky": {
      surfaces: [{ key: "widgets", entity: "widget", title: "Widgets" }],
    },
    paths: {
      "/api/v1/widgets": {
        get: {
          operationId: "widget_list",
          summary: "List widgets",
          responses: {},
          "x-clicky": { surface: "widgets", verb: "list", scope: "collection" },
        },
      },
    },
  };
  return {
    getOpenAPISpec: () => Promise.resolve(spec),
    executeCommand: () =>
      Promise.resolve({ success: true, exit_code: 0, contentType: "text/plain", stdout: "" }),
  };
}

function Harness({
  actions,
  client = makeClient(),
  surfaceTitleActions,
}: {
  actions?: ReactNode;
  client?: OperationsApiClient;
  surfaceTitleActions?: (surfaceKey: string) => ReactNode;
}) {
  const adapter = useMemoryRouter("/widgets");
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return (
    <ThemeProvider defaultTheme="light">
      <QueryClientProvider client={queryClient}>
        <RouterProvider adapter={adapter}>
          <EntityExplorerApp
            client={client}
            {...(actions ? { actions } : {})}
            {...(surfaceTitleActions ? { surfaceTitleActions } : {})}
          />
        </RouterProvider>
      </QueryClientProvider>
    </ThemeProvider>
  );
}

function renderApp(
  actions?: ReactNode,
  client?: OperationsApiClient,
  surfaceTitleActions?: (surfaceKey: string) => ReactNode,
) {
  return render(
    <Harness
      {...(actions ? { actions } : {})}
      {...(client ? { client } : {})}
      {...(surfaceTitleActions ? { surfaceTitleActions } : {})}
    />,
  );
}

const editButton = (surfaceKey: string) => (
  <button type="button">{`Edit ${surfaceKey}`}</button>
);

describe("EntityExplorerApp", () => {
  it("renders a sidebar nav link for each surface declared in the spec", async () => {
    renderApp();
    // The "widgets" surface from makeClient()'s x-clicky spec renders as a
    // clickable nav link labelled with its title once the OpenAPI spec resolves.
    const links = await screen.findAllByRole("link", { name: "Widgets" });
    expect(links.length).toBeGreaterThan(0);
  });

  it("shows the spec's title as the AppShell brand", async () => {
    renderApp();
    // AppShell renders the brand in both the desktop rail and the mobile header,
    // so the title appears more than once in the DOM.
    const brands = await screen.findAllByText("test");
    expect(brands.length).toBeGreaterThan(0);
  });

  it("titles the collection route in the top bar instead of a body header row", async () => {
    const { container } = renderApp();
    const heading = await screen.findByRole("heading", { name: "Widgets" });
    expect(container.querySelector('[data-slot="app-shell-nav"]')).toContainElement(heading);
    expect(container.querySelector('[data-slot="app-shell-body-header"]')).toBeNull();
  });

  it("replaces the surface title with a breadcrumb while a drill-down portal is mounted", async () => {
    const parentHref = "/widgets?filter.kind=blue";
    const { container } = renderApp(
      <ExplorerNavPortal parentHref={parentHref}>
        <h1>Widget 42</h1>
      </ExplorerNavPortal>,
    );
    const breadcrumb = await screen.findByRole("navigation", { name: "Breadcrumb" });
    expect(container.querySelector('[data-slot="app-shell-nav"]')).toContainElement(breadcrumb);
    expect(within(breadcrumb).getByRole("link", { name: "Widgets" }).getAttribute("href")).toBe(parentHref);
    expect(screen.getByRole("heading", { name: "Widget 42" })).toBeTruthy();
    expect(screen.queryByRole("heading", { name: "Widgets" })).toBeNull();
  });

  it("keeps the surface title actions beside the title and beside the breadcrumb crumb", async () => {
    const { container, unmount } = renderApp(undefined, undefined, editButton);
    const edit = await screen.findByRole("button", { name: "Edit widgets" });
    expect(container.querySelector('[data-slot="app-shell-nav"]')).toContainElement(edit);
    unmount();

    const drilled = renderApp(
      <ExplorerNavPortal parentHref="/widgets">
        <h1>Widget 42</h1>
      </ExplorerNavPortal>,
      undefined,
      editButton,
    );
    const breadcrumb = await screen.findByRole("navigation", { name: "Breadcrumb" });
    expect(within(breadcrumb).getByRole("button", { name: "Edit widgets" })).toBeTruthy();
    expect(screen.getAllByRole("button", { name: "Edit widgets" })).toHaveLength(1);
    drilled.unmount();
  });

  it("gives the result surface the full workspace width", async () => {
    const { container } = renderApp();
    await screen.findByRole("heading", { name: "Widgets" });
    expect(
      container
        .querySelector('[data-slot="app-shell-content"]')
        ?.getAttribute("data-content-width"),
    ).toBe("full");
  });

  it("forwards host actions into the AppShell top bar", async () => {
    const { container } = renderApp(<button type="button">Open assistant</button>);
    const action = await screen.findByRole("button", { name: "Open assistant" });
    expect(container.querySelector('[data-slot="app-shell-actions"]')).toContainElement(action);
  });

  it.each([
    { mode: "paged" as const, stepControls: true },
    { mode: undefined, stepControls: false },
  ])(
    "pages a cursor-capable surface by offset only when the host asks for $mode mode",
    async ({ mode, stepControls }) => {
      // The catalog mirrors its offset into the URL; start every case on page one.
      window.history.replaceState(null, "", "/");
      const pageSize = 2;
      const rowCount = 5;
      const spec: OpenAPISpec = {
        openapi: "3.0.0",
        info: { title: "test", version: "1" },
        "x-clicky": { surfaces: [{ key: "widgets", entity: "widget", title: "Widgets" }] },
        paths: {
          "/api/v1/widgets": {
            get: {
              operationId: "widget_list",
              tags: ["widget"],
              responses: {},
              "x-clicky": { surface: "widgets", verb: "list", scope: "collection" },
              parameters: [
                { name: "limit", in: "query", schema: { type: "integer", default: pageSize }, "x-clicky": { role: "limit" } },
                { name: "cursor", in: "query", schema: { type: "string" }, "x-clicky": { role: "cursor" } },
                { name: "offset", in: "query", schema: { type: "integer" }, "x-clicky": { role: "offset" } },
              ],
            },
          },
        },
      };
      const offsets: number[] = [];
      const client: OperationsApiClient = {
        getOpenAPISpec: () => Promise.resolve(spec),
        executeCommand: (_path, _method, params) => {
          const offset = Number((params as Record<string, string>).offset ?? 0);
          offsets.push(offset);
          const names = Array.from({ length: rowCount }, (_, index) => `Widget ${index + 1}`).slice(offset, offset + pageSize);
          const parsed = {
            version: 1 as const,
            node: {
              kind: "table" as const,
              columns: [{ name: "name", label: "Name" }],
              rows: names.map((name) => ({ cells: { name: { kind: "text" as const, text: name, plain: name } } })),
            },
          };
          const next = offset + names.length;
          return Promise.resolve({
            success: true,
            exit_code: 0,
            contentType: "application/json+clicky",
            stdout: JSON.stringify(parsed),
            parsed,
            pagination: {
              total: rowCount,
              limit: pageSize,
              offset,
              hasMore: next < rowCount,
              ...(next < rowCount ? { nextCursor: `after-${next}` } : {}),
            },
          });
        },
      };
      const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });
      function PagedHarness() {
        const router = useMemoryRouter("/widgets");
        return (
          <ThemeProvider defaultTheme="light">
            <QueryClientProvider client={queryClient}>
              <RouterProvider adapter={router}>
                <EntityExplorerApp
                  client={client}
                  {...(mode ? { surfacePaginationMode: (key: string) => (key === "widgets" ? mode : undefined) } : {})}
                />
              </RouterProvider>
            </QueryClientProvider>
          </ThemeProvider>
        );
      }
      render(<PagedHarness />);
      expect(await screen.findByText("Widget 1")).toBeInTheDocument();
      if (!stepControls) {
        expect(screen.queryByRole("button", { name: "Next page" })).toBeNull();
        return;
      }
      fireEvent.click(screen.getByRole("button", { name: "Next page" }));
      expect(await screen.findByText("Widget 3")).toBeInTheDocument();
      expect(screen.queryByText("Widget 1")).toBeNull();
      expect(offsets).toContain(pageSize);
    },
  );

  it("hides the previous profile body behind a centered loader while switching profiles", async () => {
    let resolveGadgets!: (value: Awaited<ReturnType<OperationsApiClient["executeCommand"]>>) => void;
    const gadgets = new Promise<Awaited<ReturnType<OperationsApiClient["executeCommand"]>>>(
      (resolve) => {
        resolveGadgets = resolve;
      },
    );
    const spec: OpenAPISpec = {
      openapi: "3.0.0",
      info: { title: "test", version: "1" },
      "x-clicky": {
        surfaces: [
          { key: "widgets", entity: "widget", title: "Widgets" },
          { key: "gadgets", entity: "gadget", title: "Gadgets" },
        ],
      },
      paths: {
        "/api/v1/widgets": {
          get: {
            operationId: "widget_list",
            responses: {},
            "x-clicky": { surface: "widgets", verb: "list", scope: "collection" },
          },
          post: {
            operationId: "widget_create",
            responses: {},
            "x-clicky": { surface: "widgets", verb: "create", scope: "collection" },
          },
        },
        "/api/v1/gadgets": {
          get: {
            operationId: "gadget_list",
            responses: {},
            "x-clicky": { surface: "gadgets", verb: "list", scope: "collection" },
          },
          post: {
            operationId: "gadget_create",
            responses: {},
            "x-clicky": { surface: "gadgets", verb: "create", scope: "collection" },
          },
        },
      },
    };
    const response = (label: string) => {
      const parsed = {
        version: 1 as const,
        node: {
          kind: "table" as const,
          columns: [{ name: "Name", label: "Name" }],
          rows: [{ cells: { Name: { kind: "text" as const, plain: label } } }],
        },
      };
      return {
        success: true,
        exit_code: 0,
        contentType: "application/json+clicky",
        stdout: JSON.stringify(parsed),
        parsed,
      };
    };
    const client: OperationsApiClient = {
      getOpenAPISpec: () => Promise.resolve(spec),
      executeCommand: (path) =>
        path === "/api/v1/gadgets" ? gadgets : Promise.resolve(response("Widget one")),
    };

    renderApp(undefined, client);
    expect(await screen.findByRole("button", { name: "Create" })).toBeInTheDocument();

    fireEvent.click((await screen.findAllByRole("link", { name: "Gadgets" }))[0]!);

    expect(await screen.findByRole("heading", { name: "Gadgets" })).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "Create" })).not.toBeInTheDocument();
    expect(screen.getByRole("status", { name: "Loading" })).toBeInTheDocument();
    expect(screen.getAllByRole("link", { name: "Widgets" }).length).toBeGreaterThan(0);

    resolveGadgets(response("Gadget one"));
    expect(await screen.findByRole("button", { name: "Create" })).toBeInTheDocument();
    await waitFor(() =>
      expect(screen.queryByRole("status", { name: "Loading" })).not.toBeInTheDocument(),
    );
  });
});
