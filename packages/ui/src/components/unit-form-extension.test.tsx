import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { JsonSchemaForm } from "./JsonSchemaForm";
import {
  createUnitFormExtensions,
  formatUnitAwareValue,
  parseUnitAwareValue,
  type UnitInputKind,
} from "./unit-form-extension";
import type { JsonSchemaObject } from "./json-schema-form-types";

const schema: JsonSchemaObject = {
  type: "object",
  properties: {
    rows: {
      type: "string",
      title: "Rows",
      pattern: "^[1-9][0-9]*$",
      "x-clicky-unit": "count",
      "x-input-suffix": "rows",
    },
    memory: {
      type: "string",
      title: "Memory",
      pattern: "^[1-9][0-9]*$",
      "x-clicky-unit": "bytes",
    },
  },
};

const value = { rows: "1000000", memory: "268435456" };
const extensions = createUnitFormExtensions();

describe("createUnitFormExtensions", () => {
  it("displays canonical count and byte strings using human units", () => {
    render(
      <JsonSchemaForm
        schema={schema}
        value={value}
        onChange={vi.fn()}
        pre={extensions.pre}
        showPreferencesMenu={false}
      />,
    );

    expect(screen.getByRole("textbox", { name: "Rows" })).toHaveValue("1M");
    expect(screen.getByRole("textbox", { name: "Memory" })).toHaveValue("256MiB");
  });

  it.each([
    ["Rows", "2.5M", { rows: "2500000", memory: "268435456" }],
    ["Memory", "1.5GiB", { rows: "1000000", memory: "1610612736" }],
  ])("commits a %s edit as a canonical integer when exactly representable", (name, input, expected) => {
    const onChange = vi.fn();
    render(
      <JsonSchemaForm
        schema={schema}
        value={value}
        onChange={onChange}
        pre={extensions.pre}
        showPreferencesMenu={false}
      />,
    );

    fireEvent.change(screen.getByRole("textbox", { name }), { target: { value: input } });

    expect(onChange).toHaveBeenLastCalledWith(expected);
  });

  it.each([
    ["Decrease Rows", { rows: "500000", memory: "268435456" }],
    ["Increase Rows", { rows: "2000000", memory: "268435456" }],
    ["Decrease Memory", { rows: "1000000", memory: "134217728" }],
    ["Increase Memory", { rows: "1000000", memory: "536870912" }],
  ])("commits %s as a canonical integer", (name, expected) => {
    const onChange = vi.fn();
    render(
      <JsonSchemaForm
        schema={schema}
        value={value}
        onChange={onChange}
        pre={extensions.pre}
        showPreferencesMenu={false}
      />,
    );

    fireEvent.click(screen.getByRole("button", { name }));

    expect(onChange).toHaveBeenLastCalledWith(expected);
  });

  it("preserves an inexact byte edit so schema validation can reject it", () => {
    const onChange = vi.fn();
    render(
      <JsonSchemaForm
        schema={schema}
        value={value}
        onChange={onChange}
        pre={extensions.pre}
        showPreferencesMenu={false}
      />,
    );

    fireEvent.change(screen.getByRole("textbox", { name: "Memory" }), {
      target: { value: "1.2KiB" },
    });

    expect(onChange).toHaveBeenLastCalledWith({ rows: "1000000", memory: "1.2KiB" });
  });

  it("humanizes and disables unit fields in read-only forms", () => {
    const { rerender } = render(
      <JsonSchemaForm
        schema={schema}
        value={value}
        onChange={vi.fn()}
        pre={extensions.pre}
        readOnly
        showPreferencesMenu={false}
      />,
    );

    expect(screen.getByRole("textbox", { name: "Rows" })).toHaveValue("1M");
    expect(screen.getByRole("textbox", { name: "Rows" })).toBeDisabled();
    expect(screen.getByRole("textbox", { name: "Memory" })).toHaveValue("256MiB");
    expect(screen.getByRole("textbox", { name: "Memory" })).toBeDisabled();
    expect(screen.queryByRole("button", { name: "Decrease Rows" })).not.toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "Increase Memory" })).not.toBeInTheDocument();

    rerender(
      <JsonSchemaForm
        schema={schema}
        value={value}
        onChange={vi.fn()}
        pre={extensions.pre}
        showPreferencesMenu={false}
      />,
    );
    expect(screen.getByRole("button", { name: "Decrease Rows" })).toBeEnabled();
    expect(screen.getByRole("button", { name: "Increase Memory" })).toBeEnabled();
  });
});

describe("unit values", () => {
  it.each<[string, UnitInputKind, string | null]>([
    ["2.5M", "count", "2500000"],
    ["1,500K", "count", "1500000"],
    ["256MB", "bytes", "268435456"],
    ["1.5GiB", "bytes", "1610612736"],
    ["1.2KiB", "bytes", null],
    ["0", "count", null],
  ])("parses %s as a %s value", (input, kind, expected) => {
    expect(parseUnitAwareValue(input, kind)).toBe(expected);
  });

  it.each<[string, UnitInputKind, string]>([
    ["1500000", "count", "1.5M"],
    ["1536", "bytes", "1.5KiB"],
    ["1025", "bytes", "1025B"],
  ])("formats canonical %s as a %s value", (input, kind, expected) => {
    expect(formatUnitAwareValue(input, kind)).toBe(expected);
  });
});
