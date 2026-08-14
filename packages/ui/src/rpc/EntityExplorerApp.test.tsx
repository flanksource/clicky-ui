import { render, screen } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { describe, expect, it } from "vitest";
import type { ReactNode } from "react";
import type { OpenAPISpec } from "./types";
import type { OperationsApiClient } from "./useOperations";
import { EntityExplorerApp } from "./EntityExplorerApp";
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

function Harness({ actions }: { actions?: ReactNode }) {
  const adapter = useMemoryRouter("/widgets");
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return (
    <ThemeProvider defaultTheme="light">
      <QueryClientProvider client={queryClient}>
        <RouterProvider adapter={adapter}>
          <EntityExplorerApp
            client={makeClient()}
            {...(actions ? { actions } : {})}
          />
        </RouterProvider>
      </QueryClientProvider>
    </ThemeProvider>
  );
}

function renderApp(actions?: ReactNode) {
  return render(<Harness {...(actions ? { actions } : {})} />);
}

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
});
