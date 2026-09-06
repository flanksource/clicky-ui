import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { JsonSchemaForm } from "./JsonSchemaForm";

describe("properties presentation", () => {
  it.each([true, false])("presents %s as a checkbox until editing", (value) => {
    const onChange = vi.fn();
    render(
      <JsonSchemaForm
        schema={{
          properties: { enabled: { type: "boolean", title: "Enabled" } },
        }}
        value={{ enabled: value }}
        onChange={onChange}
        layout={{ mode: "properties" }}
        showPreferencesMenu={false}
      />,
    );
    const preview = screen.getByRole("checkbox", { name: "Enabled" });
    expect(preview).toHaveProperty("checked", value);
    expect(preview).toBeDisabled();
    expect(screen.queryByText(String(value))).not.toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "Edit Enabled" }));
    const editor = screen.getByRole("checkbox", { name: "Enabled" });
    expect(editor).toBeEnabled();
    fireEvent.click(editor);
    expect(onChange).not.toHaveBeenCalled();
    fireEvent.click(screen.getByRole("button", { name: "Save Enabled" }));
    expect(onChange).toHaveBeenCalledWith({ enabled: !value });
  });

  it("renders markdown structure without mounting the editor", async () => {
    render(
      <JsonSchemaForm
        schema={{ properties: { notes: { type: "string", format: "md" } } }}
        value={{ notes: "## Release notes\n\nA **small** update." }}
        layout={{ mode: "properties" }}
        showPreferencesMenu={false}
      />,
    );
    expect(
      await screen.findByRole("heading", { name: "Release notes" }),
    ).toBeInTheDocument();
    expect(screen.getByText("small")).toHaveAttribute(
      "data-streamdown",
      "strong",
    );
    expect(screen.getByText("small")).toHaveClass("font-semibold");
    expect(screen.queryByRole("textbox")).not.toBeInTheDocument();
  });

  it("retains pre-extension adornments and number units", () => {
    render(
      <JsonSchemaForm
        schema={{
          properties: { percent: { type: "number", format: "percent" } },
        }}
        value={{ percent: 75 }}
        layout={{ mode: "properties" }}
        showPreferencesMenu={false}
        pre={[(field) => ({ ...field, prefix: <span>Quota</span> })]}
      />,
    );
    expect(screen.getByText("Quota")).toBeInTheDocument();
    expect(screen.getByText("%")).toBeInTheDocument();
  });

  it("does not commit an extension action from presentation mode", () => {
    const onChange = vi.fn();
    render(
      <JsonSchemaForm
        schema={{ properties: { name: { type: "string", title: "Name" } } }}
        value={{ name: "Before" }}
        onChange={onChange}
        layout={{ mode: "properties" }}
        showPreferencesMenu={false}
        post={[
          (field, nodes) => ({
            ...nodes,
            value: (
              <button type="button" onClick={() => field.onChange("After")}>
                Extension
              </button>
            ),
          }),
        ]}
      />,
    );
    fireEvent.click(screen.getByText("Extension"));
    expect(onChange).not.toHaveBeenCalled();
    expect(
      screen.queryByRole("button", { name: "Save Name" }),
    ).not.toBeInTheDocument();
    fireEvent.click(screen.getByText("Extension"));
    expect(
      screen.getByRole("button", { name: "Save Name" }),
    ).toBeInTheDocument();
    expect(onChange).not.toHaveBeenCalled();
  });

  it.each([
    ["xs", "py-0", "h-7"],
    ["sm", "py-0.5", "h-7"],
    ["md", "py-1", "h-8"],
    ["lg", "py-1.5", "h-8"],
    ["xl", "py-2", "h-9"],
  ] as const)(
    "scales %s cells and inline actions together",
    (size, padding, height) => {
      render(
        <JsonSchemaForm
          schema={{ properties: { name: { type: "string", title: "Name" } } }}
          value={{ name: "Example" }}
          size={size}
          layout={{ mode: "properties" }}
          showPreferencesMenu={false}
        />,
      );
      const preview = screen.getByRole("button", { name: "Edit Name" });
      expect(preview.closest("dl")?.querySelector(":scope > div")).toHaveClass(
        padding,
      );
      expect(preview.querySelector("[data-jsf-readonly]")).toHaveClass(height);
      fireEvent.keyDown(preview, { key: "Enter" });
      expect(screen.getByLabelText("Name")).toHaveClass(height);
      fireEvent.change(screen.getByLabelText("Name"), {
        target: { value: "Changed" },
      });
      expect(screen.getByRole("button", { name: "Save Name" })).toHaveClass(
        height,
      );
    },
  );
});
