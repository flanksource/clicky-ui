// Split out of TaskProgress.test.tsx (which was pushing 500 lines) to keep
// each file focused: this one covers rendering of supervised-process and
// exec-argv details, plus agent metadata/headerExtra/extraTabs. Progress bar
// math, lifecycle controls, and copy affordances stay in TaskProgress.test.tsx.
import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { TaskProgress } from "./TaskProgress";
import type { TaskSnapshot } from "./TaskSnapshot";

vi.mock("./TimeseriesGauge", () => ({
  TimeseriesGauge: ({ title }: { title: string }) => <span>{title} gauge</span>,
}));

describe("TaskProgress details", () => {
  it("renders the nested supervised process tree and current resource summary", () => {
    const snapshots: TaskSnapshot[] = [
      {
        id: "api",
        name: "api",
        type: "group",
        status: "running",
        groupId: "proc-1",
        kind: "supervised-process",
        total: 1,
        running: 1,
        details: {
          pid: 100,
          command: "api serve",
          status: "running",
          restarts: 1,
          restartPolicy: "on-failure",
          latest: { cpuPercent: 12.5, rssBytes: 2048, vmsBytes: 8192, openFiles: 8, sampledAt: "2026-07-21T00:00:00Z" },
          peak: { cpuPercent: 20, rssBytes: 4096, vmsBytes: 16384, openFiles: 10, sampledAt: "2026-07-21T00:00:00Z" },
          metrics: {},
          tree: [
            { pid: 100, ppid: 1, command: "api serve", status: "sleep", isRoot: true, cpuPercent: 5, rssBytes: 1024, vmsBytes: 4096, openFiles: 4 },
            { pid: 101, ppid: 100, command: "worker", status: "run", cpuPercent: 7.5, rssBytes: 1024, vmsBytes: 2048, openFiles: 4 },
          ],
        },
      },
      { id: "api-task", name: "api", type: "task", status: "running", groupId: "proc-1" },
    ];
    render(<TaskProgress snapshots={snapshots} />);

    expect(screen.getByText("12.5% CPU")).toBeInTheDocument();
    expect(screen.getByText("8 KB VMS")).toBeInTheDocument();
    expect(screen.getByText("Peak 20.0% CPU · 4 KB RSS")).toBeInTheDocument();
    expect(screen.getByText("worker")).toBeInTheDocument();
    expect(screen.getByText("pid 101")).toBeInTheDocument();
    expect(screen.getByText("1 restart")).toBeInTheDocument();
  });

  it("reports the completed and unstarted portions of a stopped managed run", () => {
    const snapshots: TaskSnapshot[] = [{
      id: "batch", groupId: "batch", name: "Slice models", type: "group", status: "canceled",
      work: { total: 4, completed: 1, cached: 0, failed: 0, running: 0, canceled: 0, unstarted: 3 },
    }];
    render(<TaskProgress snapshots={snapshots} />);
    expect(screen.getByText("1/4 done, 3 unstarted")).toBeInTheDocument();
    expect(screen.getByRole("progressbar")).toHaveAttribute("title", "1 passed, 3 unstarted");
  });

  it("expands supervised child tasks with argv, resource gauges, and captured streams", () => {
    const snapshots: TaskSnapshot[] = [
      {
        id: "prepare",
        name: "Prepare model",
        type: "group",
        status: "running",
        groupId: "prepare-1",
        total: 1,
        running: 1,
      },
      {
        id: "openscad",
        name: "Run OpenSCAD",
        type: "task",
        status: "running",
        groupId: "prepare-1",
        stdout: "render complete\n",
        stderr: "cache warning\n",
        details: {
          pid: 411,
          command: "/usr/local/bin/openscad",
          args: ["--backend", "manifold", "-o", "/models/box output.stl", "/models/box.scad"],
          status: "running",
          restarts: 0,
          restartPolicy: "never",
          latest: { cpuPercent: 12.5, rssBytes: 2048, vmsBytes: 8192, openFiles: 8, sampledAt: "2026-08-22T00:00:00Z" },
          peak: { cpuPercent: 20, rssBytes: 4096, vmsBytes: 16384, openFiles: 10, sampledAt: "2026-08-22T00:00:00Z" },
          metrics: { cpu: "task.openscad.cpu", rss: "task.openscad.rss" },
        },
      },
    ];

    render(<TaskProgress snapshots={snapshots} metricsBaseUrl="/api/v1/tasks/metrics/" />);
    fireEvent.click(screen.getByText("Run OpenSCAD"));

    expect(
      screen.getByText("/usr/local/bin/openscad --backend manifold -o '/models/box output.stl' /models/box.scad"),
    ).toBeInTheDocument();
    expect(screen.getByText("12.5% CPU")).toBeInTheDocument();
    expect(screen.getByText("CPU gauge")).toBeInTheDocument();
    expect(screen.getByText("RSS gauge")).toBeInTheDocument();
    expect(screen.getByText("render complete")).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "stderr" }));
    expect(screen.getByText("cache warning")).toBeInTheDocument();
  });

  it("renders child exec argv, process runtime, and domain-specific details", () => {
    const snapshots: TaskSnapshot[] = [
      {
        id: "scans",
        name: "Scans",
        type: "group",
        status: "success",
        groupId: "scan-run-1",
        kind: "scan",
        total: 1,
        completed: 1,
      },
      {
        id: "scan-task",
        name: "nuclei-safe-1",
        type: "task",
        status: "success",
        groupId: "scan-run-1",
        details: {
          command: "/opt/recon/bin/nuclei",
          args: ["-target", "api value", "-stats"],
          pid: 321,
          status: "success",
          exitCode: 0,
          started: "2026-08-10T12:00:00Z",
          duration: 2_500_000_000,
          scanId: "scan-1",
          endpointCount: 3,
          findings: 4,
          stats: { requests: 40, total: 60, templates: 18, matched: 4, errors: 2 },
        },
      },
    ];

    render(<TaskProgress snapshots={snapshots} />);
    fireEvent.click(screen.getByText("nuclei-safe-1"));

    expect(screen.getByText("/opt/recon/bin/nuclei -target 'api value' -stats")).toBeInTheDocument();
    expect(screen.getByText("pid 321")).toBeInTheDocument();
    expect(screen.getByText("exit 0")).toBeInTheDocument();
    expect(screen.getByText("2.5s")).toBeInTheDocument();
    expect(screen.getByText("scanId")).toBeInTheDocument();
    expect(screen.getByText('"scan-1"')).toBeInTheDocument();
    expect(screen.getByText("endpointCount")).toBeInTheDocument();
    expect(screen.getByText("stats")).toBeInTheDocument();
  });

  const agentRun = (details: Record<string, unknown>): TaskSnapshot[] => [
    { id: "agent", name: "Stack Trace Viewer improvements", type: "group", status: "running", groupId: "a1", total: 1, running: 1 },
    {
      id: "agent-task",
      name: "run agent",
      type: "task",
      status: "running",
      groupId: "a1",
      stdout: '{"jsonrpc":"2.0"}\n',
      details: {
        pid: 19626,
        command: "tsx",
        status: "running",
        restarts: 0,
        restartPolicy: "no",
        latest: { cpuPercent: 0.5, rssBytes: 1024, vmsBytes: 2048, openFiles: 8, sampledAt: new Date().toISOString() },
        peak: { cpuPercent: 18.7, rssBytes: 4096, vmsBytes: 8192, openFiles: 12, sampledAt: new Date().toISOString() },
        metrics: {},
        ...details,
      },
    },
  ];

  it("chips the producer's metadata in the header and links the ones that point somewhere", () => {
    render(
      <TaskProgress
        snapshots={agentRun({ metadata: { phase: "run", model: "claude-opus-5", href: "/todos/5d9f1d2a" } })}
      />,
    );

    // Scalar metadata is readable on the row itself, before anything is expanded.
    expect(screen.getByTitle("phase: run")).toBeInTheDocument();
    expect(screen.getByTitle("model: claude-opus-5")).toBeInTheDocument();

    fireEvent.click(screen.getByText("run agent"));

    expect(screen.getByRole("link", { name: "/todos/5d9f1d2a" })).toHaveAttribute("href", "/todos/5d9f1d2a");
  });

  // Structured metadata is the point of it being JSON: the header takes the
  // scalars it can render as labels and the expanded details keep the rest whole.
  it("keeps structured metadata out of the header and shows it in the details", () => {
    render(
      <TaskProgress
        snapshots={agentRun({ metadata: { state: "running", turn: { planMode: true, pending: 2 } } })}
      />,
    );

    expect(screen.getByTitle("state: running")).toBeInTheDocument();
    expect(screen.queryByTitle(/^turn:/)).toBeNull();

    fireEvent.click(screen.getByText("run agent"));

    expect(screen.getByText(/planMode/)).toBeInTheDocument();
  });

  it("lets a host replace the header content for the tasks it knows", () => {
    render(
      <TaskProgress
        snapshots={agentRun({ metadata: { state: "running" } })}
        headerExtra={(task) => (task.name === "run agent" ? <span>turn 3 of 5</span> : null)}
      />,
    );

    expect(screen.getByText("turn 3 of 5")).toBeInTheDocument();
    expect(screen.queryByTitle("state: running")).toBeNull();
  });

  it("renders the runaway limits the process would be killed for exceeding", () => {
    render(
      <TaskProgress
        snapshots={agentRun({ limits: { maxRssBytes: 1073741824, maxCpuPercent: 85, interval: "2s" }, ports: [9092] })}
      />,
    );

    fireEvent.click(screen.getByText("run agent"));

    expect(screen.getByText(/max 1(\.0)? ?GB RSS/)).toBeInTheDocument();
    expect(screen.getByText(":9092")).toBeInTheDocument();
  });

  it("puts a host-contributed pane ahead of the process's own streams", () => {
    render(
      <TaskProgress
        snapshots={agentRun({})}
        extraTabs={(task, group) =>
          task.type === "task" && group.groupId === "a1"
            ? [{ id: "transcript", label: "Transcript", render: () => <span>read FrameSource.tsx</span> }]
            : []
        }
      />,
    );

    fireEvent.click(screen.getByText("run agent"));

    // The transcript is what an operator wants; raw JSON-RPC stdout is a tab away.
    expect(screen.getByText("read FrameSource.tsx")).toBeInTheDocument();
    expect(screen.queryByText('{"jsonrpc":"2.0"}')).not.toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "stdout" }));
    expect(screen.getByText('{"jsonrpc":"2.0"}')).toBeInTheDocument();
  });

  // A tab is addressed by its id, so a host pane claiming "stdout" would not add
  // a pane — it would stand in front of the process's own output, which nothing
  // else in the UI can show.
  it("keeps the process's own stream reachable when a host pane claims its id", () => {
    render(
      <TaskProgress
        snapshots={agentRun({})}
        extraTabs={() => [
          { id: "stdout", label: "Transcript", render: () => <span>host pane</span> },
          { id: "transcript", label: "Transcript", render: () => <span>read FrameSource.tsx</span> },
        ]}
      />,
    );

    fireEvent.click(screen.getByText("run agent"));

    expect(screen.queryByText("host pane")).toBeNull();
    expect(screen.getByText("read FrameSource.tsx")).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "stdout" }));
    expect(screen.getByText('{"jsonrpc":"2.0"}')).toBeInTheDocument();
  });
});
