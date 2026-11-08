import { useCallback, useLayoutEffect, useRef } from "react";
import { createPortal } from "react-dom";
import {
  autoUpdate,
  flip,
  offset,
  shift,
  size,
  useFloating,
} from "@floating-ui/react";
import { useFloatingZIndex } from "../overlay/modalStack";
import {
  CommentDraftCard,
  type CommentDraftCardProps,
} from "./CommentDraftCard";

export type CommentDraftPopoverProps = CommentDraftCardProps & {
  reference: Element;
};

export function CommentDraftPopover({
  reference,
  onDiscard,
  ...props
}: CommentDraftPopoverProps) {
  const floatingZ = useFloatingZIndex();
  const lastRect = useRef(reference.getBoundingClientRect());
  const position = useCallback(() => {
    if (reference.isConnected && reference.getClientRects().length)
      lastRect.current = reference.getBoundingClientRect();
    return lastRect.current;
  }, [reference]);
  const { refs, floatingStyles } = useFloating({
    strategy: "fixed",
    placement: "bottom-start",
    whileElementsMounted: autoUpdate,
    middleware: [
      offset(6),
      flip(),
      shift({ padding: 8 }),
      size({
        padding: 8,
        apply({ availableHeight, elements }) {
          elements.floating.style.maxHeight = `${Math.max(0, availableHeight)}px`;
        },
      }),
    ],
  });
  useLayoutEffect(() => {
    refs.setReference(reference);
    refs.setPositionReference({
      getBoundingClientRect: position,
      contextElement: reference,
    });
  }, [position, reference, refs]);
  return createPortal(
    <div
      ref={refs.setFloating}
      role="dialog"
      aria-label={`New comment on ${props.label}`}
      data-comment-draft={props.anchor}
      style={{ ...floatingStyles, zIndex: floatingZ }}
      className="w-[min(320px,calc(100vw-16px))] overflow-y-auto rounded-lg border border-primary/50 bg-card shadow-lg"
    >
      <CommentDraftCard
        {...props}
        onDiscard={onDiscard}
      />
    </div>,
    document.body,
  );
}
