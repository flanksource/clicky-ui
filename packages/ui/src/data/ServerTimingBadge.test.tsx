import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { ServerTimingBadge } from "./ServerTimingBadge";
import type { ServerTimingMetric } from "./server-timing";

const metrics: ServerTimingMetric[] = [
  { name: "total", duration: 120.5, counters: {} },
  { name: "command", duration: 95.2, counters: {} },
  {
    name: "sql",
    duration: 18.6,
    description: "queries=2 rows_returned=501",
    counters: { queries: 2, rows_returned: 501 },
  },
  {
    name: "redis",
    duration: 0,
    description: "ops=0 hits=0 misses=0 errors=0",
    counters: { ops: 0, hits: 0, misses: 0, errors: 0 },
  },
];

describe("ServerTimingBadge", () => {
  it("renders the total and exposes every reported phase on focus", () => {
    render(<ServerTimingBadge metrics={metrics} />);

    const trigger = screen.getByRole("button", { name: "Show server timing" });
    expect(trigger).toHaveTextContent("121 ms");

    fireEvent.focus(trigger);

    expect(screen.getByText("Server timing")).toBeInTheDocument();
    expect(screen.getByText("Command")).toBeInTheDocument();
    expect(screen.getByText("2 queries · 501 rows returned")).toBeInTheDocument();
    expect(screen.getByText("0 operations · 0 hits · 0 misses · 0 errors")).toBeInTheDocument();
    expect(screen.getByText("0.0 ms")).toBeInTheDocument();
  });

  it("renders nothing without a total metric", () => {
    const { container, rerender } = render(<ServerTimingBadge metrics={undefined} />);
    expect(container).toBeEmptyDOMElement();

    rerender(<ServerTimingBadge metrics={[{ name: "sql", duration: 3, counters: {} }]} />);
    expect(container).toBeEmptyDOMElement();
  });
});
