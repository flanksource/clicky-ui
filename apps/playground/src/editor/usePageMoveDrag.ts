import { useCallback, useMemo, useState } from "react";
import type { AppShellNavDrag } from "@flanksource/clicky-ui";

import { applyPageDeleted, applyPageMoved } from "../registry";
import { PageApiError, movePage } from "./page-api";
import { plannedPageMove } from "./page-management-model";

export type PageMoveDrag = {
  /** Handed to the nav section so its rows can be dragged between folders. */
  drag: AppShellNavDrag;
  error: string | null;
};

/**
 * Dragging a page row onto a folder row is the same move the Move dialog makes
 * — same endpoint, so comments and cross-page references follow the file.
 */
export function usePageMoveDrag({
  disabled,
  activeSlug,
  onNavigate,
}: {
  disabled: boolean;
  activeSlug: string | undefined;
  onNavigate: (slug?: string) => void;
}): PageMoveDrag {
  const [error, setError] = useState<string | null>(null);

  const onDrop = useCallback<AppShellNavDrag["onDrop"]>(
    (source, target) => {
      const nextSlug = plannedPageMove(source.key, target);
      if (nextSlug === null) {
        throw new Error(
          `dropped "${source.key}" on ${target.kind} "${target.key}", which is not a move`,
        );
      }
      void movePage({ slug: source.key, nextSlug }).then(
        (result) => {
          setError(null);
          // The glob still lists the old path until the dev server revisits it,
          // so tell the registry where the page went.
          applyPageMoved(source.key, result.slug);
          // Only the page being read needs re-routing: its old slug is gone, so
          // leaving the route alone would fall back to another artifact.
          if (source.key === activeSlug) onNavigate(result.slug);
        },
        (cause: unknown) => {
          // The row was a leftover: the file went away outside the playground
          // (an agent or an editor) while the glob still listed it. Drop it
          // rather than leaving a row that fails every time it is dragged.
          if (cause instanceof PageApiError && cause.missing) {
            applyPageDeleted(source.key);
            setError(
              `"${source.key}" is no longer on disk; it was removed outside the playground, so the sidebar has dropped it.`,
            );
            if (source.key === activeSlug) onNavigate(undefined);
            return;
          }
          setError(cause instanceof Error ? cause.message : String(cause));
        },
      );
    },
    [activeSlug, onNavigate],
  );

  const drag = useMemo<AppShellNavDrag>(
    () => ({
      // Folders are not draggable: moving one is a multi-file move the sources
      // endpoint does not offer, and half-doing it would strand pages.
      canDrag: (source) => !disabled && source.kind === "item",
      canDrop: (source, target) => plannedPageMove(source.key, target) !== null,
      onDrop,
    }),
    [disabled, onDrop],
  );

  return { drag, error };
}
