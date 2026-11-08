import { fireEvent, render, screen, within } from "@testing-library/react";
import { useState } from "react";
import { describe, expect, it, vi } from "vitest";
import { JsonSchemaForm } from "./JsonSchemaForm";
import type { JsonSchemaObject } from "./json-schema-form-types";

const schema: JsonSchemaObject = {
  type: "object",
  properties: {
    writableRoots: {
      type: "array",
      title: "Writable roots",
      items: { type: "string" },
      "x-array-display": "list",
    },
  },
};

function Harness({
  onChange,
}: {
  onChange: (value: Record<string, unknown>) => void;
}) {
  const [value, setValue] = useState<Record<string, unknown>>({
    writableRoots: ["/workspace", "/cache"],
  });
  return (
    <JsonSchemaForm
      schema={schema}
      value={value}
      onChange={(next) => {
        setValue(next);
        onChange(next);
      }}
      showPreferencesMenu={false}
    />
  );
}

describe("JsonSchemaForm compact scalar lists", () => {
  it("renders list values as numbered array rows with reorder and remove actions", () => {
    render(<Harness onChange={vi.fn()} />);

    const list = screen.getByRole("group", { name: "Writable roots" });
    expect(
      within(list).getByRole("button", { name: "Move item 1 up" }),
    ).toBeDisabled();
    expect(
      within(list).getByRole("button", { name: "Move item 2 down" }),
    ).toBeDisabled();
    expect(within(list).getByRole("textbox", { name: "Item 1" })).toHaveValue(
      "/workspace",
    );
    expect(within(list).getByRole("textbox", { name: "Item 2" })).toHaveValue(
      "/cache",
    );
  });

  it("edits, removes, and adds list values without converting them to tags", () => {
    const onChange = vi.fn();
    render(<Harness onChange={onChange} />);

    fireEvent.change(screen.getByRole("textbox", { name: "Item 1" }), {
      target: { value: "/repo" },
    });
    expect(onChange).toHaveBeenLastCalledWith({
      writableRoots: ["/repo", "/cache"],
    });

    fireEvent.click(screen.getByRole("button", { name: "Remove item 2" }));
    expect(onChange).toHaveBeenLastCalledWith({ writableRoots: ["/repo"] });

    fireEvent.click(screen.getByRole("button", { name: "Add item" }));
    expect(onChange).toHaveBeenLastCalledWith({ writableRoots: ["/repo", ""] });
    const add = screen.getByRole("textbox", { name: "Item 2" });
    fireEvent.change(add, { target: { value: "/artifacts" } });
    expect(onChange).toHaveBeenLastCalledWith({
      writableRoots: ["/repo", "/artifacts"],
    });
  });

  it("reorders list values with the same item actions as boolean arrays", () => {
    const onChange = vi.fn();
    render(<Harness onChange={onChange} />);
    fireEvent.click(screen.getByRole("button", { name: "Move item 1 down" }));
    expect(onChange).toHaveBeenLastCalledWith({
      writableRoots: ["/cache", "/workspace"],
    });
    fireEvent.click(screen.getByRole("button", { name: "Move item 2 up" }));
    expect(onChange).toHaveBeenLastCalledWith({
      writableRoots: ["/workspace", "/cache"],
    });
  });

  it("hides edit actions for read-only lists", () => {
    render(
      <JsonSchemaForm
        schema={schema}
        value={{ writableRoots: ["/workspace"] }}
        readOnly
        showPreferencesMenu={false}
      />,
    );
    expect(screen.getByRole("textbox", { name: "Item 1" })).toBeDisabled();
    expect(
      screen.queryByRole("button", { name: /Add item|Move item|Remove item/ }),
    ).not.toBeInTheDocument();
  });

  it("honors array item limits in the shared list renderer", () => {
    render(
      <JsonSchemaForm
        schema={{
          properties: {
            writableRoots: {
              ...schema.properties!.writableRoots!,
              minItems: 2,
              maxItems: 2,
            },
          },
        }}
        value={{ writableRoots: ["/workspace", "/cache"] }}
        onChange={vi.fn()}
        showPreferencesMenu={false}
      />,
    );
    expect(
      screen.queryByRole("button", { name: /Add item|Remove item/ }),
    ).not.toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "Move item 1 down" }),
    ).toBeEnabled();
  });
});
