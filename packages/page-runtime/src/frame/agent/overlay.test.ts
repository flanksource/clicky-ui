// @vitest-environment jsdom
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { mountAgentOverlay } from "./overlay.ts";

describe("comment overlay hover and focus", () => {
  let overlay: ReturnType<typeof mountAgentOverlay>;
  const anchors = [{ anchor: "#target", count: 1, locators: [] }];
  const flush = () => vi.advanceTimersByTime(20);
  const highlight = () => overlay.host.shadowRoot!.querySelector<HTMLElement>(".highlight")!;

  beforeEach(() => {
    vi.useFakeTimers();
    vi.stubGlobal("ResizeObserver", class { observe() {} disconnect() {} });
    document.body.innerHTML = '<main><h2 id="target">Revenue</h2></main>';
    overlay = mountAgentOverlay({ root: document.querySelector("main")!, send: vi.fn(), registered: new Map() });
  });
  afterEach(() => {
    overlay.dispose();
    document.body.replaceChildren();
    vi.useRealTimers();
    vi.unstubAllGlobals();
  });

  it("focuses a pin without highlighting its element", () => {
    overlay.update(anchors, "#target");
    flush();
    expect(highlight().hidden).toBe(true);
    expect(overlay.host.shadowRoot!.querySelector("button")!.getAttribute("aria-pressed")).toBe("true");
  });

  it("clears hover while retaining pin focus through subsequent updates", () => {
    overlay.update(anchors, "#target");
    overlay.highlight("#target");
    flush();
    expect(highlight().hidden).toBe(false);
    overlay.highlight(null);
    overlay.update(anchors, "#target");
    flush();
    expect(highlight().hidden).toBe(true);
    expect(overlay.host.shadowRoot!.querySelector("button")!.getAttribute("aria-pressed")).toBe("true");
  });
});
