import { fireEvent, render, screen } from "@testing-library/react";
import { useState } from "react";
import { describe, expect, it, vi } from "vitest";
import { JsonSchemaForm } from "./JsonSchemaForm";
import type { JsonSchemaObject } from "./json-schema-form-types";

// A requirement holds exactly one of MUST / MUST NOT / SHOULD (a oneOf of
// single-key required branches), so the form draws one row choosing the key.
const SCHEMA = {
  type: "object",
  properties: {
    MUST: { type: "string", title: "MUST" },
    "MUST NOT": { type: "string", title: "MUST NOT" },
    SHOULD: { type: "string", title: "SHOULD" },
    status: { type: "string", title: "Status" },
  },
  oneOf: [{ required: ["MUST"] }, { required: ["MUST NOT"] }, { required: ["SHOULD"] }],
} as JsonSchemaObject;
const KEY_SELECT = "MUST / MUST NOT / SHOULD";

function Harness({ initial, onChange }: { initial: Record<string, unknown>; onChange: (next: Record<string, unknown>) => void }) {
  const [value, setValue] = useState(initial);
  return <JsonSchemaForm schema={SCHEMA} value={value} layout={{ mode: "stacked" }} showPreferencesMenu={false}
    onChange={(next) => { setValue(next); onChange(next); }} />;
}

describe("exclusive keys in JsonSchemaForm", () => {
  it("draws one key dropdown and one text box for the keys, named for the chosen key", () => {
    render(<Harness initial={{ "MUST NOT": "skip the waiting period", status: "built" }} onChange={vi.fn()} />);
    const select = screen.getByRole("combobox", { name: KEY_SELECT }) as HTMLSelectElement;
    expect({
      chosen: select.value,
      options: [...select.options].map((option) => option.textContent),
      text: (screen.getByRole("textbox", { name: "MUST NOT" }) as HTMLInputElement).value,
      otherKeyBoxes: screen.queryAllByRole("textbox", { name: /^(MUST|SHOULD)$/ }).length,
    }).toEqual({ chosen: "MUST NOT", options: ["MUST", "MUST NOT", "SHOULD"], text: "skip the waiting period", otherKeyBoxes: 0 });
  });

  it("moves the statement to the key chosen in the dropdown", () => {
    const onChange = vi.fn();
    render(<Harness initial={{ MUST: "create the policy", status: "built" }} onChange={onChange} />);
    fireEvent.change(screen.getByRole("combobox", { name: KEY_SELECT }), { target: { value: "SHOULD" } });
    expect(onChange).toHaveBeenLastCalledWith({ SHOULD: "create the policy", status: "built" });
    expect((screen.getByRole("textbox", { name: "SHOULD" }) as HTMLInputElement).value).toBe("create the policy");
  });

  it("draws the key dropdown for a nested object's exclusive keys too", () => {
    const onChange = vi.fn();
    const nested = { type: "object", properties: { requirement: { ...SCHEMA, title: "Requirement" } } } as JsonSchemaObject;
    render(<JsonSchemaForm schema={nested} value={{ requirement: { SHOULD: "send a reminder" } }} layout={{ mode: "stacked" }} showPreferencesMenu={false} onChange={onChange} />);
    fireEvent.change(screen.getByRole("combobox", { name: KEY_SELECT }), { target: { value: "MUST" } });
    expect(onChange).toHaveBeenLastCalledWith({ requirement: { MUST: "send a reminder" } });
  });

  it("writes text typed with no key set yet under the first key", () => {
    const onChange = vi.fn();
    render(<Harness initial={{}} onChange={onChange} />);
    fireEvent.change(screen.getByRole("textbox", { name: "MUST" }), { target: { value: "notify the member" } });
    expect(onChange).toHaveBeenLastCalledWith({ MUST: "notify the member" });
  });
});
