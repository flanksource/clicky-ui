import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import type { ReactElement } from "react";
import { describe, expect, it } from "vitest";
import { UiChip } from "../icons";
import { TimeseriesCoreBars } from "./TimeseriesCoreBars";
import type { TimeseriesResponse } from "./TimeseriesPanel";

function renderWithQueryClient(ui: ReactElement) {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false, gcTime: 0 } },
  });
  return render(
    <QueryClientProvider client={queryClient}>{ui}</QueryClientProvider>,
  );
}

const fetcher = async (url: string): Promise<TimeseriesResponse> => ({
  id: url,
  points: [{ at: "2026-06-02T12:00:00Z", value: 2300 }],
});

describe("TimeseriesCoreBars cell variant", () => {
  it("renders compact labeled bars, showing capacity when showCapacity is set", async () => {
    const { container } = renderWithQueryClient(
      <TimeseriesCoreBars
        variant="cell"
        showCapacity
        title="CPU"
        icon={UiChip}
        value={{ id: "cpu.usage" }}
        max={4000}
        refreshMs={0}
        fetcher={fetcher}
      />,
    );

    expect(await screen.findByText("2.3/4 cores")).toBeInTheDocument();
    expect(screen.getByText("CPU")).toBeInTheDocument();
    expect(container.firstElementChild?.className).toMatch(/inline-flex/);
    expect(container.querySelector("[data-orientation]")).toHaveAttribute(
      "data-orientation",
      "vertical",
    );
    expect(container.querySelector("svg")).toBeInTheDocument();
  });

  it("hides the cell label without hiding the icon or caption", async () => {
    const { container } = renderWithQueryClient(
      <TimeseriesCoreBars
        variant="cell"
        showLabel={false}
        title="CPU"
        icon={UiChip}
        value={{ id: "cpu.usage" }}
        max={4000}
        refreshMs={0}
        fetcher={fetcher}
      />,
    );

    expect(await screen.findByText("2.3 cores")).toBeInTheDocument();
    expect(screen.queryByText("CPU")).not.toBeInTheDocument();
    expect(container.querySelector("svg")).toBeInTheDocument();
  });

  it("hides the value caption without hiding the label or icon", async () => {
    const { container } = renderWithQueryClient(
      <TimeseriesCoreBars
        variant="cell"
        showValue={false}
        title="CPU"
        icon={UiChip}
        value={{ id: "cpu.usage" }}
        max={4000}
        refreshMs={0}
        fetcher={fetcher}
      />,
    );

    await screen.findByText("CPU");
    expect(screen.queryByText("2.3 cores")).not.toBeInTheDocument();
    expect(container.querySelector("svg")).toBeInTheDocument();
    await waitFor(() => {
      expect(
        container.querySelector('[aria-label="CPU: 2.3 cores"]'),
      ).toBeInTheDocument();
    });
  });

  it("supports horizontal bars without changing the cell layout", async () => {
    const { container } = renderWithQueryClient(
      <TimeseriesCoreBars
        variant="cell"
        orientation="horizontal"
        title="CPU"
        icon={UiChip}
        value={{ id: "cpu.usage" }}
        max={4000}
        refreshMs={0}
        fetcher={fetcher}
      />,
    );

    expect(await screen.findByText("2.3 cores")).toBeInTheDocument();
    expect(screen.getByText("CPU")).toBeInTheDocument();
    expect(container.firstElementChild?.className).toMatch(/items-center/);
    expect(container.firstElementChild?.className).not.toMatch(/flex-col/);
    expect(container.querySelector("[data-orientation]")).toHaveAttribute(
      "data-orientation",
      "horizontal",
    );
  });

  it("omits the capacity from the caption by default", async () => {
    render(
      <QueryClientProvider
        client={new QueryClient({ defaultOptions: { queries: { retry: false, gcTime: 0 } } })}
      >
        <TimeseriesCoreBars
          variant="cell"
          title="CPU"
          icon={UiChip}
          value={{ id: "cpu.usage" }}
          max={4000}
          refreshMs={0}
          fetcher={fetcher}
        />
      </QueryClientProvider>,
    );

    expect(await screen.findByText("2.3 cores")).toBeInTheDocument();
    expect(screen.queryByText("2.3/4 cores")).not.toBeInTheDocument();
  });

  it("renders a custom unit (GB) instead of cores", async () => {
    const GiB = 1024 ** 3;
    const memFetcher = async (): Promise<TimeseriesResponse> => ({
      id: "mem",
      points: [{ at: "2026-06-02T12:00:00Z", value: 2.5 * GiB }],
    });
    render(
      <QueryClientProvider
        client={new QueryClient({ defaultOptions: { queries: { retry: false, gcTime: 0 } } })}
      >
        <TimeseriesCoreBars
          variant="cell"
          title="Mem"
          icon={UiChip}
          value={{ id: "mem.rss" }}
          max={4 * GiB}
          unit={{ perBar: GiB, label: "GB", barLabel: "GB" }}
          refreshMs={0}
          fetcher={memFetcher}
        />
      </QueryClientProvider>,
    );

    expect(await screen.findByText("2.5 GB")).toBeInTheDocument();
    expect(screen.queryByText(/cores/)).not.toBeInTheDocument();
  });

  it("uses compact bar sizing after four cores", async () => {
    const { container } = renderWithQueryClient(
      <TimeseriesCoreBars
        variant="cell"
        title="CPU"
        icon={UiChip}
        value={{ id: "cpu.usage" }}
        max={8000}
        refreshMs={0}
        fetcher={fetcher}
      />,
    );

    expect(await screen.findByText("2.3 cores")).toBeInTheDocument();
    const bars = container.querySelector("[data-core-density]");
    expect(bars).toHaveAttribute("data-core-count", "8");
    expect(bars).toHaveAttribute("data-core-density", "compact");
  });

  it("opens a hover card summarising current/min/max/avg/capacity over the window", async () => {
    const windowed = async (url: string): Promise<TimeseriesResponse> => ({
      id: url,
      points: [1000, 3000, 2000, 2300].map((value, i) => ({ at: `t${i}`, value })),
    });
    const { container } = renderWithQueryClient(
      <TimeseriesCoreBars
        variant="cell"
        title="CPU"
        icon={UiChip}
        value={{ id: "cpu.usage" }}
        max={4000}
        refreshMs={0}
        fetcher={windowed}
      />,
    );

    await screen.findByText("2.3 cores");
    // The card stays closed until the gauge is hovered.
    expect(screen.queryByText("Current")).not.toBeInTheDocument();

    fireEvent.mouseEnter(container.firstElementChild as HTMLElement);

    expect(await screen.findByText("Current")).toBeInTheDocument();
    expect(screen.getByText("Min")).toBeInTheDocument();
    expect(screen.getByText("Max")).toBeInTheDocument();
    expect(screen.getByText("Avg")).toBeInTheDocument();
    expect(screen.getByText("Capacity")).toBeInTheDocument();
    // min 1000mc → 1, max 3000mc → 3, avg 2075mc → 2.1, capacity 4000mc → 4.
    expect(screen.getByText("1 cores")).toBeInTheDocument();
    expect(screen.getByText("3 cores")).toBeInTheDocument();
    expect(screen.getByText("2.1 cores")).toBeInTheDocument();
    expect(screen.getByText("4 cores")).toBeInTheDocument();
  });

  it("does not wrap in a hover card when hoverCard is false", async () => {
    const { container } = renderWithQueryClient(
      <TimeseriesCoreBars
        variant="cell"
        hoverCard={false}
        title="CPU"
        icon={UiChip}
        value={{ id: "cpu.usage" }}
        max={4000}
        refreshMs={0}
        fetcher={fetcher}
      />,
    );

    await screen.findByText("2.3 cores");
    fireEvent.mouseEnter(container.firstElementChild as HTMLElement);
    expect(screen.queryByText("Current")).not.toBeInTheDocument();
  });
});
