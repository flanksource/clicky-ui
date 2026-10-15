import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { httpExchangeRows, processNodeRows, processSampleRows, sqlStatementRows, terminalEvents } from "./fixtures";
import { TraceView } from "./TraceView";

describe("TraceView", () => {
  it.each(["http", "http_proxy"])("renders %s rows as HTTP exchanges", (kind) => {
    render(<TraceView kind={kind} rows={httpExchangeRows} />);
    expect(screen.getByText("https://api.example.com/v1/cycles/run")).toBeInTheDocument();
  });

  it.each(["pg_proxy", "sql_statements"])("renders %s rows as SQL statements", (kind) => {
    render(<TraceView kind={kind} rows={sqlStatementRows} />);
    expect(screen.getByText("×3")).toBeInTheDocument();
  });

  it("renders terminal rows in the cast player", () => {
    render(<TraceView kind="terminal" rows={terminalEvents} />);
    expect(screen.getByRole("region", { name: "Terminal screen" })).toBeInTheDocument();
    expect(screen.getByText("exit 0")).toBeInTheDocument();
  });

  it("renders process_tree rows as a tree and selects a process on click", () => {
    render(<TraceView kind="process_tree" rows={processNodeRows} samples={processSampleRows} />);
    expect(screen.getAllByRole("treeitem")).toHaveLength(4);
    fireEvent.click(screen.getByText("orphan"));
    expect(screen.getByText("orphan").closest('[role="treeitem"]')).toHaveAttribute("aria-selected", "true");
    expect(screen.getByRole("img", { name: "CPU % over 12 samples" })).toBeInTheDocument();
  });

  it("renders any other kind as a table over the row keys", () => {
    render(
      <TraceView
        kind="ticks"
        rows={[
          { tick: 1, label: "first" },
          { tick: 2, label: "second" },
        ]}
      />,
    );
    expect(screen.getByRole("columnheader", { name: /Tick/i })).toBeInTheDocument();
    expect(screen.getByRole("columnheader", { name: /Label/i })).toBeInTheDocument();
    expect(screen.getByText("second")).toBeInTheDocument();
  });

  it("renders the empty state of an unknown kind with no rows", () => {
    render(<TraceView kind="ticks" rows={[]} />);
    expect(screen.getByText("No ticks records")).toBeInTheDocument();
  });

  it("throws, naming the kind and the row, when a row lacks what its viewer needs", () => {
    vi.spyOn(console, "error").mockImplementation(() => {});
    expect(() => render(<TraceView kind="pg_proxy" rows={[{ op: "SELECT" }]} />)).toThrow(
      /trace kind "pg_proxy" row 0 has no "sql"/,
    );
    expect(() => render(<TraceView kind="process_tree" rows={[{ pid: 1 }]} />)).toThrow(
      /trace kind "process_tree" row 0 has no "key"/,
    );
  });
});
