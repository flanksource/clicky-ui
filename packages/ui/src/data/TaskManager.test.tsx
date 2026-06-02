import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { TaskManager } from "./TaskManager";
import type { TaskRunMeta, TaskSnapshot } from "./TaskSnapshot";

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

  it("expands the run matching selectedId and drills into its tasks", async () => {
    vi.stubGlobal("fetch", mockFetch());
    render(<TaskManager basePath="/api/v1" selectedId="g1" onSelectRun={() => {}} />);

    // The run row renders from the listing.
    await screen.findByText("fix-run");
    // Because selectedId === run.id, the row is expanded and the child task
    // (fetched from /tasks/g1) is visible without any click.
    await waitFor(() => expect(screen.getByText("reorg idx_c")).toBeInTheDocument());
  });

  it("calls onSelectRun with the run id when a collapsed row is clicked", async () => {
    vi.stubGlobal("fetch", mockFetch());
    const onSelectRun = vi.fn();
    render(<TaskManager basePath="/api/v1" onSelectRun={onSelectRun} />);

    const row = await screen.findByText("fix-run");
    fireEvent.click(row);
    expect(onSelectRun).toHaveBeenCalledWith("g1");
  });

  it("calls onSelectRun with null when the open row is clicked", async () => {
    vi.stubGlobal("fetch", mockFetch());
    const onSelectRun = vi.fn();
    render(<TaskManager basePath="/api/v1" selectedId="g1" onSelectRun={onSelectRun} />);

    const row = await screen.findByText("fix-run");
    fireEvent.click(row);
    expect(onSelectRun).toHaveBeenCalledWith(null);
  });
});
