import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { cn } from "@flanksource/clicky-ui";

import { useAnnotationsHidden } from "../../annotations";
import { computeLeaders, type Leader, type Rect } from "./leaders";

// A practice note is worth more pinned to the thing it describes than filed in a
// list underneath it. This renders the specimen live, marks each annotated
// region with a numbered badge, and ties the badge to its note with a leader
// line — the margin-comment treatment, drawn over a working component rather
// than a screenshot.

export type PracticeNote = {
  /** Matches `data-practice="<id>"` on an element inside the specimen. */
  id: string;
  title: string;
  body: string;
  /**
   * Selector to annotate instead of `[data-practice="<id>"]`. Needed when the
   * region belongs to a component that owns its own markup — an AppShell slot
   * is reached through its `data-slot`, not through a wrapper we control.
   */
  target?: string;
  /** `rule` is what to do; `avoid` is the failure it prevents. */
  tone?: "rule" | "avoid";
};

type AnnotatedSpecimenProps = {
  notes: readonly PracticeNote[];
  /** Accessible name for the annotation list. */
  label: string;
  children: ReactNode;
  className?: string;
};

function relativeRect(element: Element, root: Element): Rect {
  const box = element.getBoundingClientRect();
  const origin = root.getBoundingClientRect();
  return {
    left: box.left - origin.left,
    top: box.top - origin.top,
    width: box.width,
    height: box.height,
  };
}

export function AnnotatedSpecimen({
  notes,
  label,
  children,
  className,
}: AnnotatedSpecimenProps) {
  const annotationsHidden = useAnnotationsHidden();
  const frameRef = useRef<HTMLDivElement | null>(null);
  const specimenRef = useRef<HTMLDivElement | null>(null);
  const cardRefs = useRef(new Map<string, HTMLElement>());
  const [leaders, setLeaders] = useState<Leader[]>([]);
  const [active, setActive] = useState<string | null>(null);

  const measure = useCallback(() => {
    const frame = frameRef.current;
    const specimen = specimenRef.current;
    if (!frame || !specimen) return;

    const targets = new Map<string, Rect>();
    for (const note of notes) {
      const element = specimen.querySelector(
        note.target ?? `[data-practice="${note.id}"]`,
      );
      // A note whose element has been renamed away is a broken annotation, not
      // a silent no-op: it keeps its number and says so in the card.
      if (element) targets.set(note.id, relativeRect(element, frame));
    }

    const cards = new Map<string, Rect>();
    for (const [id, card] of cardRefs.current) {
      cards.set(id, relativeRect(card, frame));
    }

    setLeaders(computeLeaders(notes.map((note) => note.id), targets, cards));
  }, [notes]);

  useLayoutEffect(measure, [measure]);

  useEffect(() => {
    const frame = frameRef.current;
    if (!frame || typeof ResizeObserver === "undefined") return;
    const observer = new ResizeObserver(measure);
    observer.observe(frame);
    const specimen = specimenRef.current;
    if (specimen) observer.observe(specimen);
    return () => observer.disconnect();
  }, [measure]);

  const registerCard = useCallback((id: string, element: HTMLElement | null) => {
    if (element) cardRefs.current.set(id, element);
    else cardRefs.current.delete(id);
  }, []);

  if (annotationsHidden) {
    return <div className={cn("min-w-0", className)}>{children}</div>;
  }

  return (
    <div
      ref={frameRef}
      className={cn("relative grid gap-density-4 xl:grid-cols-[minmax(0,1fr)_22rem]", className)}
    >
      <div ref={specimenRef} className="min-w-0">
        {children}
      </div>

      <ol aria-label={label} className="space-y-density-3">
        {notes.map((note, index) => (
          <li key={note.id}>
            <article
              ref={(element) => registerCard(note.id, element)}
              onMouseEnter={() => setActive(note.id)}
              onMouseLeave={() => setActive(null)}
              className={cn(
                "rounded-xl border bg-card p-density-3 shadow-sm transition-colors",
                note.tone === "avoid"
                  ? "border-rose-500/30"
                  : "border-border",
                active === note.id && "border-primary/60",
              )}
            >
              <div className="flex items-start gap-density-2">
                <span
                  className={cn(
                    "mt-0.5 grid size-5 shrink-0 place-items-center rounded-full text-[11px] font-semibold",
                    note.tone === "avoid"
                      ? "bg-rose-500 text-white"
                      : "bg-primary text-primary-foreground",
                  )}
                >
                  {index + 1}
                </span>
                <div className="min-w-0 space-y-1">
                  <h3 className="text-sm font-semibold text-foreground">{note.title}</h3>
                  <p className="text-xs leading-5 text-muted-foreground">{note.body}</p>
                </div>
              </div>
            </article>
          </li>
        ))}
      </ol>

      <svg
        aria-hidden
        className="pointer-events-none absolute inset-0 hidden size-full overflow-visible xl:block"
      >
        {leaders.map((leader) => (
          <g key={leader.id} className={active === leader.id ? "text-primary" : "text-border"}>
            {leader.path && (
              <path
                d={leader.path}
                fill="none"
                stroke="currentColor"
                strokeWidth={active === leader.id ? 2 : 1}
                strokeDasharray="4 4"
              />
            )}
            <circle cx={leader.marker.x} cy={leader.marker.y} r="10" className="fill-primary" />
            <text
              x={leader.marker.x}
              y={leader.marker.y + 3.5}
              textAnchor="middle"
              className="fill-primary-foreground text-[10px] font-semibold"
            >
              {leader.index}
            </text>
          </g>
        ))}
      </svg>
    </div>
  );
}
