import { fireEvent, render, screen } from "@testing-library/react";
import { useState } from "react";
import { describe, expect, it, vi } from "vitest";
import { JsonSchemaForm } from "./JsonSchemaForm";
import type { JsonSchemaObject } from "./json-schema-form-types";

const schema: JsonSchemaObject = {
  type: "object",
  "x-on-load": [{ when: { properties: { enabled: { const: true } } }, show: ["dependent"] }],
  properties: {
    primary: { type: "array", title: "Primary paths", items: { type: "string" }, "x-hidden": false },
    enabled: { type: "boolean", title: "Enable dependent paths" },
    dependent: { type: "array", title: "Dependent paths", items: { type: "string" }, "x-hidden": true },
    optional: { type: "array", title: "Optional paths", items: { type: "string" } },
    other: { type: "array", title: "Other paths", items: { type: "string" } },
  },
};

function Harness() {
  const [value, setValue] = useState<Record<string, unknown>>({});
  return <JsonSchemaForm schema={schema} value={value} onChange={setValue} applyDefaults={false} showPreferencesMenu={false} />;
}

describe("JsonSchemaForm explicit array visibility", () => {
  it("keeps explicitly visible empty arrays outside automatic compaction", () => {
    const onChange = vi.fn();
    render(<JsonSchemaForm schema={schema} value={{}} onChange={onChange} applyDefaults={false} />);
    expect(screen.getByText("Primary paths")).toBeInTheDocument();
    expect(screen.queryByText("Optional paths")).toBeNull();
    expect(onChange).not.toHaveBeenCalled();
  });

  it("honors a show listener for an empty array on the first edit", () => {
    render(<Harness />);
    expect(screen.queryByText("Dependent paths")).toBeNull();
    fireEvent.click(screen.getByRole("checkbox", { name: "Enable dependent paths" }));
    expect(screen.getByText("Dependent paths")).toBeInTheDocument();
    fireEvent.click(screen.getByRole("checkbox", { name: "Enable dependent paths" }));
    expect(screen.queryByText("Dependent paths")).toBeNull();
  });
});
