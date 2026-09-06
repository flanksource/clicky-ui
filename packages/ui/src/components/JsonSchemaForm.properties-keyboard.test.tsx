import { act, fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { JsonSchemaForm } from "./JsonSchemaForm";
import { useState, type ReactNode } from "react";

function setup(readOnly = false) {
  const onChange = vi.fn();
  render(
    <JsonSchemaForm
      schema={{
        properties: {
          name: { type: "string", title: "Name" },
          notes: { type: "string", title: "Notes", format: "textarea" },
          tags: { type: "array", title: "Tags", items: { type: "string" } },
        },
      }}
      value={{ name: "Original", notes: "Notes", tags: ["api"] }}
      onChange={onChange}
      layout={{ mode: "properties" }}
      readOnly={readOnly}
      showPreferencesMenu={false}
    />,
  );
  return onChange;
}

describe("property editor keyboard navigation", () => {
  it("keeps focus when a loading control is replaced by its rich editor", async () => {
    const form = (control: ReactNode) => (
      <JsonSchemaForm
        schema={{ properties: { notes: { type: "string", title: "Notes" } } }}
        value={{ notes: "Original" }}
        onChange={vi.fn()}
        layout={{ mode: "properties" }}
        showPreferencesMenu={false}
        post={[
          (field, nodes) =>
            field.readOnly ? nodes : { ...nodes, value: control },
        ]}
      />
    );
    const { rerender } = render(form(<textarea aria-label="Loading notes" />));
    act(() => screen.getByRole("button", { name: "Edit Notes" }).focus());
    expect(
      screen.getByRole("textbox", { name: "Loading notes" }),
    ).toHaveFocus();
    await act(async () =>
      rerender(
        form(
          <>
            <button type="button" role="combobox">
              Toolbar
            </button>
            <div contentEditable role="textbox" aria-label="Rich notes" />
          </>,
        ),
      ),
    );
    expect(screen.getByRole("textbox", { name: "Rich notes" })).toHaveFocus();
  });
  it("opens and focuses the input when keyboard navigation focuses a value", () => {
    setup();
    act(() => screen.getByRole("button", { name: "Edit Name" }).focus());
    expect(screen.getByRole("textbox", { name: "Name" })).toHaveFocus();
  });

  it.each(["Enter", "Escape"])(
    "%s finishes without reopening the accepted or cancelled field",
    async (key) => {
      const onChange = setup();
      fireEvent.click(screen.getByRole("button", { name: "Edit Name" }));
      const input = screen.getByRole("textbox", { name: "Name" });
      fireEvent.change(input, { target: { value: "Draft" } });
      fireEvent.keyDown(input, { key });
      if (key === "Enter")
        expect(
          await screen.findByRole("textbox", { name: "Notes" }),
        ).toHaveFocus();
      else
        expect(
          await screen.findByRole("button", { name: "Edit Name" }),
        ).toHaveFocus();
      expect(
        screen.queryByRole("textbox", { name: "Name" }),
      ).not.toBeInTheDocument();
      if (key === "Enter")
        expect(onChange).toHaveBeenCalledExactlyOnceWith({
          name: "Draft",
          notes: "Notes",
          tags: ["api"],
        });
      else expect(onChange).not.toHaveBeenCalled();
      await act(async () =>
        screen.getByRole("button", { name: "Edit Tags" }).focus(),
      );
      expect(screen.getByRole("combobox", { name: "Tags" })).toHaveFocus();
    },
  );

  it("advances unchanged values into nested fields, skipping read-only rows and action buttons", () => {
    render(
      <JsonSchemaForm
        schema={{
          properties: {
            name: { type: "string", title: "Name" },
            identifier: { type: "string", readOnly: true },
            connection: {
              type: "object",
              properties: { host: { type: "string", title: "Host" } },
            },
          },
        }}
        value={{
          name: "Original",
          identifier: "fixed",
          connection: { host: "localhost" },
        }}
        onChange={vi.fn()}
        layout={{ mode: "properties" }}
        showPreferencesMenu={false}
      />,
    );
    fireEvent.click(screen.getByRole("button", { name: "Edit Name" }));
    fireEvent.keyDown(screen.getByRole("textbox", { name: "Name" }), {
      key: "Enter",
    });
    expect(screen.getByRole("textbox", { name: "Host" })).toHaveFocus();
  });

  it("advances a renamed map key into its value after the row remounts", () => {
    function Example() {
      const [value, setValue] = useState<Record<string, unknown>>({
        labels: { owner: "platform", region: "local" },
      });
      return (
        <JsonSchemaForm
          schema={{
            properties: {
              labels: {
                type: "object",
                additionalProperties: { type: "string" },
              },
            },
          }}
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
    expect(screen.getByRole("textbox", { name: "team" })).toHaveValue(
      "platform",
    );
  });

  it("finishes the last field without wrapping or entering another form", () => {
    for (const name of ["First form", "Second form"])
      render(
        <JsonSchemaForm
          schema={{ properties: { name: { type: "string", title: name } } }}
          value={{ name }}
          onChange={vi.fn()}
          idPrefix={name}
          layout={{ mode: "properties" }}
          showPreferencesMenu={false}
        />,
      );
    fireEvent.click(screen.getByRole("button", { name: "Edit First form" }));
    fireEvent.keyDown(screen.getByRole("textbox", { name: "First form" }), {
      key: "Enter",
    });
    expect(screen.queryByRole("textbox")).not.toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "Edit First form" }),
    ).toHaveFocus();
  });

  it("keeps the next field when saving removes the current filter match", () => {
    function Example() {
      const [value, setValue] = useState<Record<string, unknown>>({
        first: "match one",
        second: "match two",
      });
      return (
        <JsonSchemaForm
          schema={{
            properties: {
              first: { type: "string", title: "First" },
              second: { type: "string", title: "Second" },
            },
          }}
          value={value}
          onChange={setValue}
          showFilter
          layout={{ mode: "properties" }}
          showPreferencesMenu={false}
        />
      );
    }
    render(<Example />);
    fireEvent.change(screen.getByRole("textbox", { name: "Filter fields" }), {
      target: { value: "match" },
    });
    fireEvent.click(screen.getByRole("button", { name: "Edit First" }));
    fireEvent.change(screen.getByRole("textbox", { name: "First" }), {
      target: { value: "gone" },
    });
    fireEvent.keyDown(screen.getByRole("textbox", { name: "First" }), {
      key: "Enter",
    });
    expect(screen.getByRole("textbox", { name: "Second" })).toHaveFocus();
  });

  it("does not accept Enter during composition or with Shift held", () => {
    const onChange = setup();
    fireEvent.click(screen.getByRole("button", { name: "Edit Name" }));
    const input = screen.getByRole("textbox", { name: "Name" });
    fireEvent.keyDown(input, { key: "Enter", isComposing: true });
    fireEvent.keyDown(input, { key: "Enter", shiftKey: true });
    expect(input).toHaveFocus();
    expect(onChange).not.toHaveBeenCalled();
  });

  it("lets a picker consume Escape before cancelling the draft", () => {
    const onChange = setup();
    fireEvent.click(screen.getByRole("button", { name: "Edit Tags" }));
    const input = screen.getByRole("combobox", { name: "Tags" });
    fireEvent.keyDown(input, { key: "ArrowDown" });
    expect(input).toHaveAttribute("aria-expanded", "true");
    fireEvent.keyDown(input, { key: "Escape" });
    expect(input).toHaveAttribute("aria-expanded", "false");
    fireEvent.keyDown(input, { key: "Escape" });
    expect(screen.getByRole("button", { name: "Edit Tags" })).toHaveFocus();
    expect(onChange).not.toHaveBeenCalled();
  });

  it("accepts multiline values with Enter while leaving Shift+Enter for newlines", () => {
    const onChange = setup();
    act(() => screen.getByRole("button", { name: "Edit Notes" }).focus());
    const input = screen.getByRole("textbox", { name: "Notes" });
    expect(input.tagName).toBe("TEXTAREA");
    fireEvent.keyDown(input, { key: "Enter", shiftKey: true });
    expect(onChange).not.toHaveBeenCalled();
    fireEvent.change(input, { target: { value: "First\nSecond" } });
    fireEvent.keyDown(input, { key: "Enter" });
    expect(onChange).toHaveBeenCalledExactlyOnceWith({
      name: "Original",
      notes: "First\nSecond",
      tags: ["api"],
    });
  });

  it("does not turn Enter on the cancel button into a save", () => {
    const onChange = setup();
    fireEvent.click(screen.getByRole("button", { name: "Edit Name" }));
    fireEvent.change(screen.getByRole("textbox", { name: "Name" }), {
      target: { value: "Changed" },
    });
    const cancel = screen.getByRole("button", { name: "Cancel editing Name" });
    fireEvent.keyDown(cancel, { key: "Enter" });
    fireEvent.click(cancel);
    expect(onChange).not.toHaveBeenCalled();
    expect(screen.getByRole("button", { name: "Edit Name" })).toHaveFocus();
  });

  it("does not open a read-only value on focus", () => {
    setup(true);
    fireEvent.focus(screen.getByLabelText("Name"));
    expect(screen.queryByRole("textbox")).not.toBeInTheDocument();
  });

  it("accepts before a rich-text editor consumes Enter", () => {
    const onChange = vi.fn();
    const insertParagraph = vi.fn();
    render(
      <JsonSchemaForm
        schema={{ properties: { notes: { type: "string", title: "Notes" } } }}
        value={{ notes: "Original" }}
        onChange={onChange}
        layout={{ mode: "properties" }}
        showPreferencesMenu={false}
        post={[
          (field, nodes) =>
            field.readOnly
              ? nodes
              : {
                  ...nodes,
                  value: (
                    <div
                      contentEditable
                      suppressContentEditableWarning
                      role="textbox"
                      aria-label="Rich notes"
                      onKeyDown={(event) => {
                        event.preventDefault();
                        event.stopPropagation();
                        insertParagraph();
                      }}
                    >
                      Original
                    </div>
                  ),
                },
        ]}
      />,
    );
    fireEvent.click(screen.getByRole("button", { name: "Edit Notes" }));
    const editor = screen.getByRole("textbox", { name: "Rich notes" });
    expect(editor).toHaveFocus();
    fireEvent.keyDown(editor, { key: "Enter" });
    expect(insertParagraph).not.toHaveBeenCalled();
    expect(onChange).toHaveBeenCalledExactlyOnceWith({ notes: "Original" });
  });
});
