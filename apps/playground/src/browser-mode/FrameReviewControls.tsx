import { useLayoutEffect, useRef, useState, type ReactNode, type RefObject } from "react";
import type { ReviewElement } from "@flanksource/page-runtime/host";
import { hostRect, reviewToolbarLeft } from "./project";

export function FrameReviewControls({ element, frame, scrollRef, decision, children }: { element: ReviewElement; frame: HTMLIFrameElement; scrollRef: RefObject<HTMLElement | null>; decision: string | undefined; children: ReactNode }) {
  const target = useRef<HTMLDivElement>(null);
  const [position, setPosition] = useState({ left: 0, top: 0, width: 0 });
  useLayoutEffect(() => {
    if (!target.current) throw new Error("Review controls are not mounted");
    const frameRect = frame.getBoundingClientRect();
    const box = hostRect({ frame: frameRect, rect: element.selection.rect });
    const scroll = scrollRef.current;
    if (!scroll) throw new Error("Review scroll region is unavailable");
    const origin = scroll.getBoundingClientRect();
    const next = { left: reviewToolbarLeft({ frame: frameRect, right: box.x + box.width, width: target.current.offsetWidth }) - origin.left + scroll.scrollLeft, top: box.y - origin.top + scroll.scrollTop, width: frameRect.width };
    setPosition(previous => previous.left === next.left && previous.top === next.top && previous.width === next.width ? previous : next);
  }, [element, frame, scrollRef, decision]);
  return <div ref={target} data-review-controls-for={element.id} className="pointer-events-auto absolute flex flex-wrap items-center gap-1 rounded border border-border bg-background p-1 text-xs shadow-sm" style={{ left: position.left, top: position.top, ...(position.width ? { maxWidth: position.width } : {}) }}>{children}</div>;
}
