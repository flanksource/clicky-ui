import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { ObjectGraph, type ObjectGraphNode } from "./ObjectGraph";
import { pruneNullNodes } from "./object-graph-nodes";

describe("ObjectGraph", () => {
  it("renders a node's label, type annotation, scalar value and nested children", () => {
    const roots: ObjectGraphNode[] = [
      {
        id: "r",
        label: "bean",
        type: "Foo",
        kind: "object",
        children: [{ id: "r.s", label: "status", type: "String", value: "RUNNING", kind: "scalar" }],
      },
    ];
    render(<ObjectGraph roots={roots} />);
    expect(screen.getByText("bean")).toBeTruthy();
    expect(screen.getByText("@Foo")).toBeTruthy();
    // child is open by default (depth < 2)
    expect(screen.getByText("status")).toBeTruthy();
    expect(screen.getByText("RUNNING")).toBeTruthy();
  });

  it("renders an opaque node's raw preview when it has no value or children", () => {
    render(<ObjectGraph roots={[{ id: "r", label: "proxy", raw: "Proxy@1a2b" }]} />);
    expect(screen.getByText("Proxy@1a2b")).toBeTruthy();
  });

  it("uses a custom renderLabel when provided", () => {
    render(
      <ObjectGraph
        roots={[{ id: "r", label: "bean" }]}
        renderLabel={(n) => <span>custom:{n.label}</span>}
      />,
    );
    expect(screen.getByText("custom:bean")).toBeTruthy();
  });

  it("renders the label as a plain span (not a button) when onNodeSelect is omitted", () => {
    render(<ObjectGraph roots={[{ id: "r", label: "bean" }]} />);
    expect(screen.queryByRole("button", { name: "bean" })).toBeNull();
    expect(screen.getByText("bean")).toBeTruthy();
  });

  it("calls onNodeSelect with the clicked node without toggling it", () => {
    const onNodeSelect = vi.fn();
    const child: ObjectGraphNode = { id: "r.cycle", label: "cycle", expandable: true };
    render(
      <ObjectGraph
        roots={[{ id: "r", label: "bean", children: [child] }]}
        onNodeSelect={onNodeSelect}
        loadChildren={async () => []}
      />,
    );
    const label = screen.getByRole("button", { name: "cycle" });
    const before = label.closest("[role=treeitem]")?.getAttribute("aria-expanded");

    fireEvent.click(label);

    expect(onNodeSelect).toHaveBeenCalledTimes(1);
    expect(onNodeSelect).toHaveBeenCalledWith(child);
    expect(label.closest("[role=treeitem]")?.getAttribute("aria-expanded")).toBe(before);
  });

  // defaultOpenDepth renders this node open without anyone clicking it. Loading
  // only on the open transition would leave it showing a chevron over nothing
  // until the operator collapsed and reopened it.
  it("loads the children of a lazy node that starts open", async () => {
    const loadChildren = vi.fn(async () => [{ id: "r.cycle.x", label: "resolved" }]);
    render(
      <ObjectGraph
        roots={[{ id: "r", label: "bean", children: [{ id: "r.cycle", label: "cycle", expandable: true }] }]}
        loadChildren={loadChildren}
      />,
    );

    expect(await screen.findByText("resolved")).toBeTruthy();
    expect(loadChildren).toHaveBeenCalledTimes(1);
  });

  it("highlights the label whose id matches selectedId", () => {
    render(
      <ObjectGraph
        roots={[{ id: "r", label: "bean" }]}
        onNodeSelect={() => {}}
        selectedId="r"
      />,
    );
    expect(screen.getByRole("button", { name: "bean" }).className).toContain("bg-primary/15");
  });

  it("renders a custom value via renderValue and falls back when it returns null", () => {
    const roots: ObjectGraphNode[] = [
      {
        id: "r",
        label: "frame",
        children: [
          { id: "r.throwExp", label: "throwExp", value: "java.lang.NullPointerException: cid" },
          { id: "r.policy", label: "policyNumber", value: "0001234567890" },
        ],
      },
    ];
    render(
      <ObjectGraph
        roots={roots}
        renderValue={(node) =>
          node.label === "throwExp" ? <span>parsed-exception</span> : null
        }
      />,
    );
    expect(screen.getByText("parsed-exception")).toBeTruthy();
    expect(screen.queryByText("java.lang.NullPointerException: cid")).toBeNull();
    expect(screen.getByText("0001234567890")).toBeTruthy();
  });

  describe("hide null values", () => {
    // An OGNL dump stringifies a null field, so the literal text `null` is the
    // shape that actually shows up — a real JSON null is the rarer case.
    const roots: ObjectGraphNode[] = [
      {
        id: "r",
        label: "bean",
        children: [
          { id: "r.callbacks", label: "callbacks", value: "null" },
          { id: "r.comment", label: "comment", value: "   " },
          { id: "r.missing", label: "missing", value: null },
          { id: "r.bound", label: "bound", value: "false" },
          { id: "r.count", label: "count", value: "0" },
          { id: "r.empty", label: "tags [0]", children: [] },
          { id: "r.lazy", label: "cycle", expandable: true },
          {
            id: "r.nested",
            label: "nested",
            children: [{ id: "r.nested.a", label: "a", value: "null" }],
          },
        ],
      },
    ];

    it("keeps false/zero/lazy nodes and drops null, blank and all-null containers", () => {
      const kept = pruneNullNodes(roots)[0]?.children?.map((n) => n.label);
      expect(kept).toEqual(["bound", "count", "cycle"]);
    });

    // An arthas watch frame is marked expandable *and* ships inline children.
    // Treating expandable as "skip this subtree" would make the filter a no-op
    // on every real capture.
    it("prunes inside an expandable node that already carries children", () => {
      const frame: ObjectGraphNode[] = [
        {
          id: "frame-0",
          label: "AtExit validateResult",
          expandable: true,
          children: [
            { id: "frame-0.a", label: "returnObj", value: "null" },
            { id: "frame-0.b", label: "policyNumber", value: "0001234567890" },
          ],
        },
      ];
      const pruned = pruneNullNodes(frame);
      expect(pruned).toHaveLength(1);
      expect(pruned[0]?.children?.map((n) => n.label)).toEqual(["policyNumber"]);
    });

    it("keeps an expandable node whose inline children all pruned away", () => {
      const pruned = pruneNullNodes([
        { id: "f", label: "frame", expandable: true, children: [{ id: "f.a", label: "a", value: "null" }] },
      ]);
      expect(pruned.map((n) => n.label)).toEqual(["frame"]);
      expect(pruned[0]?.children).toEqual([]);
    });

    it("leaves the tree untouched when nothing is null", () => {
      const dense: ObjectGraphNode[] = [
        { id: "r", label: "bean", children: [{ id: "r.a", label: "a", value: "1" }] },
      ];
      expect(pruneNullNodes(dense)).toEqual(dense);
    });

    it("hides null rows when defaultHideNulls is set and restores them from the menu", () => {
      render(<ObjectGraph roots={roots} showOptionsMenu defaultHideNulls />);
      expect(screen.queryByText("callbacks")).toBeNull();
      expect(screen.getByText("bound")).toBeTruthy();

      fireEvent.click(screen.getByRole("button", { name: "Display options" }));
      // 5 pruned nodes: callbacks, comment, missing, tags [0], nested (+ its child).
      fireEvent.click(screen.getByText("Hide null values (6)"));

      expect(screen.getByText("callbacks")).toBeTruthy();
    });

    it("shows an explicit empty state when every value is null", () => {
      render(
        <ObjectGraph
          roots={[{ id: "r", label: "bean", children: [{ id: "r.a", label: "a", value: "null" }] }]}
          defaultHideNulls
        />,
      );
      expect(screen.getByText("All values are null.")).toBeTruthy();
    });
  });

  it("opens a fullscreen copy when the fullscreen control is used", () => {
    render(
      <ObjectGraph
        roots={[{ id: "r", label: "bean", value: "v" }]}
        showFullscreenControl
        fullscreenTitle="Capture"
      />,
    );
    expect(screen.getAllByText("bean")).toHaveLength(1);

    fireEvent.click(screen.getByRole("button", { name: "Open object browser full screen" }));

    expect(screen.getByText("Capture")).toBeTruthy();
    // Inline copy stays mounted alongside the modal copy.
    expect(screen.getAllByText("bean")).toHaveLength(2);
  });
});
