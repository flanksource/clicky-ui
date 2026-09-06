import { useState } from "react";
import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { JsonSchemaForm } from "./JsonSchemaForm";
import type { JsonSchemaObject } from "./json-schema-form-types";

const schema: JsonSchemaObject = {
  properties: {
    labels: {
      title: "String map",
      type: "object",
      additionalProperties: { type: "string" },
    },
    limits: {
      title: "Typed map",
      type: "object",
      additionalProperties: { type: "number" },
    },
    endpoints: {
      type: "object",
      propertyNames: {
        enum: ["primary"],
        "x-enum-labels": { primary: "Primary endpoint" },
      },
      additionalProperties: {
        type: "object",
        "x-layout": "stack",
        properties: { host: { type: "string", title: "Host" } },
      },
    },
  },
};
const initial = {
  labels: { owner: "platform", region: "local" },
  limits: { retries: 3, timeout: 30 },
  endpoints: { primary: { host: "localhost" } },
};

describe("nested property maps", () => {
  it.each(["xs", "sm", "md", "lg", "xl"] as const)(
    "places dirty key actions at the end of the value cell at %s",
    (size) => {
      const onChange = vi.fn();
      render(
        <JsonSchemaForm
          schema={schema}
          value={initial}
          onChange={onChange}
          size={size}
          layout={{ mode: "properties" }}
          showPreferencesMenu={false}
        />,
      );
      fireEvent.click(screen.getByRole("button", { name: "Edit owner key" }));
      expect(
        screen.queryByRole("button", { name: "Save owner key" }),
      ).not.toBeInTheDocument();
      fireEvent.change(screen.getByRole("textbox", { name: "Field name" }), {
        target: { value: "team" },
      });
      const save = screen.getByRole("button", { name: "Save owner key" });
      const cancel = screen.getByRole("button", {
        name: "Cancel editing owner key",
      });
      const valueCell = screen
        .getByRole("button", { name: "Edit owner" })
        .closest("dd");
      expect(valueCell).toContainElement(save);
      expect(valueCell).toContainElement(cancel);
      expect(screen.getByRole("term", { name: "owner" })).not.toContainElement(
        save,
      );
      expect(save).toHaveClass("text-[var(--fs-success)]");
      expect(cancel).toHaveClass("text-destructive");
      fireEvent.click(cancel);
      expect(onChange).not.toHaveBeenCalled();
      fireEvent.click(screen.getByRole("button", { name: "Edit owner key" }));
      fireEvent.change(screen.getByRole("textbox", { name: "Field name" }), {
        target: { value: "team" },
      });
      fireEvent.click(screen.getByRole("button", { name: "Save owner key" }));
      expect(onChange).toHaveBeenCalledExactlyOnceWith({
        ...initial,
        labels: { team: "platform", region: "local" },
      });
    },
  );
  it.each(["xs", "sm", "md", "lg", "xl"] as const)(
    "nests keys in label cells and keeps values aligned at %s",
    (size) => {
      render(
        <JsonSchemaForm
          schema={schema}
          value={initial}
          size={size}
          layout={{ mode: "properties" }}
          showPreferencesMenu={false}
        />,
      );
      expect(
        screen.queryByRole("button", { name: "Edit String map" }),
      ).not.toBeInTheDocument();
      for (const key of ["owner", "retries", "primary"]) {
        expect(screen.getByRole("term", { name: key })).toHaveStyle({
          paddingInlineStart: "16px",
        });
      }
      expect(screen.getByRole("term", { name: "host" })).toHaveStyle({
        paddingInlineStart: "32px",
      });
      expect(screen.getByRole("term", { name: "primary" })).toHaveTextContent(
        "Primary endpoint",
      );
      expect(
        screen.getByRole("button", { name: "Edit owner" }).closest("dd"),
      ).not.toContainElement(screen.getByRole("term", { name: "owner" }));
      expect(screen.queryByRole("textbox")).not.toBeInTheDocument();
    },
  );

  it("saves only the edited typed entry and cancels string drafts", () => {
    const onChange = vi.fn();
    render(
      <JsonSchemaForm
        schema={schema}
        value={initial}
        onChange={onChange}
        layout={{ mode: "properties" }}
        showPreferencesMenu={false}
      />,
    );
    fireEvent.focus(screen.getByRole("button", { name: "Edit owner" }));
    fireEvent.change(screen.getByRole("textbox", { name: "owner" }), {
      target: { value: "discarded" },
    });
    fireEvent.keyDown(screen.getByRole("textbox", { name: "owner" }), {
      key: "Escape",
    });
    expect(onChange).not.toHaveBeenCalled();
    fireEvent.click(screen.getByRole("button", { name: "Edit retries" }));
    fireEvent.change(screen.getByRole("textbox", { name: "retries" }), {
      target: { value: "5" },
    });
    fireEvent.keyDown(screen.getByRole("textbox", { name: "retries" }), {
      key: "Enter",
    });
    expect(onChange).toHaveBeenCalledExactlyOnceWith({
      ...initial,
      limits: { retries: 5, timeout: 30 },
    });
  });

  it("keeps map keys editable and supports adding and removing entries", () => {
    function Example() {
      const [value, setValue] = useState<Record<string, unknown>>({
        labels: initial.labels,
      });
      return (
        <JsonSchemaForm
          schema={{ properties: { labels: schema.properties!.labels! } }}
          value={value}
          onChange={setValue}
          layout={{ mode: "properties" }}
          showPreferencesMenu={false}
        />
      );
    }
    render(<Example />);
    fireEvent.click(screen.getByRole("button", { name: "Edit owner key" }));
    fireEvent.change(screen.getByRole("textbox", { name: "Field name" }), {
      target: { value: "team" },
    });
    fireEvent.keyDown(screen.getByRole("textbox", { name: "Field name" }), {
      key: "Enter",
    });
    expect(screen.getByRole("textbox", { name: "team" })).toHaveFocus();
    fireEvent.keyDown(screen.getByRole("textbox", { name: "team" }), {
      key: "Escape",
    });
    expect(screen.getByRole("button", { name: "Edit team" })).toHaveTextContent(
      "platform",
    );
    fireEvent.click(screen.getByRole("button", { name: "Edit team key" }));
    fireEvent.click(screen.getByRole("button", { name: "Remove team" }));
    expect(
      screen.queryByRole("term", { name: "team" }),
    ).not.toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "Add field" }));
    expect(
      screen.getByRole("button", { name: "Edit New field key" }),
    ).toBeInTheDocument();
  });

  it("renders errors at escaped entry paths and respects read-only maps", () => {
    render(
      <JsonSchemaForm
        schema={schema}
        value={{ labels: { "a/b": "invalid" }, limits: initial.limits }}
        readOnly
        errors={[{ instancePath: "/labels/a~1b", message: "Invalid label" }]}
        layout={{ mode: "properties" }}
        showPreferencesMenu={false}
      />,
    );
    expect(screen.getByRole("term", { name: "a/b" })).toHaveStyle({
      paddingInlineStart: "16px",
    });
    expect(screen.getByText("Invalid label")).toBeInTheDocument();
    expect(
      screen.queryByRole("button", { name: /^Edit |Add field|Remove / }),
    ).not.toBeInTheDocument();
  });
});
