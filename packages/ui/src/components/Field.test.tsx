import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { Field } from "./Field";

describe("Field", () => {
  it("renders the label and the control", () => {
    render(
      <Field label="Name">
        <input aria-label="name-input" />
      </Field>,
    );
    expect(screen.getByText("Name")).toBeInTheDocument();
    expect(screen.getByLabelText("name-input")).toBeInTheDocument();
  });

  it("appends a required marker only when required", () => {
    const { rerender } = render(
      <Field label="Name">
        <input />
      </Field>,
    );
    expect(screen.queryByText("*")).toBeNull();
    rerender(
      <Field label="Name" required>
        <input />
      </Field>,
    );
    expect(screen.getByText("*")).toBeInTheDocument();
  });

  it("shows the error under the control, taking precedence over the helper", () => {
    render(
      <Field label="Name" helper="Pick anything" error="Enter a name">
        <input />
      </Field>,
    );
    const error = screen.getByText("Enter a name");
    expect(error).toBeInTheDocument();
    expect(error.className).toContain("text-destructive");
    // Helper is suppressed while an error is shown.
    expect(screen.queryByText("Pick anything")).toBeNull();
  });

  it("shows the helper when there is no error", () => {
    render(
      <Field label="Name" helper="Pick anything">
        <input />
      </Field>,
    );
    expect(screen.getByText("Pick anything")).toBeInTheDocument();
  });

  it("fires onBlur when focus leaves the field (focusout bubbles)", () => {
    const onBlur = vi.fn();
    render(
      <Field label="Name" onBlur={onBlur}>
        <input aria-label="name-input" />
      </Field>,
    );
    fireEvent.blur(screen.getByLabelText("name-input"));
    expect(onBlur).toHaveBeenCalledTimes(1);
  });
});
