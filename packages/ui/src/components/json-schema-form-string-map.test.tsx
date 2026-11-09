import { useState } from "react";
import { fireEvent, render, screen, within } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { JsonSchemaForm } from "./JsonSchemaForm";
import type { JsonSchemaObject } from "./json-schema-form-types";

const schema: JsonSchemaObject = {
  properties: {
    labels: {
      title: "Labels",
      type: "object",
      additionalProperties: { type: "string" },
    },
  },
};
const initial = { labels: { owner: "platform", region: "local" } };

describe("string map properties tables", () => {
  it.each(["inline", "stacked"] as const)(
    "uses property rows inside a %s form",
    (mode) => {
      render(
        <JsonSchemaForm
          schema={schema}
          value={initial}
          onChange={vi.fn()}
          layout={{ mode }}
          showPreferencesMenu={false}
        />,
      );
      expect(screen.getByRole("term", { name: "owner" })).toHaveTextContent(
        "owner",
      );
      expect(
        screen.getByRole("button", { name: "Edit owner" }).closest("dd"),
      ).toHaveTextContent("platform");
      expect(screen.queryByRole("textbox")).not.toBeInTheDocument();
    },
  );

  it("saves value and key edits and supports adding and removing rows", () => {
    const onChange = vi.fn();
    function Example() {
      const [value, setValue] = useState<Record<string, unknown>>(initial);
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
    render(<Example />);
    fireEvent.click(screen.getByRole("button", { name: "Edit owner" }));
    fireEvent.change(screen.getByRole("textbox", { name: "owner" }), {
      target: { value: "engineering" },
    });
    fireEvent.keyDown(screen.getByRole("textbox", { name: "owner" }), {
      key: "Enter",
    });
    expect(onChange).toHaveBeenLastCalledWith({
      labels: { owner: "engineering", region: "local" },
    });
    fireEvent.click(screen.getByRole("button", { name: "Edit owner key" }));
    fireEvent.change(
      within(screen.getByRole("term", { name: "owner" })).getByRole("textbox", {
        name: "Field name",
      }),
      { target: { value: "team" } },
    );
    fireEvent.click(screen.getByRole("button", { name: "Save owner key" }));
    expect(onChange).toHaveBeenLastCalledWith({
      labels: { team: "engineering", region: "local" },
    });
    fireEvent.click(screen.getByRole("button", { name: "Edit team key" }));
    fireEvent.click(screen.getByRole("button", { name: "Remove team" }));
    expect(onChange).toHaveBeenLastCalledWith({ labels: { region: "local" } });
    fireEvent.click(screen.getByRole("button", { name: "Add field" }));
    expect(onChange).toHaveBeenLastCalledWith({
      labels: { region: "local", "": "" },
    });
    const newKey = screen.getByRole("button", { name: "Edit New field key" });
    expect(newKey).toHaveTextContent("New field");
    const keyCell = newKey.closest("dt")!;
    fireEvent.click(newKey);
    fireEvent.change(
      within(keyCell).getByRole("textbox", { name: "Field name" }),
      { target: { value: "purpose" } },
    );
    fireEvent.click(screen.getByRole("button", { name: "Save New field key" }));
    expect(onChange).toHaveBeenLastCalledWith({
      labels: { region: "local", purpose: "" },
    });
  });

  it("presents read-only entries and their errors without edit actions", () => {
    render(
      <JsonSchemaForm
        schema={schema}
        value={initial}
        readOnly
        errors={[{ instancePath: "/labels/owner", message: "Invalid owner" }]}
        showPreferencesMenu={false}
      />,
    );
    expect(screen.getByRole("term", { name: "owner" })).toBeInTheDocument();
    expect(screen.getByText("platform")).toBeInTheDocument();
    expect(screen.getByText("Invalid owner")).toBeInTheDocument();
    expect(
      screen.queryByRole("button", { name: /^Edit |Add field|Remove / }),
    ).not.toBeInTheDocument();
  });

  it("can add the first property to an empty map", () => {
    const onChange = vi.fn();
    render(
      <JsonSchemaForm
        schema={schema}
        value={{ labels: {} }}
        onChange={onChange}
        showPreferencesMenu={false}
      />,
    );
    fireEvent.click(screen.getByRole("button", { name: "Add field" }));
    expect(onChange).toHaveBeenCalledExactlyOnceWith({ labels: { "": "" } });
  });
});
