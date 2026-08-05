import { useEffect, useState, type RefObject } from "react";
import { cn } from "@flanksource/clicky-ui";

import { cssPath, elementBoxWithin, type Box } from "./dom-anchor";
import type { AnchorPin } from "./useDomAnchors";

export type CommentOverlayProps = {
  /** Comment mode: clicks pick an element instead of reaching the artifact. */
  active: boolean;
  scrollRef: RefObject<HTMLElement | null>;
  contentRef: RefObject<HTMLElement | null>;
  pins: AnchorPin[];
  focusedAnchor: string | null;
  onPick: (anchor: string) => void;
  onFocus: (anchor: string) => void;
};

/**
 * Draws numbered pins over the artifact and, in comment mode, turns a click on
 * any element into a `CommentAnchor`. Renders as a sibling of the artifact
 * wrapper so that drawing pins never perturbs the observed content subtree.
 */
export function CommentOverlay({
  active,
  scrollRef,
  contentRef,
  pins,
  focusedAnchor,
  onPick,
  onFocus,
}: CommentOverlayProps) {
  const [hover, setHover] = useState<Box | null>(null);

  useEffect(() => {
    if (!active) {
      setHover(null);
      return;
    }
    const scroll = scrollRef.current;
    const content = contentRef.current;
    if (!scroll || !content) return;

    const handleMove = (event: MouseEvent) => {
      const target = event.target;
      if (!(target instanceof HTMLElement) || !content.contains(target)) {
        setHover(null);
        return;
      }
      setHover(elementBoxWithin(target, scroll));
    };
    const handleLeave = () => setHover(null);
    const handleClick = (event: MouseEvent) => {
      const target = event.target;
      if (!(target instanceof HTMLElement) || !content.contains(target)) return;
      // Capture phase: the artifact's own handlers must not fire while picking.
      event.preventDefault();
      event.stopPropagation();
      onPick(cssPath(target, content));
    };

    content.addEventListener("mousemove", handleMove);
    content.addEventListener("mouseleave", handleLeave);
    content.addEventListener("click", handleClick, true);
    return () => {
      content.removeEventListener("mousemove", handleMove);
      content.removeEventListener("mouseleave", handleLeave);
      content.removeEventListener("click", handleClick, true);
    };
  }, [active, contentRef, onPick, scrollRef]);

  return (
    <div className="pointer-events-none absolute inset-0 z-30">
      {active && hover && (
        <div
          data-testid="comment-hover-outline"
          className="absolute rounded-sm bg-primary/5 ring-2 ring-primary/70"
          style={{ left: hover.left, top: hover.top, width: hover.width, height: hover.height }}
        />
      )}

      {pins.map((pin) => (
        <button
          key={pin.anchor}
          type="button"
          data-testid="comment-pin"
          onClick={() => onFocus(pin.anchor)}
          title={`${pin.count} comment${pin.count === 1 ? "" : "s"}`}
          style={{ left: pin.box.left + pin.box.width, top: pin.box.top }}
          className={cn(
            "pointer-events-auto absolute grid h-5 min-w-5 -translate-x-1/2 -translate-y-1/2",
            "place-items-center rounded-full border px-1 text-[10px] font-semibold shadow-sm",
            "transition-colors",
            focusedAnchor === pin.anchor
              ? "border-primary bg-primary text-primary-foreground"
              : "border-border bg-background text-foreground hover:border-primary hover:text-primary",
          )}
        >
          {pin.index}
        </button>
      ))}
    </div>
  );
}
