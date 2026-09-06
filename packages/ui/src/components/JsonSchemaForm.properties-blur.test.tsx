import {
  act,
  fireEvent,
  render,
  screen,
  waitFor,
} from "@testing-library/react";
import { createPortal } from "react-dom";
import { describe, expect, it, vi } from "vitest";
import { JsonSchemaForm } from "./JsonSchemaForm";

describe("property editor focus boundaries", () => {
  it.each([false, true])(
    "returns to presentation without saving when focus leaves (dirty: %s)",
    async (dirty) => {
      const onChange = vi.fn();
      render(
        <JsonSchemaForm
          schema={{
            properties: {
              first: { type: "string", title: "First" },
              second: { type: "string", title: "Second" },
            },
          }}
          value={{ first: "Original", second: "Next" }}
          onChange={onChange}
          layout={{ mode: "properties" }}
          showPreferencesMenu={false}
        />,
      );
      fireEvent.click(screen.getByRole("button", { name: "Edit First" }));
      if (dirty)
        fireEvent.change(screen.getByRole("textbox", { name: "First" }), {
          target: { value: "Draft" },
        });
      await act(async () =>
        screen.getByRole("button", { name: "Edit Second" }).focus(),
      );
      await waitFor(() =>
        expect(
          screen.getByRole("button", { name: "Edit First" }),
        ).toHaveTextContent("Original"),
      );
      expect(screen.getByRole("textbox", { name: "Second" })).toHaveFocus();
      expect(onChange).not.toHaveBeenCalled();
    },
  );

  it("keeps editing when focus moves to portaled key actions, then closes when focus leaves them", async () => {
    render(
      <>
        <JsonSchemaForm
          schema={{
            properties: {
              labels: {
                type: "object",
                additionalProperties: { type: "string" },
              },
            },
          }}
          value={{ labels: { owner: "platform" } }}
          onChange={vi.fn()}
          layout={{ mode: "properties" }}
          showPreferencesMenu={false}
        />
        <button type="button">Outside</button>
      </>,
    );
    fireEvent.click(screen.getByRole("button", { name: "Edit owner key" }));
    fireEvent.change(screen.getByRole("textbox", { name: "Field name" }), {
      target: { value: "team" },
    });
    await act(async () =>
      screen.getByRole("button", { name: "Save owner key" }).focus(),
    );
    expect(screen.getByRole("textbox", { name: "Field name" })).toHaveValue(
      "team",
    );
    await act(async () =>
      screen.getByRole("button", { name: "Outside" }).focus(),
    );
    await waitFor(() =>
      expect(
        screen.getByRole("button", { name: "Edit owner key" }),
      ).toBeInTheDocument(),
    );
    expect(screen.getByRole("button", { name: "Outside" })).toHaveFocus();
  });

  it("keeps a portaled picker inside the editor focus boundary", async () => {
    render(
      <>
        <JsonSchemaForm
          schema={{ properties: { name: { type: "string", title: "Name" } } }}
          value={{ name: "Original" }}
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
                        {nodes.value}
                        {createPortal(
                          <button type="button">Picker option</button>,
                          document.body,
                        )}
                      </>
                    ),
                  },
          ]}
        />
        <button type="button">Outside</button>
      </>,
    );
    fireEvent.click(screen.getByRole("button", { name: "Edit Name" }));
    await act(async () =>
      screen.getByRole("button", { name: "Picker option" }).focus(),
    );
    expect(screen.getByRole("textbox", { name: "Name" })).toBeInTheDocument();
    await act(async () =>
      screen.getByRole("button", { name: "Outside" }).focus(),
    );
    await waitFor(() =>
      expect(
        screen.getByRole("button", { name: "Edit Name" }),
      ).toBeInTheDocument(),
    );
    expect(
      screen.queryByRole("button", { name: "Picker option" }),
    ).not.toBeInTheDocument();
  });

  it("allows focusing and clicking save without losing the draft", async () => {
    const onChange = vi.fn();
    render(
      <JsonSchemaForm
        schema={{ properties: { name: { type: "string", title: "Name" } } }}
        value={{ name: "Original" }}
        onChange={onChange}
        layout={{ mode: "properties" }}
        showPreferencesMenu={false}
      />,
    );
    fireEvent.click(screen.getByRole("button", { name: "Edit Name" }));
    fireEvent.change(screen.getByRole("textbox", { name: "Name" }), {
      target: { value: "Saved" },
    });
    await act(async () =>
      screen.getByRole("button", { name: "Save Name" }).focus(),
    );
    fireEvent.click(screen.getByRole("button", { name: "Save Name" }));
    expect(onChange).toHaveBeenCalledExactlyOnceWith({ name: "Saved" });
  });
});
