import { useLayoutEffect, useRef, useState, type RefObject } from "react";

const GAP = 8;
const MARGIN = 8;

export type AnchoredPosition = { left: number; top: number };

/**
 * Where a panel of `width`x`height` sits beside `reference` inside a viewport: to its right, else its
 * left, else under it, then kept inside the viewport margin.
 */
export function placeBeside(
  reference: Pick<DOMRect, "left" | "right" | "top" | "bottom">,
  panel: { width: number; height: number },
  viewport: { width: number; height: number },
): AnchoredPosition {
  const clamp = (value: number, size: number, limit: number) => Math.max(MARGIN, Math.min(value, limit - size - MARGIN));
  const right = reference.right + GAP;
  const left = reference.left - GAP - panel.width;
  if (right + panel.width + MARGIN <= viewport.width) return { left: right, top: clamp(reference.top, panel.height, viewport.height) };
  if (left >= MARGIN) return { left, top: clamp(reference.top, panel.height, viewport.height) };
  const below = reference.bottom + GAP;
  const top = below + panel.height + MARGIN <= viewport.height ? below : reference.top - GAP - panel.height;
  return { left: clamp(reference.left, panel.width, viewport.width), top: clamp(top, panel.height, viewport.height) };
}

/**
 * Keeps a fixed-position panel beside `reference` as the page scrolls, resizes or re-renders. A reference
 * that is hidden or detached keeps the last place it was seen, so the panel never jumps to the corner.
 */
export function useAnchoredPosition(reference: Element, panel: RefObject<HTMLElement | null>): AnchoredPosition {
  const lastRect = useRef(reference.getBoundingClientRect());
  const [position, setPosition] = useState<AnchoredPosition>({ left: MARGIN, top: MARGIN });

  useLayoutEffect(() => {
    const place = () => {
      const floating = panel.current;
      if (!floating) return;
      if (reference.isConnected && reference.getClientRects().length > 0) lastRect.current = reference.getBoundingClientRect();
      const next = placeBeside(
        lastRect.current,
        { width: floating.offsetWidth, height: floating.offsetHeight },
        { width: window.innerWidth, height: window.innerHeight },
      );
      setPosition((previous) => (previous.left === next.left && previous.top === next.top ? previous : next));
    };
    place();
    window.addEventListener("scroll", place, { capture: true, passive: true });
    window.addEventListener("resize", place);
    const observer = new ResizeObserver(place);
    observer.observe(reference);
    if (panel.current) observer.observe(panel.current);
    return () => {
      window.removeEventListener("scroll", place, { capture: true });
      window.removeEventListener("resize", place);
      observer.disconnect();
    };
  }, [reference, panel]);

  return position;
}
