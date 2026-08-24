import { describe, expect, it } from "vitest";
import {
  DEBUG_CAPTURE_HEADER,
  debugCaptureHeaders,
  debugConsoleAvailable,
  registerDebugConsole,
  revealDebugConsole,
  setDebugCaptureLevel,
  subscribeToDebugConsole,
  type DebugConsoleRequest,
} from "./debugConsoleSignal";

describe("debug console signal", () => {
  it("reports no console before one is mounted", () => {
    expect(debugConsoleAvailable()).toBe(false);
  });

  it("delivers a reveal request to the mounted console", () => {
    const seen: DebugConsoleRequest[] = [];
    const unregister = registerDebugConsole((request) => seen.push(request));

    revealDebugConsole({ tab: "network" });

    expect(seen).toEqual([{ tab: "network" }]);
    unregister();
  });

  // A menu built before the dock renders has to gain its "Debug" item when the
  // dock arrives, rather than staying stale until something else re-renders it.
  it("tells watchers when a console appears and disappears", () => {
    const changes: boolean[] = [];
    const unwatch = subscribeToDebugConsole(() => changes.push(debugConsoleAvailable()));

    const unregister = registerDebugConsole(() => {});
    unregister();
    unwatch();

    expect(changes).toEqual([true, false]);
  });

  it("stops delivering to an unmounted console", () => {
    let delivered = 0;
    registerDebugConsole(() => delivered++)();

    revealDebugConsole();

    expect(delivered).toBe(0);
  });

  describe("capture headers", () => {
    it("arms nothing while no console is mounted, whatever the level says", () => {
      setDebugCaptureLevel("trace2");

      expect(debugCaptureHeaders()).toEqual({});
    });

    it("arms a bare fetch at the console's level", () => {
      const unregister = registerDebugConsole(() => {});
      setDebugCaptureLevel("trace1");

      expect(debugCaptureHeaders()).toEqual({ [DEBUG_CAPTURE_HEADER]: "trace1" });

      setDebugCaptureLevel("off");
      expect(debugCaptureHeaders()).toEqual({});
      unregister();
    });
  });
});
