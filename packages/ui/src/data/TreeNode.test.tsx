import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { TreeNode } from "./TreeNode";

type Node = { id: string; label: string; children?: Node[] };

const tree: Node = {
  id: "root",
  label: "root",
  children: [
    { id: "a", label: "a", children: [{ id: "a1", label: "a1" }] },
    { id: "b", label: "b" },
  ],
};

function renderTree(props: Partial<Parameters<typeof TreeNode<Node>>[0]> = {}) {
  return render(
    <TreeNode<Node>
      node={tree}
      getChildren={(n) => n.children}
      getKey={(n) => n.id}
      renderRow={({ node }) => <span>{node.label}</span>}
      {...props}
    />,
  );
}

describe("TreeNode", () => {
  it("renders root and first-level children by default (defaultOpen: depth < 1)", () => {
    renderTree();
    expect(screen.getByText("root")).toBeInTheDocument();
    expect(screen.getByText("a")).toBeInTheDocument();
    expect(screen.getByText("b")).toBeInTheDocument();
    expect(screen.queryByText("a1")).toBeNull();
  });

  it("respects custom defaultOpen predicate", () => {
    renderTree({ defaultOpen: () => true });
    expect(screen.getByText("a1")).toBeInTheDocument();
  });

  it("toggles open state when row is clicked", () => {
    renderTree();
    expect(screen.queryByText("a1")).toBeNull();
    fireEvent.click(screen.getByText("a"));
    expect(screen.getByText("a1")).toBeInTheDocument();
  });

  it("calls onSelect when row clicked", () => {
    const onSelect = vi.fn();
    renderTree({ onSelect });
    fireEvent.click(screen.getByText("b"));
    expect(onSelect).toHaveBeenCalledTimes(1);
    expect(onSelect.mock.calls[0]![0]).toMatchObject({ id: "b" });
  });

  it("marks selected row via aria-selected", () => {
    renderTree({ selected: tree.children![1] });
    const selected = screen.getByText("b").closest("[role='treeitem']")!;
    expect(selected).toHaveAttribute("aria-selected", "true");
  });

  it("expandAll transitions open/close deep nodes", () => {
    // expandAll is a *change* signal: initial render uses defaultOpen;
    // toggling expandAll from its initial value forces all nodes to match.
    const { rerender } = render(
      <TreeNode<Node>
        node={tree}
        getChildren={(n) => n.children}
        getKey={(n) => n.id}
        renderRow={({ node }) => <span>{node.label}</span>}
        expandAll={null}
      />,
    );
    expect(screen.queryByText("a1")).toBeNull();

    // Flip expandAll → true: deep nodes open.
    rerender(
      <TreeNode<Node>
        node={tree}
        getChildren={(n) => n.children}
        getKey={(n) => n.id}
        renderRow={({ node }) => <span>{node.label}</span>}
        expandAll={true}
      />,
    );
    expect(screen.getByText("a1")).toBeInTheDocument();

    // Flip expandAll → false: all nodes close (root included).
    rerender(
      <TreeNode<Node>
        node={tree}
        getChildren={(n) => n.children}
        getKey={(n) => n.id}
        renderRow={({ node }) => <span>{node.label}</span>}
        expandAll={false}
      />,
    );
    expect(screen.queryByText("a")).toBeNull();
  });

  it("applies depth-based indentation", () => {
    renderTree({ defaultOpen: () => true });
    const rootRow = screen.getByText("root").closest("div[style]") as HTMLElement;
    const aRow = screen.getByText("a").closest("div[style]") as HTMLElement;
    const a1Row = screen.getByText("a1").closest("div[style]") as HTMLElement;
    // depth 0 = 8px, 1 = 24px, 2 = 40px (default indentPx=16, basePaddingPx=8)
    expect(rootRow.style.paddingLeft).toBe("8px");
    expect(aRow.style.paddingLeft).toBe("24px");
    expect(a1Row.style.paddingLeft).toBe("40px");
  });
});
