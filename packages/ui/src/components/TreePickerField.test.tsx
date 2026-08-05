import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { TreePickerField } from "./TreePickerField";

type Node = { id: string; label: string; children?: Node[] };

// One company with two leaf plans. Companies are non-selectable (they have
// children); leaves are selectable.
const ROOTS: Node[] = [
  { id: "co", label: "Co", children: [{ id: "p1", label: "P1" }, { id: "p2", label: "P2" }] },
];

function renderField(props: Partial<Parameters<typeof TreePickerField<Node>>[0]> = {}) {
  const onSelect = props.onSelect ?? vi.fn();
  render(
    <TreePickerField<Node>
      roots={ROOTS}
      getKey={(n) => n.id}
      getChildren={(n) => n.children}
      renderRow={({ node }) => <span>{node.label}</span>}
      defaultOpen={() => false}
      isSelectable={(n) => !n.children}
      onSelect={onSelect}
      placeholder="Select…"
      {...props}
    />,
  );
  return { onSelect };
}

function panel(): HTMLElement | null {
  return document.querySelector<HTMLElement>('[data-slot="tree-picker-popup"]');
}

describe("TreePickerField", () => {
  it("shows the placeholder when no label is set, and the label when set", () => {
    const { unmount } = render(
      <TreePickerField<Node>
        roots={ROOTS}
        getKey={(n) => n.id}
        getChildren={(n) => n.children}
        renderRow={({ node }) => <span>{node.label}</span>}
        onSelect={vi.fn()}
        placeholder="Select…"
      />,
    );
    expect(screen.getByRole("button")).toHaveTextContent("Select…");
    unmount();

    renderField({ label: "Co / P1" });
    expect(screen.getByRole("button", { name: /Co \/ P1/ })).toBeInTheDocument();
  });

  it("opens the portal panel on trigger click and renders the tree roots", () => {
    renderField();
    expect(panel()).toBeNull();
    fireEvent.click(screen.getByRole("button"));
    expect(panel()).not.toBeNull();
    expect(screen.getByText("Co")).toBeInTheDocument();
  });

  it("anchors the tree panel to a custom trigger", () => {
    renderField({
      renderTrigger: ({ open, triggerRef, toggle }) => (
        <button ref={triggerRef} type="button" aria-expanded={open} onClick={toggle}>
          Browse tree
        </button>
      ),
    });

    fireEvent.click(screen.getByRole("button", { name: "Browse tree" }));

    expect(panel()).not.toBeNull();
    expect(screen.getByText("Co")).toBeInTheDocument();
  });

  it("selecting a selectable leaf fires onSelect and closes", () => {
    const { onSelect } = renderField();
    fireEvent.click(screen.getByRole("button")); // open
    fireEvent.click(screen.getByText("Co")); // expand company (not selectable)
    fireEvent.click(screen.getByText("P1")); // select leaf
    expect(onSelect).toHaveBeenCalledTimes(1);
    expect(onSelect.mock.calls[0]![0]).toMatchObject({ id: "p1" });
    expect(panel()).toBeNull();
  });

  it("clicking a non-selectable node toggles it without selecting or closing", () => {
    const { onSelect } = renderField();
    fireEvent.click(screen.getByRole("button")); // open
    fireEvent.click(screen.getByText("Co")); // company row: not selectable
    expect(onSelect).not.toHaveBeenCalled();
    expect(panel()).not.toBeNull();
    // The click still expanded the company, revealing its leaves.
    expect(screen.getByText("P1")).toBeInTheDocument();
  });

  it("clicking the caret expands without selecting", () => {
    const { onSelect } = renderField();
    fireEvent.click(screen.getByRole("button")); // open
    fireEvent.click(screen.getByRole("button", { name: "Expand" })); // caret
    expect(screen.getByText("P1")).toBeInTheDocument();
    expect(onSelect).not.toHaveBeenCalled();
    expect(panel()).not.toBeNull();
  });

  it("does not open when disabled", () => {
    renderField({ disabled: true });
    fireEvent.click(screen.getByRole("button"));
    expect(panel()).toBeNull();
  });

  it("sizes the panel to its content rather than pinning it to the trigger width", () => {
    renderField();
    fireEvent.click(screen.getByRole("button"));
    const popup = panel();
    expect(popup).not.toBeNull();
    // The panel grows to fit the widest row (capped by maxWidth) instead of
    // taking a fixed trigger width — otherwise long labels truncate and the
    // toolbar's intrinsic-width search input forces a horizontal scrollbar.
    expect(popup!.style.width).toBe("max-content");
    expect(popup!.style.maxWidth).toBe("480px");
  });

  // The picker used to drop these on the floor, so an open panel could neither
  // show which value was committed nor reveal it under a collapsed branch.
  it("marks the selected node inside the panel", () => {
    renderField({ selected: ROOTS[0]!.children![0]!, revealSelected: true });
    fireEvent.click(screen.getByRole("button"));
    expect(panel()!.querySelector('[aria-selected="true"]')).toHaveTextContent(
      "P1",
    );
  });

  it("reveals the selected node's ancestors even though they default closed", () => {
    // defaultOpen returns false for every node, so the committed value would
    // otherwise sit invisible behind its collapsed parent every time the panel
    // opens.
    const { unmount } = render(
      <TreePickerField<Node>
        roots={ROOTS}
        getKey={(n) => n.id}
        getChildren={(n) => n.children}
        renderRow={({ node }) => <span>{node.label}</span>}
        defaultOpen={() => false}
        onSelect={vi.fn()}
        selected={ROOTS[0]!.children![1]!}
      />,
    );
    fireEvent.click(screen.getByRole("button"));
    expect(panel()!.textContent).not.toContain("P2");
    unmount();

    renderField({ selected: ROOTS[0]!.children![1]!, revealSelected: true });
    fireEvent.click(screen.getByRole("button"));
    expect(panel()!.textContent).toContain("P2");
  });

  it("passes the accessible name and control visibility through to the tree", () => {
    renderField({ ariaLabel: "Destination profile", showControls: false });
    fireEvent.click(screen.getByRole("button", { name: /Select/ }));
    expect(
      screen.getByRole("tree", { name: "Destination profile" }),
    ).toBeInTheDocument();
    expect(
      screen.queryByRole("button", { name: /Expand all/i }),
    ).not.toBeInTheDocument();
  });
});
