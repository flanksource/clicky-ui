import {
  useCallback,
  useRef,
  useState,
  type CSSProperties,
  type ReactNode,
} from "react";
import { cn } from "../lib/utils";

export type SplitPaneProps = {
  /** Content rendered in the left pane. */
  left: ReactNode;
  /** Content rendered in the right pane. */
  right: ReactNode;
  /** Initial left-pane width as a percentage. */
  defaultSplit?: number;
  /** Minimum left-pane width as a percentage. */
  minLeft?: number;
  /** Minimum right-pane width as a percentage. */
  minRight?: number;
  /** Classes applied to the left pane. */
  leftClass?: string;
  /** Classes applied to the right pane. */
  rightClass?: string;
  /** Classes applied to the root split container. */
  className?: string;
  /** Stack the panes and hide the resize handle below the `md` breakpoint. */
  stackOnMobile?: boolean;
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
  stackOnMobile = false,
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
    <div
      ref={container}
      className={cn(
        "flex h-full flex-1 overflow-hidden",
        stackOnMobile && "flex-col md:flex-row",
        className,
      )}
    >
      <div
        style={
          stackOnMobile
            ? ({ "--split-pane-width": `${split}%` } as CSSProperties)
            : { width: `${split}%` }
        }
        className={cn(
          "min-h-0 overflow-y-auto bg-background",
          stackOnMobile && "w-full md:w-[var(--split-pane-width)]",
          leftClass,
        )}
      >
        {left}
      </div>
      <div
        role="separator"
        aria-orientation="vertical"
        className={cn(
          "w-1 shrink-0 cursor-col-resize bg-border transition-colors hover:bg-primary",
          stackOnMobile && "hidden md:block",
        )}
        onMouseDown={onMouseDown}
      />
      <div
        style={
          stackOnMobile
            ? ({ "--split-pane-width": `${100 - split}%` } as CSSProperties)
            : { width: `${100 - split}%` }
        }
        className={cn(
          "min-h-0 overflow-hidden bg-background",
          stackOnMobile && "w-full md:w-[var(--split-pane-width)]",
          rightClass,
        )}
      >
        {right}
      </div>
    </div>
  );
}
