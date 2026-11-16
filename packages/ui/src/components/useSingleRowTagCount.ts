import { useEffect, useLayoutEffect, useState, type RefObject } from "react";

const ROW_FLOW = "[data-combobox-tag], [data-combobox-more], input";

/**
 * How many leading tags fit on the control's first row beside the "+N more"
 * chip and the input. Starts from all of them and drops one per layout pass
 * until nothing wraps; a new selection or control width measures again.
 */
export function useSingleRowTagCount(
  anchorRef: RefObject<HTMLDivElement | null>,
  values: string[],
): number {
  const [limit, setLimit] = useState<number>();
  const [width, setWidth] = useState(0);
  const key = values.join("\u0000");
  useEffect(() => {
    const anchor = anchorRef.current;
    if (!anchor || typeof ResizeObserver === "undefined") return;
    const observer = new ResizeObserver(([entry]) => {
      if (entry) setWidth(Math.round(entry.contentRect.width));
    });
    observer.observe(anchor);
    return () => observer.disconnect();
  }, [anchorRef]);
  useLayoutEffect(() => {
    setLimit(undefined);
  }, [key, width]);
  useLayoutEffect(() => {
    const anchor = anchorRef.current;
    if (!anchor || !values.length) return;
    const flow = [...anchor.children].filter(
      (child): child is HTMLElement =>
        child instanceof HTMLElement && child.matches(ROW_FLOW),
    );
    const first = flow[0];
    if (!first) return;
    const threshold = first.offsetTop + Math.max(first.offsetHeight / 2, 1);
    if (!flow.some((element) => element.offsetTop > threshold)) return;
    setLimit((current) => Math.max(0, (current ?? values.length) - 1));
  });
  return Math.min(limit ?? values.length, values.length);
}
