import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { Tree } from "./Tree";

type Node = { id: string; label: string; children?: Node[] };

function makeLargeTree(): Node[] {
  return [
    {
      id: "root",
      label: "root",
      children: Array.from({ length: 6 }, (_, branchIndex) => ({
        id: `branch-${branchIndex}`,
        label: `branch ${branchIndex}`,
        children: Array.from({ length: 4 }, (_, leafIndex) => ({
          id: `branch-${branchIndex}-leaf-${leafIndex}`,
          label:
            branchIndex === 3 && leafIndex === 2
              ? "needle node"
              : `leaf ${branchIndex}-${leafIndex}`,
        })),
      })),
    },
  ];
}

function makeNestedMatchTree(): Node[] {
  return [
    {
      id: "root",
      label: "root",
      children: [
        {
          id: "match-branch",
          label: "matching branch",
          children: [
            {
              id: "nested-parent",
              label: "nested parent",
              children: [{ id: "deep-match", label: "deep matching node" }],
            },
          ],
        },
        {
          id: "other-branch",
          label: "other branch",
          children: [{ id: "other-leaf", label: "unrelated leaf" }],
        },
        {
          id: "filler-branch",
          label: "filler branch",
          children: Array.from({ length: 18 }, (_, index) => ({
            id: `filler-leaf-${index}`,
            label: `filler leaf ${index}`,
          })),
        },
      ],
    },
  ];
}

function renderTree(roots: Node[]) {
  return render(
    <Tree<Node>
      roots={roots}
      getChildren={(node) => node.children}
      getKey={(node) => node.id}
      renderRow={({ node }) => <span>{node.label}</span>}
    />,
  );
}

describe("Tree", () => {
  it("shows the filter input only for trees with more than 20 edges", () => {
    const { rerender } = renderTree([
      {
        id: "small-root",
        label: "small root",
        children: [
          { id: "small-a", label: "small a" },
          { id: "small-b", label: "small b" },
        ],
      },
    ]);

    expect(screen.queryByLabelText("Filter tree nodes")).toBeNull();

    rerender(
      <Tree<Node>
        roots={makeLargeTree()}
        getChildren={(node) => node.children}
        getKey={(node) => node.id}
        renderRow={({ node }) => <span>{node.label}</span>}
      />,
    );

    expect(screen.getByLabelText("Filter tree nodes")).toBeInTheDocument();
  });

  it("renders the filter as the first row inside the tree and uses icon-only controls", () => {
    renderTree(makeLargeTree());

    const tree = screen.getByRole("tree");
    const filter = screen.getByLabelText("Filter tree nodes");
    const root = screen.getByText("root");

    expect(tree).toContainElement(filter);
    expect(filter.compareDocumentPosition(root) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();

    const expandButton = screen.getByRole("button", { name: "Expand all" });
    const collapseButton = screen.getByRole("button", { name: "Collapse all" });

    expect(expandButton).toHaveAttribute("title", "Expand all");
    expect(collapseButton).toHaveAttribute("title", "Collapse all");
    expect(expandButton).not.toHaveTextContent("Expand all");
    expect(collapseButton).not.toHaveTextContent("Collapse all");
  });

  it("filters visible branches while preserving ancestor context", () => {
    renderTree(makeLargeTree());

    fireEvent.change(screen.getByLabelText("Filter tree nodes"), {
      target: { value: "needle" },
    });

    expect(screen.getByText("root")).toBeInTheDocument();
    expect(screen.getByText("branch 3")).toBeInTheDocument();
    expect(screen.getByText("needle node")).toBeInTheDocument();
    expect(screen.queryByText("branch 1")).toBeNull();
    expect(screen.queryByText("leaf 3-0")).toBeNull();
  });

  it("expands matched parent paths so nested matches stay visible", () => {
    renderTree(makeNestedMatchTree());

    fireEvent.change(screen.getByLabelText("Filter tree nodes"), {
      target: { value: "match" },
    });

    expect(screen.getByText("matching branch")).toBeInTheDocument();
    expect(screen.getByText("nested parent")).toBeInTheDocument();
    expect(screen.getByText("deep matching node")).toBeInTheDocument();
    expect(screen.queryByText("other branch")).toBeNull();
  });
});
