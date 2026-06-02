import { act, renderHook, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { useTaskRun } from "./use-task-run";
import type { TaskSnapshot } from "../data/TaskSnapshot";

// MockEventSource is a minimal stand-in for the browser EventSource so the
// SSE-first path can be driven deterministically.
class MockEventSource {
  static last: MockEventSource | null = null;
  url: string;
  onerror: ((e: unknown) => void) | null = null;
  closed = false;
  private listeners: Record<string, ((e: MessageEvent) => void)[]> = {};

  constructor(url: string) {
    this.url = url;
    MockEventSource.last = this;
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

const groupSnap = (status: string): TaskSnapshot => ({
  id: "fix-run",
  name: "fix-run",
  type: "group",
  status,
  groupId: "g1",
  total: 1,
  completed: status === "success" ? 1 : 0,
});
const taskSnap = (status: string): TaskSnapshot => ({
  id: "t1",
  name: "rebuild",
  type: "task",
  groupId: "g1",
  status,
});

describe("useTaskRun (SSE)", () => {
  beforeEach(() => {
    vi.stubGlobal("EventSource", MockEventSource as unknown as typeof EventSource);
  });
  afterEach(() => {
    vi.unstubAllGlobals();
    MockEventSource.last = null;
  });

  it("accumulates task snapshots and completes + closes on done", async () => {
    const { result } = renderHook(() => useTaskRun({ id: "g1" }));

    const es = MockEventSource.last!;
    expect(es.url).toContain("tasks=g1");

    act(() => {
      es.emit("task", groupSnap("running"));
      es.emit("task", taskSnap("running"));
    });
    await waitFor(() => expect(result.current.snapshots).toHaveLength(2));
    expect(result.current.isComplete).toBe(false);

    act(() => {
      es.emit("task", groupSnap("success"));
      es.emit("task", taskSnap("success"));
      es.emit("done", { status: "completed" });
    });

    await waitFor(() => expect(result.current.isComplete).toBe(true));
    expect(es.closed).toBe(true);
    // Latest snapshot per id wins.
    const group = result.current.snapshots.find((s) => s.type === "group");
    expect(group?.status).toBe("success");
  });
});

describe("useTaskRun (polling fallback)", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
  });

  it("polls the JSON endpoint and stops once all groups are terminal", async () => {
    // No EventSource available → fall back to polling.
    vi.stubGlobal("EventSource", undefined);
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => [groupSnap("success"), taskSnap("success")],
    });
    vi.stubGlobal("fetch", fetchMock);

    const { result } = renderHook(() => useTaskRun({ id: "g1", pollMs: 10 }));

    await waitFor(() => expect(result.current.isComplete).toBe(true));
    expect(fetchMock).toHaveBeenCalledWith(
      expect.stringContaining("/tasks/g1"),
      expect.anything(),
    );
    expect(result.current.snapshots).toHaveLength(2);
  });
});
