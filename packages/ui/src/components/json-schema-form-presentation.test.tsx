import { render, screen, fireEvent } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { JsonSchemaForm } from "./JsonSchemaForm";

describe("form presentation", () => {
  it("opens a collapsed section on descendant errors and keeps it open after correction", () => {
    const props = {
      schema: {
        properties: {
          settings: {
            type: "object" as const,
            title: "Settings",
            properties: { name: { type: "string" as const, title: "Name" } },
          },
        },
      },
      value: { settings: { name: "initial" } },
      onChange: vi.fn(),
      objectDisplay: "accordion" as const,
      applyDefaults: false,
      persistPreferences: false,
    };
    const { rerender } = render(<JsonSchemaForm {...props} />);
    rerender(
      <JsonSchemaForm
        {...props}
        errors={[{ instancePath: "/settings/name", message: "Invalid name" }]}
      />,
    );
    expect(screen.getByRole("textbox", { name: "Name" })).toBeInTheDocument();
    rerender(<JsonSchemaForm {...props} />);
    expect(screen.getByRole("button", { name: "Settings" })).toHaveAttribute(
      "aria-expanded",
      "true",
    );
  });
  it("renders schema objects as collapsible sections without changing values", () => {
    const onChange = vi.fn();
    render(
      <JsonSchemaForm
        objectDisplay="accordion"
        showTypeIcons
        schema={{
          properties: {
            settings: {
              type: "object",
              title: "Settings",
              properties: { name: { type: "string", title: "Name" } },
            },
          },
        }}
        value={{ settings: { name: "initial" } }}
        onChange={onChange}
        applyDefaults={false}
        persistPreferences={false}
      />,
    );
    expect(
      screen.queryByRole("textbox", { name: "Name" }),
    ).not.toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "Settings" }));
    expect(screen.getByRole("textbox", { name: "Name" })).toHaveValue(
      "initial",
    );
    expect(onChange).not.toHaveBeenCalled();
  });
});
