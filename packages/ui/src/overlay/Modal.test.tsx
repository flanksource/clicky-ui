import { describe, expect, it, vi } from "vitest";
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
    expect(screen.getByRole("button", { name: "Expand to fullscreen" })).toBeInTheDocument();
    expect(getDialog().className).toMatch(/max-w-2xl/);
  });

  it("toggles between the configured size and fullscreen when clicked", () => {
    render(
      <Modal open onClose={() => {}} size="lg" title="Detail">
        <p>body</p>
      </Modal>,
    );
    fireEvent.click(screen.getByRole("button", { name: "Expand to fullscreen" }));
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
    expect(screen.queryByRole("button", { name: "Expand to fullscreen" })).not.toBeInTheDocument();
  });

  describe("confirmClose", () => {
    function ConfirmHarness({ confirmClose }: { confirmClose: boolean }) {
      const [open, setOpen] = useState(true);
      return (
        <Modal open={open} onClose={() => setOpen(false)} confirmClose={confirmClose} title="Edit">
          <p>body</p>
        </Modal>
      );
    }

    it("closes immediately when the guard is off", () => {
      const onClose = vi.fn();
      render(
        <Modal open onClose={onClose} confirmClose={false} title="Edit">
          <p>body</p>
        </Modal>,
      );
      fireEvent.click(screen.getByRole("button", { name: "Close" }));
      expect(onClose).toHaveBeenCalledTimes(1);
      expect(screen.queryByRole("alertdialog")).not.toBeInTheDocument();
    });

    it("prompts instead of closing, and only closes once discard is confirmed", () => {
      render(<ConfirmHarness confirmClose />);
      fireEvent.click(screen.getByRole("button", { name: "Close" }));

      // The modal is still mounted; a confirmation prompt is shown instead.
      expect(screen.getByRole("alertdialog")).toBeInTheDocument();
      expect(screen.getByRole("dialog")).toBeInTheDocument();

      fireEvent.click(screen.getByRole("button", { name: "Discard" }));
      expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    });

    it("keeps the modal open when the prompt is cancelled", () => {
      render(<ConfirmHarness confirmClose />);
      fireEvent.click(screen.getByRole("button", { name: "Close" }));
      fireEvent.click(screen.getByRole("button", { name: "Keep editing" }));

      expect(screen.queryByRole("alertdialog")).not.toBeInTheDocument();
      expect(screen.getByRole("dialog")).toBeInTheDocument();
    });

    it("routes Escape and backdrop clicks through the guard", () => {
      const onClose = vi.fn();
      render(
        <Modal open onClose={onClose} confirmClose title="Edit">
          <p>body</p>
        </Modal>,
      );

      fireEvent.keyDown(document, { key: "Escape" });
      expect(onClose).not.toHaveBeenCalled();
      expect(screen.getByRole("alertdialog")).toBeInTheDocument();

      // A second Escape dismisses the prompt rather than the modal.
      fireEvent.keyDown(document, { key: "Escape" });
      expect(screen.queryByRole("alertdialog")).not.toBeInTheDocument();
      expect(onClose).not.toHaveBeenCalled();
    });

    it("renders custom confirmation copy", () => {
      render(
        <Modal
          open
          onClose={() => {}}
          confirmClose={{ title: "Leave wizard?", confirmLabel: "Leave" }}
          title="Edit"
        >
          <p>body</p>
        </Modal>,
      );
      fireEvent.click(screen.getByRole("button", { name: "Close" }));
      expect(screen.getByText("Leave wizard?")).toBeInTheDocument();
      expect(screen.getByRole("button", { name: "Leave" })).toBeInTheDocument();
    });
  });

  it("does not close on backdrop click by default", () => {
    const onClose = vi.fn();
    render(
      <Modal open onClose={onClose} title="Detail">
        <p>body</p>
      </Modal>,
    );
    // The backdrop is the presentation wrapper around the dialog.
    fireEvent.click(getDialog().parentElement as HTMLElement);
    expect(onClose).not.toHaveBeenCalled();
  });

  it("still closes on backdrop click when opted in", () => {
    const onClose = vi.fn();
    render(
      <Modal open onClose={onClose} closeOnBackdrop title="Detail">
        <p>body</p>
      </Modal>,
    );
    fireEvent.click(getDialog().parentElement as HTMLElement);
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  describe("nesting", () => {
    function NestedHarness() {
      const [outer, setOuter] = useState(true);
      const [inner, setInner] = useState(true);
      return (
        <>
          <Modal open={outer} onClose={() => setOuter(false)} title="Outer">
            <p>outer body</p>
          </Modal>
          <Modal open={inner} onClose={() => setInner(false)} title="Inner">
            <p>inner body</p>
          </Modal>
        </>
      );
    }

    it("keeps the underlying modal mounted when a second opens on top", () => {
      render(<NestedHarness />);
      expect(screen.getByText("outer body")).toBeInTheDocument();
      expect(screen.getByText("inner body")).toBeInTheDocument();
    });

    it("Escape closes only the topmost modal, one layer at a time", () => {
      render(<NestedHarness />);

      fireEvent.keyDown(document, { key: "Escape" });
      // Inner closed, outer still open.
      expect(screen.queryByText("inner body")).not.toBeInTheDocument();
      expect(screen.getByText("outer body")).toBeInTheDocument();

      fireEvent.keyDown(document, { key: "Escape" });
      expect(screen.queryByText("outer body")).not.toBeInTheDocument();
    });

    it("renders the topmost modal above the one beneath it", () => {
      render(<NestedHarness />);
      const zIndex = (text: string) => {
        const backdrop = screen.getByText(text).closest("[role='presentation']") as HTMLElement;
        return Number(backdrop.style.zIndex);
      };
      expect(zIndex("inner body")).toBeGreaterThan(zIndex("outer body"));
    });
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

    fireEvent.click(screen.getByRole("button", { name: "Expand to fullscreen" }));
    expect(getDialog().className).toMatch(/max-w-\[95vw\]/);

    fireEvent.click(screen.getByRole("button", { name: "Close" }));
    fireEvent.click(screen.getByRole("button", { name: "reopen" }));

    expect(getDialog().className).toMatch(/max-w-2xl/);
    expect(screen.getByRole("button", { name: "Expand to fullscreen" })).toBeInTheDocument();
  });
});
