import { fireEvent, render, screen, waitFor, within } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { RuntimeBar, type RuntimeBarValue } from "./RuntimeBar";
import { RuntimeBarActions } from "./RuntimeBarActions";
import { RuntimeBarLimitFields } from "./RuntimeBarLimits";

const BASE: RuntimeBarValue = { mode: "cli", model: "gpt-5" };

function openSegment(title: string) {
  fireEvent.click(within(screen.getByRole("group")).getByTitle(title));
}

function openComboMenu() {
  fireEvent.click(screen.getByRole("button", { name: /^Runtime:/ }));
}

async function selectPreset(inputLabel: string, optionLabel: string) {
  const input = screen.getByRole("combobox", { name: inputLabel });
  fireEvent.click(input);
  const listId = input.getAttribute("aria-controls");
  if (!listId) throw new Error(`${inputLabel} must identify its preset listbox`);
  const listbox = await waitFor(() => {
    const controlledListbox = document.getElementById(listId);
    if (!controlledListbox) throw new Error(`${inputLabel} listbox is not open`);
    return controlledListbox;
  });
  fireEvent.mouseDown(within(listbox).getByRole("option", { name: optionLabel }));
}

describe("RuntimeBar limits", () => {
  it("hides the timeout and max cost segments unless requested", () => {
    render(<RuntimeBar value={{ ...BASE, budget: { timeout: "30m", cost: 2 } }} onChange={vi.fn()} />);

    expect(screen.queryByTitle(/^Timeout/)).not.toBeInTheDocument();
    expect(screen.queryByTitle(/^Max cost/)).not.toBeInTheDocument();
  });

  it("does not render combo limit controls unless requested", () => {
    render(<RuntimeBar variant="combo" value={BASE} onChange={vi.fn()} />);

    expect(screen.queryByTitle(/^Timeout/)).not.toBeInTheDocument();
    expect(screen.queryByTitle(/^Max cost/)).not.toBeInTheDocument();
  });

  it("edits a max cost preset from the combo menu", async () => {
    const onChange = vi.fn();
    const value = { ...BASE, budget: { maxTurns: 4, timeout: "30m", cost: 2 } };
    render(
      <RuntimeBar
        variant="combo"
        value={value}
        onChange={onChange}
        showTimeout
        showCost
      />,
    );

    openComboMenu();
    expect(screen.getByLabelText("Timeout duration")).toHaveValue("30m");
    expect(screen.getByLabelText("Max cost (USD)")).toHaveValue("2");

    await selectPreset("Max cost presets", "$5.00");
    expect(onChange).toHaveBeenLastCalledWith({
      ...BASE,
      budget: { maxTurns: 4, timeout: "30m", cost: 5 },
    });
  });

  it("renders combo timeout and cost as compact icon-led rows", () => {
    render(
      <RuntimeBarLimitFields
        timeout="30m"
        cost={2}
        showTimeout
        showCost
        onTimeoutChange={vi.fn()}
        onCostChange={vi.fn()}
      />,
    );

    for (const [label, inputLabel] of [
      ["Timeout limit", "Timeout duration"],
      ["Max cost limit", "Max cost (USD)"],
    ]) {
      const row = screen.getByRole("group", { name: label });
      expect(row).toHaveClass("flex", "items-center");
      expect(row).not.toHaveClass("rounded-md", "border", "px-2", "py-1.5");
      expect(row.parentElement?.parentElement).toHaveClass("space-y-1");
      expect(row.parentElement?.parentElement).not.toHaveClass("border-b", "px-2", "pb-3", "pt-2");
      expect(within(row).getByLabelText(inputLabel).parentElement).toHaveClass("w-24");
      expect(within(row).getByLabelText(inputLabel)).toHaveClass("text-xs");
      const presets = within(row).getByRole("combobox", {
        name: `${label.replace(" limit", "")} presets`,
      });
      expect(presets.tagName).toBe("INPUT");
      expect(within(row).getByRole("button", { name: "Clear" })).toBeInTheDocument();
      expect(presets.parentElement?.parentElement).toHaveClass("w-28");
      expect(presets).toHaveClass("text-xs");
      const fieldLabel = within(row).getByText(label.replace(" limit", ""));
      expect(fieldLabel).toBeInTheDocument();
      expect(fieldLabel.parentElement?.querySelector(":scope > svg")).toBeInTheDocument();
    }
  });

  it("maps timeout and cost combobox presets and no-limit options to runtime values", async () => {
    const onTimeoutChange = vi.fn();
    const onCostChange = vi.fn();
    render(
      <RuntimeBarLimitFields
        timeout="30m"
        cost={2}
        showTimeout
        showCost
        onTimeoutChange={onTimeoutChange}
        onCostChange={onCostChange}
      />,
    );

    await selectPreset("Timeout presets", "1h");
    expect(onTimeoutChange).toHaveBeenCalledWith("1h");

    await selectPreset("Max cost presets", "$5.00");
    expect(onCostChange).toHaveBeenCalledWith(5);

    await selectPreset("Max cost presets", "No limit");
    expect(onCostChange).toHaveBeenLastCalledWith(undefined);
  });

  it("accepts typed combo limits and clears them with the preset picker", async () => {
    const onChange = vi.fn();
    const value = { ...BASE, budget: { maxTurns: 4, timeout: "30m", cost: 2 } };
    render(
      <RuntimeBar
        variant="combo"
        value={value}
        onChange={onChange}
        showTimeout
        showCost
      />,
    );

    openComboMenu();
    fireEvent.change(screen.getByLabelText("Timeout duration"), {
      target: { value: "1h30m" },
    });
    expect(onChange).toHaveBeenLastCalledWith({
      ...BASE,
      budget: { maxTurns: 4, timeout: "1h30m", cost: 2 },
    });

    fireEvent.change(screen.getByLabelText("Max cost (USD)"), {
      target: { value: "2.5" },
    });
    expect(onChange).toHaveBeenLastCalledWith({
      ...BASE,
      budget: { maxTurns: 4, timeout: "30m", cost: 2.5 },
    });

    const timeoutRow = screen.getByRole("group", { name: "Timeout limit" });
    fireEvent.click(within(timeoutRow).getByRole("button", { name: "Clear" }));
    expect(onChange).toHaveBeenLastCalledWith({
      ...BASE,
      budget: { maxTurns: 4, cost: 2 },
    });

    await selectPreset("Max cost presets", "No limit");
    expect(onChange).toHaveBeenLastCalledWith({ ...BASE, budget: { maxTurns: 4, timeout: "30m" } });
  });

  it("renders host actions beside the combo trigger", () => {
    const { container } = render(
      <RuntimeBar
        variant="combo"
        value={BASE}
        onChange={vi.fn()}
        actions={<RuntimeBarActions menu={[{ label: "Advanced", onSelect: vi.fn() }]} />}
      />,
    );

    expect(screen.getByTitle("Runtime options")).toBeInTheDocument();
    expect(
      container.querySelector("[data-runtime-bar-section=actions]"),
    ).toHaveClass("rounded-md");
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

});
