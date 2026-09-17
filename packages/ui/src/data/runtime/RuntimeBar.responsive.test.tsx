import { render, screen, within } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { RuntimeBar, type RuntimeBarValue } from "./RuntimeBar";
import { RuntimeBarActions } from "./RuntimeBarActions";

const VALUE: RuntimeBarValue = {
  mode: "agent",
  model: "anthropic/claude-sonnet-5",
  effort: "medium",
  budget: { timeout: "30m", cost: 2 },
};

const titles = (element: HTMLElement) =>
  [...element.querySelectorAll("button[title]")].map((button) => button.getAttribute("title"));

function section(
  bar: HTMLElement,
  name: "identity" | "settings" | "actions",
): HTMLElement {
  const element = bar.querySelector<HTMLElement>(`[data-runtime-bar-section=${name}]`);
  if (!element) throw new Error(`runtime bar has no ${name} section`);
  return element;
}

describe("RuntimeBar responsive layout", () => {
  it("groups runtime identity apart from run settings so settings wrap as one row instead of being clipped", () => {
    render(<RuntimeBar value={VALUE} onChange={vi.fn()} showTimeout showCost />);

    const bar = screen.getByRole("group", { name: "Runtime" });
    const identity = section(bar, "identity");
    const settings = section(bar, "settings");

    expect(bar).toHaveClass("flex-wrap", "max-sm:w-full");
    expect(bar).not.toHaveClass("h-control-h");
    expect(titles(identity)).toEqual(["Family — Claude", "Claude Agent SDK", "Model — anthropic/claude-sonnet-5"]);
    expect(titles(settings)).toEqual(["Reasoning effort", "Timeout — 30m", "Max cost — $2.00"]);
    expect(settings).toHaveClass("-ml-px", "-mt-px", "border-l", "border-t", "max-sm:w-full", "max-sm:[&>div]:flex-1");
  });

  it("keeps the family name for assistive tech while phones show only its brand icon", () => {
    render(<RuntimeBar value={VALUE} onChange={vi.fn()} />);

    const family = screen.getByRole("button", { name: "Claude" });

    expect(within(family).getByText("Claude")).toHaveClass("max-sm:sr-only");
  });

  it("fuses host actions onto the bar as a third section without touching the runtime's own sections", () => {
    render(
      <RuntimeBar
        value={VALUE}
        onChange={vi.fn()}
        showTimeout
        showCost
        actions={
          <RuntimeBarActions
            menu={[{ label: "Advanced", onSelect: vi.fn() }]}
          />
        }
      />,
    );

    const bar = screen.getByRole("group", { name: "Runtime" });

    expect(titles(section(bar, "identity"))).toEqual(["Family — Claude", "Claude Agent SDK", "Model — anthropic/claude-sonnet-5"]);
    expect(titles(section(bar, "settings"))).toEqual(["Reasoning effort", "Timeout — 30m", "Max cost — $2.00"]);
    expect(titles(section(bar, "actions"))).toEqual(["Runtime options"]);
  });

  it("renders no actions section unless the host passes one", () => {
    render(<RuntimeBar value={VALUE} onChange={vi.fn()} showTimeout showCost />);

    expect(
      screen.getByRole("group", { name: "Runtime" }).querySelector("[data-runtime-bar-section=actions]"),
    ).toBeNull();
  });

  it("renders no settings group when the runtime exposes no effort or limits", () => {
    render(<RuntimeBar value={{ mode: "api" }} onChange={vi.fn()} showEffort={false} />);

    expect(screen.getByRole("group", { name: "Runtime" }).querySelector("[data-runtime-bar-section=settings]")).toBeNull();
  });
});
