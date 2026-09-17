import { fireEvent, render, screen, within } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { RuntimeBar, type RuntimeBarValue } from "./RuntimeBar";

const BASE: RuntimeBarValue = { mode: "cli", model: "gpt-5" };

function openSegment(title: string) {
  fireEvent.click(within(screen.getByRole("group")).getByTitle(title));
}

describe("RuntimeBar limits", () => {
  it("hides the timeout and max cost segments unless requested", () => {
    render(<RuntimeBar value={{ ...BASE, budget: { timeout: "30m", cost: 2 } }} onChange={vi.fn()} />);

    expect(screen.queryByTitle(/^Timeout/)).not.toBeInTheDocument();
    expect(screen.queryByTitle(/^Max cost/)).not.toBeInTheDocument();
  });

  it("picks a timeout preset while preserving the other budget fields", () => {
    const onChange = vi.fn();
    const value = { ...BASE, budget: { maxTurns: 4, timeout: "30m" } };
    render(<RuntimeBar value={value} onChange={onChange} showTimeout showCost />);

    openSegment("Timeout — 30m");
    fireEvent.click(screen.getByRole("menuitem", { name: /^1h/ }));

    expect(onChange).toHaveBeenLastCalledWith({ ...BASE, budget: { maxTurns: 4, timeout: "1h" } });
  });

  it.each([
    { typed: "2.5", budget: { cost: 2.5 } },
    { typed: "-1", budget: undefined },
    { typed: "abc", budget: undefined },
  ])("commits a typed max cost of $typed only when it is a positive amount", ({ typed, budget }) => {
    const onChange = vi.fn();
    render(<RuntimeBar value={BASE} onChange={onChange} showCost />);

    openSegment("Max cost — no limit");
    fireEvent.change(screen.getByLabelText("Max cost (USD)"), { target: { value: typed } });

    if (budget) expect(onChange).toHaveBeenLastCalledWith({ ...BASE, budget });
    else expect(onChange).not.toHaveBeenCalled();
  });

  it.each([
    { typed: "1h30m", budget: { timeout: "1h30m" } },
    { typed: "90", budget: undefined },
  ])("commits a typed timeout of $typed only when it is a duration", ({ typed, budget }) => {
    const onChange = vi.fn();
    render(<RuntimeBar value={BASE} onChange={onChange} showTimeout />);

    openSegment("Timeout — no limit");
    fireEvent.change(screen.getByLabelText("Timeout duration"), { target: { value: typed } });

    if (budget) expect(onChange).toHaveBeenLastCalledWith({ ...BASE, budget });
    else expect(onChange).not.toHaveBeenCalled();
  });

  it("drops the budget when the last limit is cleared", () => {
    const onChange = vi.fn();
    render(<RuntimeBar value={{ ...BASE, budget: { cost: 5 } }} onChange={onChange} showCost />);

    openSegment("Max cost — $5.00");
    fireEvent.click(screen.getByRole("menuitem", { name: /^No limit/ }));

    expect(onChange).toHaveBeenLastCalledWith(BASE);
  });

  it("rejects limits on the combo variant", () => {
    vi.spyOn(console, "error").mockImplementation(() => undefined);
    expect(() =>
      render(<RuntimeBar variant="combo" value={BASE} onChange={vi.fn()} showTimeout />),
    ).toThrow("showTimeout and showCost require the segmented variant");
  });
});
