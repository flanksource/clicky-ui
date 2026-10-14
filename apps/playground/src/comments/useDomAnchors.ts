import { useCallback, useEffect, useRef, useState, type RefObject } from "react";
import { DOCUMENT_ANCHOR, type Comment } from "@flanksource/clicky-ui/comments";

import {
  describeElement,
  elementBoxWithin,
  overlayLabel,
  resolveAnchor,
  type Box,
} from "./dom-anchor";

export type AnchorPin = {
  anchor: string;
  /** 1-based badge number, stable in comment-creation order. */
  index: number;
  box: Box;
  count: number;
};

export type DomAnchors = {
  pins: AnchorPin[];
  /** Pins inside open dialogs, with viewport (not scroll-container) boxes. */
  overlayPins: AnchorPin[];
  /** Anchors whose element is no longer in the page. */
  orphans: string[];
  labels: Record<string, string>;
  recompute: () => void;
};

export type AnchorTally = { anchor: string; count: number; first: string };

/** Root comments grouped by anchor, ordered by when the anchor was first used. */
export function tallyAnchors(comments: Comment[]): AnchorTally[] {
  const tallies = new Map<string, AnchorTally>();
  for (const comment of comments) {
    if (comment.parentId) continue; // replies share their root's pin
    const anchor = comment.anchor ?? DOCUMENT_ANCHOR;
    if (anchor === DOCUMENT_ANCHOR) continue;

    const existing = tallies.get(anchor);
    if (!existing) {
      tallies.set(anchor, { anchor, count: 1, first: comment.createdAt });
      continue;
    }
    existing.count += 1;
    if (comment.createdAt < existing.first) existing.first = comment.createdAt;
  }
  return [...tallies.values()].sort(
    (a, b) => a.first.localeCompare(b.first) || a.anchor.localeCompare(b.anchor),
  );
}

function samePins(a: AnchorPin[], b: AnchorPin[]): boolean {
  return (
    a.length === b.length &&
    a.every((pin, index) => {
      const other = b[index];
      return (
        other !== undefined &&
        pin.anchor === other.anchor &&
        pin.count === other.count &&
        pin.box.left === other.box.left &&
        pin.box.top === other.box.top &&
        pin.box.width === other.box.width &&
        pin.box.height === other.box.height
      );
    })
  );
}

function sameList(a: string[], b: string[]): boolean {
  return a.length === b.length && a.every((value, index) => value === b[index]);
}

export type DomAnchorRefs = {
  /** The scrolling container; pin coordinates are expressed inside it. */
  scrollRef: RefObject<HTMLElement | null>;
  /** The artifact wrapper that anchors are resolved against and observed on. */
  contentRef: RefObject<HTMLElement | null>;
};

/**
 * Resolves each stored anchor back to a live element, registers it with the
 * `CommentProvider` (so the rail can align and scroll to it) and reports pin
 * geometry. Anchors that no longer resolve surface as `orphans` rather than
 * disappearing.
 *
 * The pin overlay must render *outside* `contentRef` — it is a sibling in the
 * scroll container — so that drawing pins cannot retrigger the observer.
 */
export function useDomAnchors(
  refs: DomAnchorRefs,
  comments: Comment[],
  registerAnchor: (anchor: string, el: HTMLElement | null) => void,
): DomAnchors {
  const { scrollRef, contentRef } = refs;
  const [pins, setPins] = useState<AnchorPin[]>([]);
  const [overlayPins, setOverlayPins] = useState<AnchorPin[]>([]);
  const [orphans, setOrphans] = useState<string[]>([]);
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
    const nextOrphans: string[] = [];
    const nextLabels: Record<string, string> = {};

    tallyAnchors(comments).forEach((tally, position) => {
      const element = resolveAnchor(content, tally.anchor);
      const dialog = overlayLabel(tally.anchor);
      if (!(element instanceof HTMLElement)) {
        // A closed dialog is expected, not a broken anchor.
        if (dialog === null) nextOrphans.push(tally.anchor);
        else nextLabels[tally.anchor] = `In dialog “${dialog}” (closed)`;
        return;
      }
      registerAnchor(tally.anchor, element);
      registeredRef.current.push(tally.anchor);
      nextLabels[tally.anchor] = describeElement(element);
      const { left, top, width, height } = element.getBoundingClientRect();
      (dialog === null ? nextPins : nextOverlayPins).push({
        anchor: tally.anchor,
        index: position + 1,
        box:
          dialog === null
            ? elementBoxWithin(element, scroll)
            : { left, top, width, height },
        count: tally.count,
      });
    });

    setPins((current) => (samePins(current, nextPins) ? current : nextPins));
    setOverlayPins((current) =>
      samePins(current, nextOverlayPins) ? current : nextOverlayPins,
    );
    setOrphans((current) => (sameList(current, nextOrphans) ? current : nextOrphans));
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
