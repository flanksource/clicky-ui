import { useMemo } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { EntityExplorerApp, RouterProvider, useMemoryRouter } from "@flanksource/clicky-ui/rpc";
import type {
  ExecutionResponse,
  OpenAPISpec,
  OperationsApiClient,
} from "@flanksource/clicky-ui/rpc";
import { DemoSection } from "./Section";

const SAMPLE_SPEC: OpenAPISpec = {
  openapi: "3.0.0",
  info: { title: "Widget Service", version: "1.0.0" },
  "x-clicky": {
    surfaces: [
      { key: "widgets", entity: "widget", title: "Widgets", description: "Demo widget surface." },
    ],
  },
  paths: {
    "/api/v1/widgets": {
      get: {
        operationId: "widget_list",
        summary: "List widgets",
        tags: ["widget"],
        parameters: [
          {
            name: "q",
            in: "query",
            schema: { type: "string" },
            description: "Search query",
            "x-clicky": { role: "search" },
          },
          {
            name: "kind",
            in: "query",
            schema: { type: "string", enum: ["big", "small"] },
            description: "Widget kind",
          },
        ],
        responses: { "200": { description: "OK" } },
        "x-clicky": { surface: "widgets", verb: "list", scope: "collection" },
      },
      post: {
        operationId: "widget_create",
        summary: "Create widget",
        tags: ["widget"],
        responses: { "201": { description: "Created" } },
        "x-clicky": { surface: "widgets", verb: "create", scope: "collection" },
      },
    },
    "/api/v1/widgets/{id}": {
      get: {
        operationId: "widget_get",
        summary: "Get widget",
        tags: ["widget"],
        parameters: [{ name: "id", in: "path", required: true, schema: { type: "string" } }],
        responses: { "200": { description: "OK" } },
        "x-clicky": { surface: "widgets", verb: "get", scope: "entity", idParam: "id" },
      },
      delete: {
        operationId: "widget_delete",
        summary: "Delete widget",
        tags: ["widget"],
        parameters: [{ name: "id", in: "path", required: true, schema: { type: "string" } }],
        responses: { "204": { description: "Deleted" } },
        "x-clicky": { surface: "widgets", verb: "delete", scope: "entity", idParam: "id" },
      },
    },
  },
};

const SAMPLE_LIST_RESPONSE: ExecutionResponse = {
  success: true,
  exit_code: 0,
  contentType: "application/json",
  stdout: JSON.stringify({
    version: 1,
    node: {
      kind: "table",
      columns: [
        { name: "id", label: "ID" },
        { name: "name", label: "Name" },
        { name: "kind", label: "Kind" },
      ],
      rows: [
        {
          cells: {
            id: { kind: "text", text: "wgt_42", plain: "wgt_42" },
            name: { kind: "text", text: "Hex bolt", plain: "Hex bolt" },
            kind: { kind: "text", text: "small", plain: "small" },
          },
        },
        {
          cells: {
            id: { kind: "text", text: "wgt_77", plain: "wgt_77" },
            name: { kind: "text", text: "Flange gasket", plain: "Flange gasket" },
            kind: { kind: "text", text: "big", plain: "big" },
          },
        },
      ],
    },
  }),
};

const FAKE_CLIENT: OperationsApiClient = {
  async getOpenAPISpec(): Promise<OpenAPISpec> {
    return SAMPLE_SPEC;
  },
  async executeCommand(path, method): Promise<ExecutionResponse> {
    if (method === "get" && path === "/api/v1/widgets") {
      return SAMPLE_LIST_RESPONSE;
    }
    return {
      success: true,
      exit_code: 0,
      contentType: "text/plain",
      stdout: `Pretending to ${method.toUpperCase()} ${path}`,
    };
  },
};

export function EntityExplorerDemo() {
  const queryClient = useMemo(
    () => new QueryClient({ defaultOptions: { queries: { retry: false, gcTime: 0 } } }),
    [],
  );
  // An in-memory adapter keeps navigation inside the demo: clicking a surface
  // link switches routes without touching the kitchen-sink's own URL.
  const router = useMemoryRouter("/widgets");

  return (
    <DemoSection
      id="entity-explorer"
      title="EntityExplorerApp"
      description={
        <>
          The full metadata-driven entity explorer — surface sidebar, Clicky table and action
          dialogs — driven by an in-memory <code>OpenAPISpec</code> with <code>x-clicky</code> surface
          metadata. The AI assistant is opt-in and mounted separately by the host; this demo shows
          the explorer on its own. Navigation is driven by an in-memory <code>RouterAdapter</code>
          (via <code>RouterProvider</code>), so surface links switch routes without touching the
          kitchen-sink URL.
        </>
      }
    >
      <QueryClientProvider client={queryClient}>
        <RouterProvider adapter={router}>
          <div className="h-[640px] overflow-auto rounded-md border border-border p-4">
            <EntityExplorerApp client={FAKE_CLIENT} showApiExplorer={false} />
          </div>
        </RouterProvider>
      </QueryClientProvider>
    </DemoSection>
  );
}
