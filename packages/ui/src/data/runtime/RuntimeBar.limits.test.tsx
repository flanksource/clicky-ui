import { fireEvent, render, screen, within } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { RuntimeBar, type RuntimeBarValue } from "./RuntimeBar";

const BASE: RuntimeBarValue = { mode: "cli", model: "gpt-5" };

function openSetting(label: string) {
  fireEvent.click(screen.getByTitle("Runtime options"));
  fireEvent.click(screen.getByRole("menuitem", { name: label }));
}

describe("RuntimeBar limits", () => {
  it("omits timeout and budget controls unless requested", () => {
    render(
      <RuntimeBar
        value={{ ...BASE, budget: { timeout: "30m", cost: 2 } }}
        onChange={vi.fn()}
      />,
    );
    fireEvent.click(screen.getByTitle("Runtime options"));
    expect(
      screen.queryByRole("menuitem", { name: "Timeout" }),
    ).not.toBeInTheDocument();
    expect(
      screen.queryByRole("menuitem", { name: "Budget" }),
    ).not.toBeInTheDocument();
  });

  it("selects budget presets while preserving other budget fields", () => {
    const onChange = vi.fn();
    render(
      <RuntimeBar
        value={{ ...BASE, budget: { maxTurns: 4, timeout: "30m", cost: 2 } }}
        onChange={onChange}
        showTimeout
        showCost
      />,
    );
    openSetting("Budget");
    expect(screen.getByLabelText("Budget (USD)")).toHaveValue("2");
    fireEvent.click(screen.getByRole("menuitem", { name: "$5.00" }));
    expect(onChange).toHaveBeenLastCalledWith({
      ...BASE,
      budget: { maxTurns: 4, timeout: "30m", cost: 5 },
    });
  });

  it("accepts custom limits through inline dropdowns and removes only the cleared limit", () => {
    const onChange = vi.fn();
    const value = {
      ...BASE,
      budget: { maxTurns: 4, timeout: "30m", cost: 2 },
    };
    render(
      <RuntimeBar value={value} onChange={onChange} showTimeout showCost />,
    );
    fireEvent.click(screen.getByTitle("Timeout — 30m"));
    fireEvent.change(screen.getByLabelText("Timeout duration"), {
      target: { value: "1h30m" },
    });
    expect(onChange).toHaveBeenLastCalledWith({
      ...BASE,
      budget: { maxTurns: 4, timeout: "1h30m", cost: 2 },
    });
    fireEvent.click(screen.getByRole("menuitem", { name: "No limit" }));
    expect(onChange).toHaveBeenLastCalledWith({
      ...BASE,
      budget: { maxTurns: 4, cost: 2 },
    });
    fireEvent.click(screen.getByTitle("Budget — $2.00"));
    fireEvent.change(screen.getByLabelText("Budget (USD)"), {
      target: { value: "2.5" },
    });
    expect(onChange).toHaveBeenLastCalledWith({
      ...BASE,
      budget: { maxTurns: 4, timeout: "30m", cost: 2.5 },
    });
    fireEvent.click(screen.getByRole("menuitem", { name: "No limit" }));
    expect(onChange).toHaveBeenLastCalledWith({
      ...BASE,
      budget: { maxTurns: 4, timeout: "30m" },
    });
  });

  it("renders host actions alongside native settings", () => {
    render(
      <RuntimeBar
        value={BASE}
        onChange={vi.fn()}
        actions={{ menu: [{ label: "Advanced", onSelect: vi.fn() }] }}
      />,
    );
    fireEvent.click(screen.getByTitle("Runtime options"));
    expect(
      within(screen.getByRole("menu", { name: "Runtime options" }))
        .getAllByRole("menuitem")
        .map((item) => item.textContent),
    ).toEqual(["Effort", "Advanced"]);
  });

  it("selects a timeout preset while preserving other budget fields", () => {
    const onChange = vi.fn();
    render(
      <RuntimeBar
        value={{ ...BASE, budget: { maxTurns: 4, timeout: "30m" } }}
        onChange={onChange}
        showTimeout
      />,
    );
    openSetting("Timeout");
    expect(screen.getByLabelText("Timeout duration")).toHaveValue("30m");
    fireEvent.click(screen.getByRole("menuitem", { name: "1h" }));
    expect(onChange).toHaveBeenLastCalledWith({
      ...BASE,
      budget: { maxTurns: 4, timeout: "1h" },
    });
  });

  it.each([
    { typed: "2.5", budget: { cost: 2.5 } },
    { typed: "-1", budget: undefined },
    { typed: "abc", budget: undefined },
  ])(
    "commits a typed budget of $typed only when it is positive",
    ({ typed, budget }) => {
      const onChange = vi.fn();
      render(<RuntimeBar value={BASE} onChange={onChange} showCost />);
      openSetting("Budget");
      const input = screen.getByLabelText("Budget (USD)");
      fireEvent.change(input, { target: { value: typed } });
      if (budget)
        expect(onChange).toHaveBeenLastCalledWith({ ...BASE, budget });
      else {
        expect(onChange).not.toHaveBeenCalled();
        expect(input).toHaveAttribute("aria-invalid", "true");
      }
    },
  );

  it.each([
    { typed: "1h30m", budget: { timeout: "1h30m" } },
    { typed: "90", budget: undefined },
  ])(
    "commits a typed timeout of $typed only when it is a duration",
    ({ typed, budget }) => {
      const onChange = vi.fn();
      render(<RuntimeBar value={BASE} onChange={onChange} showTimeout />);
      openSetting("Timeout");
      const input = screen.getByLabelText("Timeout duration");
      fireEvent.change(input, { target: { value: typed } });
      if (budget)
        expect(onChange).toHaveBeenLastCalledWith({ ...BASE, budget });
      else {
        expect(onChange).not.toHaveBeenCalled();
        expect(input).toHaveAttribute("aria-invalid", "true");
      }
    },
  );

  it("drops the budget when its final limit is cleared", () => {
    const onChange = vi.fn();
    render(
      <RuntimeBar
        value={{ ...BASE, budget: { cost: 5 } }}
        onChange={onChange}
        showCost
      />,
    );
    fireEvent.click(screen.getByTitle("Budget — $5.00"));
    fireEvent.click(screen.getByRole("menuitem", { name: "No limit" }));
    expect(onChange).toHaveBeenLastCalledWith(BASE);
  });
});
