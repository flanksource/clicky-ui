import { act, fireEvent, render } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { useSessionScroll, type SessionScrollOptions, type SessionScrollState } from "./use-session-scroll";

// jsdom does no layout, so the scroll container's geometry is scripted: every
// element reports `layout.height` as its scrollHeight and keeps the scrollTop
// it is given.
const layout = { height: 0 };
const scrollTops = new WeakMap<Element, number>();
const descriptors = {
  scrollHeight: Object.getOwnPropertyDescriptor(HTMLElement.prototype, "scrollHeight"),
  scrollTop: Object.getOwnPropertyDescriptor(Element.prototype, "scrollTop"),
};

beforeEach(() => {
  layout.height = 1000;
  Object.defineProperty(HTMLElement.prototype, "scrollHeight", { configurable: true, get: () => layout.height });
  Object.defineProperty(Element.prototype, "scrollTop", {
    configurable: true,
    get(this: Element) {
      return scrollTops.get(this) ?? 0;
    },
    set(this: Element, value: number) {
      scrollTops.set(this, value);
    },
  });
});

afterEach(() => {
  for (const [name, descriptor] of Object.entries(descriptors)) {
    if (descriptor) Object.defineProperty(name === "scrollTop" ? Element.prototype : HTMLElement.prototype, name, descriptor);
  }
});

const base = { windowSize: 60, batchSize: 40, resetKey: "session-1", enabled: true };

function renderScroll(initial: Omit<SessionScrollOptions, keyof typeof base>) {
  const current: { state?: SessionScrollState } = {};
  function Harness(props: SessionScrollOptions) {
    const state = useSessionScroll(props);
    current.state = state;
    return (
      <div ref={state.scrollRef} data-testid="scroll">
        <div ref={state.contentRef} />
      </div>
    );
  }
  const view = render(<Harness {...base} {...initial} />);
  const scroller = view.getByTestId("scroll");
  return {
    scroller,
    state: () => current.state!,
    rerender: (next: Omit<SessionScrollOptions, keyof typeof base>) => view.rerender(<Harness {...base} {...next} />),
    scrollUpToTop: () => act(() => fireEvent.wheel(scroller, { deltaY: -120 })),
  };
}

describe("useSessionScroll history paging", () => {
  it("asks for history once every local row is rendered and the reader reaches the top", () => {
    const onReachStart = vi.fn();
    const { scroller, scrollUpToTop } = renderScroll({ total: 10, firstKey: "e-50", onReachStart });
    scroller.scrollTop = 0;

    scrollUpToTop();

    expect(onReachStart).toHaveBeenCalledTimes(1);
  });

  it("renders older local rows before asking for history", () => {
    const onReachStart = vi.fn();
    const { scroller, state, scrollUpToTop } = renderScroll({ total: 200, firstKey: "e-0", onReachStart });
    scroller.scrollTop = 0;

    scrollUpToTop();

    expect(onReachStart).not.toHaveBeenCalled();
    expect(state().startIndex).toBe(100);
  });

  it("mounts a prepended page at once and keeps the reader on the row they were reading", () => {
    const { scroller, state, rerender, scrollUpToTop } = renderScroll({ total: 10, firstKey: "e-50", onReachStart: vi.fn() });
    scroller.scrollTop = 0;
    scrollUpToTop();

    const pageHeight = 400;
    layout.height += pageHeight;
    rerender({ total: 15, firstKey: "e-45", onReachStart: vi.fn() });

    expect(state().startIndex).toBe(0);
    expect(scroller.scrollTop).toBe(pageHeight);
  });

  it("does not move a reader scrolled up in the middle when new rows arrive at the bottom", () => {
    const { scroller, state, rerender, scrollUpToTop } = renderScroll({ total: 10, firstKey: "e-50" });
    scroller.scrollTop = 300;
    scrollUpToTop();

    layout.height += 200;
    rerender({ total: 12, firstKey: "e-50" });

    expect(state().startIndex).toBe(0);
    expect(scroller.scrollTop).toBe(300);
  });
});
