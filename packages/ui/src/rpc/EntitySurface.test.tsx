import { render, screen } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { describe, expect, it, vi } from "vitest";
import type { OpenAPISpec } from "./types";
import type { OperationsApiClient } from "./useOperations";
import { EntitySurface } from "./EntitySurface";
import { useMemoryRouter } from "./router";
import { RouterProvider } from "./RouterProvider";

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
        summary: "List widgets",
        responses: {},
        "x-clicky": { surface: "widgets", verb: "list", scope: "collection" },
      },
    },
    "/api/v1/gadgets": {
      get: {
        operationId: "gadget_list",
        summary: "List gadgets",
        responses: {},
        "x-clicky": { surface: "gadgets", verb: "list", scope: "collection" },
      },
    },
  },
};

function Harness({ surfaceKey, client }: { surfaceKey: string; client: OperationsApiClient }) {
  const adapter = useMemoryRouter("/connection/k3s");
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return (
    <QueryClientProvider client={queryClient}>
      <RouterProvider adapter={adapter}>
        <EntitySurface client={client} surfaceKey={surfaceKey} />
      </RouterProvider>
    </QueryClientProvider>
  );
}

describe("EntitySurface", () => {
  it("lists the one surface it names, away from the explorer's own route", async () => {
    const executeCommand = vi.fn(() =>
      Promise.resolve({ success: true, exit_code: 0, contentType: "text/plain", stdout: "" }),
    );
    render(<Harness surfaceKey="gadgets" client={{ getOpenAPISpec: () => Promise.resolve(spec), executeCommand }} />);

    await vi.waitFor(() => expect(executeCommand).toHaveBeenCalled());
    const paths = executeCommand.mock.calls.map((call) => (call as unknown[])[0]);
    expect(paths).toContain("/api/v1/gadgets");
    expect(paths).not.toContain("/api/v1/widgets");
  });

  it("names a surface the spec does not declare", async () => {
    render(
      <Harness
        surfaceKey="missing"
        client={{ getOpenAPISpec: () => Promise.resolve(spec), executeCommand: vi.fn() }}
      />,
    );

    expect(await screen.findByText("missing")).toBeInTheDocument();
    expect(screen.getByText(/Unknown surface/)).toBeInTheDocument();
  });
});
