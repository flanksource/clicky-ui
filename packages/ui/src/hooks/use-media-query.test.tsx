import { renderHook, act } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

import { mediaMatches, onMediaChange, useMediaQuery } from "./use-media-query";

// The suite's setup.ts installs a matchMedia stub, so a test that wants the
// UNSUPPORTED environment has to take it away deliberately. That environment is
// the one this module exists for: jsdom ships no matchMedia, and every consumer
// of this library runs its tests there.
function withoutMatchMedia<T>(body: () => T): T {
  const original = window.matchMedia;
  // @ts-expect-error deleting an optional-in-practice browser API
  delete window.matchMedia;
  try {
    return body();
  } finally {
    window.matchMedia = original;
  }
}

type Listener = (event: MediaQueryListEvent) => void;

/** A matchMedia whose result can be flipped, to drive the change path. */
function fakeMatchMedia(initial: boolean) {
  const listeners = new Set<Listener>();
  let matches = initial;
  const install = vi.fn((query: string) => ({
    // A getter, because the real MediaQueryList.matches is LIVE — it reflects
    // the environment at read time, which is why a change listener can read it
    // rather than being handed the value. A frozen property here would make the
    // fake disagree with the browser and hide that.
    get matches() {
      return matches;
    },
    media: query,
    onchange: null,
    addEventListener: (_: string, fn: Listener) => listeners.add(fn),
    removeEventListener: (_: string, fn: Listener) => listeners.delete(fn),
    addListener: (fn: Listener) => listeners.add(fn),
    removeListener: (fn: Listener) => listeners.delete(fn),
    dispatchEvent: () => false,
  })) as unknown as typeof window.matchMedia;

  window.matchMedia = install;
  return {
    install,
    listenerCount: () => listeners.size,
    flip(next: boolean) {
      matches = next;
      for (const fn of listeners) {
        fn({ matches: next } as MediaQueryListEvent);
      }
    },
  };
}

const original = window.matchMedia;
afterEach(() => {
  window.matchMedia = original;
});

describe("mediaMatches", () => {
  it("answers the query when the environment can be asked", () => {
    fakeMatchMedia(true);

    expect(mediaMatches("(max-width: 639px)")).toBe(true);
  });

  it("answers false rather than throwing where matchMedia does not exist", () => {
    // The regression this module exists to stop: an unguarded call took down
    // every consumer's test file that happened to render the component.
    withoutMatchMedia(() => {
      expect(() => mediaMatches("(max-width: 639px)")).not.toThrow();
      expect(mediaMatches("(max-width: 639px)")).toBe(false);
    });
  });

  // false means "this narrow-viewport / reduced-motion condition does not
  // apply", which is the desktop, full-motion default every caller wants when
  // the question cannot be asked.
  it("passes the query through verbatim", () => {
    const media = fakeMatchMedia(false);

    mediaMatches("(prefers-reduced-motion: reduce)");

    expect(media.install).toHaveBeenCalledWith("(prefers-reduced-motion: reduce)");
  });
});

describe("onMediaChange", () => {
  it("reports a change and stops after unsubscribing", () => {
    const media = fakeMatchMedia(false);
    const seen: boolean[] = [];

    const stop = onMediaChange("(prefers-color-scheme: dark)", (matches) =>
      seen.push(matches),
    );
    media.flip(true);
    stop();
    media.flip(false);

    expect(seen).toEqual([true]);
    expect(media.listenerCount()).toBe(0);
  });

  it("returns a working unsubscribe where matchMedia does not exist", () => {
    // A caller unsubscribes from a React cleanup, which runs whether or not the
    // subscribe did anything — so returning undefined here would turn a missing
    // API into a crash on unmount.
    withoutMatchMedia(() => {
      const stop = onMediaChange("(prefers-color-scheme: dark)", () => {});

      expect(() => stop()).not.toThrow();
    });
  });

  // Safari below 14 has MediaQueryList without addEventListener. The library
  // supports it via addListener, and dropping that would silently stop theme
  // switching there rather than fail loudly.
  it("falls back to addListener when addEventListener is absent", () => {
    const listeners = new Set<Listener>();
    window.matchMedia = ((query: string) => ({
      matches: false,
      media: query,
      onchange: null,
      addListener: (fn: Listener) => listeners.add(fn),
      removeListener: (fn: Listener) => listeners.delete(fn),
      dispatchEvent: () => false,
    })) as unknown as typeof window.matchMedia;

    const stop = onMediaChange("(prefers-color-scheme: dark)", () => {});
    expect(listeners.size).toBe(1);

    stop();
    expect(listeners.size).toBe(0);
  });
});

describe("useMediaQuery", () => {
  it("starts from the current match and re-renders when it changes", () => {
    const media = fakeMatchMedia(false);

    const { result } = renderHook(() => useMediaQuery("(max-width: 639px)"));
    expect(result.current).toBe(false);

    act(() => media.flip(true));

    expect(result.current).toBe(true);
  });

  it("renders false and subscribes to nothing where matchMedia does not exist", () => {
    withoutMatchMedia(() => {
      const { result, unmount } = renderHook(() =>
        useMediaQuery("(max-width: 639px)"),
      );

      expect(result.current).toBe(false);
      expect(() => unmount()).not.toThrow();
    });
  });

  it("drops its subscription on unmount", () => {
    const media = fakeMatchMedia(false);

    const { unmount } = renderHook(() => useMediaQuery("(max-width: 639px)"));
    expect(media.listenerCount()).toBe(1);

    unmount();

    expect(media.listenerCount()).toBe(0);
  });
});
