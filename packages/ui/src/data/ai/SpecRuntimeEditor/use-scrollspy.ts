import { useCallback, useEffect, useRef, useState } from "react";

// Highlights sections near the upper third of the viewport, matching the
// design's rail scrollspy.
const SCROLLSPY_ROOT_MARGIN = "-15% 0px -70% 0px";
// Ignore observer updates briefly after a nav click so smooth-scrolling past
// intermediate sections doesn't flicker the active nav item.
const CLICK_SETTLE_MS = 700;

export type ScrollSpy = {
  activeId: string;
  /** Ref callback registering (and observing) a section element by DOM id. */
  sectionRef: (id: string) => (element: HTMLElement | null) => void;
  /** Marks a section active and smooth-scrolls it into view. */
  onNavClick: (id: string) => void;
};

// jsdom has no IntersectionObserver; the hook degrades to click-driven active
// state, so components stay testable without stubbing.
export function useScrollSpy(sectionIds: string[]): ScrollSpy {
  const [activeId, setActiveId] = useState(sectionIds[0] ?? "");
  const elements = useRef(new Map<string, HTMLElement>());
  const observer = useRef<IntersectionObserver | null>(null);
  const clickedAt = useRef(0);

  const ensureObserver = useCallback(() => {
    if (observer.current) return observer.current;
    if (typeof IntersectionObserver === "undefined") return null;
    observer.current = new IntersectionObserver(
      (entries) => {
        if (Date.now() - clickedAt.current < CLICK_SETTLE_MS) return;
        for (const entry of entries) {
          if (entry.isIntersecting) setActiveId(entry.target.id);
        }
      },
      { rootMargin: SCROLLSPY_ROOT_MARGIN, threshold: 0 },
    );
    return observer.current;
  }, []);

  const sectionRef = useCallback(
    (id: string) => (element: HTMLElement | null) => {
      const current = elements.current.get(id);
      if (current) observer.current?.unobserve(current);
      if (element) {
        elements.current.set(id, element);
        ensureObserver()?.observe(element);
      } else {
        elements.current.delete(id);
      }
    },
    [ensureObserver],
  );

  useEffect(() => () => observer.current?.disconnect(), []);

  const onNavClick = useCallback((id: string) => {
    clickedAt.current = Date.now();
    setActiveId(id);
    elements.current.get(id)?.scrollIntoView?.({
      behavior: "smooth",
      block: "start",
    });
  }, []);

  return { activeId, sectionRef, onNavClick };
}
