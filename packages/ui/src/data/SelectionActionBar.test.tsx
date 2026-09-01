import { fireEvent, render, screen, within } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { SelectionActionBar } from "./SelectionActionBar";
import { splitSelectionActions } from "./selectionActionSplit";
import type {
  DataTableSelectionAction,
  DataTableSelectionContext,
} from "./DataTable";

type Row = Record<string, unknown>;

function context(
  overrides: Partial<DataTableSelectionContext<Row>> = {},
): DataTableSelectionContext<Row> {
  return {
    selectedRowIds: ["api", "worker"],
    selectedRows: [],
    clearSelection: vi.fn(),
    ...overrides,
  };
}

/** An action that fires on click. */
function button(
  id: string,
  extra: Partial<DataTableSelectionAction<Row>> = {},
): DataTableSelectionAction<Row> {
  return { id, label: id, onSelect: vi.fn(), ...extra };
}

/** An action whose values live behind a menu. */
function withValues(
  id: string,
  values: string[],
  extra: Partial<DataTableSelectionAction<Row>> = {},
): DataTableSelectionAction<Row> {
  return {
    id,
    label: id,
    onSelect: vi.fn(),
    children: values.map((value) => ({
      id: `${id}:${value}`,
      label: value,
      onSelect: vi.fn(),
    })),
    ...extra,
  };
}

function overflowMenu() {
  fireEvent.click(screen.getByRole("button", { name: "More selection actions" }));
  return within(screen.getByRole("menu"));
}

describe("splitSelectionActions", () => {
  // The regression this bar was rebuilt for: an action carrying the values a
  // bulk editor sets is exactly the one worth a named dropdown, and it was the
  // one guaranteed to be hidden.
  it("makes an action a named dropdown when it asks to be one", () => {
    const { menus, buttons, overflow } = splitSelectionActions([
      withValues("status", ["open", "closed"], { display: "menu" }),
      button("delete"),
    ]);

    expect(menus.map((action) => action.id)).toEqual(["status"]);
    expect(buttons.map((action) => action.id)).toEqual(["delete"]);
    expect(overflow).toHaveLength(0);
  });

  it("never caps dropdowns, however many there are", () => {
    const { menus, overflow } = splitSelectionActions(
      ["a", "b", "c", "d", "e"].map((id) =>
        withValues(id, ["x"], { display: "menu" }),
      ),
    );

    expect(menus).toHaveLength(5);
    expect(overflow).toHaveLength(0);
  });

  it("still leaves a bare children list in the overflow", () => {
    // A flyout needs an anchor and the overflow already is one, so inline is
    // opt-in: an existing caller's submenu does not move on its own.
    const { menus, overflow } = splitSelectionActions([
      withValues("export", ["csv", "json"]),
    ]);

    expect(menus).toHaveLength(0);
    expect(overflow.map((action) => action.id)).toEqual(["export"]);
  });

  it("treats a custom menu body as a dropdown without being told", () => {
    const { menus } = splitSelectionActions([
      button("labels", { menu: () => null }),
    ]);

    expect(menus.map((action) => action.id)).toEqual(["labels"]);
  });

  it("sends a sectioned action to the menu its heading needs", () => {
    const { buttons, overflow } = splitSelectionActions([
      button("status"),
      button("delete", { section: "Danger" }),
    ]);

    expect(buttons.map((action) => action.id)).toEqual(["status"]);
    expect(overflow.map((action) => action.id)).toEqual(["delete"]);
  });

  it("pins exactly the actions that claim primary", () => {
    const { buttons, overflow } = splitSelectionActions([
      button("status", { primary: true }),
      button("comment"),
      button("delete"),
    ]);

    expect(buttons.map((action) => action.id)).toEqual(["status"]);
    expect(overflow.map((action) => action.id)).toEqual(["comment", "delete"]);
  });

  it("collapses an action that declines to be pinned", () => {
    const { buttons, overflow } = splitSelectionActions([
      button("status"),
      button("delete", { primary: false }),
    ]);

    expect(buttons.map((action) => action.id)).toEqual(["status"]);
    expect(overflow.map((action) => action.id)).toEqual(["delete"]);
  });

  it("falls back to position, capped, when nothing claims primary", () => {
    const { buttons, overflow } = splitSelectionActions(
      ["a", "b", "c", "d"].map((id) => button(id)),
    );

    expect(buttons.map((action) => action.id)).toEqual(["a", "b", "c"]);
    expect(overflow.map((action) => action.id)).toEqual(["d"]);
  });

  it("honours a wider cap", () => {
    const { buttons, overflow } = splitSelectionActions(
      ["a", "b", "c", "d"].map((id) => button(id)),
      { maxButtons: 4 },
    );

    expect(buttons).toHaveLength(4);
    expect(overflow).toHaveLength(0);
  });

  it("keeps the caller's order in the overflow, so section headings land right", () => {
    const { overflow } = splitSelectionActions([
      button("pin", { primary: true }),
      button("edit", { section: "Edit" }),
      button("demoted"),
      button("delete", { section: "Danger" }),
    ]);

    expect(overflow.map((action) => action.id)).toEqual([
      "edit",
      "demoted",
      "delete",
    ]);
  });
});

describe("SelectionActionBar", () => {
  it("renders an inline action with values as its own named dropdown", () => {
    render(
      <SelectionActionBar
        actions={[withValues("Status", ["open", "closed"], { display: "menu" })]}
        context={context()}
      />,
    );

    const trigger = screen.getByRole("button", { name: /Status/ });
    expect(trigger.getAttribute("aria-haspopup")).toBe("menu");

    fireEvent.click(trigger);
    const menu = within(screen.getByRole("menu", { name: "Status" }));
    expect(menu.getByRole("menuitem", { name: "open" })).toBeTruthy();
    expect(menu.getByRole("menuitem", { name: "closed" })).toBeTruthy();
  });

  it("writes the value the reader picked, not the action itself", () => {
    const parent = vi.fn();
    const open = vi.fn();
    render(
      <SelectionActionBar
        actions={[
          {
            id: "Status",
            label: "Status",
            display: "menu",
            onSelect: parent,
            children: [{ id: "open", label: "open", onSelect: open }],
          },
        ]}
        context={context()}
      />,
    );

    fireEvent.click(screen.getByRole("button", { name: /Status/ }));
    fireEvent.click(screen.getByRole("menuitem", { name: "open" }));

    expect(open).toHaveBeenCalledOnce();
    // The trigger only opens the menu — firing it too would apply an edit the
    // reader never chose.
    expect(parent).not.toHaveBeenCalled();
  });

  it("renders a custom menu body and closes it on demand", () => {
    render(
      <SelectionActionBar
        actions={[
          {
            id: "Labels",
            label: "Labels",
            onSelect: vi.fn(),
            menu: ({ context: ctx, close }) => (
              <div>
                <span>{ctx.selectedRowIds.length} rows</span>
                <button type="button" onClick={close}>
                  Apply
                </button>
              </div>
            ),
          },
        ]}
        context={context()}
      />,
    );

    fireEvent.click(screen.getByRole("button", { name: /Labels/ }));
    expect(screen.getByText("2 rows")).toBeTruthy();

    fireEvent.click(screen.getByRole("button", { name: "Apply" }));
    expect(screen.queryByText("2 rows")).toBeNull();
  });

  // A custom body that called its mutation directly would leave the bar idle
  // through a bulk write — no spinner, siblings still live, a second click
  // still possible.
  it("runs work from a custom body through the bar's own plumbing", () => {
    const apply = vi.fn();
    render(
      <SelectionActionBar
        actions={[
          {
            id: "Labels",
            label: "Labels",
            onSelect: vi.fn(),
            menu: ({ run, close }) => (
              <button
                type="button"
                onClick={() => {
                  run({ onSelect: apply });
                  close();
                }}
              >
                Apply
              </button>
            ),
          },
        ]}
        context={context()}
      />,
    );

    fireEvent.click(screen.getByRole("button", { name: /Labels/ }));
    fireEvent.click(screen.getByRole("button", { name: "Apply" }));

    expect(apply).toHaveBeenCalledOnce();
    expect(apply.mock.calls[0][0].selectedRowIds).toEqual(["api", "worker"]);
  });

  it("fires an inline action that has no menu", () => {
    const onSelect = vi.fn();
    render(
      <SelectionActionBar
        actions={[button("Archive", { primary: true, onSelect })]}
        context={context()}
      />,
    );

    const trigger = screen.getByRole("button", { name: "Archive" });
    expect(trigger.getAttribute("aria-haspopup")).toBeNull();
    fireEvent.click(trigger);
    expect(onSelect).toHaveBeenCalledOnce();
  });

  it("counts the ids, not the loaded rows", () => {
    // selectedRows holds only what is currently paged in, so counting it
    // undercounts every cross-page selection.
    render(
      <SelectionActionBar
        actions={[button("Archive")]}
        context={context({ selectedRowIds: ["a", "b", "c"], selectedRows: [] })}
      />,
    );

    expect(screen.getByTestId("data-table-selection-count").textContent).toContain(
      "3 selected",
    );
  });

  it("keeps overflow sections in the order the caller gave them", () => {
    render(
      <SelectionActionBar
        actions={[
          button("pin", { primary: true }),
          button("comment", { section: "Edit" }),
          button("run", { section: "Run" }),
          button("delete", { section: "Danger" }),
        ]}
        context={context()}
      />,
    );

    const headings = overflowMenu()
      .getAllByRole("presentation", { hidden: true })
      .map((node) => node.textContent);

    // Alphabetical would sort "Danger" to the top, putting Delete directly
    // under the cursor that just opened the menu.
    expect(headings.filter(Boolean)).toEqual(["Edit", "Run", "Danger"]);
  });
});
