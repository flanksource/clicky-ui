import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { JsonSchemaForm } from "./JsonSchemaForm";
import type { JsonSchemaObject, JsonSchemaProperty } from "./json-schema-form-types";

const AUTO_TEMPLATE = "repeat(auto-fill, minmax(15rem, 1fr))";

// The grid is the element that owns gridTemplateColumns; the row wrapper is the
// element that owns gridColumn. Both are inline styles by design — a runtime
// width can never be a Tailwind arbitrary class, because the scanner only reads
// source text and these values arrive from a JSON schema at runtime.
function grid(): HTMLElement {
  const found = document.querySelector<HTMLElement>("[style*='grid-template-columns']");
  if (!found) throw new Error("no element carries an inline grid-template-columns");
  return found;
}

function rowWrapperFor(labelText: string): HTMLElement {
  const label = screen.getByText(labelText);
  const wrapper = label.closest<HTMLElement>("[style*='grid-column']");
  if (!wrapper) throw new Error(`no grid-column wrapper around "${labelText}"`);
  return wrapper;
}

function formWith(
  objectExtras: Partial<JsonSchemaProperty>,
  propExtras: Record<string, Partial<JsonSchemaProperty>> = {},
) {
  const schema: JsonSchemaObject = {
    type: "object",
    ...objectExtras,
    properties: {
      alpha: { type: "string", title: "Alpha", ...propExtras.alpha },
      beta: { type: "string", title: "Beta", ...propExtras.beta },
      gamma: { type: "string", title: "Gamma", ...propExtras.gamma },
    },
  } as JsonSchemaObject;
  return render(
    <JsonSchemaForm schema={schema} value={{}} onChange={() => {}} showPreferencesMenu={false} />,
  );
}

describe("JsonSchemaForm auto columns", () => {
  it("fills as many columns as the width allows under x-columns: auto", () => {
    formWith({ "x-columns": "auto" });
    expect(grid().style.gridTemplateColumns).toBe(AUTO_TEMPLATE);
  });

  it("never expresses the auto template as an arbitrary Tailwind class", () => {
    formWith({ "x-columns": "auto" });
    // `grid-cols-[repeat(auto-fill,…)]` composed at runtime would never be
    // emitted by the scanner, leaving the grid silently single-column.
    expect(grid().className).not.toMatch(/\[/);
  });

  it("honours an explicit column floor and overall cap", () => {
    formWith({
      "x-columns": "auto",
      "x-column-min-width": "20rem",
      "x-columns-max-width": "76rem",
    });
    expect(grid().style.gridTemplateColumns).toBe("repeat(auto-fill, minmax(20rem, 1fr))");
    expect(grid().style.maxWidth).toBe("76rem");
  });

  it("gives an x-col-span: full field the whole row, not a track count", () => {
    // Under auto the track count only exists at layout time, so a numeric span
    // would be a guess; 1 / -1 is the only correct answer.
    formWith({ "x-columns": "auto" }, { beta: { "x-col-span": "full" } });
    expect(rowWrapperFor("Beta").style.gridColumn).toBe("1 / -1");
    expect(rowWrapperFor("Alpha").style.gridColumn).toBe("span 1 / span 1");
  });

  it("lets a full-row field use the row instead of stopping at the value cap", () => {
    formWith({ "x-columns": "auto" }, { beta: { "x-col-span": "full" } });
    const capped = screen.getByText("Alpha").closest<HTMLElement>("[style*='max-width']");
    const uncapped = screen.getByText("Beta").closest<HTMLElement>("div.flex.w-full.flex-col");
    expect(capped?.style.maxWidth).toBe("600px");
    expect(uncapped?.style.maxWidth).toBe("none");
  });

  it("keeps fixed column counts working", () => {
    formWith({ "x-columns": 3 }, { beta: { "x-col-span": 2 } });
    expect(grid().style.gridTemplateColumns).toBe("repeat(3, minmax(0, 1fr))");
    expect(rowWrapperFor("Beta").style.gridColumn).toBe("span 2 / span 2");
  });

  it("leaves inline mode's two label/value tracks alone", () => {
    const schema: JsonSchemaObject = {
      type: "object",
      "x-columns": "auto",
      properties: { alpha: { type: "string", title: "Alpha" } },
    } as JsonSchemaObject;
    render(
      <JsonSchemaForm
        schema={schema}
        value={{}}
        onChange={() => {}}
        layout={{ mode: "inline" }}
        showPreferencesMenu={false}
      />,
    );
    expect(grid().style.gridTemplateColumns).toBe("fit-content(40ch) minmax(0, 600px)");
  });

  it("carries the auto grid into a nested object's own fields", () => {
    // ObjectControl rebuilds the subschema from a whitelist of keywords; a
    // keyword missing from it works at the top level and dies one level down —
    // which is precisely where an array item's body renders.
    const schema: JsonSchemaObject = {
      type: "object",
      properties: {
        nested: {
          type: "object",
          title: "Nested",
          "x-columns": "auto",
          "x-column-min-width": "12rem",
          properties: {
            alpha: { type: "string", title: "Alpha" },
            beta: { type: "string", title: "Beta" },
          },
        },
      },
    } as JsonSchemaObject;
    render(
      <JsonSchemaForm schema={schema} value={{}} onChange={() => {}} showPreferencesMenu={false} />,
    );
    const grids = document.querySelectorAll<HTMLElement>("[style*='grid-template-columns']");
    const templates = [...grids].map((el) => el.style.gridTemplateColumns);
    expect(templates).toContain("repeat(auto-fill, minmax(12rem, 1fr))");
  });
});
