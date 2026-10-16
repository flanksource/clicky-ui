import { fireEvent, render, screen, within } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { processNodeRows, processSampleRows } from "./fixtures";
import { ProcessTraceTree } from "./ProcessTraceTree";
import type { ProcessNodeRow } from "./types";

const processRow = (key: string) => {
  const element = document.querySelector<HTMLElement>(`[data-process-key="${key}"]`);
  if (!element) throw new Error(`no row for process ${key}`);
  return element;
};
const itemOf = (key: string) => processRow(key).closest<HTMLElement>('[role="treeitem"]')!;

describe("ProcessTraceTree", () => {
  it("renders the forest, with orphans as roots and children under their parent", () => {
    render(<ProcessTraceTree nodes={processNodeRows} onSelect={() => {}} />);
    expect(screen.getAllByRole("treeitem")).toHaveLength(4);
    expect(itemOf("101:100").parentElement).toContainElement(processRow("102:101"));
    expect(itemOf("101:100").parentElement).not.toContainElement(processRow("300:299"));
    expect(itemOf("300:299").parentElement).toHaveAttribute("role", "tree");
  });

  it("shows CPU and RSS columns for a running process", () => {
    render(<ProcessTraceTree nodes={processNodeRows} onSelect={() => {}} />);
    const row = within(processRow("101:100"));
    expect(row.getByText("88.2%")).toBeInTheDocument();
    expect(row.getByText("401 MB")).toBeInTheDocument();
  });

  it("shows a dash for CPU that has not been measured over a full window yet", () => {
    const unmeasured = processNodeRows.map((row) =>
      row.key === "101:100" ? { ...row, cpuPercent: null, peakCpuPercent: undefined } : row,
    );
    render(<ProcessTraceTree nodes={unmeasured} onSelect={() => {}} />);
    expect(within(processRow("101:100")).getByText("—")).toHaveAttribute("title", "Peak —");
  });

  it("dims an exited process and shows its lifetime and peak usage", () => {
    render(<ProcessTraceTree nodes={processNodeRows} onSelect={() => {}} />);
    const row = processRow("102:101");
    expect(row).toHaveAttribute("data-exited", "true");
    expect(row).toHaveClass("opacity-60");
    expect(within(row).getByText("6.5 s")).toBeInTheDocument();
    expect(within(row).getByText("peak 95.0%")).toBeInTheDocument();
    expect(processRow("101:100")).not.toHaveAttribute("data-exited");
  });

  it("reports the key of the clicked process", () => {
    const onSelect = vi.fn();
    render(<ProcessTraceTree nodes={processNodeRows} onSelect={onSelect} />);
    fireEvent.click(screen.getByText("orphan"));
    expect(onSelect).toHaveBeenCalledWith("300:299");
  });

  it("marks the selected process", () => {
    render(<ProcessTraceTree nodes={processNodeRows} selectedKey="101:100" onSelect={() => {}} />);
    expect(itemOf("101:100")).toHaveAttribute("aria-selected", "true");
    expect(itemOf("300:299")).toHaveAttribute("aria-selected", "false");
  });

  it("reveals a selected process below the levels that open by default", () => {
    const chain: ProcessNodeRow[] = ["1", "2", "3", "4"].map((key, index) => ({
      ...processNodeRows[1]!,
      key,
      pid: Number(key),
      name: `p${key}`,
      isRoot: index === 0,
      ...(index > 0 ? { parentKey: String(index) } : { parentKey: "" }),
    }));
    const { rerender } = render(<ProcessTraceTree nodes={chain} onSelect={() => {}} />);
    expect(document.querySelector('[data-process-key="4"]')).toBeNull();
    rerender(<ProcessTraceTree nodes={chain} selectedKey="4" onSelect={() => {}} />);
    expect(itemOf("4")).toHaveAttribute("aria-selected", "true");
  });

  it("draws a CPU sparkline for processes that have samples", () => {
    render(<ProcessTraceTree nodes={processNodeRows} samples={processSampleRows} onSelect={() => {}} />);
    expect(within(processRow("101:100")).getByRole("img", { name: "CPU % over 12 samples" })).toBeInTheDocument();
    expect(within(processRow("100:1")).queryByRole("img")).not.toBeInTheDocument();
  });

  it("says so when there are no processes", () => {
    render(<ProcessTraceTree nodes={[]} onSelect={() => {}} />);
    expect(screen.getByText("No processes recorded")).toBeInTheDocument();
  });

  it("shows the command inline, truncated, with the full command as its tooltip", () => {
    render(<ProcessTraceTree nodes={processNodeRows} onSelect={() => {}} />);
    const command = within(processRow("101:100")).getByText("go test ./pkg/...");
    expect(command).toHaveClass("truncate");
    expect(command).toHaveAttribute("title", "go test ./pkg/...");
  });

  describe("hide exited", () => {
    it("shows no toolbar unless the host handles the checkbox", () => {
      render(<ProcessTraceTree nodes={processNodeRows} onSelect={() => {}} />);
      expect(screen.queryByLabelText("Hide exited")).not.toBeInTheDocument();
    });

    it("counts processes and reports the checkbox", () => {
      const onHideExitedChange = vi.fn();
      render(<ProcessTraceTree nodes={processNodeRows} onSelect={() => {}} onHideExitedChange={onHideExitedChange} />);
      expect(screen.getByText("4 processes")).toBeInTheDocument();
      fireEvent.click(screen.getByLabelText("Hide exited"));
      expect(onHideExitedChange).toHaveBeenCalledWith(true);
    });

    it("says 1 process, not 1 processes", () => {
      render(<ProcessTraceTree nodes={[processNodeRows[0]!]} onSelect={() => {}} onHideExitedChange={() => {}} />);
      expect(screen.getByText("1 process")).toBeInTheDocument();
    });

    it("drops a childless exited process but keeps the live ones", () => {
      render(<ProcessTraceTree nodes={processNodeRows} hideExited onSelect={() => {}} onHideExitedChange={() => {}} />);
      expect(document.querySelector('[data-process-key="102:101"]')).toBeNull();
      expect(processRow("101:100")).toBeInTheDocument();
      expect(screen.getByLabelText("Hide exited")).toBeChecked();
    });

    it("keeps an exited ancestor of a live process", () => {
      const nodes: ProcessNodeRow[] = [
        { ...processNodeRows[0]!, status: "exited", exitedAt: "2026-10-01T09:00:20.000Z" },
        processNodeRows[1]!,
      ];
      render(<ProcessTraceTree nodes={nodes} hideExited onSelect={() => {}} />);
      expect(processRow("100:1")).toHaveAttribute("data-exited", "true");
      expect(processRow("101:100")).toBeInTheDocument();
    });

    it("says every process has exited when pruning leaves nothing", () => {
      const nodes: ProcessNodeRow[] = processNodeRows.map((row) => ({ ...row, status: "exited" }));
      render(<ProcessTraceTree nodes={nodes} hideExited onSelect={() => {}} />);
      expect(screen.getByText("Every process has exited")).toBeInTheDocument();
      expect(screen.queryAllByRole("treeitem")).toHaveLength(0);
    });
  });

  describe("loading and error", () => {
    it("shows a waiting spinner instead of the empty label while loading", () => {
      render(<ProcessTraceTree nodes={[]} loading onSelect={() => {}} />);
      expect(screen.getByRole("status")).toHaveTextContent("Waiting for process trace…");
      expect(screen.queryByText("No processes recorded")).not.toBeInTheDocument();
    });

    it("shows the error banner and neither the spinner nor the empty label", () => {
      render(<ProcessTraceTree nodes={[]} loading error="trace store unreachable" onSelect={() => {}} />);
      expect(screen.getByRole("alert")).toHaveTextContent("trace store unreachable");
      expect(screen.queryByRole("status")).not.toBeInTheDocument();
      expect(screen.queryByText("No processes recorded")).not.toBeInTheDocument();
    });

    it("keeps the processes visible beside an error", () => {
      render(<ProcessTraceTree nodes={processNodeRows} error="poll failed" onSelect={() => {}} />);
      expect(screen.getByRole("alert")).toHaveTextContent("poll failed");
      expect(screen.getAllByRole("treeitem")).toHaveLength(4);
    });
  });

  describe("expandAll", () => {
    const chain: ProcessNodeRow[] = ["1", "2", "3", "4"].map((key, index) => ({
      ...processNodeRows[1]!,
      key,
      pid: Number(key),
      name: `p${key}`,
      isRoot: index === 0,
      parentKey: index > 0 ? String(index) : "",
    }));

    it("opens levels below the default depth when true and closes them when false", () => {
      const { rerender } = render(<ProcessTraceTree nodes={chain} expandAll={null} onSelect={() => {}} />);
      expect(document.querySelector('[data-process-key="4"]')).toBeNull();
      rerender(<ProcessTraceTree nodes={chain} expandAll onSelect={() => {}} />);
      expect(processRow("4")).toBeInTheDocument();
      rerender(<ProcessTraceTree nodes={chain} expandAll={false} onSelect={() => {}} />);
      expect(document.querySelector('[data-process-key="2"]')).toBeNull();
    });

    it("hides the tree's own expand buttons when the host owns the state", () => {
      render(<ProcessTraceTree nodes={chain} expandAll onSelect={() => {}} />);
      expect(screen.queryByLabelText("Expand all")).not.toBeInTheDocument();
    });

    it("reports the tree's expand buttons when the host handles the change", () => {
      const onExpandAllChange = vi.fn();
      render(<ProcessTraceTree nodes={chain} expandAll={null} onExpandAllChange={onExpandAllChange} onSelect={() => {}} />);
      fireEvent.click(screen.getByLabelText("Expand all"));
      expect(onExpandAllChange).toHaveBeenCalledWith(true);
    });
  });

  it("throws on a parent cycle rather than hiding the processes in it", () => {
    vi.spyOn(console, "error").mockImplementation(() => {});
    const a = { ...processNodeRows[0]!, key: "a", parentKey: "b", isRoot: false };
    const b = { ...processNodeRows[0]!, key: "b", parentKey: "a", isRoot: false };
    expect(() => render(<ProcessTraceTree nodes={[a, b]} onSelect={() => {}} />)).toThrow(/cycle/);
  });
});
