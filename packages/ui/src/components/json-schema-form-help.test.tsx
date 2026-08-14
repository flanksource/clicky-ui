import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { JsonSchemaForm } from "./JsonSchemaForm";
import type { FormLayout, JsonSchemaObject, JsonSchemaProperty } from "./json-schema-form-types";

const NAME_HELP = "Parameter key, referenced as {{.params.<name>}} in the query";
const LABEL_HELP = "Human-facing name shown in the filter bar";

function renderForm(
  properties: Record<string, JsonSchemaProperty>,
  layout?: FormLayout,
) {
  const schema: JsonSchemaObject = { type: "object", properties };
  return render(
    <JsonSchemaForm
      schema={schema}
      value={{}}
      onChange={() => {}}
      showPreferencesMenu={false}
      {...(layout ? { layout } : {})}
    />,
  );
}

describe("JsonSchemaForm help display", () => {
  it("keeps the description a visible paragraph by default", () => {
    // Regression guard for every form that exists today.
    renderForm({ name: { type: "string", title: "Name", description: NAME_HELP } });
    expect(screen.getByText(NAME_HELP)).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "About Name" })).toBeNull();
  });

  it("moves the description behind a ? when the field asks for hover", () => {
    renderForm({
      name: {
        type: "string",
        title: "Name",
        description: NAME_HELP,
        "x-help-display": "hover",
      },
    });
    expect(screen.queryByText(NAME_HELP)).toBeNull();
    expect(screen.getByRole("button", { name: "About Name" })).toBeInTheDocument();
  });

  it("reveals the text on focus, so it is not mouse-only", () => {
    renderForm({
      name: {
        type: "string",
        title: "Name",
        description: NAME_HELP,
        "x-help-display": "hover",
      },
    });
    fireEvent.focus(screen.getByRole("button", { name: "About Name" }));
    // The card is portaled to document.body, outside the form's tree.
    expect(screen.getByRole("tooltip")).toHaveTextContent(NAME_HELP);
  });

  it("flips every field when the form asks, and lets a field opt back in", () => {
    renderForm(
      {
        name: { type: "string", title: "Name", description: NAME_HELP },
        label: {
          type: "string",
          title: "Label",
          description: LABEL_HELP,
          "x-help-display": "inline",
        },
      },
      { mode: "stacked", help: "hover" },
    );
    expect(screen.queryByText(NAME_HELP)).toBeNull();
    expect(screen.getByRole("button", { name: "About Name" })).toBeInTheDocument();
    // Per-field wins over the form.
    expect(screen.getByText(LABEL_HELP)).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "About Label" })).toBeNull();
  });

  it("merges description and x-help.body into the one hover card", () => {
    renderForm(
      {
        name: {
          type: "string",
          title: "Name",
          description: NAME_HELP,
          "x-help": { body: "Must be unique." },
        },
      },
      { mode: "stacked", help: "hover" },
    );
    fireEvent.focus(screen.getByRole("button", { name: "About Name" }));
    expect(screen.getByRole("tooltip")).toHaveTextContent(`${NAME_HELP} Must be unique.`);
  });

  it("applies to a nested object's section header too", () => {
    renderForm(
      {
        nested: {
          type: "object",
          title: "Nested",
          description: LABEL_HELP,
          properties: { alpha: { type: "string", title: "Alpha" } },
        },
      },
      { mode: "stacked", help: "hover" },
    );
    expect(screen.queryByText(LABEL_HELP)).toBeNull();
    expect(screen.getByRole("button", { name: "About Nested" })).toBeInTheDocument();
  });

  it("keeps the ? on a relabelled array item row", () => {
    // Array items are relabelled "Item N", which builds its own label node —
    // an easy place for the affordance to go missing while the paragraph has
    // already been suppressed, losing the description entirely.
    const schema: JsonSchemaObject = {
      type: "object",
      properties: {
        tags: {
          type: "array",
          title: "Tags",
          // Stacked: the "Item N" rows this covers are that opt-out's doing.
          "x-array-display": "stacked",
          items: { type: "number", title: "Tag", description: LABEL_HELP },
        },
      },
    };
    render(
      <JsonSchemaForm
        schema={schema}
        value={{ tags: [1] }}
        onChange={() => {}}
        layout={{ mode: "stacked", help: "hover" }}
        showPreferencesMenu={false}
      />,
    );
    expect(screen.queryByText(LABEL_HELP)).toBeNull();
    expect(screen.getByRole("button", { name: "About Item 1" })).toBeInTheDocument();
  });
});
