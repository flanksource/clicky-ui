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

  it("throws on a parent cycle rather than hiding the processes in it", () => {
    vi.spyOn(console, "error").mockImplementation(() => {});
    const a = { ...processNodeRows[0]!, key: "a", parentKey: "b", isRoot: false };
    const b = { ...processNodeRows[0]!, key: "b", parentKey: "a", isRoot: false };
    expect(() => render(<ProcessTraceTree nodes={[a, b]} onSelect={() => {}} />)).toThrow(/cycle/);
  });
});
