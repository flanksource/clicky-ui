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

  it("names the card and trigger after a custom title and labels request, module, file and build counters", () => {
    render(
      <ServerTimingBadge
        title="Page load"
        metrics={[
          { name: "total", duration: 30, counters: {} },
          { name: "fetch", duration: 12, counters: { requests: 1, files: 2 } },
          { name: "compile", duration: 8, counters: { modules: 2, builds: 1 } },
        ]}
      />,
    );

    fireEvent.focus(screen.getByRole("button", { name: "Show page load" }));

    expect(screen.getByText("Page load")).toBeInTheDocument();
    expect(screen.getByText("1 request · 2 files")).toBeInTheDocument();
    expect(screen.getByText("2 modules · 1 build")).toBeInTheDocument();
  });

  it("renders the footer inside the card under the phases", () => {
    render(<ServerTimingBadge metrics={metrics} footer={<button type="button">Build log…</button>} />);

    expect(screen.queryByRole("button", { name: "Build log…" })).not.toBeInTheDocument();
    fireEvent.focus(screen.getByRole("button", { name: "Show server timing" }));

    expect(screen.getByRole("button", { name: "Build log…" })).toBeInTheDocument();
  });

  it("renders nothing without a total metric", () => {
    const { container, rerender } = render(<ServerTimingBadge metrics={undefined} />);
    expect(container).toBeEmptyDOMElement();

    rerender(<ServerTimingBadge metrics={[{ name: "sql", duration: 3, counters: {} }]} />);
    expect(container).toBeEmptyDOMElement();
  });
});
