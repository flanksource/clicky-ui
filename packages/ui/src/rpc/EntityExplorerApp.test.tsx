import { render, screen } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { describe, expect, it } from "vitest";
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

function Harness() {
  const adapter = useMemoryRouter("/widgets");
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return (
    <ThemeProvider defaultTheme="light">
      <QueryClientProvider client={queryClient}>
        <RouterProvider adapter={adapter}>
          <EntityExplorerApp client={makeClient()} />
        </RouterProvider>
      </QueryClientProvider>
    </ThemeProvider>
  );
}

function renderApp() {
  return render(<Harness />);
}

describe("EntityExplorerApp", () => {
  it("renders a sidebar nav link for each surface declared in the spec", async () => {
    renderApp();
    // The "widgets" surface from makeClient()'s x-clicky spec renders as a
    // clickable nav link labelled with its title once the OpenAPI spec resolves.
    const links = await screen.findAllByRole("link", { name: "Widgets" });
    expect(links.length).toBeGreaterThan(0);
  });

  it("shows the spec's title in the sidebar header", async () => {
    renderApp();
    expect(await screen.findByText("test")).toBeTruthy();
  });
});
