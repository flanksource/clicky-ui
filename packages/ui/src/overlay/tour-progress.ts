import type { TourDefinition } from "./tour-types";

/**
 * Completion persistence for tours.
 *
 * The default is a localStorage store so the zero-config path works, but the
 * seam is an adapter rather than a boolean because completion is *user* state,
 * not device state: someone who signs in on a second machine should not re-see a
 * first-run tour, and an admin may want to reset one for a whole org. Both are
 * expressible as a `TourStorage`; neither is expressible as "the library owns
 * localStorage" or as a bare `completed` prop.
 */

export type TourCompletionStatus = "completed" | "dismissed";

export type TourCompletion = {
  tourId: string;
  status: TourCompletionStatus;
  /** The definition `version` this was recorded against. */
  version: number;
  /** ISO timestamp. */
  at: string;
};

export type TourStorage = {
  read: () => TourCompletion[] | Promise<TourCompletion[]>;
  write: (entry: TourCompletion) => void | Promise<void>;
  clear: (tourId?: string) => void | Promise<void>;
};

const DEFAULT_KEY = "clicky-ui-tours";

function isCompletion(value: unknown): value is TourCompletion {
  if (!value || typeof value !== "object") return false;
  const entry = value as Partial<TourCompletion>;
  return (
    typeof entry.tourId === "string" &&
    (entry.status === "completed" || entry.status === "dismissed") &&
    typeof entry.version === "number"
  );
}

/**
 * localStorage-backed store, keyed like `clicky-ui-theme` / `clicky-ui-density`.
 * A corrupt or unreadable value reads as "nothing recorded" — the cost of being
 * wrong is re-offering a tour, so refusing to boot over it would be worse.
 */
export function localStorageTourStorage(key: string = DEFAULT_KEY): TourStorage {
  const load = (): TourCompletion[] => {
    if (typeof localStorage === "undefined") return [];
    try {
      const raw = localStorage.getItem(key);
      if (!raw) return [];
      const parsed: unknown = JSON.parse(raw);
      return Array.isArray(parsed) ? parsed.filter(isCompletion) : [];
    } catch {
      return [];
    }
  };

  const save = (entries: TourCompletion[]) => {
    if (typeof localStorage === "undefined") return;
    try {
      localStorage.setItem(key, JSON.stringify(entries));
    } catch {
      // A full or blocked quota must not break the tour that just finished.
    }
  };

  return {
    read: load,
    write: (entry) => save([...load().filter((e) => e.tourId !== entry.tourId), entry]),
    clear: (tourId) => save(tourId ? load().filter((e) => e.tourId !== tourId) : []),
  };
}

/** In-memory store, for tests, stories, and embedded/mocked renderings. */
export function memoryTourStorage(seed: TourCompletion[] = []): TourStorage {
  let entries = [...seed];
  return {
    read: () => entries,
    write: (entry) => {
      entries = [...entries.filter((e) => e.tourId !== entry.tourId), entry];
    },
    clear: (tourId) => {
      entries = tourId ? entries.filter((e) => e.tourId !== tourId) : [];
    },
  };
}

/**
 * True when a recorded completion still covers the definition's current version.
 * Bumping `version` on a reworked tour makes prior completions stale, so it is
 * offered again with no migration step.
 */
export function isTourFinished(
  completions: TourCompletion[],
  definition: TourDefinition,
): boolean {
  const entry = completions.find((completion) => completion.tourId === definition.id);
  if (!entry) return false;
  return entry.version >= (definition.version ?? 1);
}
