import { useState } from "react";
import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { JsonSchemaForm } from "./JsonSchemaForm";
import type { JsonSchemaObject } from "./json-schema-form-types";

const schema: JsonSchemaObject = {
  type: "object",
  properties: {
    name: { type: "string", title: "Name" },
    tags: { type: "array", title: "Tags", items: { type: "string" } },
    credentials: {
      type: "object",
      title: "Credentials",
      properties: {
        retries: { type: "integer", title: "Retries" },
        secret: { type: "string", title: "Secret", format: "password" },
        identifier: { type: "string", title: "Identifier", readOnly: true },
      },
    },
  },
};

function Example({ readOnly = false }: { readOnly?: boolean }) {
  const [value, setValue] = useState<Record<string, unknown>>({
    name: "Example",
    tags: ["api", "internal"],
    credentials: { retries: 3, secret: "test-secret", identifier: "fixed" },
  });
  return (
    <JsonSchemaForm
      schema={schema}
      value={value}
      onChange={setValue}
      layout={{ mode: "properties" }}
      readOnly={readOnly}
      showPreferencesMenu={false}
    />
  );
}

describe("properties form layout", () => {
  it("stages composite extension edits together with the field value", () => {
    const onChange = vi.fn();
    render(
      <JsonSchemaForm
        schema={{ properties: { name: { type: "string", title: "Name" } } }}
        value={{ name: "Original", sibling: "Before" }}
        onChange={onChange}
        layout={{ mode: "properties" }}
        showPreferencesMenu={false}
        post={[
          (_field, nodes, ctx) => ({
            ...nodes,
            value: (
              <>
                {nodes.value}
                <button
                  type="button"
                  onClick={() =>
                    ctx?.onRootChange?.({
                      ...ctx.rootValue,
                      name: "Composite",
                      sibling: "After",
                    })
                  }
                >
                  Update sibling
                </button>
              </>
            ),
          }),
        ]}
      />,
    );
    fireEvent.click(screen.getByRole("button", { name: "Edit Name" }));
    fireEvent.click(screen.getByRole("button", { name: "Update sibling" }));
    expect(screen.getByLabelText("Name")).toHaveValue("Composite");
    expect(onChange).not.toHaveBeenCalled();
    fireEvent.change(screen.getByLabelText("Name"), {
      target: { value: "Final" },
    });
    fireEvent.click(screen.getByRole("button", { name: "Save Name" }));
    expect(onChange).toHaveBeenCalledExactlyOnceWith({
      name: "Final",
      sibling: "After",
    });
  });
  it("discards edits on cancel and only emits changes on save", () => {
    const onChange = vi.fn();
    render(
      <JsonSchemaForm
        schema={schema}
        value={{ name: "Original" }}
        onChange={onChange}
        layout={{ mode: "properties" }}
        showPreferencesMenu={false}
      />,
    );
    fireEvent.click(screen.getByRole("button", { name: "Edit Name" }));
    fireEvent.change(screen.getByLabelText("Name"), {
      target: { value: "Discarded" },
    });
    expect(onChange).not.toHaveBeenCalled();
    fireEvent.click(
      screen.getByRole("button", { name: "Cancel editing Name" }),
    );
    expect(screen.getByRole("button", { name: "Edit Name" })).toHaveTextContent(
      "Original",
    );
    expect(onChange).not.toHaveBeenCalled();
    fireEvent.click(screen.getByRole("button", { name: "Edit Name" }));
    fireEvent.change(screen.getByLabelText("Name"), {
      target: { value: "Saved" },
    });
    fireEvent.click(screen.getByRole("button", { name: "Save Name" }));
    expect(onChange).toHaveBeenCalledExactlyOnceWith({ name: "Saved" });
  });
  it("shows selected tags in presentation mode", () => {
    render(<Example />);
    expect(screen.getByRole("button", { name: "Edit Tags" })).toHaveTextContent(
      "apiinternal",
    );
    expect(document.querySelectorAll("[data-combobox-tag]")).toHaveLength(2);
  });
  it("shows values until clicked, then edits nested values through the schema control", () => {
    render(<Example />);
    expect(screen.queryByRole("textbox")).not.toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "Edit Retries" }));
    const input = screen.getByLabelText("Retries");
    expect(input).toHaveFocus();
    fireEvent.change(input, { target: { value: "5" } });
    fireEvent.click(screen.getByRole("button", { name: "Save Retries" }));
    expect(
      screen.getByRole("button", { name: "Edit Retries" }),
    ).toHaveTextContent("5");
    expect(screen.getByRole("button", { name: "Edit Name" })).toHaveTextContent(
      "Example",
    );
  });

  it("masks secrets and never offers editing for read-only fields", () => {
    render(<Example />);
    expect(
      screen.getByRole("button", { name: "Edit Secret" }),
    ).toHaveTextContent("••••••••");
    expect(screen.queryByText("test-secret")).not.toBeInTheDocument();
    expect(
      screen.queryByRole("button", { name: "Edit Identifier" }),
    ).not.toBeInTheDocument();
  });

  it("keeps a read-only form as static values", () => {
    render(<Example readOnly />);
    expect(
      screen.queryByRole("button", { name: /^Edit / }),
    ).not.toBeInTheDocument();
    expect(screen.getByText("Example")).toBeInTheDocument();
  });

  it("exposes validation errors on the preview and the active input", () => {
    render(
      <JsonSchemaForm
        schema={schema}
        value={{ name: "" }}
        onChange={vi.fn()}
        errors={[{ instancePath: "/name", message: "Name is required" }]}
        layout={{ mode: "properties" }}
        showPreferencesMenu={false}
      />,
    );
    expect(screen.getByRole("button", { name: "Edit Name" })).toHaveAttribute(
      "aria-invalid",
      "true",
    );
    expect(screen.getByText("Name is required")).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "Edit Name" }));
    expect(screen.getByLabelText("Name")).toHaveAttribute(
      "aria-invalid",
      "true",
    );
  });

  it("preserves post-extension previews and opens their editor on click", () => {
    render(
      <JsonSchemaForm
        schema={{ properties: { name: { type: "string", title: "Name" } } }}
        value={{ name: "Example" }}
        onChange={vi.fn()}
        layout={{ mode: "properties" }}
        showPreferencesMenu={false}
        post={[
          (_field, nodes) => ({
            ...nodes,
            value: <button type="button">Custom editor</button>,
          }),
        ]}
      />,
    );
    expect(screen.getByText("Custom editor")).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "Edit Name" }));
    expect(screen.getByRole("button", { name: "Custom editor" })).toHaveFocus();
  });

  it("offers the properties layout in the form display menu", () => {
    render(
      <JsonSchemaForm
        schema={schema}
        value={{ name: "Example" }}
        onChange={vi.fn()}
        persistPreferences={false}
      />,
    );
    fireEvent.click(
      screen.getByRole("button", { name: "Form display options" }),
    );
    fireEvent.click(
      screen.getByRole("menuitemradio", { name: "Properties", exact: true }),
    );
    expect(screen.getByRole("button", { name: "Edit Name" })).toHaveTextContent(
      "Example",
    );
  });
});
