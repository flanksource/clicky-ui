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

  it("opens the task manager panel and shows running CPU and memory gauges", async () => {
    vi.stubGlobal("EventSource", undefined);
    vi.stubGlobal("fetch", vi.fn().mockImplementation(async (url: string) => ({
      ok: true,
      json: async () => url.endsWith("/tasks/run-1") ? [{
        id: "slice",
        name: "Slice model",
        type: "task",
        status: "running",
        details: {
          command: "orca-slicer",
          status: "running",
          restarts: 0,
          restartPolicy: "never",
          latest: { sampledAt: "2026-08-24T00:00:00Z", cpuPercent: 37.5, rssBytes: 268435456, vmsBytes: 0, openFiles: 4 },
          peak: { sampledAt: "2026-08-24T00:00:00Z", cpuPercent: 50, rssBytes: 536870912, vmsBytes: 0, openFiles: 4 },
          metrics: {},
        },
      }] : [{
        id: "run-1",
        name: "Slice print job",
        status: "running",
        total: 1,
        completed: 0,
        failed: 0,
        running: 1,
      }],
    })));

    render(<TaskManagerButton basePath="/api" kind="makerprint" labels={{ job: "job-1" }} panel />);

    expect(await screen.findByText("37.5%")).toBeInTheDocument();
    expect(screen.getByText("256 MB")).toBeInTheDocument();
    fireEvent.click(screen.getByLabelText("Tasks (1 active)"));
    expect(await screen.findByTestId("task-manager-panel")).toHaveTextContent("makerprint job-1");
  });
});
