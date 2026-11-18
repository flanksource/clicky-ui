import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { threadStateBadge, threadStateDot } from "./state-styles";
import { ThreadStateFilterChips } from "./ThreadStateFilterChips";

describe("ThreadStateFilterChips", () => {
  const counts = new Map([
    ["WAITING", 2],
    ["RUNNABLE", 5],
    ["BLOCKED", 1],
  ]);

  it("orders chips by count and marks the selected ones pressed", () => {
    render(<ThreadStateFilterChips counts={counts} selected={new Set(["BLOCKED"])} dot={threadStateDot} onToggle={() => {}} />);
    const chips = screen.getAllByRole("button");
    expect(chips.map((chip) => chip.textContent)).toEqual(["RUNNABLE5", "WAITING2", "BLOCKED1"]);
    expect(chips.map((chip) => chip.getAttribute("aria-pressed"))).toEqual(["false", "false", "true"]);
  });

  it("reports the toggled state", () => {
    const onToggle = vi.fn();
    render(<ThreadStateFilterChips counts={counts} selected={new Set()} dot={threadStateDot} onToggle={onToggle} />);
    fireEvent.click(screen.getByRole("button", { name: /WAITING/ }));
    expect(onToggle).toHaveBeenCalledWith("WAITING");
  });
});

describe("thread state styles", () => {
  it.each([
    ["runnable", "bg-green-500"],
    ["RUNNABLE", "bg-green-500"],
    ["BLOCKED", "bg-red-500"],
    ["TIMED_WAITING", "bg-blue-500"],
    ["new", "bg-amber-500"],
    ["TERMINATED", "bg-muted-foreground/40"],
  ])("%s dot is %s regardless of case", (state, dot) => {
    expect(threadStateDot(state)).toBe(dot);
  });

  it("matches the badge for upper and lower case states", () => {
    expect(threadStateBadge("BLOCKED")).toBe(threadStateBadge("blocked"));
    expect(threadStateBadge("BLOCKED")).toContain("text-red-700");
  });
});
