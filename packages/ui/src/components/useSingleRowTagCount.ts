import { useEffect, useLayoutEffect, useState, type RefObject } from "react";

const ROW_FLOW = "[data-combobox-tag], [data-combobox-more], input";

type TagFit = {
  key: string;
  width: number;
  min: number;
  max: number;
  count: number;
};

export function useSingleRowTagCount(
  anchorRef: RefObject<HTMLDivElement | null>,
  values: string[],
): number {
  const [fit, setFit] = useState<TagFit>();
  const [width, setWidth] = useState(0);
  const key = values.join("\u0000");
  const current = fit?.key === key && fit.width === width ? fit : undefined;
  const count = current?.count ?? values.length;

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
    const anchor = anchorRef.current;
    if (!anchor || count === 0) return;
    const flow = [...anchor.children].filter(
      (child): child is HTMLElement =>
        child instanceof HTMLElement && child.matches(ROW_FLOW),
    );
    const first = flow[0];
    if (!first) return;
    const threshold = first.offsetTop + Math.max(first.offsetHeight / 2, 1);
    const wraps = flow.some((element) => element.offsetTop > threshold);

    // Try all tags without the overflow chip first, then narrow the range each layout pass.
    const min = wraps ? (current && current.min < count ? current.min : 0) : count;
    const max = wraps ? count - 1 : (current?.max ?? values.length);
    const next = Math.ceil((min + max) / 2);
    if (next !== count) setFit({ key, width, min, max, count: next });
  });

  return count;
}
