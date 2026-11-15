import { render, screen, within } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { METRICS } from "../fixtures/classes";
import { MemoryPools } from "./MemoryPools";

const MB = 1024 * 1024;
const pool = (name: string) => document.querySelector<HTMLElement>(`[data-pool="${name}"]`)!;

describe("MemoryPools", () => {
  it("draws a pool with a maximum against that maximum", () => {
    render(<MemoryPools memory={METRICS.memory} />);
    expect(within(pool("G1 Old Gen")).getByText("611 MB / 1 GB")).toBeInTheDocument();
    const bar = within(pool("G1 Old Gen")).getByRole("progressbar", { name: "G1 Old Gen memory" });
    expect(bar).toHaveAttribute("aria-valuemax", String(1024 * MB));
    expect(bar).toHaveAttribute("aria-valuenow", String(768 * MB));
  });

  it("draws a pool without a maximum (-1) against its committed size and says so", () => {
    render(<MemoryPools memory={METRICS.memory} />);
    expect(within(pool("G1 Eden Space")).getByText("182 MB / 256 MB committed · no max")).toBeInTheDocument();
    expect(within(pool("G1 Eden Space")).getByRole("progressbar")).toHaveAttribute("aria-valuemax", String(256 * MB));
  });

  it("renders an empty pool as text instead of a bar", () => {
    render(<MemoryPools memory={METRICS.memory} />);
    expect(within(pool("mapped")).queryByRole("progressbar")).toBeNull();
    expect(within(pool("mapped")).getByText("0 B / 0 B committed · no max")).toBeInTheDocument();
  });

  it("totals each group and names the empty ones", () => {
    render(<MemoryPools memory={{ ...METRICS.memory, buffer: [] }} />);
    expect(screen.getByRole("heading", { name: /^Heap/ })).toHaveTextContent("805 MB / 1.3 GB");
    expect(screen.getByText("No pools reported.")).toBeInTheDocument();
  });

  it("colours a nearly full bounded pool red", () => {
    render(<MemoryPools memory={{ heap: [{ name: "Old", used: 95, committed: 100, max: 100 }], nonHeap: [], buffer: [] }} />);
    expect(within(pool("Old")).getByRole("progressbar").querySelector(".bg-red-500")).not.toBeNull();
  });
});
