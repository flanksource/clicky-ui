import { render, screen, within } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { JsonSchemaForm } from "./JsonSchemaForm";
import type { EnumDisplay, JsonSchemaObject } from "./json-schema-form-types";

const DESCRIPTIONS = {
  insert: "Insert a new activity.",
  update: "Update the existing activity.",
  skip: "Leave the activity untouched.",
};

function modeSchema({ display, defaultValue }: { display: EnumDisplay; defaultValue?: string }): JsonSchemaObject {
  return {
    type: "object",
    properties: {
      mode: {
        type: "string",
        title: "Mode",
        enum: ["insert", "update", "skip"],
        "x-enum-display": display,
        "x-enum-descriptions": DESCRIPTIONS,
        ...(defaultValue !== undefined ? { default: defaultValue } : {}),
      },
    },
  };
}

// applyDefaults={false} keeps an unset value unset so the implied state renders;
// the form otherwise writes the schema default into the value on mount.
function renderMode({
  display,
  defaultValue,
  value,
}: {
  display: EnumDisplay;
  defaultValue?: string;
  value: Record<string, unknown>;
}) {
  render(
    <JsonSchemaForm
      schema={modeSchema({ display, ...(defaultValue !== undefined ? { defaultValue } : {}) })}
      value={value}
      onChange={vi.fn()}
      applyDefaults={false}
      showPreferencesMenu={false}
    />,
  );
  return screen.getByRole("radiogroup", { name: "Mode" });
}

function radioLabel(group: HTMLElement, name: string): HTMLElement {
  const label = within(group).getByRole("radio", { name }).closest("label");
  if (!label) throw new Error(`radio ${name} is not wrapped in a label`);
  return label;
}

describe("JsonSchemaForm radio enum: descriptions and default", () => {
  it("puts each option's x-enum-descriptions entry on its label as a native title tooltip", () => {
    const group = renderMode({ display: "radio", value: { mode: "update" } });
    expect(
      ["insert", "update", "skip"].map((name) => radioLabel(group, name).getAttribute("title")),
    ).toEqual([DESCRIPTIONS.insert, DESCRIPTIONS.update, DESCRIPTIONS.skip]);
  });

  it("marks only the schema-default option with a visible default suffix and appends it to the tooltip", () => {
    const group = renderMode({ display: "radio", defaultValue: "insert", value: { mode: "update" } });
    expect(
      ["insert", "update", "skip"].map((name) => ({
        name,
        marker: within(radioLabel(group, name)).queryByText("default") !== null,
        title: radioLabel(group, name).getAttribute("title"),
      })),
    ).toEqual([
      { name: "insert", marker: true, title: `${DESCRIPTIONS.insert} (default)` },
      { name: "update", marker: false, title: DESCRIPTIONS.update },
      { name: "skip", marker: false, title: DESCRIPTIONS.skip },
    ]);
  });

  it("exposes the default marker as the radio's accessible description without changing its name", () => {
    const group = renderMode({ display: "radio", defaultValue: "insert", value: { mode: "update" } });
    const insert = within(group).getByRole("radio", { name: "insert" });
    expect(insert).toHaveAccessibleDescription("default");
    expect(within(group).getByRole("radio", { name: "update" })).not.toHaveAccessibleDescription();
  });

  it.each([
    { case: "missing", value: {} },
    { case: "empty string", value: { mode: "" } },
  ])("renders the default option as implied, not checked, when the value is $case", ({ value }) => {
    const group = renderMode({ display: "radio", defaultValue: "insert", value });
    const insert = within(group).getByRole("radio", { name: "insert" });
    const label = radioLabel(group, "insert");
    expect({
      checked: (insert as HTMLInputElement).checked,
      implied: label.getAttribute("data-implied"),
      explicitSelection: label.classList.contains("bg-primary"),
      impliedOutline: label.classList.contains("outline-dashed") && label.classList.contains("outline-primary/60"),
      othersImplied: ["update", "skip"].some((name) => radioLabel(group, name).hasAttribute("data-implied")),
    }).toEqual({
      checked: false,
      implied: "true",
      explicitSelection: false,
      impliedOutline: true,
      othersImplied: false,
    });
  });

  it("drops the implied style once a value is chosen, keeping the default marker on the default option", () => {
    const group = renderMode({ display: "radio", defaultValue: "insert", value: { mode: "skip" } });
    const skip = within(group).getByRole("radio", { name: "skip" }) as HTMLInputElement;
    const insert = within(group).getByRole("radio", { name: "insert" }) as HTMLInputElement;
    expect({
      skipChecked: skip.checked,
      skipSelected: radioLabel(group, "skip").classList.contains("bg-primary"),
      insertChecked: insert.checked,
      anyImplied: group.querySelector("[data-implied]") !== null,
      insertMarker: within(radioLabel(group, "insert")).queryByText("default") !== null,
    }).toEqual({
      skipChecked: true,
      skipSelected: true,
      insertChecked: false,
      anyImplied: false,
      insertMarker: true,
    });
  });

  it("renders no marker, implied state or tooltip suffix when the schema has no default", () => {
    const group = renderMode({ display: "radio", value: {} });
    expect({
      marker: within(group).queryByText("default"),
      implied: group.querySelector("[data-implied]"),
      titles: ["insert", "update", "skip"].map((name) => radioLabel(group, name).getAttribute("title")),
    }).toEqual({
      marker: null,
      implied: null,
      titles: [DESCRIPTIONS.insert, DESCRIPTIONS.update, DESCRIPTIONS.skip],
    });
  });

  it("ignores a schema default that matches no enum option", () => {
    const group = renderMode({ display: "radio", defaultValue: "archive", value: {} });
    expect({
      marker: within(group).queryByText("default"),
      implied: group.querySelector("[data-implied]"),
    }).toEqual({ marker: null, implied: null });
  });
});

describe("JsonSchemaForm segmented enum: descriptions and default", () => {
  it("passes each description through as the segment's title, keeping the visible description", () => {
    const group = renderMode({ display: "segmented", defaultValue: "insert", value: { mode: "update" } });
    const segments = within(group).getAllByRole("radio");
    expect(segments.map((segment) => segment.getAttribute("title"))).toEqual([
      `${DESCRIPTIONS.insert} (default)`,
      DESCRIPTIONS.update,
      DESCRIPTIONS.skip,
    ]);
    expect(within(group).getByText(DESCRIPTIONS.update)).toBeInTheDocument();
  });

  it("marks the default segment accessibly and renders it implied while the value is unset", () => {
    const group = renderMode({ display: "segmented", defaultValue: "insert", value: {} });
    const [insert, update] = within(group).getAllByRole("radio");
    expect({
      insertChecked: insert?.getAttribute("aria-checked"),
      insertImplied: insert?.getAttribute("data-implied"),
      insertDescription: insert?.getAttribute("aria-describedby") !== null,
      insertOutline: insert?.classList.contains("border-dashed"),
      updateImplied: update?.hasAttribute("data-implied"),
    }).toEqual({
      insertChecked: "false",
      insertImplied: "true",
      insertDescription: true,
      insertOutline: true,
      updateImplied: false,
    });
    expect(insert).toHaveAccessibleDescription("default");
  });

  it("does not render the implied state once a segment is selected", () => {
    const group = renderMode({ display: "segmented", defaultValue: "insert", value: { mode: "skip" } });
    expect(group.querySelector("[data-implied]")).toBeNull();
  });
});
