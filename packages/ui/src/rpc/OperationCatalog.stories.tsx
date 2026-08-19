import type { Meta, StoryObj } from "@storybook/react-vite";
import { useMemo, type ComponentProps } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { OperationCatalog } from "./OperationCatalog";
import type { RenderLink } from "./EndpointList";
import type { ExecutionResponse, OpenAPISpec } from "./types";
import type { OperationsApiClient } from "./useOperations";

const SAMPLE_SPEC: OpenAPISpec = {
  openapi: "3.0.0",
  info: { title: "Widget Service", version: "1.0.0" },
  "x-clicky": {
    surfaces: [
      {
        key: "widgets",
        entity: "widget",
        title: "Widgets",
        description: "Demo widget surface.",
      },
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
          },
          {
            name: "kind",
            in: "query",
            schema: { type: "string", enum: ["big", "small"] },
            description: "Widget kind",
          },
          {
            name: "sort",
            in: "query",
            schema: {
              type: "string",
              enum: ["name", "updated"],
              default: "updated",
            },
            "x-clicky": { role: "sort" },
          },
          {
            name: "order",
            in: "query",
            schema: { type: "string", enum: ["asc", "desc"], default: "desc" },
            "x-clicky": { role: "order" },
          },
          {
            name: "limit",
            in: "query",
            schema: { type: "integer", default: 2 },
            "x-clicky": { role: "limit" },
          },
          {
            name: "offset",
            in: "query",
            schema: { type: "integer", default: 0 },
            "x-clicky": { role: "offset" },
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
        parameters: [
          {
            name: "id",
            in: "path",
            required: true,
            schema: { type: "string" },
          },
        ],
        responses: { "200": { description: "OK" } },
        "x-clicky": {
          surface: "widgets",
          verb: "get",
          scope: "entity",
          idParam: "id",
        },
      },
      delete: {
        operationId: "widget_delete",
        summary: "Delete widget",
        tags: ["widget"],
        parameters: [
          {
            name: "id",
            in: "path",
            required: true,
            schema: { type: "string" },
          },
        ],
        responses: { "204": { description: "Deleted" } },
        "x-clicky": {
          surface: "widgets",
          verb: "delete",
          scope: "entity",
          idParam: "id",
        },
      },
    },
  },
};

const SAMPLE_ROWS = [
  { id: "wgt_42", name: "Hex bolt", kind: "small", updated: "2026-08-17" },
  { id: "wgt_77", name: "Flange gasket", kind: "big", updated: "2026-08-19" },
  { id: "wgt_13", name: "Anchor plate", kind: "big", updated: "2026-08-18" },
  { id: "wgt_91", name: "Lock washer", kind: "small", updated: "2026-08-16" },
];

function sampleListResponse(params: Record<string, string>): ExecutionResponse {
  const sort = params.sort || "updated";
  const order = params.order || "desc";
  const limit = Number(params.limit || 2);
  const offset = Number(params.offset || 0);
  const rows = [...SAMPLE_ROWS]
    .sort((left, right) => {
      const comparison = left[sort as "name" | "updated"].localeCompare(
        right[sort as "name" | "updated"],
      );
      return order === "desc" ? -comparison : comparison;
    })
    .slice(offset, offset + limit);
  const document = {
    version: 1,
    node: {
      kind: "table",
      columns: [
        { name: "id", label: "ID" },
        { name: "name", label: "Name", sortKey: "name" },
        { name: "kind", label: "Kind" },
        { name: "updated", label: "Updated", sortKey: "updated" },
      ],
      rows: rows.map((row) => ({
        cells: Object.fromEntries(
          Object.entries(row).map(([key, value]) => [
            key,
            { kind: "text", text: value, plain: value },
          ]),
        ),
      })),
    },
  } as const;
  return {
    success: true,
    exit_code: 0,
    contentType: "application/json+clicky",
    parsed: document,
    stdout: JSON.stringify(document),
    pagination: {
      total: SAMPLE_ROWS.length,
      limit,
      offset,
      hasMore: offset + rows.length < SAMPLE_ROWS.length,
    },
  };
}

const FAKE_CLIENT: OperationsApiClient = {
  async getOpenAPISpec(): Promise<OpenAPISpec> {
    return SAMPLE_SPEC;
  },
  async executeCommand(path, method, params): Promise<ExecutionResponse> {
    if (method === "get" && path === "/api/v1/widgets") {
      return sampleListResponse(params);
    }
    return {
      success: true,
      exit_code: 0,
      contentType: "text/plain",
      stdout: `Pretending to ${method.toUpperCase()} ${path}`,
    };
  },
};

const renderDemoLink: RenderLink = ({
  to,
  className,
  children,
  title,
  key,
}) => (
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

function CatalogShowcase(args: ComponentProps<typeof OperationCatalog>) {
  const queryClient = useMemo(
    () =>
      new QueryClient({
        defaultOptions: { queries: { retry: false, gcTime: 0 } },
      }),
    [],
  );
  return (
    <QueryClientProvider client={queryClient}>
      <div className="h-[640px] overflow-auto rounded-md border border-border p-density-4">
        <OperationCatalog {...args} />
      </div>
    </QueryClientProvider>
  );
}

const meta: Meta<typeof OperationCatalog> = {
  title: "Clicky-RPC/OperationCatalog",
  component: OperationCatalog,
  args: {
    definition: {
      key: "widgets",
      title: "Widgets",
      description: "Demo widget surface backed by a fake client.",
    },
    entities: ["widget"],
    client: FAKE_CLIENT,
    renderLink: renderDemoLink,
    surfaceKey: "widgets",
  },
  argTypes: {
    client: { table: { disable: true } },
    renderLink: { table: { disable: true } },
  },
  parameters: {
    docs: {
      description: {
        component:
          "Operations-mode explorer driven by an in-memory OpenAPISpec with x-clicky surface metadata. The fake OperationsApiClient returns a Clicky table for the list endpoint and navigation links are intercepted. Note: filter inputs still write to ?q=… on the page — a known OperationCatalog side effect.",
      },
    },
  },
};

export default meta;

export const Default: StoryObj<typeof OperationCatalog> = {
  render: (args) => <CatalogShowcase {...args} />,
};
