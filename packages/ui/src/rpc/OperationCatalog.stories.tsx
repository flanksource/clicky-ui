import type { Meta, StoryObj } from "@storybook/react-vite";
import { useEffect, useMemo, type ComponentProps } from "react";
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
  const filtered = SAMPLE_ROWS.filter((row) =>
    params.kind ? row.kind === params.kind : true,
  );
  const rows = [...filtered]
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
      total: filtered.length,
      limit,
      offset,
      hasMore: offset + rows.length < filtered.length,
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

// A trace-results-style embedding: `kind` is pinned by the host (so only "big"
// widgets ever show, and no "Kind" filter chip is rendered), the URL round-trip
// is namespaced under a "story" prefix so it would not collide with a host
// route's own query params, and each row expands into host-rendered detail —
// none of which disturb the native paging/filters/sort/export the table still
// drives.
export const LockedValuesAndRowDetail: StoryObj<typeof OperationCatalog> = {
  args: {
    lockedValues: { kind: "big" },
    urlState: { prefix: "story" },
    rowDetail: {
      render: (row) => (
        <div className="space-y-1 p-density-3 text-sm">
          <div className="font-semibold">{String(row.name)}</div>
          <div className="text-muted-foreground">
            Raw id: <code>{String(row.id)}</code>
          </div>
        </div>
      ),
    },
  },
  render: (args) => <CatalogShowcase {...args} />,
  parameters: {
    docs: {
      description: {
        story:
          "lockedValues pins `kind=big` (sent on every request, hidden from the filter bar); urlState namespaces the URL under `story.*`; rowDetail.render expands a clicked row with host-owned content built from raw cell values.",
      },
    },
  },
};

// The list operation `follow` targets needs its own `POST .../sessions`
// operation advertised — FAKE_CLIENT's spec has none, so it is extended here
// rather than shared with the stories above.
const FOLLOW_SPEC: OpenAPISpec = {
  ...SAMPLE_SPEC,
  paths: {
    ...SAMPLE_SPEC.paths,
    "/api/v1/widgets/sessions": {
      post: {
        operationId: "start-widgets-session",
        summary: "Follow widgets",
        responses: { "201": { description: "Session started" } },
      },
    },
  },
};

const FOLLOW_CLIENT: OperationsApiClient = {
  ...FAKE_CLIENT,
  async getOpenAPISpec(): Promise<OpenAPISpec> {
    return FOLLOW_SPEC;
  },
};

// FollowFakeEventSource emits one new widget row on an interval, standing in
// for the commons-db sessions SSE stream `useLogTail` opens once
// OperationCatalog's `follow` prop resolves a session-start operation — there
// is no real server for a story to hit.
class FollowFakeEventSource {
  static instances: FollowFakeEventSource[] = [];
  onerror: ((e: unknown) => void) | null = null;
  private listeners: Record<string, ((e: MessageEvent) => void)[]> = {};
  private timer: ReturnType<typeof setInterval> | undefined;
  private sequence = 0;

  constructor(public url: string) {
    FollowFakeEventSource.instances.push(this);
    this.timer = setInterval(() => this.emitNextRow(), 1500);
  }

  addEventListener(type: string, fn: (e: MessageEvent) => void) {
    (this.listeners[type] ||= []).push(fn);
  }

  private emitNextRow() {
    this.sequence += 1;
    const row = {
      id: `wgt_live_${this.sequence}`,
      name: `Live widget ${this.sequence}`,
      kind: this.sequence % 2 === 0 ? "big" : "small",
      updated: new Date().toISOString().slice(0, 10),
    };
    // `clickyRow` is the presented row every trace/follow event carries next
    // to `row` — the same shape `sampleListResponse` above builds for
    // node.rows[n] — so OperationCatalog's follow merge (which now reads
    // `clickyRow` directly rather than guessing a ClickyNode from raw JSON)
    // has one to fold in.
    const clickyRow = {
      cells: Object.fromEntries(
        Object.entries(row).map(([key, value]) => [
          key,
          { kind: "text" as const, text: value, plain: value },
        ]),
      ),
    };
    const frame = { sessionId: "story-session", sequence: this.sequence, row, clickyRow };
    for (const fn of this.listeners.event ?? []) {
      fn({ data: JSON.stringify(frame) } as MessageEvent);
    }
  }

  close() {
    if (this.timer) clearInterval(this.timer);
  }
}

// FollowShowcase installs the fake session transport only while it is
// mounted — `window.fetch`/`window.EventSource` are restored on unmount, so
// this story never leaks into any story rendered alongside or after it.
function FollowShowcase(args: ComponentProps<typeof OperationCatalog>) {
  const queryClient = useMemo(
    () => new QueryClient({ defaultOptions: { queries: { retry: false, gcTime: 0 } } }),
    [],
  );

  useEffect(() => {
    const originalFetch = window.fetch;
    const originalEventSource = window.EventSource;
    let nextSessionId = 1;

    window.fetch = (async (input: RequestInfo | URL, init?: RequestInit) => {
      const url = typeof input === "string" ? input : input.toString();
      const method = (init?.method ?? "GET").toUpperCase();
      if (method === "POST" && url.includes("/widgets/sessions")) {
        const id = `story-session-${nextSessionId++}`;
        return new Response(
          JSON.stringify({
            id,
            profile: "widgets",
            kind: "list",
            state: "running",
            eventCount: 0,
            startedAt: new Date().toISOString(),
          }),
          { status: 201 },
        );
      }
      if (method === "DELETE" && url.includes("/sessions/")) {
        return new Response("", { status: 204 });
      }
      return originalFetch(input, init);
    }) as typeof fetch;
    window.EventSource = FollowFakeEventSource as unknown as typeof EventSource;

    return () => {
      window.fetch = originalFetch;
      window.EventSource = originalEventSource;
      for (const instance of FollowFakeEventSource.instances) instance.close();
      FollowFakeEventSource.instances = [];
    };
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <div className="h-[640px] overflow-auto rounded-md border border-border p-density-4">
        <OperationCatalog {...args} />
      </div>
    </QueryClientProvider>
  );
}

// follow=true opens a live session over the widgets list operation's
// advertised POST .../sessions endpoint and folds newly-arrived rows into the
// table without a refetch — the compact status pill above the table shows
// Live/dropped-rows/stream-error state.
export const Follow: StoryObj<typeof OperationCatalog> = {
  args: {
    client: FOLLOW_CLIENT,
    follow: true,
  },
  render: (args) => <FollowShowcase {...args} />,
  parameters: {
    docs: {
      description: {
        story:
          "follow=true starts a live session over the list operation's advertised `POST .../sessions` endpoint and merges newly-arrived rows into the table as they stream in — demonstrated here with a fake EventSource that emits one new widget every 1.5s instead of a real commons-db session.",
      },
    },
  },
};
