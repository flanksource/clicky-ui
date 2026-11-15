import { fireEvent, render, screen, within } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { classSourceFixture } from "../fixtures/classes";
import { MethodPicker } from "./MethodPicker";

const CLASS = "com.example.orders.OrderService";
const METHODS = classSourceFixture(CLASS, "6d06d69c").methods;

function renderPicker(value: string, onChange = vi.fn()) {
  render(<MethodPicker forClass={CLASS} methods={METHODS} value={value} onChange={onChange} />);
  return onChange;
}

describe("MethodPicker", () => {
  it("lists the whole class first, then each method by readable signature in source order", () => {
    renderPicker("");
    const select = screen.getByRole("combobox", { name: "Jump to method" });
    expect(within(select).getAllByRole("option").map((option) => option.textContent)).toEqual([
      "Whole class",
      "OrderService(Inventory, PriceCalculator)",
      "checkout(String)",
      "cancel(String)",
    ]);
  });

  it("reports the exact overload selector, name and descriptor", () => {
    const onChange = renderPicker("");
    fireEvent.change(screen.getByRole("combobox", { name: "Jump to method" }), { target: { value: "checkout(Ljava/lang/String;)D" } });
    expect(onChange.mock.calls).toEqual([["checkout(Ljava/lang/String;)D"]]);
  });

  it("reports an empty selector for the whole class", () => {
    const onChange = renderPicker("cancel");
    fireEvent.change(screen.getByRole("combobox", { name: "Jump to method" }), { target: { value: "" } });
    expect(onChange.mock.calls).toEqual([[""]]);
  });

  it("shows the method a bare name from a link resolves to", () => {
    renderPicker("checkout");
    expect(screen.getByRole("combobox", { name: "Jump to method" })).toHaveValue("checkout(Ljava/lang/String;)D");
  });

  it("shows the whole class for a name no method has, rather than a stale choice", () => {
    renderPicker("refund");
    expect(screen.getByRole("combobox", { name: "Jump to method" })).toHaveValue("");
  });

  it("is disabled when the class has no methods to jump to", () => {
    render(<MethodPicker forClass={CLASS} methods={[]} value="" onChange={vi.fn()} />);
    expect(screen.getByRole("combobox", { name: "Jump to method" })).toBeDisabled();
  });
});
