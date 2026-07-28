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
});
