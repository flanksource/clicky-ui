import { useEffect, useLayoutEffect, useRef, useState, type RefObject } from "react";
import { measureAnchors, type AnchorMode, type Box } from "./geometry";

const NARROW_WIDTH = 640;

/** Rendered height of each margin card, keyed by anchor, kept current by one ResizeObserver. */
export function useCardHeights() {
  const [heights, setHeights] = useState<Record<string, number>>({});
  const observer = useRef<ResizeObserver | null>(null);
  const refs = useRef(new Map<string, (el: HTMLDivElement | null) => void>());
  useEffect(() => () => observer.current?.disconnect(), []);

  const observe = () =>
    (observer.current ??= new ResizeObserver((entries) =>
      setHeights((prev) => {
        let next = prev;
        for (const entry of entries) {
          const el = entry.target as HTMLElement;
          const anchor = el.dataset.cardAnchor ?? "";
          if (prev[anchor] !== el.offsetHeight) next = { ...next, [anchor]: el.offsetHeight };
        }
        return next;
      }),
    ));

  const refFor = (anchor: string) => {
    let ref = refs.current.get(anchor);
    if (!ref) {
      let current: HTMLDivElement | null = null;
      ref = (el) => {
        if (current) observe().unobserve(current);
        current = el;
        if (el) observe().observe(el);
      };
      refs.current.set(anchor, ref);
    }
    return ref;
  };
  return { heights, refFor };
}

/** Anchor boxes and document height, re-measured as the markdown renders and reflows. */
export function useAnchorBoxes({
  origin,
  markdown,
  anchors,
  mode,
  visible,
}: {
  origin: RefObject<HTMLDivElement | null>;
  markdown: RefObject<HTMLDivElement | null>;
  anchors: readonly string[];
  mode: AnchorMode;
  /** A hidden document measures as zero, so the last boxes are kept until it shows again. */
  visible: boolean;
}) {
  const [boxes, setBoxes] = useState(new Map<string, Box[]>());
  const [height, setHeight] = useState(0);
  const [width, setWidth] = useState(0);
  useLayoutEffect(() => {
    const originEl = origin.current;
    const markdownEl = markdown.current;
    if (!originEl || !markdownEl || !visible) return;
    const sync = () => {
      setBoxes(measureAnchors({ origin: originEl, markdown: markdownEl, anchors, mode }));
      setHeight(originEl.offsetHeight);
      setWidth(originEl.offsetWidth);
    };
    sync();
    const mutations = new MutationObserver(sync);
    mutations.observe(markdownEl, { childList: true, subtree: true, characterData: true });
    const resizes = new ResizeObserver(sync);
    resizes.observe(markdownEl);
    return () => {
      mutations.disconnect();
      resizes.disconnect();
    };
  }, [origin, markdown, anchors, mode, visible]);
  return { boxes, height, width };
}

export function useNarrow(ref: RefObject<HTMLDivElement | null>) {
  const [narrow, setNarrow] = useState(false);
  useLayoutEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new ResizeObserver(() => setNarrow(el.offsetWidth < NARROW_WIDTH));
    observer.observe(el);
    return () => observer.disconnect();
  }, [ref]);
  return narrow;
}
