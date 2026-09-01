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

function Harness({ onChange }: { onChange: (value: Record<string, unknown>) => void }) {
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
  it("renders each configured value as a compact list item", () => {
    render(<Harness onChange={vi.fn()} />);

    const list = screen.getByRole("list", { name: "Writable roots" });
    expect(within(list).getAllByRole("listitem")).toHaveLength(3);
    expect(screen.getByRole("textbox", { name: "Writable roots 1" })).toHaveValue(
      "/workspace",
    );
    expect(screen.getByRole("textbox", { name: "Writable roots 2" })).toHaveValue(
      "/cache",
    );
  });

  it("edits, removes, and adds list values without converting them to tags", () => {
    const onChange = vi.fn();
    render(<Harness onChange={onChange} />);

    fireEvent.change(screen.getByRole("textbox", { name: "Writable roots 1" }), {
      target: { value: "/repo" },
    });
    expect(onChange).toHaveBeenLastCalledWith({ writableRoots: ["/repo", "/cache"] });

    fireEvent.click(screen.getByRole("button", { name: "Remove /cache" }));
    expect(onChange).toHaveBeenLastCalledWith({ writableRoots: ["/repo"] });

    const add = screen.getByRole("textbox", { name: "Add Writable roots" });
    fireEvent.change(add, { target: { value: "/artifacts" } });
    fireEvent.keyDown(add, { key: "Enter" });
    expect(onChange).toHaveBeenLastCalledWith({
      writableRoots: ["/repo", "/artifacts"],
    });
  });
});
