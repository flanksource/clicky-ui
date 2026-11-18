import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { METRICS } from "../fixtures/classes";
import { fakeJvmClient } from "../fixtures/fake-client";
import type { JvmDiagnosticsClient } from "../protocol/client";
import { JvmProvider } from "./JvmProvider";
import { RuntimeSurface } from "./RuntimeSurface";

function renderSurface(metrics: JvmDiagnosticsClient["metrics"], props: { refetchIntervalMs?: number } = {}) {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false, gcTime: 0 } } });
  render(
    <QueryClientProvider client={queryClient}>
      <JvmProvider client={{ ...fakeJvmClient(), metrics }} scope="test">
        <RuntimeSurface {...props} />
      </JvmProvider>
    </QueryClientProvider>,
  );
}

describe("RuntimeSurface", () => {
  it("renders the agent's metrics snapshot", async () => {
    renderSurface(async () => METRICS);
    expect(await screen.findByText("G1 Young Generation")).toBeInTheDocument();
    expect(screen.getByText("37.5%")).toBeInTheDocument();
    expect(screen.getByText("182 MB / 256 MB committed · no max")).toBeInTheDocument();
  });

  it("refetches on the interval and shows the newer snapshot", async () => {
    const metrics = vi.fn<JvmDiagnosticsClient["metrics"]>();
    metrics.mockResolvedValueOnce(METRICS).mockResolvedValue({ ...METRICS, processCpuPercent: 91 });
    renderSurface(metrics, { refetchIntervalMs: 50 });
    expect(await screen.findByText("37.5%")).toBeInTheDocument();
    expect(await screen.findByText("91.0%")).toBeInTheDocument();
    expect(metrics.mock.calls.length).toBeGreaterThanOrEqual(2);
  });

  it("refetches on demand", async () => {
    const metrics = vi.fn<JvmDiagnosticsClient["metrics"]>().mockResolvedValue(METRICS);
    renderSurface(metrics);
    fireEvent.click(await screen.findByRole("button", { name: "Refresh" }));
    await waitFor(() => expect(metrics).toHaveBeenCalledTimes(2));
  });

  it("surfaces a failed read", async () => {
    renderSurface(async () => {
      throw new Error("agent unreachable");
    });
    expect(await screen.findByText("JVM metrics unavailable")).toBeInTheDocument();
  });
});
