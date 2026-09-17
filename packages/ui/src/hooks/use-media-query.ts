import { useEffect, useState } from "react";

/**
 * One place that asks the environment a media question, for every component in
 * this library that needs one.
 *
 * `window.matchMedia` is not universally present. jsdom does not implement it
 * at all, which matters more than it sounds: this library's own suite installs
 * a stub in `src/test/setup.ts`, so an unguarded call passes here and then
 * throws `window.matchMedia is not a function` in every CONSUMER's test file
 * that happens to render the component. That failure names the consumer's test,
 * not the component, so it reads as their regression rather than ours. It is
 * also absent during SSR, where there is no window at all.
 *
 * The rule these helpers encode: a media query that cannot be asked answers
 * FALSE. Every query in this library is phrased so false is the safe default —
 * not a narrow viewport, not reduced motion, not a dark colour scheme — so a
 * component in an environment that cannot answer renders the ordinary desktop,
 * full-motion, light case rather than failing.
 */

/** Whether the environment matches `query` right now. False when it cannot be asked. */
export function mediaMatches(query: string): boolean {
  const media = queryList(query);
  return media ? media.matches : false;
}

/**
 * Calls `onChange` whenever `query` starts or stops matching, and returns an
 * unsubscribe.
 *
 * The unsubscribe is always callable, including where matchMedia is missing:
 * callers invoke it from a React cleanup, which runs whether or not the
 * subscribe did anything, so returning nothing would turn an absent API into a
 * crash on unmount.
 */
export function onMediaChange(
  query: string,
  onChange: (matches: boolean) => void,
): () => void {
  const media = queryList(query);
  if (!media) return () => {};

  const listener = () => onChange(media.matches);
  // addEventListener is the modern form; addListener is deprecated but is all
  // Safari before 14 has, and dropping it would silently stop theme switching
  // there rather than fail visibly.
  if (media.addEventListener) {
    media.addEventListener("change", listener);
    return () => media.removeEventListener("change", listener);
  }
  media.addListener?.(listener);
  return () => media.removeListener?.(listener);
}

/** `mediaMatches` as a hook: re-renders when the answer changes. */
export function useMediaQuery(query: string): boolean {
  const [matches, setMatches] = useState(() => mediaMatches(query));

  useEffect(() => {
    // Re-read on subscribe: the query may have changed, or the environment may
    // have moved between the initial render and this effect.
    setMatches(mediaMatches(query));
    return onMediaChange(query, setMatches);
  }, [query]);

  return matches;
}

function queryList(query: string): MediaQueryList | null {
  if (typeof window === "undefined" || typeof window.matchMedia !== "function") {
    return null;
  }
  return window.matchMedia(query);
}
