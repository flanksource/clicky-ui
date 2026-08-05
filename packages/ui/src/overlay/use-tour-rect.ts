import { useEffect, useState } from "react";
import { autoUpdate } from "@floating-ui/react";
import { anchorRadius, spotlightRect, type SpotlightRect } from "./tour-geometry";

/**
 * Keeps the spotlight cutout locked to its anchor through scrolling, resizing,
 * and layout shifts. Separate from the card's own `autoUpdate` subscription:
 * both are cheap, and feeding floating-ui a virtual reference built from this
 * rect would still need its own update trigger.
 */
export function useTourRect(
  anchor: HTMLElement | null,
  options: { padding: number; radius?: number | undefined },
): SpotlightRect | null {
  const { padding, radius } = options;
  const [rect, setRect] = useState<SpotlightRect | null>(null);

  useEffect(() => {
    if (!anchor) {
      setRect(null);
      return;
    }
    const view = anchor.ownerDocument.defaultView;
    if (!view) return;

    const measure = () => {
      setRect(
        spotlightRect({
          anchor: anchor.getBoundingClientRect(),
          padding,
          radius: radius ?? anchorRadius(anchor) + padding,
          viewport: { width: view.innerWidth, height: view.innerHeight },
        }),
      );
    };

    measure();
    // jsdom has no ResizeObserver, and autoUpdate constructs one unconditionally.
    if (typeof ResizeObserver === "undefined") return;
    return autoUpdate(anchor, anchor, measure);
  }, [anchor, padding, radius]);

  return rect;
}
