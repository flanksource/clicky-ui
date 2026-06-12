import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { Tree } from "./Tree";

type Node = { id: string; label: string; children?: Node[] };
type SecondaryNode = Node & { secondary?: boolean };

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

function renderSecondaryTree(roots: SecondaryNode[]) {
  return render(
    <Tree<SecondaryNode>
      roots={roots}
      getChildren={(node) => node.children}
      getKey={(node) => node.id}
      isSecondary={(node) => node.secondary === true}
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

  it("does not auto-expand matched nodes whose children are secondary-only", () => {
    renderSecondaryTree([
      {
        id: "root",
        label: "root",
        children: [
          {
            id: "users",
            label: "users",
            children: Array.from({ length: 21 }, (_, index) => ({
              id: `col-${index}`,
              label: index === 0 ? "id" : `col_${index}`,
              secondary: true,
            })),
          },
        ],
      },
    ]);

    fireEvent.change(screen.getByLabelText("Filter tree nodes"), {
      target: { value: "users" },
    });

    expect(screen.getByText("users")).toBeInTheDocument();
    expect(screen.queryByText("id")).toBeNull();

    fireEvent.click(screen.getByText("users"));

    expect(screen.getByText("id")).toBeInTheDocument();
  });

  it("Expand all / Collapse all act recursively from a fully-collapsed tree", () => {
    const deep: Node[] = [
      {
        id: "r",
        label: "r",
        children: [
          { id: "x", label: "x", children: [{ id: "y", label: "y", children: [{ id: "z", label: "z" }] }] },
        ],
      },
    ];
    render(
      <Tree<Node>
        roots={deep}
        getChildren={(node) => node.children}
        getKey={(node) => node.id}
        defaultOpen={() => false}
        renderRow={({ node }) => <span>{node.label}</span>}
      />,
    );

    // Fully collapsed: only the root row shows.
    expect(screen.getByText("r")).toBeInTheDocument();
    expect(screen.queryByText("z")).toBeNull();

    fireEvent.click(screen.getByRole("button", { name: "Expand all" }));
    // One click reveals the deepest leaf — recursive expansion.
    expect(screen.getByText("z")).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "Collapse all" }));
    // Collapse-all returns to the root only.
    expect(screen.queryByText("x")).toBeNull();
  });

  describe("revealSelected", () => {
    // A deep collapsed tree whose leaf would be hidden under defaultOpen=false.
    const leaf: Node = { id: "z", label: "z" };
    const makeDeepTree = (): Node[] => [
      {
        id: "r",
        label: "r",
        children: [{ id: "x", label: "x", children: [{ id: "y", label: "y", children: [leaf] }] }],
      },
    ];

    it("force-opens the selected node's ancestors so a deep leaf is revealed", () => {
      render(
        <Tree<Node>
          roots={makeDeepTree()}
          getChildren={(node) => node.children}
          getKey={(node) => node.id}
          selected={leaf}
          revealSelected
          defaultOpen={() => false}
          renderRow={({ node }) => <span>{node.label}</span>}
        />,
      );

      // Despite defaultOpen=false, the selected leaf and its ancestors render.
      expect(screen.getByText("x")).toBeInTheDocument();
      expect(screen.getByText("y")).toBeInTheDocument();
      expect(screen.getByText("z")).toBeInTheDocument();
    });

    it("keeps the selected branch open when its ancestor's chevron is clicked", () => {
      render(
        <Tree<Node>
          roots={makeDeepTree()}
          getChildren={(node) => node.children}
          getKey={(node) => node.id}
          selected={leaf}
          revealSelected
          defaultOpen={() => false}
          renderRow={({ node }) => <span>{node.label}</span>}
        />,
      );

      // The ancestor's collapse control is forced-open and cannot hide the leaf.
      fireEvent.click(screen.getAllByRole("button", { name: "Collapse" })[0]);
      expect(screen.getByText("z")).toBeInTheDocument();
    });

    it("does not reveal the selected node without revealSelected", () => {
      render(
        <Tree<Node>
          roots={makeDeepTree()}
          getChildren={(node) => node.children}
          getKey={(node) => node.id}
          selected={leaf}
          defaultOpen={() => false}
          renderRow={({ node }) => <span>{node.label}</span>}
        />,
      );

      expect(screen.getByText("r")).toBeInTheDocument();
      expect(screen.queryByText("z")).toBeNull();
    });
  });
});
