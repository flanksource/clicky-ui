import { fireEvent, render, screen, within } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import {
  goProfileRecords,
  httpExchangeRows,
  processNodeRows,
  processSampleRows,
  sqlStatementRows,
  stackRecords,
  terminalEvents,
} from "./fixtures";
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

  describe("goprof", () => {
    const otherProcess = goProfileRecords.map((record) => ({ ...record, key: "101:100", checkpointId: `${record.checkpointId}-child` }));

    it("renders one process's records as a Go profile view without a process heading", () => {
      render(<TraceView kind="goprof" rows={goProfileRecords} />);
      expect(screen.getByRole("combobox", { name: "Profile checkpoint" })).toHaveValue("prof-cpu");
      expect(screen.getByText("Total 2.3 s across 7 functions")).toBeInTheDocument();
      expect(document.querySelectorAll("[data-go-profile]")).toHaveLength(1);
      expect(screen.queryByText("100:1")).toBeNull();
    });

    it("renders one profile view per process key when the records span several, each under its key", () => {
      render(<TraceView kind="goprof" rows={[...goProfileRecords, ...otherProcess]} />);
      const sections = [...document.querySelectorAll("[data-trace-process]")];
      expect(sections.map((section) => section.getAttribute("data-trace-process"))).toEqual(["100:1", "101:100"]);
      sections.forEach((section) => expect(within(section as HTMLElement).getByRole("combobox", { name: "Profile checkpoint" })).toBeInTheDocument());
      expect(screen.getByText("101:100")).toBeInTheDocument();
    });

    it("scopes each process's checkpoints to its own records", () => {
      render(<TraceView kind="goprof" rows={[...goProfileRecords, ...otherProcess]} />);
      const child = within(document.querySelector('[data-trace-process="101:100"]') as HTMLElement);
      const picker = child.getByRole("combobox", { name: "Profile checkpoint" });
      expect(picker).toHaveValue("prof-cpu-child");
      expect(within(picker).getAllByRole("option").map((option) => option.getAttribute("value"))).toEqual(["prof-cpu-child", "prof-heap-child"]);
    });

    it("throws, naming the row, when a record has no process key", () => {
      vi.spyOn(console, "error").mockImplementation(() => {});
      expect(() => render(<TraceView kind="goprof" rows={[{ checkpointId: "c" }]} />)).toThrow(/trace kind "goprof" row 0 has no "key"/);
    });
  });

  describe("stacks", () => {
    const section = (key: string) => within(document.querySelector(`[data-trace-process="${key}"]`) as HTMLElement);
    const checkpointIds = (key: string) =>
      [...document.querySelectorAll(`[data-trace-process="${key}"] [data-stack-checkpoint]`)].map((node) => node.getAttribute("data-stack-checkpoint"));

    it("groups the records of each process into one stack dump per checkpoint, latest first", () => {
      render(<TraceView kind="stacks" rows={stackRecords} />);
      expect([...document.querySelectorAll("[data-trace-process]")].map((node) => node.getAttribute("data-trace-process"))).toEqual([
        "100:1",
        "101:100",
        "102:101",
      ]);
      expect(checkpointIds("100:1")).toEqual(["ckpt-timeout", "ckpt-periodic"]);
    });

    it("renders each checkpoint's goroutines from only that checkpoint's records", () => {
      render(<TraceView kind="stacks" rows={stackRecords} />);
      const timeout = within(document.querySelector('[data-stack-checkpoint="ckpt-timeout"]') as HTMLElement);
      const periodic = within(document.querySelector('[data-stack-checkpoint="ckpt-periodic"]') as HTMLElement);
      expect(timeout.getByText("3 / 3 goroutines")).toBeInTheDocument();
      expect(timeout.getByText("g22")).toBeInTheDocument();
      expect(periodic.getByText("2 / 2 goroutines")).toBeInTheDocument();
      expect(periodic.queryByText("g22")).toBeNull();
    });

    it("shows how each checkpoint was taken", () => {
      render(<TraceView kind="stacks" rows={stackRecords} />);
      expect(section("100:1").getAllByText("inprocess")).toHaveLength(2);
      expect(section("101:100").getByText("native")).toBeInTheDocument();
    });

    it("shows a native dump's raw text and a failed dump's error", () => {
      render(<TraceView kind="stacks" rows={stackRecords} />);
      expect(section("101:100").getByText(/Sampling process 101/)).toBeInTheDocument();
      expect(section("102:101").getByText("the process exited before a stack could be read")).toBeInTheDocument();
    });

    it("omits the process headings when the records are of one process", () => {
      render(<TraceView kind="stacks" rows={stackRecords.filter((record) => record.key === "100:1")} />);
      expect(screen.queryByText("100:1")).toBeNull();
      expect(checkpointIds("100:1")).toEqual(["ckpt-timeout", "ckpt-periodic"]);
    });

    it("throws, naming the row, when a record has no checkpoint", () => {
      vi.spyOn(console, "error").mockImplementation(() => {});
      expect(() => render(<TraceView kind="stacks" rows={[{ key: "100:1" }]} />)).toThrow(/trace kind "stacks" row 0 has no "checkpointId"/);
    });
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
