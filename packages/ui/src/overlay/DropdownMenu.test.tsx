import { fireEvent, render, screen, within } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { useState } from "react";
import { DropdownMenu } from "./DropdownMenu";
import { Modal } from "./Modal";
import { zIndex } from "./zIndex";

const items = (onSelect = vi.fn()) => [
  { label: "JSON", onSelect },
  { label: "Markdown", onSelect: vi.fn() },
];

describe("DropdownMenu", () => {
  it("is closed until the trigger is clicked", () => {
    render(<DropdownMenu label="Download" items={items()} />);
    expect(screen.queryByRole("menu")).not.toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: /download/i }));
    expect(screen.getByRole("menu")).toBeInTheDocument();
  });

  it("invokes onSelect and closes when an item is chosen", () => {
    const onSelect = vi.fn();
    render(<DropdownMenu label="Download" items={items(onSelect)} />);
    fireEvent.click(screen.getByRole("button", { name: /download/i }));
    fireEvent.click(screen.getByRole("menuitem", { name: "JSON" }));
    expect(onSelect).toHaveBeenCalledTimes(1);
    expect(screen.queryByRole("menu")).not.toBeInTheDocument();
  });

  it("closes on Escape", () => {
    render(<DropdownMenu label="Download" items={items()} />);
    fireEvent.click(screen.getByRole("button", { name: /download/i }));
    expect(screen.getByRole("menu")).toBeInTheDocument();
    fireEvent.keyDown(document, { key: "Escape" });
    expect(screen.queryByRole("menu")).not.toBeInTheDocument();
  });

  it("closes on outside pointer press", () => {
    render(
      <div>
        <DropdownMenu label="Download" items={items()} />
        <button type="button">outside</button>
      </div>,
    );
    fireEvent.click(screen.getByRole("button", { name: /download/i }));
    expect(screen.getByRole("menu")).toBeInTheDocument();
    fireEvent.pointerDown(screen.getByText("outside"));
    expect(screen.queryByRole("menu")).not.toBeInTheDocument();
  });

  it("stays open when a press lands inside a Modal it renders as a child", () => {
    // The Modal portals to document.body, so a press inside it is "outside" the
    // menu in the DOM. Because it is rendered through the menu's children render
    // prop, React's synthetic events still propagate to the floating element, so
    // useDismiss treats it as inside and keeps the menu open — otherwise the menu
    // (and the Modal it owns) would unmount on the first click in the Modal.
    render(
      <DropdownMenu label="Download">
        {() => (
          <Modal open onClose={() => {}} title="Log">
            <button type="button">in modal</button>
          </Modal>
        )}
      </DropdownMenu>,
    );
    fireEvent.click(screen.getByRole("button", { name: /download/i }));
    expect(screen.getByRole("menu")).toBeInTheDocument();
    fireEvent.pointerDown(screen.getByText("in modal"));
    expect(screen.getByRole("menu")).toBeInTheDocument();
  });

  it("dismisses on a press inside an unrelated dialog it does not own", () => {
    // A dialog that is a sibling (owned by some other component), not a child of
    // the menu, is genuinely outside — pressing into it dismisses the menu. This
    // is harmless: closing the menu does not unmount a Modal it does not render.
    render(
      <div>
        <DropdownMenu label="Download" items={items()} />
        <div role="dialog" aria-modal="true">
          <button type="button">in dialog</button>
        </div>
      </div>,
    );
    fireEvent.click(screen.getByRole("button", { name: /download/i }));
    expect(screen.getByRole("menu")).toBeInTheDocument();
    fireEvent.pointerDown(screen.getByText("in dialog"));
    expect(screen.queryByRole("menu")).not.toBeInTheDocument();
  });

  it("does not fire onSelect for a disabled item", () => {
    const onSelect = vi.fn();
    render(
      <DropdownMenu label="Actions" items={[{ label: "Delete", onSelect, disabled: true }]} />,
    );
    fireEvent.click(screen.getByRole("button", { name: /actions/i }));
    fireEvent.click(screen.getByRole("menuitem", { name: "Delete" }));
    expect(onSelect).not.toHaveBeenCalled();
  });

  it("renders custom children with a working close callback", () => {
    render(
      <DropdownMenu label="Filters">
        {(close) => (
          <button type="button" onClick={close}>
            apply
          </button>
        )}
      </DropdownMenu>,
    );
    fireEvent.click(screen.getByRole("button", { name: /filters/i }));
    expect(screen.getByText("apply")).toBeInTheDocument();
    fireEvent.click(screen.getByText("apply"));
    expect(screen.queryByRole("menu")).not.toBeInTheDocument();
  });

  // Portal + edge positioning. The flip/shift geometry needs a real browser, so
  // those assertions live in DropdownMenu.stories.tsx (Storybook test runner).
  // Here we only verify the menu escapes its container via the body portal.
  it("renders the open menu in a body portal so a clipping ancestor cannot hide it", () => {
    render(
      <div data-testid="container" style={{ overflow: "hidden" }}>
        <DropdownMenu label="Download" items={items()} />
      </div>,
    );
    fireEvent.click(screen.getByRole("button", { name: /download/i }));
    const menu = screen.getByRole("menu");
    expect(screen.getByTestId("container").contains(menu)).toBe(false);
    expect(document.body.contains(menu)).toBe(true);
  });

  it("opens via a custom trigger and selects an item", () => {
    const onSelect = vi.fn();
    render(
      <DropdownMenu
        trigger={<button type="button">menu</button>}
        items={[{ label: "Profile", onSelect }]}
      />,
    );
    fireEvent.click(screen.getByRole("button", { name: "menu" }));
    fireEvent.click(screen.getByRole("menuitem", { name: "Profile" }));
    expect(onSelect).toHaveBeenCalledTimes(1);
  });

  it("floats at the popover layer when no modal is open", () => {
    render(<DropdownMenu label="Download" items={items()} />);
    fireEvent.click(screen.getByRole("button", { name: /download/i }));
    expect(Number(screen.getByRole("menu").style.zIndex)).toBe(zIndex.popover);
  });

  it("renders header and footer nodes inside the menu, around the items", () => {
    const onMore = vi.fn();
    render(
      <DropdownMenu
        label="Download"
        items={items()}
        header={<span>Choose a format</span>}
        footer={
          <button type="button" onClick={onMore}>
            Show more
          </button>
        }
      />,
    );
    fireEvent.click(screen.getByRole("button", { name: /download/i }));
    const menu = screen.getByRole("menu");
    expect(within(menu).getByText("Choose a format")).toBeInTheDocument();
    expect(within(menu).getByRole("menuitem", { name: "JSON" })).toBeInTheDocument();
    fireEvent.click(within(menu).getByRole("button", { name: "Show more" }));
    expect(onMore).toHaveBeenCalledTimes(1);
  });

  it("renders above an open modal it lives inside, not behind it", () => {
    render(
      <Modal open onClose={() => {}} title="Edit">
        <DropdownMenu label="Download" items={items()} />
      </Modal>,
    );
    fireEvent.click(screen.getByRole("button", { name: /download/i }));
    const menuZ = Number(screen.getByRole("menu").style.zIndex);
    const modalZ = Number(screen.getByRole("dialog").style.zIndex);
    expect(menuZ).toBeGreaterThan(modalZ);
  });

  it("Escape closes a menu inside a modal before closing the modal", () => {
    function Harness() {
      const [open, setOpen] = useState(true);
      return (
        <Modal open={open} onClose={() => setOpen(false)} title="Edit">
          <DropdownMenu label="Download" items={items()} />
        </Modal>
      );
    }

    render(<Harness />);
    fireEvent.click(screen.getByRole("button", { name: /download/i }));

    fireEvent.keyDown(document, { key: "Escape" });
    expect(screen.queryByRole("menu")).not.toBeInTheDocument();
    expect(screen.getByRole("dialog", { name: "Edit" })).toBeInTheDocument();

    fireEvent.keyDown(document, { key: "Escape" });
    expect(screen.queryByRole("dialog", { name: "Edit" })).not.toBeInTheDocument();
  });

  it("Escape closes a child modal before the menu that rendered it", () => {
    function Harness() {
      const [modalOpen, setModalOpen] = useState(true);
      return (
        <DropdownMenu label="Download">
          {() => (
            <Modal open={modalOpen} onClose={() => setModalOpen(false)} title="Log">
              <button type="button">in modal</button>
            </Modal>
          )}
        </DropdownMenu>
      );
    }

    render(<Harness />);
    fireEvent.click(screen.getByRole("button", { name: /download/i }));
    expect(screen.getByRole("menu")).toBeInTheDocument();
    expect(screen.getByRole("dialog", { name: "Log" })).toBeInTheDocument();

    fireEvent.keyDown(document, { key: "Escape" });
    expect(screen.queryByRole("dialog", { name: "Log" })).not.toBeInTheDocument();
    expect(screen.getByRole("menu")).toBeInTheDocument();

    fireEvent.keyDown(document, { key: "Escape" });
    expect(screen.queryByRole("menu")).not.toBeInTheDocument();
  });
});
