import { fireEvent, render, screen, within } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { PatchActions, type PatchActionsProps } from "./PatchActions";

function renderActions(overrides: Partial<PatchActionsProps> = {}) {
  const handlers = { onEdit: vi.fn(), onCancel: vi.fn(), onCompile: vi.fn(), onApply: vi.fn(), onRestore: vi.fn(), onLeaseSecondsChange: vi.fn() };
  render(
    <PatchActions
      editing={false}
      dirty={false}
      compiledCurrent={false}
      patched={false}
      busy={null}
      leaseSeconds={900}
      canEdit
      mutationAllowed
      {...handlers}
      {...overrides}
    />,
  );
  return handlers;
}

describe("PatchActions while reading", () => {
  it("offers Edit, and no restore for a class that is not patched", () => {
    const { onEdit } = renderActions();
    expect(screen.queryByRole("button", { name: "Restore original" })).toBeNull();
    fireEvent.click(screen.getByRole("button", { name: "Edit" }));
    expect(onEdit).toHaveBeenCalledOnce();
  });

  it("explains why Edit is disabled", () => {
    renderActions({ canEdit: false, editDisabledReason: "This is a group of loaders; pick the loader that defines the class." });
    const edit = screen.getByRole("button", { name: "Edit" });
    expect(edit).toBeDisabled();
    expect(edit).toHaveAttribute("title", "This is a group of loaders; pick the loader that defines the class.");
  });

  it("restores a patched class when writes are allowed", () => {
    const { onRestore } = renderActions({ patched: true });
    fireEvent.click(screen.getByRole("button", { name: "Restore original" }));
    expect(onRestore).toHaveBeenCalledOnce();
  });

  it("keeps restore disabled until the operator allows replacing bytecode", () => {
    renderActions({ patched: true, mutationAllowed: false });
    const restore = screen.getByRole("button", { name: "Restore original" });
    expect(restore).toBeDisabled();
    expect(restore).toHaveAttribute("title", "Allow replacing class bytecode first.");
  });

  it("disables restore and edit while an action runs", () => {
    renderActions({ patched: true, busy: "restore" });
    expect(screen.getByRole("button", { name: "Restore original" })).toBeDisabled();
    expect(screen.getByRole("button", { name: "Edit" })).toBeDisabled();
  });
});

describe("PatchActions while editing", () => {
  const editing = { editing: true, dirty: true };

  it("shows compile, lease and apply instead of edit", () => {
    renderActions(editing);
    expect(screen.queryByRole("button", { name: "Edit" })).toBeNull();
    expect(screen.getByRole("button", { name: "Cancel" })).toBeEnabled();
    expect(screen.getByRole("button", { name: "Compile preview" })).toBeEnabled();
    expect(screen.getByRole("button", { name: "Apply patch" })).toBeDisabled();
  });

  it("keeps compile disabled until the draft differs from the decompiled source", () => {
    renderActions({ editing: true, dirty: false });
    expect(screen.getByRole("button", { name: "Compile preview" })).toBeDisabled();
  });

  it("requires a successful compile of the current draft before apply", () => {
    renderActions(editing);
    expect(screen.getByRole("button", { name: "Apply patch" })).toHaveAttribute("title", "Compile the current source first.");
  });

  it("enables apply once the current draft compiled and writes are allowed", () => {
    const { onApply } = renderActions({ ...editing, compiledCurrent: true });
    const apply = screen.getByRole("button", { name: "Apply patch" });
    expect(apply).toBeEnabled();
    fireEvent.click(apply);
    expect(onApply).toHaveBeenCalledOnce();
  });

  it("keeps apply disabled until the operator allows replacing bytecode, even after a clean compile", () => {
    renderActions({ ...editing, compiledCurrent: true, mutationAllowed: false });
    const apply = screen.getByRole("button", { name: "Apply patch" });
    expect(apply).toBeDisabled();
    expect(apply).toHaveAttribute("title", "Allow replacing class bytecode first.");
  });

  it.each(["compile", "patch", "restore"] as const)("disables every control while %s runs", (busy) => {
    renderActions({ ...editing, compiledCurrent: true, busy });
    for (const name of ["Cancel", "Compile preview", "Apply patch"]) expect(screen.getByRole("button", { name })).toBeDisabled();
    expect(screen.getByRole("combobox", { name: "Restore original bytecode after" })).toBeDisabled();
  });

  it("offers 2, 5 and 15 minute leases and reports the choice in seconds", () => {
    const { onLeaseSecondsChange } = renderActions(editing);
    const lease = screen.getByRole("combobox", { name: "Restore original bytecode after" });
    expect(lease).toHaveValue("900");
    expect(within(lease).getAllByRole("option").map((option) => option.textContent)).toEqual(["2 minutes", "5 minutes", "15 minutes"]);
    fireEvent.change(lease, { target: { value: "120" } });
    expect(onLeaseSecondsChange).toHaveBeenCalledWith(120);
  });

  it("routes compile and cancel", () => {
    const { onCompile, onCancel } = renderActions(editing);
    fireEvent.click(screen.getByRole("button", { name: "Compile preview" }));
    fireEvent.click(screen.getByRole("button", { name: "Cancel" }));
    expect([onCompile.mock.calls.length, onCancel.mock.calls.length]).toEqual([1, 1]);
  });
});
