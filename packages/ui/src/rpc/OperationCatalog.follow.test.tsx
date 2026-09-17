import { act, cleanup, render, screen, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { OperationCatalog } from "./OperationCatalog";
import type { RenderLink } from "./EndpointList";
import type { ExecutionResponse, OpenAPISpec } from "./types";
import type { OperationsApiClient } from "./useOperations";
import type { LogSessionInfo } from "../hooks/use-log-tail";
import type { OperationCatalogFollowOption } from "./useOperationCatalogFollow";

// OperationCatalog.follow.test.tsx exercises the `follow` prop end to end:
// starting a session with the effective params, folding live rows into the
// table, restarting on a filter/lockedValues change, stopping on unmount, and
// the two failure surfaces (no session-start operation advertised; a stream
// error). The pure merge/param/detection logic has its own focused unit
// tests in operationCatalogFollow.test.ts — this file is only about wiring
// those into the rendered catalog.

const LIST_PATH = "/api/v1/profile/things";
const SESSIONS_PATH = `${LIST_PATH}/sessions`;
const SESSION_ID = "sess-1";

class MockEventSource {
  static instances: MockEventSource[] = [];
  url: string;
  onerror: ((e: unknown) => void) | null = null;
  closed = false;
  private listeners: Record<string, ((e: MessageEvent) => void)[]> = {};

  constructor(url: string) {
    this.url = url;
    MockEventSource.instances.push(this);
  }
  addEventListener(type: string, fn: (e: MessageEvent) => void) {
    (this.listeners[type] ||= []).push(fn);
  }
  emit(type: string, data: unknown) {
    for (const fn of this.listeners[type] ?? []) {
      fn({ data: JSON.stringify(data) } as MessageEvent);
    }
  }
  close() {
    this.closed = true;
  }
}

function makeSpec({ withSessions = true } = {}): OpenAPISpec {
  const paths: OpenAPISpec["paths"] = {
    [LIST_PATH]: {
      get: {
        operationId: "things_list",
        "x-clicky": { surface: "things", verb: "list", scope: "collection" },
        parameters: [
          { name: "stream", in: "query", schema: { type: "string" }, "x-clicky": { role: "filter" } },
          { name: "status", in: "query", schema: { type: "string" }, "x-clicky": { role: "filter" } },
          { name: "limit", in: "query", schema: { type: "integer" }, "x-clicky": { role: "limit" } },
          { name: "offset", in: "query", schema: { type: "integer" }, "x-clicky": { role: "offset" } },
        ],
        responses: {},
      },
    },
  };
  if (withSessions) {
    paths[SESSIONS_PATH] = {
      post: { operationId: "start-things-session", responses: {} },
    };
  }
  return { openapi: "3.0.0", info: { title: "test", version: "1" }, paths };
}

function tableRow(id: string, status: string) {
  return {
    cells: {
      _id: { kind: "text" as const, text: id, plain: id },
      status: { kind: "text" as const, text: status, plain: status },
    },
  };
}

function listResponse(rows: ReturnType<typeof tableRow>[]): ExecutionResponse {
  const document = {
    version: 1 as const,
    node: {
      kind: "table" as const,
      columns: [
        { name: "_id", label: "ID" },
        { name: "status", label: "Status" },
      ],
      rows,
    },
  };
  return {
    success: true,
    exit_code: 0,
    parsed: document,
    stdout: JSON.stringify(document),
    pagination: { total: rows.length, limit: 100, offset: 0, totalRelation: "eq" },
  };
}

function makeClient(spec: OpenAPISpec, response: ExecutionResponse): OperationsApiClient {
  return {
    getOpenAPISpec: async () => spec,
    executeCommand: vi.fn().mockResolvedValue(response),
    lookupFilters: vi.fn().mockResolvedValue({ filters: {} }),
  };
}

const renderFakeLink: RenderLink = ({ to, className, children, title, key }) => (
  <a key={key} href={to} className={className} title={title}>
    {children}
  </a>
);

const sessionInfo = (overrides: Partial<LogSessionInfo> = {}): LogSessionInfo => ({
  id: SESSION_ID,
  profile: "things",
  kind: "list",
  state: "running",
  eventCount: 0,
  startedAt: "2026-09-01T00:00:00Z",
  ...overrides,
});

const jsonResponse = (status: number, body: unknown) => ({
  ok: status >= 200 && status < 300,
  status,
  json: async () => body,
  text: async () => (typeof body === "string" ? body : JSON.stringify(body)),
});

/** Answers every POST with a fresh session id ("sess-1", "sess-2", …); DELETE is not a served route. */
function stubFetch() {
  let nextId = 1;
  const mock = vi.fn(async (url: string, init?: RequestInit) => {
    const method = (init?.method ?? "GET").toUpperCase();
    if (method === "POST") return jsonResponse(201, sessionInfo({ id: `sess-${nextId++}` }));
    if (method === "DELETE") return jsonResponse(405, "DELETE /sessions/{id} is not served");
    return jsonResponse(200, []);
  });
  vi.stubGlobal("fetch", mock);
  return mock;
}

const postCalls = (mock: ReturnType<typeof stubFetch>) =>
  mock.mock.calls.filter(([, init]) => (init as RequestInit | undefined)?.method === "POST");
const deleteCalls = (mock: ReturnType<typeof stubFetch>) =>
  mock.mock.calls.filter(([, init]) => (init as RequestInit | undefined)?.method === "DELETE");

function renderCatalog(props: {
  client: OperationsApiClient;
  follow?: OperationCatalogFollowOption;
  lockedValues?: Record<string, string>;
}) {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false, gcTime: 0 } } });
  const tree = (lockedValues: Record<string, string> | undefined) => (
    <QueryClientProvider client={queryClient}>
      <OperationCatalog
        definition={{ key: "things", title: "Things", description: "All the things." }}
        entities={["things"]}
        surfaceKey="things"
        client={props.client}
        renderLink={renderFakeLink}
        follow={props.follow ?? true}
        {...(lockedValues ? { lockedValues } : {})}
      />
    </QueryClientProvider>
  );
  const utils = render(tree(props.lockedValues));
  return {
    ...utils,
    rerenderWithLockedValues: (lockedValues: Record<string, string>) =>
      utils.rerender(tree(lockedValues)),
  };
}

describe("OperationCatalog follow mode", () => {
  beforeEach(() => {
    vi.stubGlobal("EventSource", MockEventSource as unknown as typeof EventSource);
  });

  afterEach(() => {
    cleanup();
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
    MockEventSource.instances = [];
  });

  it("starts a session with the effective locked + filter params", async () => {
    const fetchMock = stubFetch();
    const client = makeClient(makeSpec(), listResponse([tableRow("a1", "open")]));
    renderCatalog({ client, lockedValues: { stream: "s1" } });

    await screen.findByText("a1");
    await waitFor(() => expect(postCalls(fetchMock)).toHaveLength(1));
    expect(postCalls(fetchMock)[0]?.[0]).toBe(`/api/v1/profile/things/sessions?follow=true&stream=s1`);
  });

  it("merges live rows into the table, de-duplicated against the current page", async () => {
    stubFetch();
    const client = makeClient(makeSpec(), listResponse([tableRow("a1", "open")]));
    renderCatalog({ client, lockedValues: { stream: "s1" } });

    await screen.findByText("a1");
    await waitFor(() => expect(MockEventSource.instances).toHaveLength(1));
    const source = MockEventSource.instances[0]!;

    act(() => {
      source.emit("event", {
        sessionId: SESSION_ID,
        sequence: 1,
        row: { _id: "a1", status: "open" },
        clickyRow: tableRow("a1", "open"),
      });
      source.emit("event", {
        sessionId: SESSION_ID,
        sequence: 2,
        row: { _id: "a2", status: "closed" },
        clickyRow: tableRow("a2", "closed"),
      });
    });

    await screen.findByText("a2");
    // "a1" arrived again over the stream but was already on the page: it must
    // render once, not twice.
    expect(screen.getAllByText("a1")).toHaveLength(1);
    expect(await screen.findByText("+1")).toBeInTheDocument();
  });

  it("reconciles a live root page from all stream events instead of retaining displaced rows", async () => {
    const fetchMock = stubFetch();
    const client = makeClient(makeSpec(), listResponse([tableRow("child", "open")]));
    vi.mocked(client.executeCommand)
      .mockResolvedValueOnce(listResponse([tableRow("child", "open")]))
      .mockResolvedValue(listResponse([tableRow("parent", "open")]));
    renderCatalog({ client, lockedValues: { stream: "s1", status: "open" },
      follow: { mode: "reconcile", params: { stream: "s1" }, maxRows: 1 } });

    await screen.findByText("child");
    await waitFor(() => expect(MockEventSource.instances).toHaveLength(1));
    expect(postCalls(fetchMock)[0]?.[0]).toBe(`/api/v1/profile/things/sessions?follow=true&stream=s1`);
    act(() => MockEventSource.instances[0]!.emit("event", {
      sessionId: SESSION_ID, sequence: 1, row: { _id: "parent", status: "closed" },
    }));

    await screen.findByText("parent");
    expect(screen.queryByText("child")).not.toBeInTheDocument();
    expect(screen.queryByText(/without its presented row/)).not.toBeInTheDocument();
  });

  it("shows a stream error and does not merge a row whose event carries no clickyRow", async () => {
    stubFetch();
    const client = makeClient(makeSpec(), listResponse([tableRow("a1", "open")]));
    renderCatalog({ client, lockedValues: { stream: "s1" } });

    await screen.findByText("a1");
    await waitFor(() => expect(MockEventSource.instances).toHaveLength(1));
    const source = MockEventSource.instances[0]!;

    act(() => {
      // commons-db sends the presented row alongside every trace/follow row
      // event; one that omits it is a stream contract violation, never a row
      // to render by guessing at its shape from the raw JSON.
      source.emit("event", { sessionId: SESSION_ID, sequence: 1, row: { _id: "a2", status: "closed" } });
    });

    await screen.findByText(/without its presented row/);
    expect(screen.queryByText("a2")).not.toBeInTheDocument();
  });

  it("restarts the session when lockedValues change and closes the old stream", async () => {
    const fetchMock = stubFetch();
    const client = makeClient(makeSpec(), listResponse([tableRow("a1", "open")]));
    const { rerenderWithLockedValues } = renderCatalog({ client, lockedValues: { stream: "s1" } });

    await screen.findByText("a1");
    await waitFor(() => expect(postCalls(fetchMock)).toHaveLength(1));

    act(() => rerenderWithLockedValues({ stream: "s2" }));

    await waitFor(() => expect(postCalls(fetchMock)).toHaveLength(2));
    expect(postCalls(fetchMock)[1]?.[0]).toBe(`/api/v1/profile/things/sessions?follow=true&stream=s2`);
    const old = MockEventSource.instances.find((es) => es.url.includes(`/sessions/${SESSION_ID}/`));
    await waitFor(() => expect(old?.closed).toBe(true));
    // The server reaps the unsubscribed view session; nothing is deleted.
    expect(deleteCalls(fetchMock)).toHaveLength(0);
  });

  it("closes the stream on unmount without deleting the session", async () => {
    const fetchMock = stubFetch();
    const client = makeClient(makeSpec(), listResponse([tableRow("a1", "open")]));
    const { unmount } = renderCatalog({ client, lockedValues: { stream: "s1" } });

    await screen.findByText("a1");
    await waitFor(() => expect(postCalls(fetchMock)).toHaveLength(1));

    await waitFor(() => expect(MockEventSource.instances.length).toBeGreaterThan(0));
    const live = MockEventSource.instances.at(-1)!;
    unmount();

    expect(live.closed).toBe(true);
    expect(deleteCalls(fetchMock)).toHaveLength(0);
  });

  it("fails loudly, naming the surface, when the list operation advertises no session to follow", async () => {
    stubFetch();
    const client = makeClient(makeSpec({ withSessions: false }), listResponse([tableRow("a1", "open")]));
    renderCatalog({ client, lockedValues: { stream: "s1" } });

    await screen.findByText("Live follow is not available");
    expect(document.body.textContent).toMatch(/things.*no session to follow/i);
    // No silent no-op: the table itself must not render behind the error.
    expect(screen.queryByText("a1")).not.toBeInTheDocument();
  });

  it("surfaces a stream error without swallowing it", async () => {
    stubFetch();
    const client = makeClient(makeSpec(), listResponse([tableRow("a1", "open")]));
    renderCatalog({ client, lockedValues: { stream: "s1" } });

    await screen.findByText("a1");
    await waitFor(() => expect(MockEventSource.instances).toHaveLength(1));
    const source = MockEventSource.instances[0]!;

    act(() => {
      source.emit("event", { sessionId: SESSION_ID, sequence: 1, error: "upstream reader closed" });
    });

    await screen.findByText(/upstream reader closed/);
  });
});
