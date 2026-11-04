import { useLayoutEffect, useRef, type CSSProperties, type ReactNode, type Ref } from "react";
import { ResizeHandle } from "../layout/ResizeHandle";
import { useCommentRailWidth } from "./use-comment-rail-width";
import { cn } from "../lib/utils";
import { useState } from "react";

export type CommentRailProps = {
  children: ReactNode;
  className?: string;
  style?: CSSProperties;
  width?: number;
  onWidthChange?: (width: number) => void;
  /** Match the host's existing stacked layout. */
  stacked?: boolean;
  scrollRef?: Ref<HTMLDivElement>;
};

/** A right comment rail; only the content scrolls, keeping the divider reachable. */
export function CommentRail({ children, className, style, width, onWidthChange, stacked, scrollRef }: CommentRailProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [preferred, setPreferred] = useCommentRailWidth();
  const [available, setAvailable] = useState(960);
  useLayoutEffect(() => {
    const parent = ref.current?.parentElement;
    if (!parent) return;
    const update = () => setAvailable(parent.clientWidth);
    update();
    const observer = typeof ResizeObserver === "undefined" ? null : new ResizeObserver(update);
    observer?.observe(parent);
    return () => observer?.disconnect();
  }, []);
  const narrow = stacked ?? available < 640;
  const max = Math.max(280, Math.min(640, available - 320));
  const actual = Math.max(280, Math.min(max, width ?? preferred));
  return <div ref={ref} data-comment-rail="" className={cn("relative min-h-0 shrink-0 border-border bg-background", narrow ? "w-full border-t" : "border-l", className)}
    style={{ ...style, ...(!narrow ? { width: actual } : {}) }}>
    {!narrow && <ResizeHandle orientation="vertical" value={actual} min={280} max={max} pointerFactor={-1} label="Resize comment sidebar" className="left-0" onChange={onWidthChange ?? setPreferred} />}
    <div ref={scrollRef} className="h-full overflow-y-auto overscroll-contain" data-comment-rail-scroll="">{children}</div>
  </div>;
}
