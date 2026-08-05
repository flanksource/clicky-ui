import { useEffect, useRef, useState } from "react";
import { resolveAnchor } from "./tour-anchor";
import type { TourRootSource, TourTarget } from "./tour-types";

/**
 * React lifecycle around `resolveAnchor`: one bounded wait per step, aborted when
 * the step changes or the tour unmounts, plus the scroll-into-view that makes the
 * spotlight land somewhere the operator can actually see.
 */

export type TourAnchorState = "idle" | "waiting" | "found" | "missing";

export type UseTourAnchorOptions = {
  root: TourRootSource;
  /** Omit for an anchorless (centred) step; the hook then reports `idle`. */
  target?: TourTarget | undefined;
  timeoutMs: number;
  /** Scroll the anchor into view once it resolves. Defaults to `true`. */
  scrollIntoView?: boolean | undefined;
  /** Changes to this restart the wait — pass the step id. */
  key: string;
};

export type UseTourAnchorResult = {
  anchor: HTMLElement | null;
  state: TourAnchorState;
};

function prefersReducedMotion(element: HTMLElement): boolean {
  const view = element.ownerDocument.defaultView;
  return view?.matchMedia?.("(prefers-reduced-motion: reduce)").matches ?? false;
}

export function useTourAnchor(options: UseTourAnchorOptions): UseTourAnchorResult {
  const { root, target, timeoutMs, scrollIntoView = true, key } = options;
  const [result, setResult] = useState<UseTourAnchorResult>({ anchor: null, state: "idle" });
  const scrollRef = useRef(scrollIntoView);
  scrollRef.current = scrollIntoView;

  useEffect(() => {
    if (target === undefined) {
      setResult({ anchor: null, state: "idle" });
      return;
    }

    setResult({ anchor: null, state: "waiting" });
    const controller = new AbortController();

    void resolveAnchor({ root, target, timeoutMs, signal: controller.signal }).then(
      (resolution) => {
        if (controller.signal.aborted) return;
        if (resolution.status !== "found") {
          setResult({ anchor: null, state: "missing" });
          return;
        }
        setResult({ anchor: resolution.element, state: "found" });
        if (!scrollRef.current || !resolution.element.scrollIntoView) return;
        resolution.element.scrollIntoView({
          block: "center",
          inline: "nearest",
          behavior: prefersReducedMotion(resolution.element) ? "auto" : "smooth",
        });
      },
    );

    return () => controller.abort();
    // `root` and `target` are re-created per render by most callers; `key` (the
    // step id) is the identity that should restart the wait.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key, timeoutMs]);

  return result;
}
