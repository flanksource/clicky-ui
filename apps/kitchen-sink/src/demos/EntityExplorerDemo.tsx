import { useMemo } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { EntityExplorerApp } from "@flanksource/clicky-ui/rpc";
import type {
  ExecutionResponse,
  OpenAPISpec,
  OperationsApiClient,
  RenderLink,
} from "@flanksource/clicky-ui/rpc";
import { mockChatTransport, MOCK_MODELS } from "@flanksource/clicky-ui/chat";
import type { ThreadSource, ThreadSummary } from "@flanksource/clicky-ui/ai";
import { DemoSection } from "./Section";

// In-memory thread source for the assistant's conversation switcher — the demo
// has no chat backend, so it serves sample threads (and supports delete)
// directly instead of fetching an endpoint.
const SAMPLE_THREADS: ThreadSummary[] = [
  { id: "t-001", title: "Reconcile stuck widgets", totalCostUsd: 0.12 },
  { id: "t-002", title: "Why is wgt_77 failing?", totalCostUsd: 0.04 },
];
let threads = [...SAMPLE_THREADS];
const THREADS_SOURCE: ThreadSource = {
  load: () => Promise.resolve(threads),
  remove: (id) => {
    threads = threads.filter((t) => t.id !== id);
    return Promise.resolve();
  },
};

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

// Navigation links are intercepted so the demo doesn't push history onto the
// kitchen-sink URL; the explorer therefore stays on the widgets surface.
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

export function EntityExplorerDemo() {
  const queryClient = useMemo(
    () => new QueryClient({ defaultOptions: { queries: { retry: false, gcTime: 0 } } }),
    [],
  );

  return (
    <DemoSection
      id="entity-explorer"
      title="EntityExplorerApp"
      description={
        <>
          The full metadata-driven entity explorer — surface sidebar, Clicky table and action
          dialogs — driven by an in-memory <code>OpenAPISpec</code> with <code>x-clicky</code> surface
          metadata. The <code>chat</code> prop mounts the floating assistant (FAB, bottom-right) whose
          tool-preferences popover is derived from the very same RPC operations the explorer exposes,
          grouped by surface and defaulting to <em>Ask</em> (human approval). The assistant footer
          carries a model picker with provider brand icons and a token/cost gauge; the header has a
          conversation thread switcher (mock data). Navigation links are intercepted so the demo
          doesn&apos;t hijack the kitchen-sink URL.
        </>
      }
    >
      <QueryClientProvider client={queryClient}>
        <div className="h-[640px] overflow-auto rounded-md border border-border p-4">
          <EntityExplorerApp
            client={FAKE_CLIENT}
            pathname="/widgets"
            renderLink={renderDemoLink}
            showApiExplorer={false}
            chat={{
              transport: mockChatTransport(),
              models: MOCK_MODELS,
              modelsApi: null,
              defaultModel: "anthropic/claude-sonnet-4-5",
            }}
            chatThreadsSource={THREADS_SOURCE}
          />
        </div>
      </QueryClientProvider>
    </DemoSection>
  );
}
