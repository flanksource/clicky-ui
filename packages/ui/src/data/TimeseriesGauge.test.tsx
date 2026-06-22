import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { render, screen } from "@testing-library/react";
import type { ReactElement } from "react";
import { describe, expect, it } from "vitest";
import { UiChip } from "../icons";
import { TimeseriesGauge } from "./TimeseriesGauge";
import type { TimeseriesResponse } from "./TimeseriesPanel";

function renderWithQueryClient(ui: ReactElement) {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false, gcTime: 0 } },
  });
  return render(<QueryClientProvider client={queryClient}>{ui}</QueryClientProvider>);
}

const fetcher = async (url: string): Promise<TimeseriesResponse> => ({
  id: url,
  points: [{ at: "2026-06-02T12:00:00Z", value: url.includes("limit") ? 100 : 42 }],
});

describe("TimeseriesGauge", () => {
  it("renders a compact labeled cell while keeping the icon and readout", async () => {
    const { container } = renderWithQueryClient(
      <TimeseriesGauge
        variant="cell"
        title="CPU"
        icon={UiChip}
        unit="percent"
        centerDisplay="percent"
        value={{ id: "cpu.usage" }}
        max={100}
        refreshMs={0}
        fetcher={fetcher}
      />,
    );

    expect(await screen.findByText("42%")).toBeInTheDocument();
    expect(screen.getByText("CPU")).toBeInTheDocument();
    expect(container.firstElementChild?.className).toMatch(/inline-flex/);
    expect(container.querySelector("svg")).toBeInTheDocument();
  });

  it("hides the cell label without hiding the icon or readout", async () => {
    const { container } = renderWithQueryClient(
      <TimeseriesGauge
        variant="cell"
        showLabel={false}
        title="CPU"
        icon={UiChip}
        unit="percent"
        centerDisplay="percent"
        value={{ id: "cpu.usage" }}
        max={100}
        refreshMs={0}
        fetcher={fetcher}
      />,
    );

    expect(await screen.findByText("42%")).toBeInTheDocument();
    expect(screen.queryByText("CPU")).not.toBeInTheDocument();
    expect(container.querySelector("svg")).toBeInTheDocument();
  });

  it("renders a linear progress bar instead of the arc when shape is linear", async () => {
    const { container } = renderWithQueryClient(
      <TimeseriesGauge
        shape="linear"
        title="Disk"
        unit="percent"
        centerDisplay="percent"
        value={{ id: "disk.usage" }}
        max={100}
        expandable={false}
        refreshMs={0}
        fetcher={fetcher}
      />,
    );

    expect(await screen.findByText("42%")).toBeInTheDocument();
    expect(container.querySelector('[data-shape="linear"]')).toBeInTheDocument();
    // The linear shape replaces the SVG arc with a div-based progress bar.
    expect(container.querySelector("svg")).not.toBeInTheDocument();
  });
});
