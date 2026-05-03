import { useEffect, useLayoutEffect, useRef, useState, type ReactNode } from "react";
import { createPortal } from "react-dom";
import { cn } from "../lib/utils";

export type HoverCardPlacement = "top" | "bottom" | "left" | "right";

export type HoverCardProps = {
  trigger: ReactNode;
  children: ReactNode;
  placement?: HoverCardPlacement;
  delay?: number;
  arrow?: boolean;
  className?: string;
  cardClassName?: string;
};

const GAP_PX = 6;

type Position = { top: number; left: number };

// Grace period that lets the cursor cross the gap from the trigger to the
// portaled card without the card disappearing.
const HOVER_CLOSE_DELAY_MS = 120;

export function HoverCard({
  trigger,
  children,
  placement = "top",
  delay = 0,
  arrow = true,
  className,
  cardClassName,
}: HoverCardProps) {
  const [open, setOpen] = useState(false);
  const [position, setPosition] = useState<Position | null>(null);
  const triggerRef = useRef<HTMLSpanElement | null>(null);
  const cardRef = useRef<HTMLDivElement | null>(null);
  const openTimerRef = useRef<number | null>(null);
  const closeTimerRef = useRef<number | null>(null);

  const cancelClose = () => {
    if (closeTimerRef.current !== null) {
      window.clearTimeout(closeTimerRef.current);
      closeTimerRef.current = null;
    }
  };

  function onEnter() {
    cancelClose();
    if (delay > 0) {
      if (openTimerRef.current !== null) window.clearTimeout(openTimerRef.current);
      openTimerRef.current = window.setTimeout(() => setOpen(true), delay);
    } else {
      setOpen(true);
    }
  }
  function onLeave() {
    if (openTimerRef.current !== null) {
      window.clearTimeout(openTimerRef.current);
      openTimerRef.current = null;
    }
    cancelClose();
    closeTimerRef.current = window.setTimeout(() => setOpen(false), HOVER_CLOSE_DELAY_MS);
  }

  // Recompute position whenever the card opens or the viewport scrolls/resizes
  // while it's open. We position via fixed coordinates so the card escapes
  // every overflow-hidden / transform ancestor — important when the trigger
  // sits inside a table row, dropdown, or modal that would otherwise clip it.
  useLayoutEffect(() => {
    if (!open) return;
    const update = () => {
      const trigger = triggerRef.current;
      const card = cardRef.current;
      if (!trigger || !card) return;
      const t = trigger.getBoundingClientRect();
      const c = card.getBoundingClientRect();
      let top = 0;
      let left = 0;
      switch (placement) {
        case "top":
          top = t.top - c.height - GAP_PX;
          left = t.left + t.width / 2 - c.width / 2;
          break;
        case "bottom":
          top = t.bottom + GAP_PX;
          left = t.left + t.width / 2 - c.width / 2;
          break;
        case "left":
          top = t.top + t.height / 2 - c.height / 2;
          left = t.left - c.width - GAP_PX;
          break;
        case "right":
          top = t.top + t.height / 2 - c.height / 2;
          left = t.right + GAP_PX;
          break;
      }
      // Clamp to viewport so cards near the edge don't overflow off-screen.
      const margin = 4;
      left = Math.min(Math.max(margin, left), window.innerWidth - c.width - margin);
      top = Math.min(Math.max(margin, top), window.innerHeight - c.height - margin);
      setPosition({ top, left });
    };
    update();
    window.addEventListener("scroll", update, true);
    window.addEventListener("resize", update);
    return () => {
      window.removeEventListener("scroll", update, true);
      window.removeEventListener("resize", update);
    };
  }, [open, placement, children]);

  useEffect(() => {
    return () => {
      if (openTimerRef.current !== null) window.clearTimeout(openTimerRef.current);
      if (closeTimerRef.current !== null) window.clearTimeout(closeTimerRef.current);
    };
  }, []);

  const card =
    open && typeof document !== "undefined"
      ? createPortal(
          <div
            ref={cardRef}
            role="tooltip"
            onMouseEnter={cancelClose}
            onMouseLeave={onLeave}
            style={
              position
                ? { position: "fixed", top: position.top, left: position.left }
                : { position: "fixed", top: -9999, left: -9999, visibility: "hidden" }
            }
            className={cn(
              "z-[9999] rounded-md border border-border bg-background px-2.5 py-1.5 text-[11px] shadow-lg",
              "whitespace-nowrap",
              cardClassName,
            )}
          >
            {children}
            {arrow && position && <Arrow placement={placement} />}
          </div>,
          document.body,
        )
      : null;

  return (
    <span
      ref={triggerRef}
      className={cn("relative inline-flex items-center", className)}
      onMouseEnter={onEnter}
      onMouseLeave={onLeave}
      onFocus={onEnter}
      onBlur={onLeave}
    >
      {trigger}
      {card}
    </span>
  );
}

function Arrow({ placement }: { placement: HoverCardPlacement }) {
  // The arrow is a small rotated square clipped to look like a notch on the
  // card edge that points back at the trigger. Drawn relative to the card.
  const base = "absolute h-1.5 w-1.5 rotate-45 border bg-background border-border";
  switch (placement) {
    case "top":
      return (
        <span
          aria-hidden
          className={cn(base, "left-1/2 -translate-x-1/2 -bottom-0.5 border-l-0 border-t-0")}
        />
      );
    case "bottom":
      return (
        <span
          aria-hidden
          className={cn(base, "left-1/2 -translate-x-1/2 -top-0.5 border-r-0 border-b-0")}
        />
      );
    case "left":
      return (
        <span
          aria-hidden
          className={cn(base, "top-1/2 -translate-y-1/2 -right-0.5 border-l-0 border-b-0")}
        />
      );
    case "right":
      return (
        <span
          aria-hidden
          className={cn(base, "top-1/2 -translate-y-1/2 -left-0.5 border-r-0 border-t-0")}
        />
      );
  }
}
