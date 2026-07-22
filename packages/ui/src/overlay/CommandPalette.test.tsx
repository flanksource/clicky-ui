import { describe, expect, it, vi } from "vitest";
import { useState } from "react";
import { fireEvent, render, screen } from "@testing-library/react";
import { CommandPalette } from "./CommandPalette";
import { Modal } from "./Modal";
import type { CommandGroup } from "./CommandPalette.model";

function groups(overrides: Partial<CommandGroup>[] = []): CommandGroup[] {
  const base: CommandGroup[] = [
    {
      id: "navigate",
      heading: "Navigate",
      items: [
        { id: "widgets", label: "Widgets" },
        { id: "orders", label: "Orders", keywords: ["invoice"] },
      ],
    },
    {
      id: "actions",
      heading: "Actions",
      items: [
        { id: "new", label: "New widget" },
        { id: "archive", label: "Archive", disabled: true },
      ],
    },
  ];
  return overrides.length > 0 ? (overrides as CommandGroup[]) : base;
}

function renderPalette(props: Partial<React.ComponentProps<typeof CommandPalette>> = {}) {
  return render(<CommandPalette open groups={groups()} {...props} />);
}

function combobox() {
  return screen.getByRole("combobox");
}

function activeLabel(): string | null {
  const id = combobox().getAttribute("aria-activedescendant");
  return id ? (document.getElementById(id)?.textContent ?? null) : null;
}

describe("CommandPalette", () => {
  it("renders nothing while closed", () => {
    render(<CommandPalette open={false} groups={groups()} />);

    expect(screen.queryByRole("dialog")).toBeNull();
  });

  it("renders every group heading and command when open", () => {
    renderPalette();

    expect(screen.getByRole("dialog")).toBeInTheDocument();
    expect(screen.getByText("Navigate")).toBeInTheDocument();
    expect(screen.getAllByRole("option")).toHaveLength(4);
  });

  it("focuses the search input on open", () => {
    renderPalette();

    expect(combobox()).toHaveFocus();
  });

  it("opens on the hotkey when uncontrolled", () => {
    render(<CommandPalette groups={groups()} />);
    expect(screen.queryByRole("dialog")).toBeNull();

    fireEvent.keyDown(document, { key: "k", metaKey: true });

    expect(screen.getByRole("dialog")).toBeInTheDocument();
  });

  it("filters rows as the query narrows and drops emptied groups", () => {
    renderPalette();

    fireEvent.change(combobox(), { target: { value: "invoice" } });

    expect(screen.getAllByRole("option")).toHaveLength(1);
    expect(screen.getByRole("option")).toHaveTextContent("Orders");
    expect(screen.queryByText("Actions")).toBeNull();
  });

  it("starts with the first row active so Enter runs the top result", () => {
    const onSelect = vi.fn();
    renderPalette({ onSelect });

    expect(activeLabel()).toContain("Widgets");
    fireEvent.keyDown(combobox(), { key: "Enter" });

    expect(onSelect).toHaveBeenCalledOnce();
    expect(onSelect.mock.calls[0]?.[0]?.item?.id).toBe("widgets");
  });

  it("moves the active row with the arrow keys", () => {
    renderPalette();

    fireEvent.keyDown(combobox(), { key: "ArrowDown" });

    expect(activeLabel()).toContain("Orders");
  });

  it("skips disabled rows and wraps at the end", () => {
    renderPalette();

    // widgets -> orders -> new; "archive" is disabled so the next wraps to the top
    fireEvent.keyDown(combobox(), { key: "ArrowDown" });
    fireEvent.keyDown(combobox(), { key: "ArrowDown" });
    expect(activeLabel()).toContain("New widget");

    fireEvent.keyDown(combobox(), { key: "ArrowDown" });
    expect(activeLabel()).toContain("Widgets");
  });

  it("wraps backwards from the first row to the last enabled one", () => {
    renderPalette();

    fireEvent.keyDown(combobox(), { key: "ArrowUp" });

    expect(activeLabel()).toContain("New widget");
  });

  it("jumps to the first and last enabled rows with Home and End", () => {
    renderPalette();

    fireEvent.keyDown(combobox(), { key: "End" });
    expect(activeLabel()).toContain("New widget");

    fireEvent.keyDown(combobox(), { key: "Home" });
    expect(activeLabel()).toContain("Widgets");
  });

  it("prefers an item's own onSelect over the palette fallback", () => {
    const own = vi.fn();
    const fallback = vi.fn();
    render(
      <CommandPalette
        open
        onSelect={fallback}
        groups={[{ id: "g", items: [{ id: "a", label: "Alpha", onSelect: own }] }]}
      />,
    );

    fireEvent.keyDown(combobox(), { key: "Enter" });

    expect(own).toHaveBeenCalledOnce();
    expect(fallback).not.toHaveBeenCalled();
  });

  it("does not activate a disabled row on click", () => {
    const onSelect = vi.fn();
    renderPalette({ onSelect });

    fireEvent.click(screen.getByText("Archive"));

    expect(onSelect).not.toHaveBeenCalled();
  });

  it("closes after a selection by default", () => {
    const onOpenChange = vi.fn();
    renderPalette({ onOpenChange });

    fireEvent.keyDown(combobox(), { key: "Enter" });

    expect(onOpenChange).toHaveBeenCalledWith(false);
  });

  it("stays open when closeOnSelect is false", () => {
    const onOpenChange = vi.fn();
    renderPalette({ onOpenChange, closeOnSelect: false });

    fireEvent.keyDown(combobox(), { key: "Enter" });

    expect(onOpenChange).not.toHaveBeenCalled();
  });

  it("closes on Escape", () => {
    const onOpenChange = vi.fn();
    renderPalette({ onOpenChange });

    fireEvent.keyDown(document, { key: "Escape" });

    expect(onOpenChange).toHaveBeenCalledWith(false);
  });

  it("closes on a backdrop click but not on a panel click", () => {
    const onOpenChange = vi.fn();
    renderPalette({ onOpenChange });

    const panel = screen.getByRole("dialog");
    fireEvent.click(panel);
    expect(onOpenChange).not.toHaveBeenCalled();

    // The backdrop is the panel's parent; group headings also carry
    // role="presentation", so query by relationship rather than by role.
    const backdrop = panel.parentElement;
    expect(backdrop).not.toBeNull();
    fireEvent.click(backdrop as HTMLElement);
    expect(onOpenChange).toHaveBeenCalledWith(false);
  });

  it("shows the empty state when nothing matches", () => {
    renderPalette();

    fireEvent.change(combobox(), { target: { value: "zzzz" } });

    expect(screen.queryAllByRole("option")).toHaveLength(0);
    expect(screen.getByText("No results")).toBeInTheDocument();
  });

  it("leaves groups untouched when filtering is delegated to the caller", () => {
    renderPalette({ filter: false });

    fireEvent.change(combobox(), { target: { value: "no-such-command" } });

    expect(screen.getAllByRole("option")).toHaveLength(4);
  });

  it("takes one Escape to close a palette opened over a modal, leaving the modal up", () => {
    const onModalClose = vi.fn();
    function Stacked() {
      const [paletteOpen, setPaletteOpen] = useState(false);
      return (
        <Modal open onClose={onModalClose} title="Underlying modal">
          <button type="button" onClick={() => setPaletteOpen(true)}>
            Open palette
          </button>
          <CommandPalette open={paletteOpen} onOpenChange={setPaletteOpen} groups={groups()} />
        </Modal>
      );
    }
    render(<Stacked />);

    // Open the palette after the modal, which is the real sequence — the escape
    // layer is LIFO by registration, so the most recently opened surface wins.
    fireEvent.click(screen.getByText("Open palette"));
    expect(screen.getByRole("dialog", { name: "Command palette" })).toBeInTheDocument();

    fireEvent.keyDown(document, { key: "Escape" });

    expect(screen.queryByRole("dialog", { name: "Command palette" })).toBeNull();
    expect(screen.getByText("Underlying modal")).toBeInTheDocument();
    expect(onModalClose).not.toHaveBeenCalled();
  });
});
