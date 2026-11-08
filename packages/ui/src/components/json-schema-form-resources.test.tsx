import { useState } from "react";
import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { JsonSchemaForm } from "./JsonSchemaForm";
import type { JsonSchemaObject } from "./json-schema-form-types";

function Form({ schema, initial = {} }: { schema: JsonSchemaObject; initial?: Record<string, unknown> }) {
  const [value, setValue] = useState(initial);
  return <><JsonSchemaForm schema={schema} value={value} onChange={setValue} showPreferencesMenu={false} /><output>{JSON.stringify(value)}</output></>;
}

describe("resource schema editing", () => {
  it("renders documentation links beside field help", () => {
    render(<Form schema={{ properties: { mode: { type: "string", title: "Mode", description: "Choose an access mode.", "x-help": { links: [{ label: "Access documentation", href: "https://example.com/access" }] } } } }} />);
    expect(screen.getByRole("link", { name: "Access documentation" })).toHaveAttribute("href", "https://example.com/access");
  });

  it("edits scalar and object union branches while retaining each draft", () => {
    const schema: JsonSchemaObject = { properties: { access: { title: "Access", anyOf: [
      { type: "string", title: "Named policy" },
      { type: "object", title: "Custom policy", properties: { path: { type: "string", title: "Path" } } },
    ] } } };
    render(<Form schema={schema} initial={{ access: "read" }} />);
    fireEvent.change(screen.getByRole("combobox", { name: "Access format" }), { target: { value: "1" } });
    fireEvent.change(screen.getByLabelText("Path"), { target: { value: "/workspace" } });
    expect(screen.getByRole("status")).toHaveTextContent('{"access":{"path":"/workspace"}}');
    fireEvent.change(screen.getByRole("combobox", { name: "Access format" }), { target: { value: "0" } });
    expect(screen.getByRole("status")).toHaveTextContent('{"access":"read"}');
    fireEvent.change(screen.getByRole("combobox", { name: "Access format" }), { target: { value: "1" } });
    expect(screen.getByLabelText("Path")).toHaveValue("/workspace");
  });

  it("preserves typed JSON and lets malformed drafts be corrected", () => {
    render(<Form schema={{ properties: { payload: { title: "Payload", format: "json" } } }} initial={{ payload: { enabled: true } }} />);
    const input = screen.getByRole("textbox", { name: "Payload" });
    fireEvent.change(input, { target: { value: "{" } });
    expect(input).toHaveValue("{");
    expect(screen.getByRole("status")).toHaveTextContent('{"payload":{"enabled":true}}');
    fireEvent.change(input, { target: { value: '[1,false,null]' } });
    expect(screen.getByRole("status")).toHaveTextContent('{"payload":[1,false,null]}');
  });

  it("switches discriminated object branches and restores their drafts", () => {
    render(<Form schema={{ properties: { access: { title: "Access", oneOf: [
      { type: "object", title: "Read policy", properties: { kind: { const: "read" }, path: { type: "string", title: "Path" } } },
      { type: "object", title: "Write policy", properties: { kind: { const: "write" }, path: { type: "string", title: "Path" } } },
    ] } } }} initial={{ access: { kind: "read", path: "/read" } }} />);
    fireEvent.change(screen.getByRole("combobox", { name: "Access format" }), { target: { value: "1" } });
    expect(screen.getByRole("status")).toHaveTextContent('"kind":"write"');
    fireEvent.change(screen.getByLabelText("Path"), { target: { value: "/write" } });
    fireEvent.change(screen.getByRole("combobox", { name: "Access format" }), { target: { value: "0" } });
    expect(screen.getByLabelText("Path")).toHaveValue("/read");
  });

  it("retains native boolean and null values in scalar unions", () => {
    render(<Form schema={{ properties: { sandbox: { title: "Sandbox", anyOf: [
      { type: "boolean", title: "Toggle" }, { type: "string", title: "Command" }, { type: "null", title: "Unset" },
    ] } } }} initial={{ sandbox: false }} />);
    fireEvent.click(screen.getByRole("button", { name: "Clear Sandbox to null" }));
    expect(screen.getByRole("status")).toHaveTextContent('{"sandbox":null}');
    fireEvent.change(screen.getByRole("combobox", { name: "Sandbox format" }), { target: { value: "0" } });
    expect(screen.getByRole("status")).toHaveTextContent('{"sandbox":false}');
  });

  it("includes choices from every enum branch", () => {
    render(<Form schema={{ properties: { access: { title: "Access", oneOf: [
      { type: "string", enum: ["read", "write"] }, { type: "string", enum: ["deny"] },
    ] } } }} initial={{ access: "read" }} />);
    fireEvent.click(screen.getByRole("combobox", { name: "Access" }));
    expect(screen.getByRole("option", { name: "deny" })).toBeInTheDocument();
  });

  it("renders known map fields with their native types and help", () => {
    render(<Form schema={{ properties: { sandbox: {
      type: "object", additionalProperties: { format: "json" },
      properties: { enabled: { type: "boolean", title: "Enable sandbox", description: "Confine the child process." } },
    } } }} initial={{ sandbox: {} }} />);
    fireEvent.click(screen.getByRole("switch", { name: "Enable sandbox" }));
    expect(screen.getByRole("status")).toHaveTextContent('{"sandbox":{"enabled":true}}');
    expect(screen.getByText("Confine the child process.")).toBeInTheDocument();
  });

  it("edits recursive values as typed JSON while retaining nested data", () => {
    const schema: JsonSchemaObject = { properties: { node: { $ref: "#/$defs/node" } },
      $defs: { node: { type: "object", properties: { next: { $ref: "#/$defs/node", title: "Next" } } } } };
    render(<Form schema={schema} initial={{ node: { next: { enabled: true } } }} />);
    const input = screen.getByRole("textbox", { name: "Next" });
    expect(input.tagName).toBe("TEXTAREA");
    fireEvent.change(input, { target: { value: '{"enabled":false,"items":[0,null]}' } });
    expect(screen.getByRole("status")).toHaveTextContent('{"node":{"next":{"enabled":false,"items":[0,null]}}}');
  });
});
