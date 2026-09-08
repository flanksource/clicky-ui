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

function twoFields(props: Partial<Parameters<typeof JsonSchemaForm>[0]> = {}) {
  return (
    <JsonSchemaForm
      schema={{
        properties: {
          first: { type: "string", title: "First" },
          second: { type: "string", title: "Second" },
        },
      }}
      value={{ first: "Original", second: "Next" }}
      onChange={vi.fn()}
      layout={{ mode: "properties" }}
      showPreferencesMenu={false}
      {...props}
    />
  );
}

/** Opens First, types `draft`, then moves focus to the Second row. */
async function editFirstThenLeave(draft: string) {
  fireEvent.click(screen.getByRole("button", { name: "Edit First" }));
  fireEvent.change(screen.getByRole("textbox", { name: "First" }), {
    target: { value: draft },
  });
  await act(async () =>
    screen.getByRole("button", { name: "Edit Second" }).focus(),
  );
}

describe("property editor focus boundaries", () => {
  it("closes an untouched editor when focus leaves, showing the saved value", async () => {
    const onChange = vi.fn();
    render(twoFields({ onChange }));
    fireEvent.click(screen.getByRole("button", { name: "Edit First" }));
    await act(async () =>
      screen.getByRole("button", { name: "Edit Second" }).focus(),
    );
    await waitFor(() =>
      expect(
        screen.getByRole("button", { name: "Edit First" }),
      ).toHaveTextContent("Original"),
    );
    expect(screen.getByRole("textbox", { name: "Second" })).toHaveFocus();
    expect(
      screen.queryByRole("button", { name: "Save First" }),
    ).not.toBeInTheDocument();
    expect(onChange).not.toHaveBeenCalled();
  });

  // Leaving a field is not a decision to throw the answer away. The row parks
  // the edit — presentation of the draft, still flagged by the tick and cross —
  // instead of silently reverting it.
  it("parks a dirty draft on the row when focus leaves, still unsaved", async () => {
    const onChange = vi.fn();
    render(twoFields({ onChange }));
    await editFirstThenLeave("Draft");
    await waitFor(() =>
      expect(
        screen.getByRole("button", { name: "Edit First" }),
      ).toHaveTextContent("Draft"),
    );
    expect(screen.getByRole("textbox", { name: "Second" })).toHaveFocus();
    expect(screen.getByRole("button", { name: "Save First" })).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "Cancel editing First" }),
    ).toBeInTheDocument();
    expect(onChange).not.toHaveBeenCalled();
  });

  it("commits a parked draft when its tick is clicked", async () => {
    const onChange = vi.fn();
    render(twoFields({ onChange }));
    await editFirstThenLeave("Draft");
    await waitFor(() =>
      expect(screen.getByRole("button", { name: "Save First" })).toBeInTheDocument(),
    );
    fireEvent.click(screen.getByRole("button", { name: "Save First" }));
    expect(onChange).toHaveBeenCalledExactlyOnceWith({
      first: "Draft",
      second: "Next",
    });
  });

  it("restores the saved value when a parked draft is cancelled", async () => {
    const onChange = vi.fn();
    render(twoFields({ onChange }));
    await editFirstThenLeave("Draft");
    await waitFor(() =>
      expect(
        screen.getByRole("button", { name: "Cancel editing First" }),
      ).toBeInTheDocument(),
    );
    fireEvent.click(screen.getByRole("button", { name: "Cancel editing First" }));
    expect(screen.getByRole("button", { name: "Edit First" })).toHaveTextContent(
      "Original",
    );
    expect(
      screen.queryByRole("button", { name: "Save First" }),
    ).not.toBeInTheDocument();
    expect(onChange).not.toHaveBeenCalled();
  });

  it("reopens a parked row on the draft rather than the saved value", async () => {
    render(twoFields());
    await editFirstThenLeave("Draft");
    await waitFor(() =>
      expect(
        screen.getByRole("button", { name: "Edit First" }),
      ).toHaveTextContent("Draft"),
    );
    fireEvent.click(screen.getByRole("button", { name: "Edit First" }));
    expect(screen.getByRole("textbox", { name: "First" })).toHaveValue("Draft");
  });

  // autoSave removes the per-field confirm step entirely: leaving the field is
  // the commit, so there is nothing left to park and no tick/cross to show.
  it("commits on blur and renders no confirm actions under autoSave", async () => {
    const onChange = vi.fn();
    render(twoFields({ onChange, autoSave: true }));
    await editFirstThenLeave("Draft");
    await waitFor(() =>
      expect(onChange).toHaveBeenCalledExactlyOnceWith({
        first: "Draft",
        second: "Next",
      }),
    );
    expect(
      screen.queryByRole("button", { name: "Save First" }),
    ).not.toBeInTheDocument();
    expect(
      screen.queryByRole("button", { name: "Cancel editing First" }),
    ).not.toBeInTheDocument();
    expect(screen.getByRole("textbox", { name: "Second" })).toHaveFocus();
  });

  it("still reverts on Escape under autoSave", async () => {
    const onChange = vi.fn();
    render(twoFields({ onChange, autoSave: true }));
    fireEvent.click(screen.getByRole("button", { name: "Edit First" }));
    fireEvent.change(screen.getByRole("textbox", { name: "First" }), {
      target: { value: "Draft" },
    });
    fireEvent.keyDown(screen.getByRole("textbox", { name: "First" }), {
      key: "Escape",
    });
    expect(screen.getByRole("button", { name: "Edit First" })).toHaveTextContent(
      "Original",
    );
    expect(onChange).not.toHaveBeenCalled();
  });

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
