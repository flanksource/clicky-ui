import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { TaskManagerButton } from "./TaskManagerButton";

vi.mock("./TaskManager", () => ({
  TaskManager: ({ kind, labels }: { kind?: string; labels?: Record<string, string> }) => (
    <div data-testid="task-manager-panel">{kind} {labels?.job}</div>
  ),
}));

describe("TaskManagerButton", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
  });

  it("shows active count and follows each run href", async () => {
    vi.stubGlobal("EventSource", undefined);
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue({
      ok: true,
      json: async () => [{
        id: "run-1",
        name: "Run tests",
        href: "/projects/acme?action=test&run=run-1",
        status: "running",
        total: 1,
        completed: 0,
        failed: 0,
        running: 1,
      }],
    }));
    const onNavigate = vi.fn();
    render(<TaskManagerButton basePath="/api" onNavigate={onNavigate} />);

    await waitFor(() => expect(screen.getByLabelText("Tasks (1 active)")).toBeInTheDocument());
    fireEvent.click(screen.getByLabelText("Tasks (1 active)"));
    fireEvent.click(await screen.findByText("Run tests"));
    expect(onNavigate).toHaveBeenCalledWith("/projects/acme?action=test&run=run-1");
  });

  it("opens the task manager panel and sums resources from every active task", async () => {
    vi.stubGlobal("EventSource", undefined);
    const process = (id: string, status: "running" | "success", cpuPercent: number, rssBytes: number) => ({
      id,
      name: id,
      type: "task",
      status,
      details: {
        command: id,
        status,
        restarts: 0,
        restartPolicy: "never",
        latest: { sampledAt: "2026-08-24T00:00:00Z", cpuPercent, rssBytes, vmsBytes: 0, openFiles: 4 },
        peak: { sampledAt: "2026-08-24T00:00:00Z", cpuPercent, rssBytes, vmsBytes: 0, openFiles: 4 },
        metrics: {},
      },
    });
    vi.stubGlobal("fetch", vi.fn().mockImplementation(async (url: string) => {
      if (url.endsWith("/tasks/run-1")) {
        return { ok: true, json: async () => [
          process("orca-slicer", "running", 37.5, 268435456),
          process("completed-export", "success", 80, 1073741824),
        ] };
      }
      if (url.endsWith("/tasks/run-2")) {
        return { ok: true, json: async () => [process("openscad", "running", 22.5, 134217728)] };
      }
      return { ok: true, json: async () => [
        {
          id: "run-1", name: "Slice print job", status: "running",
          total: 2, completed: 1, failed: 0, running: 1,
        },
        {
          id: "run-2", name: "Preview model", status: "running",
          total: 1, completed: 0, failed: 0, running: 1,
        },
      ] };
    }));

    render(<TaskManagerButton basePath="/api" kind="makerprint" labels={{ job: "job-1" }} panel />);

    expect(await screen.findByText("60.0%")).toBeInTheDocument();
    expect(screen.getByText("384 MB")).toBeInTheDocument();
    fireEvent.click(screen.getByLabelText("Tasks (2 active)"));
    expect(await screen.findByTestId("task-manager-panel")).toHaveTextContent("makerprint job-1");
  });
});
