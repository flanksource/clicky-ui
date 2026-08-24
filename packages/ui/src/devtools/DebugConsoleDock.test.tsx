import { act, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import {
  debugCaptureHeaders,
  debugConsoleOpen,
  revealDebugConsole,
} from "../data/debugConsoleSignal";
import { DebugConsoleDock } from "./DebugConsoleDock";
import { DebugStore } from "./debugStore";
import type { ExecutionSummary } from "./types";

/**
 * An EventSource that never connects, so a mounted dock does not reach for a
 * network the test has not stood up.
 */
class SilentEventSource {
  addEventListener() {}
  removeEventListener() {}
  close() {}
  onopen: (() => void) | null = null;
  onerror: (() => void) | null = null;
}

const silentStream = () => new SilentEventSource() as unknown as EventSource;

function record(sequence: number): ExecutionSummary {
  return {
    id: `record-${sequence}`,
    sequence,
    source: { surface: "profile", profile: "activities" },
    startedAt: "2026-08-23T10:00:00Z",
    durationMs: 8.5,
    rows: 2,
    level: "debug",
    operations: [
      { index: 1, provider: "postgres", query: "SELECT 1", durationMs: 8, rows: 2 },
    ],
    counts: {
      operations: 1,
      harEntries: 0,
      harDropped: 0,
      logLines: 0,
      logDropped: 0,
      probes: 0,
      inspections: 0,
    },
  };
}

describe("DebugConsoleDock", () => {
  let store: DebugStore;

  beforeEach(() => {
    store = new DebugStore();
    window.history.replaceState(null, "", "/explorer");
  });

  afterEach(() => {
    window.history.replaceState(null, "", "/explorer");
  });

  // Closed, the dock costs the page nothing at all — the trigger and its counts
  // moved to the navbar, so there is no strip left to occupy a screen edge.
  it("renders nothing while closed", () => {
    store.addRecords([record(1), record(2)]);

    render(<DebugConsoleDock store={store} createEventSource={silentStream} />);

    expect(screen.queryByTestId("devtools-dock")).not.toBeInTheDocument();
    expect(debugConsoleOpen()).toBe(false);
  });

  it("opens when a table asks to be explained", async () => {
    render(<DebugConsoleDock store={store} createEventSource={silentStream} />);

    act(() => revealDebugConsole({ tab: "console" }));

    await waitFor(() => expect(screen.getByTestId("devtools-dock")).toBeInTheDocument());
    expect(debugConsoleOpen()).toBe(true);
  });

  // The navbar trigger toggles; a table's "Debug" action must not, or clicking
  // it while the console is already open would close it.
  it("toggles only for a request that asked to toggle", async () => {
    render(<DebugConsoleDock store={store} defaultOpen createEventSource={silentStream} />);

    act(() => revealDebugConsole({ tab: "queries" }));
    await waitFor(() => expect(screen.getByTestId("devtools-dock")).toBeInTheDocument());

    act(() => revealDebugConsole({ toggle: true }));
    await waitFor(() => expect(screen.queryByTestId("devtools-dock")).not.toBeInTheDocument());

    act(() => revealDebugConsole({ toggle: true }));
    await waitFor(() => expect(screen.getByTestId("devtools-dock")).toBeInTheDocument());
  });

  it("shows the captures it holds once open", async () => {
    store.addRecord(record(1));

    render(<DebugConsoleDock store={store} defaultOpen createEventSource={silentStream} />);

    expect(await screen.findByText("SELECT 1")).toBeInTheDocument();
  });

  // The dock is a fixed-height box, so its body only scrolls if every element
  // between that box and the table's scroll region is a flex column that is
  // allowed to shrink. One plain block anywhere in the chain, or one `h-full`
  // in place of `flex-1`, and the table sizes to its content and overflows the
  // dock instead — with no error, which is why this is pinned rather than
  // left to the eye.
  it("hands a bounded height all the way down to the table's scroll region", async () => {
    store.addRecords([record(1), record(2)]);
    render(<DebugConsoleDock store={store} defaultOpen createEventSource={silentStream} />);
    await screen.findAllByText("SELECT 1");

    const dock = screen.getByTestId("devtools-dock");
    const scroller = dock.querySelector(".overflow-auto");
    expect(scroller).not.toBeNull();
    // No caller has overridden the scroll region's own sizing — `h-full` here
    // resolves against an auto-height parent and defeats the whole chain.
    expect(scroller?.classList.contains("flex-1")).toBe(true);
    expect(scroller?.classList.contains("h-full")).toBe(false);

    // Checked as class tokens, not substrings: `flex-1` contains "flex" while
    // setting no display at all, which is exactly the mistake being guarded.
    for (
      let element = scroller?.parentElement;
      element && element !== dock;
      element = element.parentElement
    ) {
      expect({
        classes: element.className,
        flex: element.classList.contains("flex"),
        shrinkable: element.classList.contains("min-h-0"),
      }).toEqual({ classes: element.className, flex: true, shrinkable: true });
    }
  });

  // The capture level a bare fetch reads has to follow the picker, or the
  // profile builder's sample would be armed at a level nobody chose.
  it("publishes its level for call sites that fetch without the wrapper", async () => {
    render(<DebugConsoleDock store={store} defaultOpen createEventSource={silentStream} />);

    await waitFor(() => expect(debugCaptureHeaders()["X-Debug-Level"]).toBe("debug"));

    fireEvent.change(screen.getByRole("combobox"), { target: { value: "trace2" } });

    await waitFor(() => expect(debugCaptureHeaders()["X-Debug-Level"]).toBe("trace2"));
  });

  it("stops arming anything once closed", async () => {
    render(<DebugConsoleDock store={store} defaultOpen createEventSource={silentStream} />);

    fireEvent.click(screen.getByRole("button", { name: "Close console" }));

    await waitFor(() => expect(debugCaptureHeaders()).toEqual({}));
  });
});
