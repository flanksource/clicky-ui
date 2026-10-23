import { useCallback, useEffect, useRef, useState, type RefObject } from "react";
import { isUnresolved } from "@flanksource/clicky-ui/comments";

import type { CommentLocator } from "../../plugins/comments-model";
import { tallyAnchors } from "./anchor-tally";
import {
  describeElement,
  elementBoxWithin,
  legacyLocators,
  overlayLabel,
  resolveAnchor,
  resolveComment,
  type Box,
  type CommentMatch,
} from "./dom-anchor";
import {
  PLAYGROUND_COMMENT_CONFIG,
  type PlaygroundComment,
} from "./useComments";

export type AnchorPin = {
  anchor: string;
  /** 1-based badge number, stable in comment-creation order. */
  index: number;
  box: Box;
  count: number;
  /** Found by a fallback locator rather than the stored anchor. */
  moved: boolean;
};

export type AnchorOrphan = {
  anchor: string;
  /** Whether any comment on the anchor still needs attention. */
  unresolved: boolean;
};

export type DomAnchors = {
  pins: AnchorPin[];
  /** Pins inside open dialogs, with viewport (not scroll-container) boxes. */
  overlayPins: AnchorPin[];
  /** Anchors that neither the anchor nor any locator can find on the page. */
  orphans: AnchorOrphan[];
  labels: Record<string, string>;
  recompute: () => void;
};

const legacyCache = new Map<string, CommentLocator[]>();

/** Locators of the comment that first used `anchor`, derived from its HTML when it predates them. */
function locatorsFor(
  comments: PlaygroundComment[],
  anchor: string,
): CommentLocator[] {
  const first = comments
    .filter((comment) => !comment.parentId && comment.anchor === anchor)
    .sort((a, b) => a.createdAt.localeCompare(b.createdAt))[0];
  const element = first?.element;
  if (!element) return [];
  if (element.locators) return element.locators;
  const cached = legacyCache.get(element.html);
  if (cached) return cached;
  const derived = legacyLocators(element.html);
  legacyCache.set(element.html, derived);
  return derived;
}

/** Rail label: how the element was found when that was not the stored anchor. */
function matchLabel(match: CommentMatch): string {
  const described = describeElement(match.element);
  const { matchedBy, conflict } = match;
  if (matchedBy === "anchor") {
    return conflict ? `Locators disagree — ${described}` : described;
  }
  const how =
    matchedBy.kind === "css"
      ? "matched by its saved selector"
      : matchedBy.kind === "role"
        ? "matched by role and name"
        : matchedBy.heading
          ? `found under “${matchedBy.heading.text}”`
          : "matched by text";
  return `Moved — ${how}${conflict ? ", locators disagree" : ""}: ${described}`;
}

export { tallyAnchors, type AnchorTally } from "./anchor-tally";

function samePins(a: AnchorPin[], b: AnchorPin[]): boolean {
  return (
    a.length === b.length &&
    a.every((pin, index) => {
      const other = b[index];
      return (
        other !== undefined &&
        pin.anchor === other.anchor &&
        pin.count === other.count &&
        pin.moved === other.moved &&
        pin.box.left === other.box.left &&
        pin.box.top === other.box.top &&
        pin.box.width === other.box.width &&
        pin.box.height === other.box.height
      );
    })
  );
}

function sameOrphans(a: AnchorOrphan[], b: AnchorOrphan[]): boolean {
  return (
    a.length === b.length &&
    a.every(
      (orphan, index) =>
        orphan.anchor === b[index]?.anchor &&
        orphan.unresolved === b[index]?.unresolved,
    )
  );
}

export type DomAnchorRefs = {
  /** The scrolling container; pin coordinates are expressed inside it. */
  scrollRef: RefObject<HTMLElement | null>;
  /** The artifact wrapper that anchors are resolved against and observed on. */
  contentRef: RefObject<HTMLElement | null>;
};

/**
 * Resolves each stored anchor back to a live element — through the anchor and
 * the comment's stored locators — registers it with the `CommentProvider` (so
 * the rail can align and scroll to it) and reports pin geometry. A fallback
 * match is labelled as moved; anchors nothing can find surface as `orphans`
 * rather than disappearing.
 *
 * The pin overlay must render *outside* `contentRef` — it is a sibling in the
 * scroll container — so that drawing pins cannot retrigger the observer.
 */
export function useDomAnchors(
  refs: DomAnchorRefs,
  comments: PlaygroundComment[],
  registerAnchor: (anchor: string, el: HTMLElement | null) => void,
): DomAnchors {
  const { scrollRef, contentRef } = refs;
  const [pins, setPins] = useState<AnchorPin[]>([]);
  const [overlayPins, setOverlayPins] = useState<AnchorPin[]>([]);
  const [orphans, setOrphans] = useState<AnchorOrphan[]>([]);
  const [labels, setLabels] = useState<Record<string, string>>({});
  const registeredRef = useRef<string[]>([]);
  const frameRef = useRef<number | null>(null);

  const recompute = useCallback(() => {
    const scroll = scrollRef.current;
    const content = contentRef.current;
    if (!scroll || !content) return;

    for (const anchor of registeredRef.current) registerAnchor(anchor, null);
    registeredRef.current = [];

    const nextPins: AnchorPin[] = [];
    const nextOverlayPins: AnchorPin[] = [];
    const nextOrphans: AnchorOrphan[] = [];
    const nextLabels: Record<string, string> = {};

    tallyAnchors(comments).forEach((tally, position) => {
      const dialog = overlayLabel(tally.anchor);
      // Dialog anchors carry no locators: their portal is outside the artifact.
      const match =
        dialog === null
          ? resolveComment(content, tally.anchor, locatorsFor(comments, tally.anchor))
          : null;
      const element = match ? match.element : resolveAnchor(content, tally.anchor);
      if (!(element instanceof HTMLElement)) {
        // A closed dialog is expected, not a broken anchor.
        if (dialog === null) {
          nextOrphans.push({
            anchor: tally.anchor,
            unresolved: comments.some(
              (comment) =>
                !comment.parentId &&
                comment.anchor === tally.anchor &&
                isUnresolved(PLAYGROUND_COMMENT_CONFIG, comment.status),
            ),
          });
        } else nextLabels[tally.anchor] = `In dialog “${dialog}” (closed)`;
        return;
      }
      registerAnchor(tally.anchor, element);
      registeredRef.current.push(tally.anchor);
      nextLabels[tally.anchor] = match ? matchLabel(match) : describeElement(element);
      const { left, top, width, height } = element.getBoundingClientRect();
      (dialog === null ? nextPins : nextOverlayPins).push({
        anchor: tally.anchor,
        index: position + 1,
        box:
          dialog === null
            ? elementBoxWithin(element, scroll)
            : { left, top, width, height },
        count: tally.count,
        moved: match !== null && match.matchedBy !== "anchor",
      });
    });

    setPins((current) => (samePins(current, nextPins) ? current : nextPins));
    setOverlayPins((current) =>
      samePins(current, nextOverlayPins) ? current : nextOverlayPins,
    );
    setOrphans((current) => (sameOrphans(current, nextOrphans) ? current : nextOrphans));
    setLabels((current) => {
      const keys = Object.keys(nextLabels);
      const unchanged =
        keys.length === Object.keys(current).length &&
        keys.every((key) => current[key] === nextLabels[key]);
      return unchanged ? current : nextLabels;
    });
  }, [comments, contentRef, registerAnchor, scrollRef]);

  const scheduleRecompute = useCallback(() => {
    if (frameRef.current !== null) return;
    frameRef.current = requestAnimationFrame(() => {
      frameRef.current = null;
      recompute();
    });
  }, [recompute]);

  useEffect(() => {
    scheduleRecompute();

    const content = contentRef.current;
    if (!content) return;

    window.addEventListener("resize", scheduleRecompute);
    const resizeObserver =
      typeof ResizeObserver === "undefined" ? null : new ResizeObserver(scheduleRecompute);
    resizeObserver?.observe(content);
    // Artifacts render their own dynamic content; watch for DOM churn so pins
    // follow the elements they were dropped on.
    const mutationObserver =
      typeof MutationObserver === "undefined" ? null : new MutationObserver(scheduleRecompute);
    mutationObserver?.observe(content, { childList: true, subtree: true });

    return () => {
      window.removeEventListener("resize", scheduleRecompute);
      resizeObserver?.disconnect();
      mutationObserver?.disconnect();
      if (frameRef.current !== null) cancelAnimationFrame(frameRef.current);
      frameRef.current = null;
    };
  }, [contentRef, scheduleRecompute]);

  // Dialogs portal into document.body and scroll on their own, so their
  // anchors need the whole document watched, but only while any exist.
  const watchOverlays = comments.some(
    (comment) => !comment.parentId && overlayLabel(comment.anchor ?? "") !== null,
  );
  useEffect(() => {
    if (!watchOverlays) return;
    const mutationObserver = new MutationObserver(scheduleRecompute);
    mutationObserver.observe(document.body, { childList: true, subtree: true });
    window.addEventListener("scroll", scheduleRecompute, true);
    return () => {
      mutationObserver.disconnect();
      window.removeEventListener("scroll", scheduleRecompute, true);
    };
  }, [scheduleRecompute, watchOverlays]);

  return { pins, overlayPins, orphans, labels, recompute: scheduleRecompute };
}
