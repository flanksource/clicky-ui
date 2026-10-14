import { createPortal } from "react-dom";
import { cn, useFloatingZIndex } from "@flanksource/clicky-ui";

import type { AnchorPin } from "./useDomAnchors";

export type CommentOverlayProps = {
  pins: AnchorPin[];
  focusedAnchor: string | null;
  onFocus: (anchor: string) => void;
};

/**
 * Draws numbered pins over the artifact. Renders as a sibling of the artifact
 * wrapper so that drawing pins never perturbs the observed content subtree.
 */
export function CommentOverlay(props: CommentOverlayProps) {
  return (
    <div className="pointer-events-none absolute inset-0 z-30">
      <Pins {...props} />
    </div>
  );
}

/**
 * Pins for anchors inside portaled dialogs: a fixed layer in `document.body`
 * stacked above the open modal, positioned with viewport boxes.
 */
export function DialogCommentOverlay(props: CommentOverlayProps) {
  const zIndex = useFloatingZIndex();
  if (props.pins.length === 0) return null;
  return createPortal(
    <div className="pointer-events-none fixed inset-0" style={{ zIndex }}>
      <Pins {...props} />
    </div>,
    document.body,
  );
}

function Pins({ pins, focusedAnchor, onFocus }: CommentOverlayProps) {
  return pins.map((pin) => (
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
  ));
}
