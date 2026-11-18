import { act, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, expect, it, vi } from "vitest";
import { registerDebugRuntime } from "../data/debugRuntime";
import { registerDebugConsole, type DebugConsoleRequest } from "../data/debugConsoleSignal";
import { RuntimeIndicatorBadge } from "./RuntimeIndicatorBadge";
import { DebugConsoleButton } from "./DebugConsoleButton";

const releases: Array<() => void> = [];
afterEach(() => act(() => { for (const release of releases.splice(0)) release(); }));

function runtime(id: string) {
  let snapshot = { status: "booting", error: null as string | null };
  const listeners = new Set<() => void>();
  releases.push(registerDebugRuntime({ id, label: `${id}.tsx`, clear: vi.fn(), content: null, state: {
    getSnapshot: () => snapshot,
    subscribe(listener: () => void) { listeners.add(listener); return () => { listeners.delete(listener); }; },
  } }));
  return (status: string, error: string | null = null) => {
    snapshot = { status, error };
    for (const listener of listeners) listener();
  };
}

it("shows live runtime phases and opens the runtimes diagnostics", () => {
  const seen: DebugConsoleRequest[] = [];
  releases.push(registerDebugConsole(request => seen.push(request)));
  const update = runtime("facet");
  render(<RuntimeIndicatorBadge />);
  const badge = screen.getByRole("button", { name: /Runtime: booting/ });
  expect(badge).toBeEnabled();
  expect(badge.querySelector("button")).toBeNull();
  act(() => update("ready"));
  fireEvent.click(screen.getByRole("button", { name: /Runtime: ready/ }));
  expect(seen).toEqual([{ tab: "runtimes" }]);
});

it("prioritizes failed frames and removes disposed frames from the indicator", () => {
  const update = runtime("facet");
  runtime("clicky");
  render(<RuntimeIndicatorBadge />);
  expect(screen.getByRole("button", { name: /2 runtimes: 2 loading/ })).toBeInTheDocument();
  act(() => update("failed", "compile: Unexpected token"));
  expect(screen.getByRole("button", { name: /2 runtimes: 1 failed/ })).toHaveAttribute("title", expect.stringContaining("compile: Unexpected token"));
  act(() => releases.splice(0).forEach(release => release()));
  expect(screen.queryByRole("button")).not.toBeInTheDocument();
});

it("adds the runtime badge beside the console trigger and disables it without a console", () => {
  const update = runtime("facet");
  update("ready");
  render(<DebugConsoleButton />);
  expect(screen.getByRole("button", { name: /Runtime: ready/ })).toBeDisabled();
  expect(screen.getByRole("button", { name: "Debug console" })).toBeInTheDocument();
});
