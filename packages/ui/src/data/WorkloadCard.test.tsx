import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { fireEvent, render, screen, within } from "@testing-library/react";
import type { ReactElement } from "react";
import { describe, expect, it } from "vitest";
import { WorkloadCard } from "./WorkloadCard";
import type { TimeseriesResponse } from "./TimeseriesPanel";
import type {
  WorkloadCardMetrics,
  WorkloadCardWorkload,
} from "./WorkloadCard.model";

function renderWithQueryClient(ui: ReactElement) {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false, gcTime: 0 } },
  });
  return render(
    <QueryClientProvider client={queryClient}>{ui}</QueryClientProvider>,
  );
}

const workload: WorkloadCardWorkload = {
  kind: "deployment",
  name: "cycle",
  namespace: "ops",
  role: "api",
  createdAt: "2026-06-01T08:00:00Z",
  replicas: { ready: 2, desired: 3 },
  status: {
    health: "healthy",
    code: "Ready",
    message: "all replicas are ready",
  },
};

const metrics: WorkloadCardMetrics = {
  cpu: {
    value: { id: "workload.cpu.usage" },
    max: { id: "workload.cpu.limit" },
  },
  memory: {
    value: { id: "workload.memory.usage" },
    max: { id: "workload.memory.limit" },
  },
  disk: {
    value: { id: "workload.disk.usage" },
    max: { id: "workload.disk.limit" },
  },
};

const latestByMetric: Record<string, number> = {
  "cpu.usage": 2300,
  "cpu.limit": 4000,
  "memory.usage": 3_200_000_000,
  "memory.limit": 8_000_000_000,
  "disk.usage": 18_000_000_000,
  "disk.limit": 64_000_000_000,
};

const fetcher = async (url: string): Promise<TimeseriesResponse> => {
  const entry = Object.entries(latestByMetric).find(([key]) =>
    url.includes(key),
  );
  const latest = entry?.[1] ?? 0;
  return {
    id: url,
    points: [
      { at: "2026-06-02T12:00:00Z", value: latest * 0.8 },
      { at: "2026-06-02T12:01:00Z", value: latest },
    ],
  };
};

describe("WorkloadCard", () => {
  it("renders workload identity, status, replicas, and configured resource metrics", async () => {
    renderWithQueryClient(
      <WorkloadCard
        workload={workload}
        metrics={metrics}
        baseUrl="/api/v1/metrics/"
        refreshMs={0}
        fetcher={fetcher}
      />,
    );

    expect(screen.getByText("cycle")).toBeInTheDocument();
    expect(screen.getAllByText("Deployment").length).toBeGreaterThan(0);
    expect(screen.getByText("ops")).toBeInTheDocument();
    expect(screen.getByText("2/3 ready")).toBeInTheDocument();
    expect(screen.getByText("Ready")).toBeInTheDocument();
    expect(await screen.findByText("2.3 / 4 cores")).toBeInTheDocument();
    expect(screen.getByText("CPU")).toBeInTheDocument();
    expect(screen.getByText("Memory")).toBeInTheDocument();
    expect(screen.getByText("Disk")).toBeInTheDocument();
  });

  it("omits disk when no disk metric is configured", async () => {
    renderWithQueryClient(
      <WorkloadCard
        workload={workload}
        metrics={{ cpu: metrics.cpu, memory: metrics.memory }}
        refreshMs={0}
        fetcher={fetcher}
      />,
    );

    expect(await screen.findByText("2.3 / 4 cores")).toBeInTheDocument();
    expect(screen.getByText("Memory")).toBeInTheDocument();
    expect(screen.queryByText("Disk")).not.toBeInTheDocument();
  });

  it("supports visual size and variant props", async () => {
    const { container } = renderWithQueryClient(
      <WorkloadCard
        workload={workload}
        metrics={metrics}
        size="sm"
        variant="elevated"
        refreshMs={0}
        fetcher={fetcher}
      />,
    );

    const root = container.firstElementChild;
    expect(root).toHaveAttribute("data-size", "sm");
    expect(root).toHaveAttribute("data-variant", "elevated");
    expect(root).toHaveClass("shadow-sm");
    expect(await screen.findByText("2.3/4 cores")).toBeInTheDocument();
  });

  it("opens a history modal with one panel per configured metric", async () => {
    renderWithQueryClient(
      <WorkloadCard
        workload={workload}
        metrics={metrics}
        refreshMs={0}
        fetcher={fetcher}
      />,
    );

    fireEvent.click(screen.getByRole("button", { name: "Open cycle history" }));

    const dialog = await screen.findByRole("dialog", { name: "cycle history" });
    expect(within(dialog).getByText("CPU")).toBeInTheDocument();
    expect(within(dialog).getByText("Memory")).toBeInTheDocument();
    expect(within(dialog).getByText("Disk")).toBeInTheDocument();
  });

  it("shows an empty metric state without a history action", () => {
    renderWithQueryClient(
      <WorkloadCard
        workload={workload}
        metrics={{}}
        refreshMs={0}
        fetcher={fetcher}
      />,
    );

    expect(screen.getByText("No metrics configured")).toBeInTheDocument();
    expect(
      screen.queryByRole("button", { name: "Open cycle history" }),
    ).not.toBeInTheDocument();
  });
});
