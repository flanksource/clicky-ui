import { useLayoutEffect, useRef, useState, type ReactNode } from "react";
import { useCommentState } from "./comment-persistence";

export function CommentPreview({ id, lines, children }: { id: string; lines: number; children: ReactNode }) {
  const content = useRef<HTMLDivElement>(null);
  const [expanded, setExpanded] = useCommentState(`preview:${id}`, false);
  const [overflow, setOverflow] = useState(false);
  useLayoutEffect(() => {
    const element = content.current;
    if (!element) return;
    const measure = () => {
      const lineHeight = Number.parseFloat(getComputedStyle(element).lineHeight);
      setOverflow(element.scrollHeight > lineHeight * lines + 1);
    };
    measure();
    const observer = typeof ResizeObserver === "undefined" ? null : new ResizeObserver(measure);
    observer?.observe(element);
    return () => observer?.disconnect();
  }, [children, lines]);
  return <div>
    <div ref={content} data-comment-preview="" className="overflow-hidden"
      style={!expanded ? { display: "-webkit-box", WebkitBoxOrient: "vertical", WebkitLineClamp: lines, maxHeight: `${lines * 1.25}rem` } : undefined}>
      {children}
    </div>
    {overflow && <button type="button" className="mt-1 text-xs font-medium text-primary hover:underline" aria-expanded={expanded}
      onClick={event => { event.stopPropagation(); setExpanded(!expanded); }}>{expanded ? "Show less" : "Show more"}</button>}
  </div>;
}
