import { act, fireEvent, render } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { useSessionScroll, type SessionScrollOptions, type SessionScrollState } from "./use-session-scroll";

// jsdom does no layout, so the scroll container's geometry is scripted: every
// element reports `layout.height` as its scrollHeight and `layout.viewport` as
// its clientHeight, and keeps the scrollTop it is given.
const layout = { height: 0, viewport: 0 };
const scrollTops = new WeakMap<Element, number>();
const descriptors = {
  scrollHeight: Object.getOwnPropertyDescriptor(HTMLElement.prototype, "scrollHeight"),
  clientHeight: Object.getOwnPropertyDescriptor(Element.prototype, "clientHeight"),
  scrollTop: Object.getOwnPropertyDescriptor(Element.prototype, "scrollTop"),
};

beforeEach(() => {
  layout.height = 1000;
  layout.viewport = 200;
  Object.defineProperty(HTMLElement.prototype, "scrollHeight", { configurable: true, get: () => layout.height });
  Object.defineProperty(Element.prototype, "clientHeight", { configurable: true, get: () => layout.viewport });
  Object.defineProperty(Element.prototype, "scrollTop", {
    configurable: true,
    get(this: Element) {
      return scrollTops.get(this) ?? 0;
    },
    set(this: Element, value: number) {
      scrollTops.set(this, Math.max(0, Math.min(value, layout.height - layout.viewport)));
    },
  });
});

afterEach(() => {
  for (const [name, descriptor] of Object.entries(descriptors)) {
    if (descriptor) Object.defineProperty(name === "scrollHeight" ? HTMLElement.prototype : Element.prototype, name, descriptor);
  }
});

const base = { windowSize: 60, batchSize: 40, resetKey: "session-1", enabled: true };
const bottom = () => layout.height - layout.viewport;

// SessionViewer renders no scroll container until the session has events, so the
// harness mirrors that: the container only mounts once `total` is non-zero.
function renderScroll(initial: Omit<SessionScrollOptions, keyof typeof base>) {
  const current: { state?: SessionScrollState } = {};
  function Harness(props: SessionScrollOptions) {
    const state = useSessionScroll(props);
    current.state = state;
    if (props.total === 0) return <p>empty</p>;
    return (
      <div ref={state.scrollRef} data-testid="scroll">
        <div ref={state.contentRef} />
      </div>
    );
  }
  const view = render(<Harness {...base} {...initial} />);
  return {
    scroller: () => view.getByTestId("scroll"),
    following: () => current.state!.following,
    rerender: (next: Omit<SessionScrollOptions, keyof typeof base>) => view.rerender(<Harness {...base} {...next} />),
  };
}

function scrollTo(el: HTMLElement, top: number) {
  act(() => {
    el.scrollTop = top;
    fireEvent.scroll(el);
  });
}

describe("useSessionScroll follow mode", () => {
  it("opens pinned to the newest row and following", () => {
    const { scroller, following } = renderScroll({ total: 10 });

    expect({ top: scroller().scrollTop, following: following() }).toEqual({ top: bottom(), following: true });
  });

  it("keeps following when content grows before the programmatic scroll event lands", () => {
    const { scroller, following } = renderScroll({ total: 10 });
    const grownBy = 600;
    layout.height += grownBy;

    act(() => {
      fireEvent.scroll(scroller());
    });

    expect({ top: scroller().scrollTop, following: following() }).toEqual({ top: bottom(), following: true });
  });

  it("pauses when the reader wheels up", () => {
    const { scroller, following } = renderScroll({ total: 10 });

    act(() => {
      fireEvent.wheel(scroller(), { deltaY: -120 });
    });

    expect(following()).toBe(false);
  });

  it("pauses when the reader drags the scrollbar up", () => {
    const { scroller, following } = renderScroll({ total: 10 });
    fireEvent.pointerDown(scroller());

    scrollTo(scroller(), 300);

    expect(following()).toBe(false);
  });

  it("pauses when the reader pages up with the keyboard", () => {
    const { scroller, following } = renderScroll({ total: 10 });
    fireEvent.keyDown(scroller(), { key: "PageUp" });

    scrollTo(scroller(), 300);

    expect(following()).toBe(false);
  });

  it("does not pause on a wheel up when the log fits and has no older rows", () => {
    layout.height = 150;
    const { scroller, following } = renderScroll({ total: 2 });

    act(() => {
      fireEvent.wheel(scroller(), { deltaY: -120 });
    });

    expect(following()).toBe(true);
  });

  it("tracks a scroll container that mounts after the first render", () => {
    const { scroller, following, rerender } = renderScroll({ total: 0 });
    rerender({ total: 10 });

    act(() => {
      fireEvent.wheel(scroller(), { deltaY: -120 });
    });

    expect(following()).toBe(false);
  });
});
