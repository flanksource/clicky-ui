import { useEffect, useLayoutEffect, useMemo, useRef, useState, type RefObject } from "react";
import { elementDrift, type DriftState } from "../../comments/anchoring/drift";
import { ELEMENT_PREFIX, resolveElementAnchor } from "../../comments/anchoring/dom-anchor";
import { measureAnchors, type AnchorMode, type Box } from "./geometry";
import type { PatchLineRange } from "./patch-comments";

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
  patchRanges,
  visible,
}: {
  origin: RefObject<HTMLDivElement | null>;
  markdown: RefObject<HTMLDivElement | null>;
  anchors: readonly string[];
  mode: AnchorMode;
  /** Current source lines of the `r:` anchors that are placed, so they are boxed on the blocks covering them. */
  patchRanges?: ReadonlyMap<string, PatchLineRange>;
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
      setBoxes(measureAnchors({ origin: originEl, markdown: markdownEl, anchors, mode, ...(patchRanges ? { patchRanges } : {}) }));
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
  }, [origin, markdown, anchors, mode, patchRanges, visible]);
  const currentBoxes = useMemo(() => {
    const current = new Set(anchors);
    return new Map([...boxes].filter(([anchor]) => current.has(anchor)));
  }, [boxes, anchors]);
  return { boxes: currentBoxes, height, width };
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

/**
 * Where each `e:` anchor sits in the rendered markdown: null when its element
 * is found and its locators agree, else why not (`orphaned` when gone, `moved`
 * when only some locators find it). Resolved against the DOM whether or not it
 * is visible, so a thread in drift can be listed from any tab. An anchor not
 * yet resolved is absent from the map.
 */
export function useElementDrift({
  markdown,
  anchors,
}: {
  markdown: RefObject<HTMLDivElement | null>;
  anchors: readonly string[];
}): ReadonlyMap<string, DriftState | null> {
  const [drift, setDrift] = useState<ReadonlyMap<string, DriftState | null>>(new Map());
  useLayoutEffect(() => {
    const root = markdown.current;
    const elements = anchors.filter((anchor) => anchor.startsWith(ELEMENT_PREFIX));
    if (!root || elements.length === 0) return setDrift((current) => (current.size === 0 ? current : new Map()));
    const sync = () =>
      setDrift((current) => {
        const next = new Map(elements.map((anchor) => [anchor, elementDrift(resolveElementAnchor(root, anchor))] as const));
        return next.size === current.size && [...next].every(([anchor, state]) => current.get(anchor) === state) ? current : next;
      });
    sync();
    const mutations = new MutationObserver(sync);
    mutations.observe(root, { childList: true, subtree: true, characterData: true });
    return () => mutations.disconnect();
  }, [markdown, anchors]);
  return drift;
}
