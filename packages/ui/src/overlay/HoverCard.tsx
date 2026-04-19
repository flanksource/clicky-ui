import { useState, type ReactNode } from "react";
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

const placementPos: Record<HoverCardPlacement, string> = {
  top: "bottom-full left-1/2 -translate-x-1/2 mb-1.5",
  bottom: "top-full left-1/2 -translate-x-1/2 mt-1.5",
  left: "right-full top-1/2 -translate-y-1/2 mr-1.5",
  right: "left-full top-1/2 -translate-y-1/2 ml-1.5",
};

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
  const timer = useState<number | null>(null);

  function onEnter() {
    if (delay > 0) {
      const id = window.setTimeout(() => setOpen(true), delay);
      timer[1](id);
    } else {
      setOpen(true);
    }
  }
  function onLeave() {
    if (timer[0] !== null) window.clearTimeout(timer[0]);
    setOpen(false);
  }

  return (
    <span
      className={cn("relative inline-flex items-center", className)}
      onMouseEnter={onEnter}
      onMouseLeave={onLeave}
      onFocus={onEnter}
      onBlur={onLeave}
    >
      {trigger}
      {open && (
        <div
          role="tooltip"
          className={cn(
            "absolute z-20 bg-background border border-border rounded-md shadow-lg px-2.5 py-1.5 whitespace-nowrap text-[11px]",
            placementPos[placement],
            cardClassName,
          )}
        >
          {children}
          {arrow && placement === "top" && (
            <div className="absolute top-full left-1/2 -translate-x-1/2 -mt-px">
              <div className="w-1.5 h-1.5 bg-background border-b border-r border-border rotate-45 -translate-y-1" />
            </div>
          )}
        </div>
      )}
    </span>
  );
}
