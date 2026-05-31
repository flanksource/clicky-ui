import { describe, expect, it } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { useState } from "react";
import { Modal } from "./Modal";

function getDialog() {
  return screen.getByRole("dialog");
}

describe("Modal", () => {
  it("renders the expand toggle by default and starts at the configured size", () => {
    render(
      <Modal open onClose={() => {}} size="lg" title="Detail">
        <p>body</p>
      </Modal>,
    );
    expect(
      screen.getByRole("button", { name: "Expand to fullscreen" }),
    ).toBeInTheDocument();
    expect(getDialog().className).toMatch(/max-w-2xl/);
  });

  it("toggles between the configured size and fullscreen when clicked", () => {
    render(
      <Modal open onClose={() => {}} size="lg" title="Detail">
        <p>body</p>
      </Modal>,
    );
    fireEvent.click(
      screen.getByRole("button", { name: "Expand to fullscreen" }),
    );
    expect(getDialog().className).toMatch(/max-w-\[95vw\]/);
    expect(getDialog().className).not.toMatch(/max-w-2xl/);

    fireEvent.click(screen.getByRole("button", { name: "Restore size" }));
    expect(getDialog().className).toMatch(/max-w-2xl/);
    expect(getDialog().className).not.toMatch(/max-w-\[95vw\]/);
  });

  it("hides the toggle when expandable is false", () => {
    render(
      <Modal open onClose={() => {}} size="lg" title="Detail" expandable={false}>
        <p>body</p>
      </Modal>,
    );
    expect(
      screen.queryByRole("button", { name: "Expand to fullscreen" }),
    ).not.toBeInTheDocument();
  });

  it("resets to the configured size after the modal is closed and reopened", () => {
    function Harness() {
      const [open, setOpen] = useState(true);
      return (
        <>
          <button onClick={() => setOpen(true)}>reopen</button>
          <Modal open={open} onClose={() => setOpen(false)} size="lg" title="Detail">
            <p>body</p>
          </Modal>
        </>
      );
    }
    render(<Harness />);

    fireEvent.click(
      screen.getByRole("button", { name: "Expand to fullscreen" }),
    );
    expect(getDialog().className).toMatch(/max-w-\[95vw\]/);

    fireEvent.click(screen.getByRole("button", { name: "Close" }));
    fireEvent.click(screen.getByRole("button", { name: "reopen" }));

    expect(getDialog().className).toMatch(/max-w-2xl/);
    expect(
      screen.getByRole("button", { name: "Expand to fullscreen" }),
    ).toBeInTheDocument();
  });
});
