import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { render, screen, waitFor } from "@testing-library/react";
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
  it("renders compact labeled bars while keeping the icon and caption", async () => {
    const { container } = renderWithQueryClient(
      <TimeseriesCoreBars
        variant="cell"
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

    expect(await screen.findByText("2.3/4 cores")).toBeInTheDocument();
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
    expect(screen.queryByText("2.3/4 cores")).not.toBeInTheDocument();
    expect(container.querySelector("svg")).toBeInTheDocument();
    await waitFor(() => {
      expect(container.firstElementChild).toHaveAttribute(
        "aria-label",
        "CPU: 2.3/4 cores",
      );
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

    expect(await screen.findByText("2.3/4 cores")).toBeInTheDocument();
    expect(screen.getByText("CPU")).toBeInTheDocument();
    expect(container.firstElementChild?.className).toMatch(/items-center/);
    expect(container.firstElementChild?.className).not.toMatch(/flex-col/);
    expect(container.querySelector("[data-orientation]")).toHaveAttribute(
      "data-orientation",
      "horizontal",
    );
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

    expect(await screen.findByText("2.3/8 cores")).toBeInTheDocument();
    const bars = container.querySelector("[data-core-density]");
    expect(bars).toHaveAttribute("data-core-count", "8");
    expect(bars).toHaveAttribute("data-core-density", "compact");
  });
});
