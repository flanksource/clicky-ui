import { describe, expect, it, vi } from "vitest";
import type { ClickyDocument, ClickyRow } from "../data/Clicky";
import { getClickyRowId } from "./rowNavigation";
import {
  markUnavailableRows,
  nextPickedRowIds,
  pickerTableRowSelection,
} from "./operationCatalogRowSelection";
import { SCHEME_ROWS, schemeRow, schemesResponse } from "./operationEntityPicker.fixtures";

const [first, second] = SCHEME_ROWS as [ClickyRow, ClickyRow];
const isSecond = (row: ClickyRow) => getClickyRowId(row) === "G0000012";

describe("nextPickedRowIds", () => {
  it.each([
    ["single: checking a second row replaces the first", "single", ["a"], ["a", "b"], ["b"]],
    ["single: checking the first row", "single", [], ["a"], ["a"]],
    ["single: unchecking the only row", "single", ["a"], [], []],
    ["multi: passes the table's set through", "multi", ["a"], ["a", "b", "c"], ["a", "b", "c"]],
  ] as const)("%s", (_name, mode, previous, next, expected) => {
    expect(nextPickedRowIds(mode, previous, next)).toEqual(expected);
  });

  it("throws when single mode is offered several new rows at once", () => {
    expect(() => nextPickedRowIds("single", ["a"], ["a", "b", "c"])).toThrow(
      /offered 2 new rows at once \(b, c\)/,
    );
  });

  it("throws when a single-mode selection already holds several ids", () => {
    expect(() => nextPickedRowIds("single", ["a", "b"], ["a", "b", "c"])).toThrow(
      /single-mode selection holds 2 ids/,
    );
  });
});

describe("pickerTableRowSelection", () => {
  it("reports the picked id, its loaded row and the effective filters", () => {
    const onSelectionChange = vi.fn();
    const filters = { product: "gl-guid" };
    const selection = pickerTableRowSelection(
      { mode: "single", selectedRowIds: ["G0000011"], onSelectionChange },
      filters,
    );

    selection.onSelectionChange(["G0000011", "G0000012"], [first, second]);

    expect(onSelectionChange).toHaveBeenCalledWith(["G0000012"], [second], { filters });
  });

  it.each([
    ["single", false],
    ["multi", true],
  ] as const)("%s mode sets the table's selectAll to %s", (mode, selectAll) => {
    const selection = pickerTableRowSelection(
      { mode, selectedRowIds: [], onSelectionChange: vi.fn() },
      {},
    );
    expect(selection.selectAll).toBe(selectAll);
  });

  it("toggles on row click and refuses rows without an id or marked unavailable", () => {
    const selection = pickerTableRowSelection(
      {
        mode: "multi",
        selectedRowIds: [],
        onSelectionChange: vi.fn(),
        unavailableRows: {
          isUnavailable: isSecond,
          label: "Attached",
          columnLabel: "Context",
        },
      },
      {},
    );

    expect(selection.toggleOnRowClick).toBe(true);
    expect(
      [first, second, { cells: {} }].map((row) => selection.isRowSelectable?.(row)),
    ).toEqual([true, false, false]);
  });
});

describe("markUnavailableRows", () => {
  const unavailable = {
    isUnavailable: isSecond,
    label: "Attached",
    columnLabel: "Context",
  };

  it("adds a badge column that marks only unavailable rows", () => {
    const marked = markUnavailableRows(schemesResponse(), unavailable);
    const table = (marked.parsed as ClickyDocument).node;

    expect(table.columns?.at(-1)).toEqual({
      name: "__unavailable",
      label: "Context",
      shrink: true,
    });
    expect(table.rows?.map((row) => row.cells.__unavailable)).toEqual([
      { kind: "text", text: "", plain: "" },
      { kind: "badge", badgeLabel: "Attached" },
    ]);
  });

  it("returns the response untouched when no row is unavailable", () => {
    const response = schemesResponse([schemeRow("G1", "Acme", "Active")]);
    expect(markUnavailableRows(response, unavailable)).toBe(response);
  });

  it("marks a response that only carries its document as stdout", () => {
    const parsed = schemesResponse().parsed;
    const marked = markUnavailableRows(
      { success: true, exit_code: 0, stdout: JSON.stringify(parsed) },
      { ...unavailable, isUnavailable: () => true },
    );
    const table = (marked.parsed as ClickyDocument).node;
    expect(table.rows?.every((row) => row.cells.__unavailable?.kind === "badge")).toBe(true);
  });
});
