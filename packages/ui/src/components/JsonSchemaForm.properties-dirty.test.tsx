import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { JsonSchemaForm } from "./JsonSchemaForm";

describe("property draft actions", () => {
  it.each(["xs", "sm", "md", "lg", "xl"] as const)(
    "only shows actions for a changed %s draft",
    (size) => {
      render(
        <JsonSchemaForm
          schema={{ properties: { name: { type: "string", title: "Name" } } }}
          value={{ name: "Original" }}
          onChange={vi.fn()}
          size={size}
          layout={{ mode: "properties" }}
          showPreferencesMenu={false}
        />,
      );
      fireEvent.click(screen.getByRole("button", { name: "Edit Name" }));
      const input = screen.getByRole("textbox", { name: "Name" });
      expect(
        screen.queryByRole("button", { name: "Save Name" }),
      ).not.toBeInTheDocument();
      expect(
        screen.queryByRole("button", { name: "Cancel editing Name" }),
      ).not.toBeInTheDocument();
      fireEvent.change(input, { target: { value: "Changed" } });
      expect(
        screen.getByRole("button", { name: "Save Name" }),
      ).toBeInTheDocument();
      expect(
        screen.getByRole("button", { name: "Cancel editing Name" }),
      ).toBeInTheDocument();
      fireEvent.change(input, { target: { value: "Original" } });
      expect(
        screen.queryByRole("button", { name: "Save Name" }),
      ).not.toBeInTheDocument();
      expect(
        screen.queryByRole("button", { name: "Cancel editing Name" }),
      ).not.toBeInTheDocument();
      fireEvent.keyDown(input, { key: "Escape" });
      expect(screen.getByRole("button", { name: "Edit Name" })).toHaveFocus();
    },
  );

  it("compares nested collection contents instead of references or object key order", () => {
    render(
      <JsonSchemaForm
        schema={{
          properties: {
            items: {
              title: "Items",
              type: "array",
              items: {
                type: "object",
                properties: {
                  name: { type: "string" },
                  enabled: { type: "boolean" },
                },
              },
            },
          },
        }}
        value={{ items: [{ name: "API", enabled: true }] }}
        onChange={vi.fn()}
        layout={{ mode: "properties" }}
        showPreferencesMenu={false}
        post={[
          (field, nodes) =>
            field.readOnly
              ? nodes
              : {
                  ...nodes,
                  value: (
                    <>
                      <button
                        type="button"
                        onClick={() =>
                          field.onChange([{ name: "Worker", enabled: true }])
                        }
                      >
                        Change item
                      </button>
                      <button
                        type="button"
                        onClick={() =>
                          field.onChange([{ enabled: true, name: "API" }])
                        }
                      >
                        Restore item
                      </button>
                    </>
                  ),
                },
        ]}
      />,
    );
    fireEvent.click(screen.getByRole("button", { name: "Edit Items" }));
    fireEvent.click(screen.getByRole("button", { name: "Change item" }));
    expect(
      screen.getByRole("button", { name: "Save Items" }),
    ).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "Restore item" }));
    expect(
      screen.queryByRole("button", { name: "Save Items" }),
    ).not.toBeInTheDocument();
    expect(
      screen.queryByRole("button", { name: "Cancel editing Items" }),
    ).not.toBeInTheDocument();
  });

  it("includes sibling edits made by root-level extensions", () => {
    const onChange = vi.fn();
    render(
      <JsonSchemaForm
        schema={{ properties: { name: { type: "string", title: "Name" } } }}
        value={{ name: "Original", sibling: "Before" }}
        onChange={onChange}
        layout={{ mode: "properties" }}
        showPreferencesMenu={false}
        post={[
          (field, nodes, ctx) =>
            field.readOnly
              ? nodes
              : {
                  ...nodes,
                  value: (
                    <>
                      {nodes.value}
                      <button
                        type="button"
                        onClick={() =>
                          ctx?.onRootChange?.({
                            name: "Original",
                            sibling: "After",
                          })
                        }
                      >
                        Change sibling
                      </button>
                      <button
                        type="button"
                        onClick={() =>
                          ctx?.onRootChange?.({
                            sibling: "Before",
                            name: "Original",
                          })
                        }
                      >
                        Restore sibling
                      </button>
                    </>
                  ),
                },
        ]}
      />,
    );
    fireEvent.click(screen.getByRole("button", { name: "Edit Name" }));
    fireEvent.click(screen.getByRole("button", { name: "Change sibling" }));
    expect(
      screen.getByRole("button", { name: "Save Name" }),
    ).toBeInTheDocument();
    expect(screen.getByRole("textbox", { name: "Name" })).toHaveValue(
      "Original",
    );
    fireEvent.click(screen.getByRole("button", { name: "Restore sibling" }));
    expect(
      screen.queryByRole("button", { name: "Save Name" }),
    ).not.toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "Change sibling" }));
    fireEvent.click(screen.getByRole("button", { name: "Save Name" }));
    expect(onChange).toHaveBeenCalledExactlyOnceWith({
      name: "Original",
      sibling: "After",
    });
  });
});
