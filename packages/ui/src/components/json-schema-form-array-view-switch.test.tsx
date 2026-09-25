import { fireEvent, render, screen, within } from "@testing-library/react";
import { useState } from "react";
import { describe, expect, it } from "vitest";
import { JsonSchemaForm } from "./JsonSchemaForm";
import type { FormLayout, JsonSchemaObject, JsonSchemaProperty } from "./json-schema-form-types";

// An object array with no display hint opens by its column count, and its ⋮
// menu switches between the grid, a stacked item form and an inline one.

const MENU = "View options for Reinsurers";

function itemsWith(count: number): JsonSchemaProperty {
  return {
    type: "object",
    properties: Object.fromEntries(
      Array.from({ length: count }, (_, i) => [`c${i + 1}`, { type: "string", title: `Cell ${i + 1}` }]),
    ),
  };
}

function Harness({
  columns,
  initial,
  layout = { mode: "stacked" },
}: {
  columns: number;
  initial: Record<string, unknown>[];
  layout?: FormLayout;
}) {
  const schema: JsonSchemaObject = {
    type: "object",
    properties: { Reinsurers: { type: "array", title: "Reinsurers", items: itemsWith(columns) } },
  };
  const [value, setValue] = useState<Record<string, unknown>>({ Reinsurers: initial });
  return (
    <JsonSchemaForm
      schema={schema}
      value={value}
      onChange={setValue}
      layout={layout}
      showPreferencesMenu={false}
    />
  );
}

function pickView(label: "Grid" | "Stack form" | "Inline form") {
  fireEvent.click(screen.getByRole("button", { name: MENU }));
  fireEvent.click(screen.getByRole("menuitem", { name: new RegExp(label) }));
}

function rowHeaders(): HTMLElement[] {
  return screen
    .getAllByRole("button")
    .filter((b) => b.hasAttribute("aria-expanded") && b.closest("[data-accordion-row]") !== null);
}

function openRow(index: number) {
  fireEvent.click(rowHeaders()[index]!);
}

function isInlineLabel(text: string): boolean {
  const panel = screen.getByRole("region");
  return within(panel).getByText(text).closest(".grid-cols-subgrid") !== null;
}

describe("object array view switch", () => {
  it("opens a narrow array as a grid with the view menu beside it", () => {
    render(<Harness columns={3} initial={[{ c1: "a" }]} />);
    expect(screen.getByRole("table")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: MENU })).toBeInTheDocument();
  });

  it("opens a wide array as the inline item form with the view menu on its summary line", () => {
    render(<Harness columns={7} initial={[{ c1: "a" }]} />);
    expect(screen.queryByRole("table")).toBeNull();
    expect(screen.getByRole("button", { name: MENU })).toBeInTheDocument();
    openRow(0);
    expect(isInlineLabel("Cell 1")).toBe(true);
  });

  it("marks the active view in the menu", () => {
    render(<Harness columns={3} initial={[{}]} />);
    fireEvent.click(screen.getByRole("button", { name: MENU }));
    expect(screen.getByRole("menuitem", { name: "Grid (current view)" })).toBeInTheDocument();
    expect(screen.getByRole("menuitem", { name: "Stack form" })).toBeInTheDocument();
  });

  it("switches the grid to accordion rows", () => {
    render(<Harness columns={3} initial={[{ c1: "a" }, { c1: "b" }]} />);
    pickView("Stack form");
    expect(screen.queryByRole("table")).toBeNull();
    expect(rowHeaders()).toHaveLength(2);
  });

  it("places labels above the fields in the stack form and beside them in the inline form", () => {
    render(<Harness columns={3} initial={[{ c1: "a" }]} layout={{ mode: "inline" }} />);
    pickView("Stack form");
    openRow(0);
    expect(isInlineLabel("Cell 1")).toBe(false);
    pickView("Inline form");
    expect(isInlineLabel("Cell 1")).toBe(true);
  });

  it("keeps an edit made in one view after switching to another", () => {
    render(<Harness columns={3} initial={[{ c1: "a" }]} />);
    fireEvent.change(within(screen.getByRole("table")).getAllByRole("textbox")[0]!, { target: { value: "edited" } });
    pickView("Inline form");
    openRow(0);
    const input = within(screen.getByRole("region")).getAllByRole("textbox")[0]!;
    expect(input).toHaveValue("edited");
    fireEvent.change(input, { target: { value: "again" } });
    pickView("Grid");
    expect(within(screen.getByRole("table")).getAllByRole("textbox")[0]).toHaveValue("again");
  });

  it("hides the view menu in a presentation preview, keeping the default view", () => {
    render(<Harness columns={3} initial={[{ c1: "a" }]} layout={{ mode: "properties" }} />);
    expect(within(screen.getByRole("button", { name: "Edit Reinsurers" })).getByRole("table")).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: MENU })).toBeNull();
  });
});
