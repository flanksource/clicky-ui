import { useLayoutEffect, useState } from "react";

/**
 * Observes an element's width and reports whether it is at least `minWidth`.
 *
 * Measuring the CONTAINER rather than the content is deliberate: a component
 * that decides its own layout from its own rendered width feeds back into the
 * measurement (collapsing shrinks it, which then says it fits), so it needs
 * hysteresis to stop oscillating. A block-level container fills its column
 * regardless of what it holds, so its width is an independent input.
 *
 * An unmeasured element — width 0 in jsdom, or before the first layout —
 * reports true, so a component defaults to its roomy layout instead of
 * flashing collapsed.
 */
export function useContainerWiderThan(minWidth: number): {
  ref: (node: HTMLElement | null) => void;
  wider: boolean;
} {
  // A state setter is a stable callback ref that also re-runs the effect once
  // the node attaches; a plain useRef would measure nothing on first mount.
  const [node, setNode] = useState<HTMLElement | null>(null);
  const [wider, setWider] = useState(true);

  useLayoutEffect(() => {
    if (!node) return;
    const measure = () => {
      const width = node.getBoundingClientRect().width;
      const next = width <= 0 || width >= minWidth;
      setWider((prev) => (prev === next ? prev : next));
    };
    measure();

    // ResizeObserver is absent in older browsers and during SSR; the window
    // resize fallback still catches viewport-driven changes.
    const ResizeObserverCtor =
      typeof ResizeObserver === "undefined" ? null : ResizeObserver;
    if (!ResizeObserverCtor) {
      window.addEventListener("resize", measure);
      return () => window.removeEventListener("resize", measure);
    }
    const observer = new ResizeObserverCtor(measure);
    observer.observe(node);
    window.addEventListener("resize", measure);
    return () => {
      observer.disconnect();
      window.removeEventListener("resize", measure);
    };
  }, [node, minWidth]);

  return { ref: setNode, wider };
}
