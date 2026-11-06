import { describe, expect, it, vi } from "vitest";
import { fireEvent, render, screen } from "@testing-library/react";
import { JsonSchemaForm } from "./JsonSchemaForm";
import type { JsonSchemaObject } from "./json-schema-form-types";

const NEUTRAL_SWATCH = "#000000";
const PICKED = "#ff8800";

const schema = (extra: Record<string, unknown> = {}): JsonSchemaObject => ({
  type: "object",
  properties: { fill: { type: "string", title: "Fill", format: "color", ...extra } },
});

function renderColor(value: string, extra: Record<string, unknown> = {}) {
  const onChange = vi.fn();
  const view = render(<JsonSchemaForm schema={schema(extra)} value={{ fill: value }} onChange={onChange} />);
  return {
    onChange,
    text: () => view.container.querySelector<HTMLInputElement>("input[data-jsf-input]")!,
    swatch: () => screen.getByLabelText<HTMLInputElement>("Fill color picker"),
  };
}

describe("format: color string fields", () => {
  it("keeps the text input and adds a swatch bound to a hex value", () => {
    const { text, swatch } = renderColor("#1a2b3c");

    expect({ text: [text().type, text().value], swatch: [swatch().type, swatch().value] }).toEqual({
      text: ["text", "#1a2b3c"],
      swatch: ["color", "#1a2b3c"],
    });
  });

  it.each(["red", "#fff", "rgb(10, 20, 30)", "", "#12345g"])(
    "shows a neutral swatch and leaves the text of the non-hex value %j alone",
    (value) => {
      const { text, swatch, onChange } = renderColor(value);

      expect({ text: text().value, swatch: swatch().value, edits: onChange.mock.calls.length }).toEqual({
        text: value,
        swatch: NEUTRAL_SWATCH,
        edits: 0,
      });
    },
  );

  it("commits the picked hex through the field", () => {
    const { swatch, onChange } = renderColor("red");

    fireEvent.change(swatch(), { target: { value: PICKED } });

    expect(onChange).toHaveBeenLastCalledWith({ fill: PICKED });
  });

  it("still commits typed text, such as a CSS color name, unchanged", () => {
    const { text, onChange } = renderColor("");

    fireEvent.change(text(), { target: { value: "rebeccapurple" } });

    expect(onChange).toHaveBeenLastCalledWith({ fill: "rebeccapurple" });
  });

  it("disables the swatch together with the text input for a disabled field", () => {
    const { text, swatch } = renderColor("#1a2b3c", { "x-disabled": true });

    expect([text().disabled, swatch().disabled]).toEqual([true, true]);
  });

  it("shows a read-only color as static text without a picker", () => {
    renderColor("#1a2b3c", { readOnly: true });

    expect({
      picker: screen.queryByLabelText("Fill color picker"),
      text: screen.getByText("#1a2b3c").tagName,
    }).toEqual({ picker: null, text: "SPAN" });
  });

  it("leaves other string formats without a swatch", () => {
    render(
      <JsonSchemaForm
        schema={schema({ format: "uri" })}
        value={{ fill: "https://example.com" }}
        onChange={vi.fn()}
      />,
    );

    expect(screen.queryByLabelText("Fill color picker")).toBeNull();
  });
});
