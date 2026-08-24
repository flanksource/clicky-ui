import { act, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import {
  registerDebugConsole,
  setDebugConsoleOpen,
  type DebugConsoleRequest,
} from "../data/debugConsoleSignal";
import { DebugConsoleButton } from "./DebugConsoleButton";
import { DebugStore } from "./debugStore";
import type { ExecutionSummary } from "./types";

function record(sequence: number, overrides: Partial<ExecutionSummary> = {}): ExecutionSummary {
  return {
    id: `record-${sequence}`,
    sequence,
    source: { surface: "profile", profile: "activities" },
    startedAt: "2026-08-23T10:00:00Z",
    durationMs: 8.5,
    rows: 2,
    status: 200,
    level: "debug",
    counts: {
      operations: 1,
      harEntries: 0,
      harDropped: 0,
      logLines: 0,
      logDropped: 0,
      probes: 0,
      inspections: 0,
    },
    ...overrides,
  };
}

describe("DebugConsoleButton", () => {
  afterEach(() => act(() => setDebugConsoleOpen(false)));

  const mountConsole = (seen: DebugConsoleRequest[] = []) =>
    registerDebugConsole((request) => seen.push(request));

  it("asks the console to toggle rather than always opening it", () => {
    const seen: DebugConsoleRequest[] = [];
    const unregister = mountConsole(seen);
    render(<DebugConsoleButton store={new DebugStore()} />);

    fireEvent.click(screen.getByRole("button", { name: "Debug console" }));

    expect(seen).toEqual([{ toggle: true }]);
    act(unregister);
  });

  // The trigger sits in the navbar, outside the console's tree, so pressed
  // state is the only thing telling you which of the two states you are in.
  it("reads as pressed while the console is showing", async () => {
    const unregister = mountConsole();
    render(<DebugConsoleButton store={new DebugStore()} />);
    const button = screen.getByRole("button", { name: "Debug console" });
    expect(button).toHaveAttribute("aria-pressed", "false");

    act(() => setDebugConsoleOpen(true));

    await waitFor(() => expect(button).toHaveAttribute("aria-pressed", "true"));
    act(unregister);
  });

  // A trigger that says nothing gives no reason to press it. This is what the
  // collapsed status bar was actually for.
  it("counts the captures it has", async () => {
    const store = new DebugStore();
    const unregister = mountConsole();
    render(<DebugConsoleButton store={store} />);

    act(() => store.addRecords([record(1), record(2), record(3)]));

    const button = screen.getByRole("button", { name: "Debug console" });
    await waitFor(() => expect(button).toHaveTextContent("3"));
    expect(button).toHaveAttribute("title", "Show the debug console — 3 captures");
    act(unregister);
  });

  // Failures displace the total rather than adding a second number: one badge
  // has room for the count that makes someone look, and that is the failures.
  it("counts failures instead once anything failed", async () => {
    const store = new DebugStore();
    const unregister = mountConsole();
    render(<DebugConsoleButton store={store} />);

    act(() =>
      store.addRecords([
        record(1),
        record(2, { status: 504, error: "context deadline exceeded" }),
        record(3, { status: 422 }),
      ]),
    );

    const button = screen.getByRole("button", { name: "Debug console" });
    await waitFor(() => expect(button).toHaveTextContent("2"));
    expect(button).toHaveAttribute("title", "Show the debug console — 3 captures, 2 failed");
    act(unregister);
  });

  it("shows no badge before anything has run", () => {
    const unregister = mountConsole();
    render(<DebugConsoleButton store={new DebugStore()} />);

    const button = screen.getByRole("button", { name: "Debug console" });
    expect(button).toHaveTextContent("");
    expect(button).toHaveAttribute("title", "Show the debug console");
    act(unregister);
  });
});
