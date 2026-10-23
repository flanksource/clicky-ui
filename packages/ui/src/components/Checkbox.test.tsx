import { useState } from "react";
import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { Checkbox } from "./Checkbox";

function Controlled() {
  const [on, setOn] = useState(false);
  return <Checkbox checked={on} onChange={setOn} aria-label="Pick" />;
}

describe("Checkbox", () => {
  it("is a native checkbox named by aria-label and reflecting checked", () => {
    render(<Checkbox checked onChange={() => {}} aria-label="Pick commit" />);
    expect(screen.getByRole("checkbox", { name: "Pick commit" })).toBeChecked();
  });

  it("emits the next checked state on click", () => {
    const onChange = vi.fn();
    render(<Checkbox checked={false} onChange={onChange} aria-label="Pick" />);
    fireEvent.click(screen.getByRole("checkbox"));
    expect(onChange).toHaveBeenCalledExactlyOnceWith(true);
  });

  it("toggles back and forth when controlled", () => {
    render(<Controlled />);
    const box = screen.getByRole("checkbox");
    fireEvent.click(box);
    expect(box).toBeChecked();
    fireEvent.click(box);
    expect(box).not.toBeChecked();
  });

  // jsdom still toggles a disabled checkbox on a synthetic click, so assert the
  // native attribute browsers honour rather than the (jsdom-only) change event.
  it("disables the native input", () => {
    render(<Checkbox checked={false} onChange={() => {}} disabled aria-label="Pick" />);
    expect(screen.getByRole("checkbox", { name: "Pick" })).toBeDisabled();
  });

  it("associates a visible label with the checkbox", () => {
    render(<Checkbox checked={false} onChange={() => {}} label="Include drafts" />);
    expect(screen.getByRole("checkbox", { name: "Include drafts" })).toBeInTheDocument();
  });

  it("forwards onClick so a host can read modifier keys before the change", () => {
    const onClick = vi.fn();
    render(<Checkbox checked={false} onChange={() => {}} onClick={onClick} aria-label="Pick" />);
    fireEvent.click(screen.getByRole("checkbox"), { shiftKey: true });
    expect(onClick).toHaveBeenCalledExactlyOnceWith(expect.objectContaining({ shiftKey: true }));
  });
});
