import { beforeEach, describe, expect, it } from "vitest";
import { DEFAULT_DOCK_STATE, readDockState, writeDockState } from "./dockState";

describe("dock state in the URL", () => {
  beforeEach(() => {
    window.history.replaceState(null, "", "/explorer");
  });

  it("reads a shared link back as the state that produced it", () => {
    expect(readDockState("?__debug_open=1&__debug_tab=network&__debug_level=trace2")).toEqual({
      open: true,
      tab: "network",
      level: "trace2",
    });
  });

  it("falls back to the defaults for a URL that says nothing", () => {
    expect(readDockState("?region=EU")).toEqual(DEFAULT_DOCK_STATE);
  });

  // A tab name the app no longer has would otherwise render an empty panel with
  // no way back to a real one.
  it("ignores a tab it does not have", () => {
    expect(readDockState("?__debug_open=1&__debug_tab=flamegraph").tab).toBe("queries");
  });

  it("round-trips through the address bar", () => {
    writeDockState({ open: true, tab: "console", level: "trace1" });

    expect(readDockState(window.location.search)).toEqual({
      open: true,
      tab: "console",
      level: "trace1",
    });
  });

  // The ordinary case must not make every link the user copies carry debug
  // parameters they did not ask for.
  it("leaves no trace when the console is closed", () => {
    writeDockState({ open: true, tab: "network", level: "trace2" });
    writeDockState({ open: false, tab: "network", level: "trace2" });

    expect(window.location.search).toBe("");
  });

  it("keeps the defaults out of the URL", () => {
    writeDockState({ open: true, tab: "queries", level: "debug" });

    expect(window.location.search).toBe("?__debug_open=1");
  });

  it("preserves the parameters the page already had", () => {
    window.history.replaceState(null, "", "/explorer?region=EU");

    writeDockState({ open: true, tab: "queries", level: "debug" });

    expect(new URLSearchParams(window.location.search).get("region")).toBe("EU");
  });
});
