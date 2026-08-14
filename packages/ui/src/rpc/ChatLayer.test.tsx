import { render, screen, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { describe, expect, it, vi } from "vitest";
import type { ToolMeta } from "../data/ai/ToolPreferences";
import type { OpenAPISpec } from "./types";
import type { OperationsApiClient } from "./useOperations";
import { ChatLayer } from "./ChatLayer";

vi.mock("../data/ai/ChatWindow", () => ({
  ChatWindowLayer: ({ tools }: { tools: ToolMeta[] }) => (
    <output aria-label="Chat tools">{JSON.stringify(tools)}</output>
  ),
}));

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
        responses: {},
        "x-clicky": { surface: "widgets", verb: "list", scope: "collection" },
      },
    },
    "/api/schema": {
      get: {
        operationId: "schema",
        responses: {},
      },
    },
  },
};

const client: OperationsApiClient = {
  getOpenAPISpec: () => Promise.resolve(spec),
  executeCommand: () =>
    Promise.resolve({ success: true, exit_code: 0, contentType: "text/plain", stdout: "" }),
};

describe("ChatLayer", () => {
  it("filters operations and groups tools with spec surfaces", async () => {
    const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });
    render(
      <QueryClientProvider client={queryClient}>
        <ChatLayer
          client={client}
          operationFilter={(operation) => operation.operation.operationId !== "schema"}
        />
      </QueryClientProvider>,
    );

    await waitFor(() => {
      const tools = JSON.parse(screen.getByLabelText("Chat tools").textContent ?? "[]");
      expect(tools).toMatchObject([
        { name: "widget_list", group: "widgets", parent: "Widgets", entity: "widget" },
      ]);
    });
  });
});
