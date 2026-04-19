import { useCallback, useRef, useState, type ReactNode } from "react";
import { cn } from "../lib/utils";

export type SplitPaneProps = {
  left: ReactNode;
  right: ReactNode;
  defaultSplit?: number;
  minLeft?: number;
  minRight?: number;
  leftClass?: string;
  rightClass?: string;
  className?: string;
};

export function SplitPane({
  left,
  right,
  defaultSplit = 50,
  minLeft = 20,
  minRight = 20,
  leftClass,
  rightClass,
  className,
}: SplitPaneProps) {
  const [split, setSplit] = useState(defaultSplit);
  const dragging = useRef(false);
  const container = useRef<HTMLDivElement>(null);

  const onMouseDown = useCallback(
    (e: React.MouseEvent) => {
      e.preventDefault();
      dragging.current = true;

      const onMove = (ev: MouseEvent) => {
        if (!dragging.current || !container.current) return;
        const rect = container.current.getBoundingClientRect();
        const pct = ((ev.clientX - rect.left) / rect.width) * 100;
        setSplit(Math.max(minLeft, Math.min(100 - minRight, pct)));
      };

      const onUp = () => {
        dragging.current = false;
        document.removeEventListener("mousemove", onMove);
        document.removeEventListener("mouseup", onUp);
        document.body.style.cursor = "";
        document.body.style.userSelect = "";
      };

      document.addEventListener("mousemove", onMove);
      document.addEventListener("mouseup", onUp);
      document.body.style.cursor = "col-resize";
      document.body.style.userSelect = "none";
    },
    [minLeft, minRight],
  );

  return (
    <div ref={container} className={cn("flex flex-1 overflow-hidden min-h-0", className)}>
      <div
        style={{ width: `${split}%` }}
        className={cn("overflow-y-auto bg-background min-h-0", leftClass)}
      >
        {left}
      </div>
      <div
        role="separator"
        aria-orientation="vertical"
        className="w-1 bg-border hover:bg-primary cursor-col-resize shrink-0 transition-colors"
        onMouseDown={onMouseDown}
      />
      <div
        style={{ width: `${100 - split}%` }}
        className={cn("overflow-hidden bg-background min-h-0", rightClass)}
      >
        {right}
      </div>
    </div>
  );
}
