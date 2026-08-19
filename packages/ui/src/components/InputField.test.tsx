import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { InputField } from "./InputField";

describe("InputField", () => {
  it("renders prefix and suffix adornments", () => {
    render(
      <InputField
        value=""
        onChange={() => {}}
        prefix={<span>pre</span>}
        suffix={<span>suf</span>}
      />,
    );

    expect(screen.getByText("pre")).toBeInTheDocument();
    expect(screen.getByText("suf")).toBeInTheDocument();
  });

  it("emits typed input via onChange", () => {
    const onChange = vi.fn();
    render(<InputField value="" onChange={onChange} />);

    fireEvent.change(screen.getByRole("textbox"), {
      target: { value: "query" },
    });

    expect(onChange).toHaveBeenCalledExactlyOnceWith(
      "query",
      expect.any(Object),
    );
  });

  it("renders and handles a keyboard shortcut", () => {
    const onShortcut = vi.fn();
    render(
      <InputField
        value=""
        onChange={() => {}}
        shortcut="⌘J"
        onShortcut={onShortcut}
      />,
    );

    fireEvent.keyDown(document, { key: "j", metaKey: true });

    expect(onShortcut).toHaveBeenCalledOnce();
    expect(screen.getByRole("textbox")).toHaveFocus();
    expect(screen.getByText("⌘J")).toBeInTheDocument();
  });

  it("hides the shortcut badge when shortcut is null", () => {
    render(<InputField value="" onChange={() => {}} shortcut={null} />);
    expect(screen.queryByText("⌘J")).not.toBeInTheDocument();
  });

  /* The border lives on the outer wrapper rather than the input, so an invalid
   * field that only set aria-invalid would announce correctly and look
   * identical to a valid one. */
  it("marks an invalid field for both assistive tech and the eye", () => {
    const { container } = render(
      <InputField value="" onChange={() => {}} invalid />,
    );

    expect(screen.getByRole("textbox")).toHaveAttribute("aria-invalid", "true");
    expect(container.firstElementChild?.className).toContain("border-destructive");
  });

  it("leaves a valid field unmarked", () => {
    const { container } = render(<InputField value="" onChange={() => {}} />);

    expect(screen.getByRole("textbox")).not.toHaveAttribute("aria-invalid");
    expect(container.firstElementChild?.className).not.toContain("border-destructive");
  });

  it("carries invalid through to a textarea", () => {
    render(<InputField as="textarea" value="" onChange={() => {}} invalid />);
    expect(screen.getByRole("textbox")).toHaveAttribute("aria-invalid", "true");
  });

  /* `disabled` lands on the inner element, which the bordered wrapper can only
   * see through :has() — without it a disabled field looks editable. */
  it("dims the control when the input is disabled", () => {
    const { container } = render(
      <InputField value="" onChange={() => {}} disabled />,
    );

    expect(screen.getByRole("textbox")).toBeDisabled();
    expect(container.firstElementChild?.className).toContain("has-[:disabled]:opacity-50");
  });
});
