import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import type { JvmPatch } from "../protocol/types";
import { PatchRegister, type PatchRegisterProps } from "./PatchRegister";

const NOW = 1_700_000_000_000;
const leased: JvmPatch = { class: "com.example.Leased", loader: "app", patched: true, leaseExpiresAt: NOW + 60_000 };
const unleased: JvmPatch = { class: "com.example.Unleased", loader: "app", patched: true };
const stale: JvmPatch = { class: "com.example.Stale", loader: "gone", patched: false, error: "class is no longer loaded" };

function renderRegister(patches: JvmPatch[], props: Partial<PatchRegisterProps> = {}) {
  const onRestoreAll = vi.fn();
  render(<PatchRegister patches={patches} now={NOW} canMutate failures={[]} onRestore={vi.fn()} onRestoreAll={onRestoreAll} onRenew={vi.fn()} {...props} />);
  return { onRestoreAll };
}

describe("PatchRegister", () => {
  it("warns that unleased patches will not restore themselves", () => {
    renderRegister([leased, unleased]);
    expect(screen.getByText(/1 class has no lease/)).toBeInTheDocument();
  });

  it("restores only the restorable rows with Restore all", () => {
    const { onRestoreAll } = renderRegister([leased, unleased, stale]);
    fireEvent.click(screen.getByRole("button", { name: "Restore all (2)" }));
    expect(onRestoreAll).toHaveBeenCalledWith([leased, unleased]);
  });

  it("disables Restore all while a restore is running and names the class", () => {
    renderRegister([leased, unleased], { restoringAll: "com.example.Leased" });
    expect(screen.getByRole("button", { name: /Restoring com.example.Leased/ })).toBeDisabled();
  });

  it("disables Restore all when writes are not allowed or nothing is restorable", () => {
    const { unmount } = render(
      <PatchRegister patches={[leased]} now={NOW} canMutate={false} failures={[]} onRestore={vi.fn()} onRestoreAll={vi.fn()} onRenew={vi.fn()} />,
    );
    expect(screen.getByRole("button", { name: "Restore all (1)" })).toBeDisabled();
    unmount();
    renderRegister([stale]);
    expect(screen.getByRole("button", { name: "Restore all (0)" })).toBeDisabled();
  });

  it("lists each failed class with the agent's message", () => {
    renderRegister([leased], { failures: [{ key: "app:com.example.Leased", className: "com.example.Leased", message: "redefinition rejected" }] });
    expect(screen.getByText("com.example.Leased: redefinition rejected")).toBeInTheDocument();
  });

  it("says the JVM runs original bytecode when the register is empty, with the host's hint", () => {
    renderRegister([], { emptyHint: <a href="#/classes">Open the class browser</a> });
    expect(screen.getByText("This JVM is running its original bytecode.")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Open the class browser" })).toBeInTheDocument();
  });

  it("renders the toolbar slot and a refresh button only when given", () => {
    const onRefresh = vi.fn();
    renderRegister([leased], { toolbar: <span>gate</span>, onRefresh });
    expect(screen.getByText("gate")).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "Refresh" }));
    expect(onRefresh).toHaveBeenCalledOnce();
  });
});
