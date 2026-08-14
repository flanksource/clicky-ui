import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { useState } from "react";
import { describe, expect, it, vi } from "vitest";
import { JsonSchemaForm } from "./JsonSchemaForm";
import type {
  JsonSchemaObject,
  LookupFetcher,
} from "./json-schema-form-types";

// Both array shapes that hold a list of choices reach the same control: an
// `enum` item schema (options in the schema) and an `x-clicky-lookup` with
// `multi: true` (options fetched). These tests drive it through JsonSchemaForm,
// since the wiring — the resolved options, the fetcher context — is the point.

const PROFILES = ["jms", "logs.api", "remote-debugger"];

const fetcher: LookupFetcher = async ({ query }) =>
  PROFILES.filter((name) => name.includes(query)).map((name) => ({
    value: name,
    label: name,
  }));

const lookupSchema: JsonSchemaObject = {
  type: "object",
  properties: {
    imports: {
      type: "array",
      title: "Imports",
      items: { type: "string" },
      "x-clicky-lookup": { url: "/api/v1/profiles", filter: "profile", multi: true },
    },
  },
};

const enumSchema: JsonSchemaObject = {
  type: "object",
  properties: {
    roles: {
      type: "array",
      title: "Roles",
      items: {
        type: "string",
        enum: ["admin", "editor", "viewer"],
        "x-enum-labels": { admin: "Administrator" },
      },
    },
  },
};

// A stateful host: a pill only disappears once the committed value actually
// changes, which a stateless render can never show.
function Harness({
  schema,
  initial,
  onChange,
  lookupFetcher,
}: {
  schema: JsonSchemaObject;
  initial: Record<string, unknown>;
  onChange: (next: Record<string, unknown>) => void;
  lookupFetcher?: LookupFetcher;
}) {
  const [value, setValue] = useState(initial);
  return (
    <JsonSchemaForm
      schema={schema}
      value={value}
      onChange={(next) => {
        setValue(next);
        onChange(next);
      }}
      showPreferencesMenu={false}
      {...(lookupFetcher ? { lookupFetcher } : {})}
    />
  );
}

// Focus opens the menu, which works while a lookup's head set is still loading
// (the toggle button is a spinner then). The menu commits on mousedown.
function openMenu() {
  fireEvent.focus(screen.getByRole("combobox"));
}

function select(name: string) {
  fireEvent.mouseDown(screen.getByRole("option", { name }));
}

describe("enum array as a tags combobox", () => {
  it("renders each committed value as a pill under the schema's label", () => {
    render(
      <Harness schema={enumSchema} initial={{ roles: ["admin", "viewer"] }} onChange={vi.fn()} />,
    );
    // The pill reads the enum's label, exactly as the single-value combobox
    // renders a chosen option.
    expect(screen.getByText("Administrator (admin)")).toBeInTheDocument();
    expect(screen.getByText("viewer")).toBeInTheDocument();
  });

  it("removes the value its pill names", () => {
    const onChange = vi.fn();
    render(
      <Harness schema={enumSchema} initial={{ roles: ["admin", "viewer"] }} onChange={onChange} />,
    );
    fireEvent.click(screen.getByRole("button", { name: "Remove viewer" }));
    expect(onChange).toHaveBeenCalledWith({ roles: ["admin"] });
  });

  it("offers every option, including the ones already selected", () => {
    render(<Harness schema={enumSchema} initial={{ roles: ["admin"] }} onChange={vi.fn()} />);
    openMenu();
    expect(screen.getAllByRole("option").map((o) => o.textContent)).toEqual([
      "Administrator (admin)",
      "editor",
      "viewer",
    ]);
  });
});

// A list of scalars has no options at all: typing IS how a value is added. The
// numeric case has to survive the round trip through the pill's text.
describe("scalar array as a tags combobox", () => {
  const portsSchema: JsonSchemaObject = {
    type: "object",
    properties: {
      ports: { type: "array", title: "Ports", items: { type: "integer" } },
    },
  };

  function typeAndCommit(text: string, key = "Enter") {
    const input = screen.getByRole("combobox");
    fireEvent.focus(input);
    fireEvent.change(input, { target: { value: text } });
    fireEvent.keyDown(input, { key });
  }

  it("renders committed numbers as pills", () => {
    render(<Harness schema={portsSchema} initial={{ ports: [80, 443] }} onChange={vi.fn()} />);
    expect(screen.getByRole("button", { name: "Remove 80" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Remove 443" })).toBeInTheDocument();
  });

  it("commits typed digits as a number, not a string", () => {
    const onChange = vi.fn();
    render(<Harness schema={portsSchema} initial={{ ports: [80] }} onChange={onChange} />);
    typeAndCommit("443");
    expect(onChange).toHaveBeenCalledWith({ ports: [80, 443] });
  });

  it("keeps text that is not a number, so a template token survives", () => {
    const onChange = vi.fn();
    render(<Harness schema={portsSchema} initial={{ ports: [] }} onChange={onChange} />);
    typeAndCommit("{{.params.port}}");
    expect(onChange).toHaveBeenCalledWith({ ports: ["{{.params.port}}"] });
  });

  it("commits on a comma as well as Enter", () => {
    const onChange = vi.fn();
    render(<Harness schema={portsSchema} initial={{ ports: [] }} onChange={onChange} />);
    typeAndCommit("8080", ",");
    expect(onChange).toHaveBeenCalledWith({ ports: [8080] });
  });

  it("splits a pasted list into one pill per value", () => {
    const onChange = vi.fn();
    render(<Harness schema={portsSchema} initial={{ ports: [] }} onChange={onChange} />);
    fireEvent.paste(screen.getByRole("combobox"), {
      clipboardData: { getData: () => "80, 443,\n8080" },
    });
    expect(onChange).toHaveBeenCalledTimes(1);
    expect(onChange).toHaveBeenCalledWith({ ports: [80, 443, 8080] });
  });

  it("drops the last value on Backspace with an empty query", () => {
    const onChange = vi.fn();
    render(<Harness schema={portsSchema} initial={{ ports: [80, 443] }} onChange={onChange} />);
    const input = screen.getByRole("combobox");
    fireEvent.focus(input);
    fireEvent.keyDown(input, { key: "Backspace" });
    expect(onChange).toHaveBeenCalledWith({ ports: [80] });
  });

  it("keeps a string list on strings", () => {
    const onChange = vi.fn();
    render(
      <Harness
        schema={{ type: "object", properties: { tags: { type: "array", items: { type: "string" } } } }}
        initial={{ tags: ["math"] }}
        onChange={onChange}
      />,
    );
    typeAndCommit("engine");
    expect(onChange).toHaveBeenCalledWith({ tags: ["math", "engine"] });
  });
});

describe("multi lookup as a tags combobox", () => {
  it("keeps the committed values visible instead of dropping the array", async () => {
    render(
      <Harness
        schema={lookupSchema}
        initial={{ imports: ["jms"] }}
        onChange={vi.fn()}
        lookupFetcher={fetcher}
      />,
    );
    // The head set has not resolved yet, so this can only come from the value.
    expect(screen.getByText("jms")).toBeInTheDocument();
  });

  it("commits an array of the fetched values, never a bare string", async () => {
    const onChange = vi.fn();
    render(
      <Harness
        schema={lookupSchema}
        initial={{ imports: ["jms"] }}
        onChange={onChange}
        lookupFetcher={fetcher}
      />,
    );
    openMenu();
    await waitFor(() =>
      expect(screen.getByRole("option", { name: "logs.api" })).toBeInTheDocument(),
    );
    select("logs.api");
    expect(onChange).toHaveBeenCalledWith({ imports: ["jms", "logs.api"] });
  });

  it("searches the server as the query is typed", async () => {
    const spy = vi.fn(fetcher);
    render(
      <Harness
        schema={lookupSchema}
        initial={{ imports: [] }}
        onChange={vi.fn()}
        lookupFetcher={spy}
      />,
    );
    const input = screen.getByRole("combobox");
    fireEvent.focus(input);
    fireEvent.change(input, { target: { value: "debug" } });
    await waitFor(() =>
      expect(spy).toHaveBeenCalledWith(expect.objectContaining({ query: "debug" })),
    );
    await waitFor(() =>
      expect(screen.getByRole("option", { name: "remote-debugger" })).toBeInTheDocument(),
    );
  });
});
