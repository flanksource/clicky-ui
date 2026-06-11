import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { TreeNode } from "./TreeNode";

type Node = { id: string; label: string; children?: Node[]; lazy?: boolean };

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

  it("clicking the caret toggles without selecting the row", () => {
    const onSelect = vi.fn();
    renderTree({ onSelect });
    // Node "a" is expandable; its caret is the Expand/Collapse button.
    const caret = screen.getByRole("button", { name: "Expand" });
    expect(screen.queryByText("a1")).toBeNull();
    fireEvent.click(caret);
    // Caret expands the node...
    expect(screen.getByText("a1")).toBeInTheDocument();
    // ...but never selects it (no onSelect, unlike a row-label click).
    expect(onSelect).not.toHaveBeenCalled();
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

  it("expandAll recursively reveals depths that mount only as ancestors open", () => {
    // A 4-level chain rendered fully collapsed: only the root row is mounted, so
    // a one-level expand would stop short. Flipping expandAll → true must cascade
    // through every newly-mounted descendant down to the deepest leaf.
    const deep: Node = {
      id: "r",
      label: "r",
      children: [{ id: "x", label: "x", children: [{ id: "y", label: "y", children: [{ id: "z", label: "z" }] }] }],
    };
    const props = {
      node: deep,
      getChildren: (n: Node) => n.children,
      getKey: (n: Node) => n.id,
      renderRow: ({ node }: { node: Node }) => <span>{node.label}</span>,
      defaultOpen: () => false,
    };
    const { rerender } = render(<TreeNode<Node> {...props} expandAll={null} />);
    // Collapsed: only the root is visible.
    expect(screen.getByText("r")).toBeInTheDocument();
    expect(screen.queryByText("z")).toBeNull();

    rerender(<TreeNode<Node> {...props} expandAll={true} />);
    // The deepest leaf is now visible — proves the cascade is recursive.
    expect(screen.getByText("z")).toBeInTheDocument();

    rerender(<TreeNode<Node> {...props} expandAll={false} />);
    // Collapse-all returns to the root only.
    expect(screen.queryByText("x")).toBeNull();
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

describe("TreeNode lazy children", () => {
  // A single lazy root that carries no synchronous children; loadChildren
  // supplies them the first time it is opened.
  const lazyRoot: Node = { id: "root", label: "root", lazy: true };

  function renderLazy(
    loadChildren: (n: Node) => Promise<Node[]>,
    renderRow?: Parameters<typeof TreeNode<Node>>[0]["renderRow"],
  ) {
    return render(
      <TreeNode<Node>
        node={lazyRoot}
        getChildren={(n) => n.children}
        getKey={(n) => n.id}
        defaultOpen={() => false}
        hasMoreChildren={(n) => n.lazy === true && !n.children}
        loadChildren={loadChildren}
        renderRow={renderRow ?? (({ node }) => <span>{node.label}</span>)}
      />,
    );
  }

  it("shows an expand chevron for a lazy node with no synchronous children", () => {
    renderLazy(() => Promise.resolve([]));
    const row = screen.getByText("root").closest("[role='treeitem']")!;
    // aria-expanded is only present when the node is expandable; a lazy node is.
    expect(row).toHaveAttribute("aria-expanded", "false");
  });

  it("fetches children once on open, showing loading then the resolved nodes", async () => {
    const loadChildren = vi.fn(() =>
      Promise.resolve([{ id: "c1", label: "child-1" }] as Node[]),
    );
    renderLazy(loadChildren, ({ node, loading }) => (
      <span>
        {node.label}
        {loading ? " (loading)" : ""}
      </span>
    ));

    fireEvent.click(screen.getByText("root"));
    expect(screen.getByText("root (loading)")).toBeInTheDocument();

    await waitFor(() => expect(screen.getByText("child-1")).toBeInTheDocument());
    expect(loadChildren).toHaveBeenCalledTimes(1);
  });

  it("does not re-fetch when collapsed and reopened after a successful load", async () => {
    const loadChildren = vi.fn(() =>
      Promise.resolve([{ id: "c1", label: "child-1" }] as Node[]),
    );
    renderLazy(loadChildren);

    fireEvent.click(screen.getByText("root"));
    await waitFor(() => expect(screen.getByText("child-1")).toBeInTheDocument());
    fireEvent.click(screen.getByText("root")); // collapse
    expect(screen.queryByText("child-1")).toBeNull();
    fireEvent.click(screen.getByText("root")); // reopen
    expect(screen.getByText("child-1")).toBeInTheDocument();
    expect(loadChildren).toHaveBeenCalledTimes(1);
  });

  it("surfaces a load failure via renderRow ctx.error and stays usable", async () => {
    const loadChildren = vi.fn(() => Promise.reject(new Error("boom")));
    renderLazy(loadChildren, ({ node, error }) => (
      <span>
        {node.label}
        {error ? ` (error: ${(error as Error).message})` : ""}
      </span>
    ));

    fireEvent.click(screen.getByText("root"));
    await waitFor(() =>
      expect(screen.getByText("root (error: boom)")).toBeInTheDocument(),
    );
  });

  it("retries the fetch after a failure when reopened", async () => {
    const loadChildren = vi
      .fn<(n: Node) => Promise<Node[]>>()
      .mockRejectedValueOnce(new Error("transient"))
      .mockResolvedValueOnce([{ id: "c1", label: "child-1" }]);
    renderLazy(loadChildren, ({ node, error }) => (
      <span data-testid="row">
        {node.label}
        {error ? " (error)" : ""}
      </span>
    ));

    const row = () => screen.getByTestId("row");
    fireEvent.click(row());
    await waitFor(() => expect(row()).toHaveTextContent("root (error)"));
    fireEvent.click(row()); // collapse
    fireEvent.click(row()); // reopen → retry
    await waitFor(() => expect(screen.getByText("child-1")).toBeInTheDocument());
    expect(loadChildren).toHaveBeenCalledTimes(2);
  });
});
