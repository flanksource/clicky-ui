import { useState } from "react";
import { Button } from "../components/button";
import { Badge, type BadgeTone } from "../data/Badge";
import { cn } from "../lib/utils";
import { DRIFT_LABEL, type AnchorDrift, type DriftState } from "./anchoring/drift";
import type { TextQuote } from "./annotation-types";
import type { Comment, CommentAnchor } from "./comment-types";

/** A new anchor a pick found, with the selected words when the pick was a text selection in rendered prose. */
export type PickedAnchor = { anchor: CommentAnchor; quote?: TextQuote };

/** How a surface re-anchors a thread: it picks a new place, then the host stores it (gavel `retarget`). */
export type Retarget = {
  /**
   * Starts a pick, such as an element click or a text selection, for a thread
   * on `anchor` and resolves with the new anchor (and its quote), or null when cancelled.
   */
  pickAnchor: (anchor: CommentAnchor) => Promise<PickedAnchor | null>;
  /** `quote` is stored beside a patch anchor, never inside it. */
  onRetarget: (id: Comment["id"], anchor: CommentAnchor, quote?: TextQuote) => void | Promise<void>;
};

/** A thread (or the several roots sharing an anchor) whose anchor has drifted. */
export type DriftItem = {
  /** The root comment ids on the anchor: Re-anchor retargets each of them. */
  ids: readonly Comment["id"][];
  anchor: CommentAnchor;
  /** What the anchor was on, e.g. "Lines 7–8". */
  label: string;
  drift: AnchorDrift;
};

/** An anchor that may still be right (moved, ambiguous) warns; one whose target is gone or changed (outdated, orphaned) is a danger. */
const STATE_TONE: Record<DriftState, BadgeTone> = {
  moved: "warning",
  ambiguous: "warning",
  outdated: "danger",
  orphaned: "danger",
};

/** The one badge every surface (the drift list, the inbox) shows for an anchor in drift. */
export function DriftBadge({ state }: { state: DriftState }) {
  return (
    <span data-drift-badge={state} className="inline-flex shrink-0">
      <Badge tone={STATE_TONE[state]} variant="soft" size="xs" clickToCopy={false}>
        {DRIFT_LABEL[state]}
      </Badge>
    </span>
  );
}

/** Starts a pick for a drifted thread and hands the result to the host; says so when either step fails. */
export function ReanchorButton({ item, retarget }: { item: DriftItem; retarget: Retarget }) {
  const [state, setState] = useState<{ busy: boolean; error: string | null }>({ busy: false, error: null });
  async function reanchor() {
    setState({ busy: true, error: null });
    try {
      const picked = await retarget.pickAnchor(item.anchor);
      if (picked) for (const id of item.ids) await (picked.quote ? retarget.onRetarget(id, picked.anchor, picked.quote) : retarget.onRetarget(id, picked.anchor));
      setState({ busy: false, error: null });
    } catch (cause) {
      setState({ busy: false, error: `Could not re-anchor: ${cause instanceof Error ? cause.message : String(cause)}` });
    }
  }
  return (
    <>
      <Button type="button" size="sm" variant="outline" loading={state.busy} onClick={() => void reanchor()} className="shrink-0">
        Re-anchor
      </Button>
      {state.error && (
        <span role="alert" className="basis-full text-[11px] text-destructive">
          {state.error}
        </span>
      )}
    </>
  );
}

/**
 * The one list of threads whose anchors have drifted: patch lines that are
 * outdated or ambiguous, elements and words that are orphaned, moved or
 * ambiguous. Each says why and, when the host can retarget, offers Re-anchor.
 * Nothing is hidden: a thread in drift stays reachable here.
 */
export function DriftList({
  items,
  retarget,
  onSelect,
  className,
}: {
  items: readonly DriftItem[];
  /** Offers Re-anchor on each item that can be re-picked; omit it and the list only reports. */
  retarget?: Retarget | undefined;
  onSelect?: ((item: DriftItem) => void) | undefined;
  className?: string | undefined;
}) {
  if (items.length === 0) return null;
  return (
    <section data-drift-list="" aria-label="Comments needing re-anchoring" className={cn("rounded-md border border-border bg-card", className)}>
      <h3 className="px-2 pt-2 text-xs font-medium text-muted-foreground">Needs re-anchoring · {items.length}</h3>
      <ul className="space-y-1 p-2">
        {items.map((item) => (
          <li key={item.anchor} data-drift-item={item.anchor} data-drift-state={item.drift.state} className="flex flex-wrap items-center gap-2 rounded-md px-1 py-1 text-xs">
            <DriftBadge state={item.drift.state} />
            {onSelect ? (
              <button type="button" onClick={() => onSelect(item)} className="min-w-0 flex-1 truncate text-left font-medium hover:underline">
                {item.label}
              </button>
            ) : (
              <span className="min-w-0 flex-1 truncate font-medium">{item.label}</span>
            )}
            {retarget && item.drift.reanchor !== false && <ReanchorButton item={item} retarget={retarget} />}
            {item.drift.note && (
              <p data-drift-note="" className="basis-full text-[11px] text-muted-foreground">
                {item.drift.note}
              </p>
            )}
          </li>
        ))}
      </ul>
    </section>
  );
}
