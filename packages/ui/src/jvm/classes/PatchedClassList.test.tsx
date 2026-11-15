import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { APP_LOADER } from "../fixtures/classes";
import type { JvmPatch } from "../protocol/types";
import { PatchedClassList } from "./PatchedClassList";

const ORDER_SERVICE: JvmPatch = { class: "com.example.orders.OrderService", loader: APP_LOADER, patched: true, leaseExpiresAt: 1_800_000_000_000 };
const LEDGER: JvmPatch = { class: "com.example.orders.Ledger", loader: APP_LOADER, patched: true };
const GONE: JvmPatch = { class: "com.example.orders.Gone", loader: APP_LOADER, patched: true, error: "class is no longer loaded" };
const RESTORED: JvmPatch = { class: "com.example.orders.Inventory", loader: APP_LOADER, patched: false };

describe("PatchedClassList", () => {
  it("renders nothing when no class is patched", () => {
    const { container } = render(<PatchedClassList patches={[RESTORED]} onSelect={vi.fn()} />);
    expect(container).toBeEmptyDOMElement();
  });

  it("counts and lists patched classes, leaving out restored ones", () => {
    render(<PatchedClassList patches={[ORDER_SERVICE, RESTORED, LEDGER]} onSelect={vi.fn()} />);
    expect(screen.getByText("Patched in this JVM (2)")).toBeInTheDocument();
    expect(screen.getAllByRole("button").map((button) => button.textContent)).toEqual(["com.example.orders.OrderService", "com.example.orders.Ledger"]);
  });

  it("selects a patched class by name and loader", () => {
    const onSelect = vi.fn();
    render(<PatchedClassList patches={[ORDER_SERVICE]} onSelect={onSelect} />);
    fireEvent.click(screen.getByRole("button", { name: "com.example.orders.OrderService" }));
    expect(onSelect).toHaveBeenCalledWith({ name: "com.example.orders.OrderService", loader: APP_LOADER });
  });

  it("marks the class in view", () => {
    render(<PatchedClassList patches={[ORDER_SERVICE, LEDGER]} selected={{ name: LEDGER.class, loader: LEDGER.loader }} onSelect={vi.fn()} />);
    expect(screen.getByRole("button", { name: LEDGER.class })).toHaveAttribute("aria-current", "true");
    expect(screen.getByRole("button", { name: ORDER_SERVICE.class })).not.toHaveAttribute("aria-current");
  });

  it("flags a patch whose class could not be inspected as stale, with the reason", () => {
    render(<PatchedClassList patches={[GONE]} onSelect={vi.fn()} />);
    const button = screen.getByRole("button", { name: /Gone/ });
    expect(button).toHaveTextContent("(stale)");
    expect(button).toHaveAttribute("title", "class is no longer loaded");
  });
});
