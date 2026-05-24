import { useMemo } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { OperationCatalog } from "@flanksource/clicky-ui/rpc";
import type {
  ExecutionResponse,
  OpenAPISpec,
  OperationsApiClient,
  RenderLink,
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
          { name: "q", in: "query", schema: { type: "string" }, description: "Search query" },
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

const renderDemoLink: RenderLink = ({ to, className, children, title, key }) => (
  <a
    key={key}
    href={to}
    className={className}
    title={title}
    onClick={(event) => event.preventDefault()}
  >
    {children}
  </a>
);

export function OperationExplorerDemo() {
  const queryClient = useMemo(
    () => new QueryClient({ defaultOptions: { queries: { retry: false, gcTime: 0 } } }),
    [],
  );

  return (
    <DemoSection
      id="operation-explorer"
      title="OperationCatalog"
      description={
        <>
          Operations-mode explorer driven by an in-memory <code>OpenAPISpec</code> with{" "}
          <code>x-clicky</code> surface metadata. The fake <code>OperationsApiClient</code> returns
          a Clicky table for the list endpoint; navigation links are intercepted so the demo doesn't
          hijack the kitchen-sink URL. Filter inputs still write to <code>?q=…</code> on the page —
          a known side effect of <code>OperationCatalog</code>.
        </>
      }
    >
      <QueryClientProvider client={queryClient}>
        <div className="h-[640px] overflow-auto rounded-md border border-border p-4">
          <OperationCatalog
            definition={{
              key: "widgets",
              title: "Widgets",
              description: "Demo widget surface backed by a fake client.",
            }}
            entities={["widget"]}
            client={FAKE_CLIENT}
            renderLink={renderDemoLink}
            surfaceKey="widgets"
          />
        </div>
      </QueryClientProvider>
    </DemoSection>
  );
}
