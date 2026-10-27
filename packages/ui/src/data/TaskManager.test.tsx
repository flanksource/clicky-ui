import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { act, fireEvent, render, screen, waitFor, within } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { TaskManager } from "./TaskManager";
import type { TaskRunMeta, TaskSnapshot } from "./TaskSnapshot";
import { taskQueryKeys } from "./task-query-keys";

// One run in the listing, and its drill-down snapshot (group + one task).
const RUN: TaskRunMeta = {
  id: "g1",
  name: "fix-run",
  kind: "sql-fix",
  status: "warning",
  total: 1,
  completed: 1,
  failed: 0,
  running: 0,
};

const SNAPSHOT: TaskSnapshot[] = [
  { id: "g1-name", name: "fix-run", type: "group", status: "warning", groupId: "g1", total: 1 },
  { id: "t1", name: "reorg idx_c", type: "task", groupId: "g1", status: "warning" },
];

function mockFetch() {
  return vi.fn(async (input: RequestInfo | URL) => {
    const url = String(input);
    const body = url.includes("/tasks/g1") ? SNAPSHOT : [RUN];
    return {
      ok: true,
      json: async () => body,
    } as Response;
  });
}

function createClient() {
  return new QueryClient({
    defaultOptions: {
      queries: { retry: false, gcTime: Infinity },
      mutations: { retry: false },
    },
  });
}

function renderManager(client: QueryClient, manager: React.ReactNode) {
  return render(<QueryClientProvider client={client}>{manager}</QueryClientProvider>);
}

describe("TaskManager selection", () => {
  beforeEach(() => {
    // Force the polling transport (no EventSource) so the drill-down fetch is
    // deterministic without an SSE stub.
    vi.stubGlobal("EventSource", undefined);
  });
  afterEach(() => {
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
  });

  it("renders host-provided output for the selected run", async () => {
    vi.stubGlobal("fetch", mockFetch());
    renderManager(createClient(), <TaskManager basePath="/api/v1" selectedId="g1" onSelectRun={() => {}}
      renderRunDetails={(run, snapshots) => <span>{run.id}: {snapshots.length} snapshots</span>} />);
    expect(await screen.findByText("g1: 2 snapshots")).toBeInTheDocument();
  });

  it("expands the run matching selectedId and drills into its tasks", async () => {
    vi.stubGlobal("fetch", mockFetch());
    renderManager(createClient(), <TaskManager basePath="/api/v1" selectedId="g1" onSelectRun={() => {}} />);

    // The run row renders from the listing.
    await screen.findByText("fix-run");
    // Because selectedId === run.id, the row is expanded and the child task
    // (fetched from /tasks/g1) is visible without any click.
    await waitFor(() => expect(screen.getByText("reorg idx_c")).toBeInTheDocument());
  });

  it("renders a run table and all child progress in the selected row detail", async () => {
    const snapshots: TaskSnapshot[] = [
      { id: "group", name: "Batch", type: "group", status: "running", groupId: "g1", total: 5, running: 1 },
      ...["First", "Second", "Third", "Fourth", "Fifth"].map((name, index) => ({
        id: `task-${index}`,
        name,
        type: "task" as const,
        status: index === 0 ? "running" : "pending",
        groupId: "g1",
      })),
    ];
    vi.stubGlobal("fetch", vi.fn(async (input: RequestInfo | URL) => ({
      ok: true,
      json: async () => String(input).includes("/tasks/g1") ? snapshots : [{ ...RUN, name: "Batch", status: "running", total: 5, completed: 0, running: 1 }],
    }) as Response));

    renderManager(createClient(), <TaskManager basePath="/api/v1" selectedId="g1" onSelectRun={() => {}} />);

    const table = await screen.findByRole("table");
    expect(within(table).getByRole("columnheader", { name: /^Run / })).toBeInTheDocument();
    expect(within(table).getByRole("columnheader", { name: /^Status / })).toBeInTheDocument();
    expect(within(table).getByRole("columnheader", { name: /^Progress / })).toBeInTheDocument();
    expect(await screen.findByText("Fifth")).toBeInTheDocument();
  });

  it("calls onSelectRun with the run id when a collapsed row is clicked", async () => {
    vi.stubGlobal("fetch", mockFetch());
    const onSelectRun = vi.fn();
    renderManager(createClient(), <TaskManager basePath="/api/v1" onSelectRun={onSelectRun} />);

    const row = await screen.findByText("fix-run");
    fireEvent.click(row);
    expect(onSelectRun).toHaveBeenCalledWith("g1");
  });

  it("calls onSelectRun with null when the open row is clicked", async () => {
    vi.stubGlobal("fetch", mockFetch());
    const onSelectRun = vi.fn();
    renderManager(createClient(), <TaskManager basePath="/api/v1" selectedId="g1" onSelectRun={onSelectRun} />);

    const row = await screen.findByText("fix-run");
    fireEvent.click(row);
    expect(onSelectRun).toHaveBeenCalledWith(null);
  });

  it("keeps application kinds in FilterBar without a Kind table column", async () => {
    vi.stubGlobal("fetch", vi.fn(async () => ({
      ok: true,
      json: async () => [
        { ...RUN, id: "openscad-1", name: "Preview model", kind: "openscad" },
        { ...RUN, id: "orca-1", name: "Slice model", kind: "orca" },
      ],
    }) as Response));

    renderManager(createClient(), <TaskManager basePath="/api/v1" />);

    const table = await screen.findByRole("table");
    expect(within(table).queryByRole("columnheader", { name: /^Kind / })).not.toBeInTheDocument();
    fireEvent.focus(screen.getByRole("combobox", { name: "Kind" }));
    expect(screen.getByRole("option", { name: "OpenSCAD" })).toBeInTheDocument();
    expect(screen.getByRole("option", { name: "Orca" })).toBeInTheDocument();
    expect(screen.getByText("Preview model")).toBeInTheDocument();
    expect(screen.getByText("Slice model")).toBeInTheDocument();
  });

  it("shows run labels as tags and formats the elapsed duration from run timestamps", async () => {
    vi.stubGlobal("fetch", vi.fn(async () => ({
      ok: true,
      json: async () => [{
        ...RUN,
        labels: { team: "platform", region: "eu" },
        startedAt: "2026-10-15T07:00:00Z",
        finishedAt: "2026-10-15T07:02:00Z",
      }],
    }) as Response));

    renderManager(createClient(), <TaskManager basePath="/api/v1" />);

    const table = await screen.findByRole("table");
    expect(within(table).getAllByRole("columnheader").map((header) => header.textContent?.replace(/[↕↑↓]/g, "").trim())).toEqual([
      "Run", "Status", "Duration", "Progress", "Labels", "Started", "Finished",
    ]);
    const row = within(table).getAllByRole("row")[1]!;
    expect(within(row).getByText("team")).toBeInTheDocument();
    expect(within(row).getByText("platform")).toBeInTheDocument();
    expect(within(row).getByText("region")).toBeInTheDocument();
    expect(within(row).getByText("eu")).toBeInTheDocument();
    expect(row).toHaveTextContent("2 min");
  });

  it("uses FilterBar controls to query by kind, status, and a run label", async () => {
    const fetchMock = vi.fn(async () => ({
      ok: true,
      json: async () => [{ ...RUN, labels: { team: "platform" } }],
    }) as Response);
    vi.stubGlobal("fetch", fetchMock);
    renderManager(createClient(), <TaskManager basePath="/api/v1" />);

    await screen.findByText("fix-run");
    fireEvent.focus(screen.getByLabelText("Kind"));
    fireEvent.mouseDown(screen.getByRole("option", { name: "sql-fix" }));
    await waitFor(() => expect(fetchMock).toHaveBeenCalledWith(
      "/api/v1/tasks?kind=sql-fix",
      expect.anything(),
    ));

    fireEvent.focus(screen.getByLabelText("Status"));
    fireEvent.mouseDown(screen.getByRole("option", { name: "Failed" }));
    await waitFor(() => expect(fetchMock).toHaveBeenCalledWith(
      "/api/v1/tasks?kind=sql-fix&status=failed",
      expect.anything(),
    ));

    fireEvent.focus(screen.getByLabelText("Labels"));
    fireEvent.mouseDown(screen.getByRole("option", { name: "team=platform" }));
    await waitFor(() => expect(fetchMock).toHaveBeenCalledWith(
      "/api/v1/tasks?kind=sql-fix&status=failed&label=team%3Dplatform",
      expect.anything(),
    ));
  });

  it("keeps the table filters visible when the listing is empty", async () => {
    vi.stubGlobal("fetch", vi.fn(async () => ({ ok: true, json: async () => [] }) as Response));
    renderManager(createClient(), <TaskManager basePath="/api/v1" />);

    expect(await screen.findByText("No background tasks.")).toBeInTheDocument();
    expect(screen.getByRole("table")).toBeInTheDocument();
    expect(screen.getByRole("combobox", { name: "Kind" })).toBeInTheDocument();
    expect(screen.getByRole("combobox", { name: "Status" })).toBeInTheDocument();
  });

  it("keeps status visible within the run cell in a compact panel", async () => {
    vi.stubGlobal("fetch", mockFetch());
    renderManager(createClient(), <TaskManager basePath="/api/v1" compact />);

    const table = await screen.findByRole("table");
    expect(within(table).getAllByRole("columnheader")).toHaveLength(3);
    expect(within(table).getByText("sql-fix")).toBeInTheDocument();
    expect(within(table).getByText("warning")).toBeInTheDocument();
  });

  it("scopes the run listing with label equality filters", async () => {
    const fetchMock = mockFetch();
    vi.stubGlobal("fetch", fetchMock);
    renderManager(
      createClient(),
      <TaskManager
        basePath="/api/v1"
        kind="rules.backfill"
        labels={{ entity_id: "entity-1", org_id: "org-1" }}
      />,
    );

    await screen.findByText("fix-run");
    expect(fetchMock).toHaveBeenCalledWith(
      "/api/v1/tasks?kind=rules.backfill&label=entity_id%3Dentity-1&label=org_id%3Dorg-1",
      expect.objectContaining({ headers: { Accept: "application/json" } }),
    );
  });

  it("routes advertised child controls through the task control endpoint", async () => {
    const snapshots: TaskSnapshot[] = [
      { id: "g1-name", name: "commit", type: "group", status: "running", groupId: "g1", total: 1, running: 1 },
      { id: "t1", name: "Commit one.go", type: "task", groupId: "g1", status: "running", controls: ["stop"] },
    ];
    const fetchMock = vi.fn(async (input: RequestInfo | URL, init?: RequestInit) => {
      if (init?.method === "POST") return { ok: true } as Response;
      return {
        ok: true,
        json: async () => String(input).includes("/tasks/g1") ? snapshots : [{ ...RUN, status: "running", running: 1, completed: 0 }],
      } as Response;
    });
    vi.stubGlobal("fetch", fetchMock);
    renderManager(createClient(), <TaskManager basePath="/api/v1" selectedId="g1" onSelectRun={() => {}} />);

    fireEvent.click(await screen.findByRole("button", { name: "Stop Commit one.go" }));

    await waitFor(() => expect(fetchMock).toHaveBeenCalledWith(
      "/api/v1/tasks/g1/tasks/t1/control",
      expect.objectContaining({
        method: "POST",
        body: JSON.stringify({ action: "stop" }),
      }),
    ));
  });

  it("mirrors native task stream frames into exact QueryClient caches", async () => {
    const eventSources: TestEventSource[] = [];
    class TestEventSource {
      readonly listeners = new Map<string, (event: MessageEvent<string>) => void>();
      readonly close = vi.fn();
      onerror: (() => void) | null = null;

      constructor(readonly url: string) {
        eventSources.push(this);
      }

      addEventListener(type: string, listener: EventListenerOrEventListenerObject) {
        this.listeners.set(type, listener as (event: MessageEvent<string>) => void);
      }

      emit(type: string, data: unknown) {
        this.listeners.get(type)?.({ data: JSON.stringify(data) } as MessageEvent<string>);
      }
    }
    vi.stubGlobal("EventSource", TestEventSource);
    const client = createClient();

    renderManager(
      client,
      <TaskManager basePath="/api/v1" kind="sql-fix" selectedId="g1" onSelectRun={() => {}} />,
    );
    expect(eventSources.map((source) => source.url)).toEqual([
      "/api/v1/tasks/runs/stream?kind=sql-fix",
    ]);

    act(() => eventSources[0]?.emit("runs", [RUN]));
    await screen.findByText("fix-run");
    expect(eventSources.map((source) => source.url)).toEqual([
      "/api/v1/tasks/runs/stream?kind=sql-fix",
      "/api/v1/tasks/stream?tasks=g1",
    ]);
    act(() => {
      eventSources[1]?.emit("task", SNAPSHOT[0]);
      eventSources[1]?.emit("task", SNAPSHOT[1]);
    });

    await waitFor(() => {
      expect(client.getQueryData(taskQueryKeys.runs({ basePath: "/api/v1", kind: "sql-fix" }))).toEqual([RUN]);
      expect(client.getQueryData(taskQueryKeys.run({ basePath: "/api/v1", runId: "g1" }))).toEqual(SNAPSHOT);
    });
  });

  it("does not publish the previous listing under a newly-filtered cache key", async () => {
    const eventSources: { url: string; emit: (type: string, data: unknown) => void }[] = [];
    class TestEventSource {
      private readonly listeners = new Map<string, (event: MessageEvent<string>) => void>();
      readonly close = vi.fn();
      onerror: (() => void) | null = null;

      constructor(readonly url: string) {
        eventSources.push(this);
      }

      addEventListener(type: string, listener: EventListenerOrEventListenerObject) {
        this.listeners.set(type, listener as (event: MessageEvent<string>) => void);
      }

      emit(type: string, data: unknown) {
        this.listeners.get(type)?.({ data: JSON.stringify(data) } as MessageEvent<string>);
      }
    }
    vi.stubGlobal("EventSource", TestEventSource);
    const client = createClient();

    renderManager(client, <TaskManager basePath="/api/v1" kind="sql-fix" />);
    act(() => eventSources[0]?.emit("runs", [RUN]));
    await screen.findByText("fix-run");

    const unfiltered = taskQueryKeys.runs({ basePath: "/api/v1", kind: "sql-fix" });
    const failedOnly = taskQueryKeys.runs({
      basePath: "/api/v1",
      kind: "sql-fix",
      status: "failed",
    });
    expect(client.getQueryData(unfiltered)).toEqual([RUN]);

    // Narrow to status=failed. The transport re-subscribes, but the warning run
    // stays on screen until the new stream delivers — it must not be cached as
    // if it were the failed-only result.
    fireEvent.focus(screen.getByLabelText("Status"));
    fireEvent.mouseDown(screen.getByRole("option", { name: "Failed" }));
    await waitFor(() => {
      expect(eventSources.map((source) => source.url)).toContain(
        "/api/v1/tasks/runs/stream?kind=sql-fix&status=failed",
      );
    });
    expect(client.getQueryData(failedOnly)).toBeUndefined();

    // Once the new subscription delivers, its own result is published.
    act(() => eventSources[1]?.emit("runs", []));
    await waitFor(() => expect(client.getQueryData(failedOnly)).toEqual([]));
  });

  it("coalesces matching controls and invalidates only their SSE-backed caches", async () => {
    const client = createClient();
    const runsKey = taskQueryKeys.runs({ basePath: "/api/v1" });
    const runKey = taskQueryKeys.run({ basePath: "/api/v1", runId: "g1" });
    const otherRunKey = taskQueryKeys.run({ basePath: "/api/v1", runId: "other" });
    client.setQueryData(otherRunKey, [{ ...SNAPSHOT[0], groupId: "other" }]);
    let finishControl: ((response: Response) => void) | undefined;
    const pendingControl = new Promise<Response>((resolve) => {
      finishControl = resolve;
    });
    const controlledSnapshots = SNAPSHOT.map((snapshot) => ({ ...snapshot, controls: ["stop" as const] }));
    const fetchMock = vi.fn(async (input: RequestInfo | URL, init?: RequestInit) => {
      if (init?.method === "POST") return pendingControl;
      return {
        ok: true,
        json: async () => String(input).includes("/tasks/g1") ? controlledSnapshots : [RUN],
      } as Response;
    });
    vi.stubGlobal("fetch", fetchMock);
    renderManager(client, <TaskManager basePath="/api/v1" selectedId="g1" onSelectRun={() => {}} />);

    const stopGroup = await screen.findByRole("button", { name: "Stop" });
    fireEvent.click(stopGroup);
    fireEvent.click(stopGroup);

    await waitFor(() => expect(fetchMock.mock.calls.filter(([, init]) => init?.method === "POST")).toHaveLength(1));
    finishControl?.({ ok: true } as Response);
    await waitFor(() => {
      expect(client.getQueryState(runsKey)?.isInvalidated).toBe(true);
      expect(client.getQueryState(runKey)?.isInvalidated).toBe(true);
    });
    expect(client.getQueryState(otherRunKey)?.isInvalidated).toBe(false);
  });

  it("surfaces contextual control failures beside the affected task", async () => {
    const snapshots: TaskSnapshot[] = [
      { id: "g1-name", name: "commit", type: "group", status: "running", groupId: "g1", total: 1, running: 1 },
      { id: "t1", name: "Commit one.go", type: "task", groupId: "g1", status: "running", controls: ["stop"] },
    ];
    vi.stubGlobal("fetch", vi.fn(async (input: RequestInfo | URL, init?: RequestInit) => {
      if (init?.method === "POST") {
        return { ok: false, status: 409, text: async () => "task is already stopped" } as Response;
      }
      return {
        ok: true,
        json: async () => String(input).includes("/tasks/g1") ? snapshots : [RUN],
      } as Response;
    }));
    renderManager(createClient(), <TaskManager basePath="/api/v1" selectedId="g1" onSelectRun={() => {}} />);

    fireEvent.click(await screen.findByRole("button", { name: "Stop Commit one.go" }));

    expect(await screen.findByRole("alert")).toHaveTextContent(
      'Failed to stop task "Commit one.go": task is already stopped',
    );
  });
});
