import { act, fireEvent, render, renderHook, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import {
  ListMenu,
  ListMenuActionBar,
  ListMenuHeader,
  ListMenuItem,
  ListMenuSection,
} from "./ListMenu";
import { useListMenuSelection } from "./use-list-menu-selection";

const KEYS = ["a", "b", "c", "d"];

describe("ListMenu", () => {
  it("renders the shared list, section, header, and row classes", () => {
    render(
      <ListMenu data-testid="menu">
        <ListMenuSection>
          <ListMenuHeader>Repository</ListMenuHeader>
          <ListMenuItem>Pull request</ListMenuItem>
        </ListMenuSection>
      </ListMenu>,
    );

    expect(screen.getByTestId("menu")).toHaveClass("divide-y", "divide-border");
    expect(screen.getByText("Repository")).toHaveClass("sticky", "bg-muted", "border-b");
    expect(screen.getByText("Pull request")).toHaveClass("border-l-2", "border-transparent", "hover:bg-muted");
  });

  it("prioritizes active and selected row states over the inactive accent", () => {
    render(
      <>
        <ListMenuItem active accentClassName="border-red-400">
          Active row
        </ListMenuItem>
        <ListMenuItem selected accentClassName="border-yellow-400">
          Selected row
        </ListMenuItem>
      </>,
    );

    expect(screen.getByText("Active row")).toHaveClass("border-primary", "bg-primary/10");
    expect(screen.getByText("Active row")).not.toHaveClass("border-red-400");
    expect(screen.getByText("Selected row")).toHaveClass("border-primary/40", "bg-primary/5");
    expect(screen.getByText("Selected row")).not.toHaveClass("border-yellow-400");
  });
});

describe("useListMenuSelection", () => {
  it("toggles a single key on and off and tracks counts", () => {
    const { result } = renderHook(() => useListMenuSelection({ keys: KEYS }));

    act(() => result.current.toggle("b"));
    expect(result.current.selectedKeys).toEqual(["b"]);
    expect(result.current.count).toBe(1);
    expect(result.current.someSelected).toBe(true);
    expect(result.current.allSelected).toBe(false);

    act(() => result.current.toggle("b"));
    expect(result.current.selectedKeys).toEqual([]);
    expect(result.current.someSelected).toBe(false);
  });

  it("extends a contiguous range from the anchor on Shift+Click", () => {
    const { result } = renderHook(() => useListMenuSelection({ keys: KEYS }));

    act(() => result.current.toggle("b"));
    act(() => result.current.toggle("d", { shiftKey: true }));
    // Range b..d, ordered by `keys`, excludes the unrelated "a".
    expect(result.current.selectedKeys).toEqual(["b", "c", "d"]);
  });

  it("treats Shift+Click without an anchor as a plain toggle", () => {
    const { result } = renderHook(() => useListMenuSelection({ keys: KEYS }));

    act(() => result.current.toggle("c", { shiftKey: true }));
    expect(result.current.selectedKeys).toEqual(["c"]);
  });

  it("selects all and clears", () => {
    const { result } = renderHook(() => useListMenuSelection({ keys: KEYS }));

    act(() => result.current.selectAll());
    expect(result.current.allSelected).toBe(true);
    expect(result.current.selectedKeys).toEqual(KEYS);

    act(() => result.current.clear());
    expect(result.current.count).toBe(0);
  });

  it("does not own state when controlled, only emitting the next selection", () => {
    const onSelectionChange = vi.fn();
    const { result } = renderHook(() =>
      useListMenuSelection({ keys: KEYS, selectedKeys: ["a"], onSelectionChange }),
    );

    act(() => result.current.toggle("c"));
    expect(onSelectionChange).toHaveBeenCalledWith(["a", "c"]);
    // Controlled value is unchanged until the parent passes new props.
    expect(result.current.selectedKeys).toEqual(["a"]);
  });
});

function SelectionHarness({ onRun }: { onRun?: (keys: string[]) => void }) {
  const selection = useListMenuSelection({ keys: KEYS });
  return (
    <ListMenu selection={selection}>
      <ListMenuActionBar
        actions={onRun ? [{ label: "Archive", onClick: onRun }] : []}
      />
      <ListMenuSection>
        {KEYS.map((key) => (
          <ListMenuItem key={key} itemKey={key} className="px-3 py-2">
            Item {key}
          </ListMenuItem>
        ))}
      </ListMenuSection>
    </ListMenu>
  );
}

describe("ListMenu multi-select", () => {
  it("renders a checkbox per selectable row and toggles selection on change", () => {
    render(<SelectionHarness />);

    const checkboxes = screen.getAllByRole("checkbox");
    expect(checkboxes).toHaveLength(KEYS.length);

    fireEvent.click(checkboxes[1]!);
    expect((checkboxes[1] as HTMLInputElement).checked).toBe(true);
    expect(screen.getByText("Item b").closest("[class*='border-l-2']")).toHaveClass(
      "border-primary/40",
    );
  });

  it("range-selects rows on Shift+Click after a checkbox sets the anchor", () => {
    render(<SelectionHarness />);
    const checkboxes = screen.getAllByRole("checkbox") as HTMLInputElement[];

    fireEvent.click(checkboxes[0]!); // anchor on "a"
    fireEvent.click(screen.getByText("Item c"), { shiftKey: true });

    expect(checkboxes[0]!.checked).toBe(true);
    expect(checkboxes[1]!.checked).toBe(true);
    expect(checkboxes[2]!.checked).toBe(true);
    expect(checkboxes[3]!.checked).toBe(false);
  });

  it("runs a bulk action across the selected keys and shows the count", () => {
    const onRun = vi.fn();
    render(<SelectionHarness onRun={onRun} />);
    const checkboxes = screen.getAllByRole("checkbox");

    // The action bar is hidden until something is selected.
    expect(screen.queryByText("Archive")).toBeNull();

    fireEvent.click(checkboxes[0]!);
    fireEvent.click(checkboxes[3]!);
    expect(screen.getByText("2 selected")).toBeInTheDocument();

    fireEvent.click(screen.getByText("Archive"));
    expect(onRun).toHaveBeenCalledWith(["a", "d"]);
  });

  it("clears the selection from the action bar", () => {
    render(<SelectionHarness />);
    const checkboxes = screen.getAllByRole("checkbox") as HTMLInputElement[];

    fireEvent.click(checkboxes[0]!);
    fireEvent.click(screen.getByText("Clear"));
    expect(checkboxes[0]!.checked).toBe(false);
  });
});
