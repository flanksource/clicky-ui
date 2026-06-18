import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { render, screen } from "@testing-library/react";
import type { ReactElement } from "react";
import { describe, expect, it } from "vitest";
import { UiChip } from "../icons";
import { TimeseriesCoreBars } from "./TimeseriesCoreBars";
import type { TimeseriesResponse } from "./TimeseriesPanel";

function renderWithQueryClient(ui: ReactElement) {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false, gcTime: 0 } },
  });
  return render(<QueryClientProvider client={queryClient}>{ui}</QueryClientProvider>);
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
});
