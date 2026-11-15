import { fireEvent, render, screen, within } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import type { JvmPatch } from "../protocol/types";
import { PatchRegisterTable, type PatchRegisterTableProps } from "./PatchRegisterTable";

const NOW = 1_700_000_000_000;
const leased: JvmPatch = { class: "com.example.Leased", loader: "app", patched: true, leaseExpiresAt: NOW + 125_000 };
const unleased: JvmPatch = { class: "com.example.Unleased", loader: "app", patched: true };
const expired: JvmPatch = { class: "com.example.Expired", loader: "app", patched: true, leaseExpiresAt: NOW - 1 };
const stale: JvmPatch = { class: "com.example.Stale", loader: "gone", patched: false, error: "class is no longer loaded" };
const virtual: JvmPatch = { class: "com.example.Virtual", loader: "~janino", patched: true, leaseExpiresAt: NOW + 5_000 };

function renderTable(patches: JvmPatch[], props: Partial<PatchRegisterTableProps> = {}) {
  const onRestore = vi.fn();
  const onRenew = vi.fn();
  render(<PatchRegisterTable patches={patches} now={NOW} canMutate onRestore={onRestore} onRenew={onRenew} {...props} />);
  return { onRestore, onRenew };
}

const rowOf = (className: string) => screen.getByText(className).closest("tr") as HTMLElement;

describe("PatchRegisterTable", () => {
  it("counts a lease down to minutes and seconds", () => {
    renderTable([leased]);
    expect(within(rowOf("com.example.Leased")).getByText("in 2m 5s")).toBeInTheDocument();
  });

  it("calls a missing lease out as its own state, not as zero", () => {
    renderTable([unleased, expired]);
    expect(within(rowOf("com.example.Unleased")).getByText("no lease")).toBeInTheDocument();
    expect(within(rowOf("com.example.Expired")).getByText("restoring now…")).toBeInTheDocument();
  });

  it("explains a stale row instead of offering to restore it", () => {
    renderTable([stale]);
    const row = rowOf("com.example.Stale");
    expect(within(row).getByText("class is no longer loaded")).toBeInTheDocument();
    expect(within(row).getByText("nothing to restore")).toBeInTheDocument();
    expect(within(row).queryByRole("button", { name: /Restore/ })).toBeNull();
  });

  it("does not offer restore for a virtual loader", () => {
    renderTable([virtual]);
    const row = rowOf("com.example.Virtual");
    expect(within(row).getByText("~janino (virtual)")).toBeInTheDocument();
    expect(within(row).getByText("not restorable here")).toBeInTheDocument();
  });

  it("restores and renews the row's patch", () => {
    const { onRestore, onRenew } = renderTable([leased]);
    fireEvent.click(screen.getByRole("button", { name: "Restore com.example.Leased" }));
    fireEvent.click(screen.getByRole("button", { name: "Renew lease of com.example.Leased" }));
    expect(onRestore).toHaveBeenCalledWith(leased);
    expect(onRenew).toHaveBeenCalledWith(leased);
  });

  it("does not offer renew without a lease to extend", () => {
    renderTable([unleased]);
    expect(screen.getByRole("button", { name: "Restore com.example.Unleased" })).toBeEnabled();
    expect(screen.queryByRole("button", { name: /Renew lease/ })).toBeNull();
  });

  it("disables every action when writes are not allowed", () => {
    renderTable([leased], { canMutate: false });
    expect(screen.getByRole("button", { name: "Restore com.example.Leased" })).toBeDisabled();
    expect(screen.getByRole("button", { name: "Renew lease of com.example.Leased" })).toBeDisabled();
  });

  it("uses the class link slot for the class name", () => {
    renderTable([leased], { renderClassLink: (patch) => <a href={`#/classes/${patch.class}`}>{patch.class}</a> });
    expect(screen.getByRole("link", { name: "com.example.Leased" })).toHaveAttribute("href", "#/classes/com.example.Leased");
  });

  it("lists patches that never restore themselves before ones about to", () => {
    renderTable([leased, unleased]);
    const names = screen.getAllByText(/^com\.example\./).map((cell) => cell.textContent);
    expect(names).toEqual(["com.example.Unleased", "com.example.Leased"]);
  });
});
