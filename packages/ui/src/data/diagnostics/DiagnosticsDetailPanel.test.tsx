import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { DiagnosticsDetailPanel } from "./DiagnosticsDetailPanel";
import { sampleProcessTree } from "./fixtures";

describe("DiagnosticsDetailPanel", () => {
  it("composes the stack dump view for a process with a captured stack", () => {
    render(<DiagnosticsDetailPanel process={sampleProcessTree} />);
    expect(screen.getByText("ready")).toBeInTheDocument();
    expect(screen.getByLabelText("Filter goroutines")).toBeInTheDocument();
    expect(screen.getByText("g17")).toBeInTheDocument();
  });

  it("refreshes the stack of the selected pid from the stack toolbar", () => {
    const onCollectStack = vi.fn();
    render(<DiagnosticsDetailPanel process={sampleProcessTree} onCollectStack={onCollectStack} />);
    fireEvent.click(screen.getByRole("button", { name: /Refresh/ }));
    expect(onCollectStack).toHaveBeenCalledWith(sampleProcessTree.pid);
  });

  it("lifts Refresh into the header and drops the filter UI in single-item mode", () => {
    render(<DiagnosticsDetailPanel process={sampleProcessTree} singleItem onCollectStack={() => {}} />);
    expect(screen.queryByLabelText("Filter goroutines")).not.toBeInTheDocument();
    expect(screen.getAllByRole("button", { name: /Refresh/ })).toHaveLength(1);
  });

  it("offers Collect when no stack was captured, and shows the capture error", () => {
    const onCollectStack = vi.fn();
    render(
      <DiagnosticsDetailPanel
        process={{ ...sampleProcessTree, stack_capture: { status: "error", error: "ptrace denied" } }}
        onCollectStack={onCollectStack}
      />,
    );
    expect(screen.getByText("ptrace denied")).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: /Collect stack trace/ }));
    expect(onCollectStack).toHaveBeenCalledWith(sampleProcessTree.pid);
  });

  it("says nothing is selected for a null process", () => {
    render(<DiagnosticsDetailPanel process={null} />);
    expect(screen.getByText("Select a process to view diagnostics")).toBeInTheDocument();
  });
});
