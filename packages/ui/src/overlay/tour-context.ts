import { createContext, useContext } from "react";
import type { TourCompletionStatus } from "./tour-progress";
import type { TourDefinition } from "./tour-types";

/** Status of the running tour. `waiting` means its anchor has not appeared yet. */
export type TourStatus = "idle" | "navigating" | "waiting" | "active";

export type TourState = {
  /** Running tour, or null. */
  tourId: string | null;
  /** Zero-based index within the running tour. */
  index: number;
  /** Enabled step count of the running tour — the denominator of "2 of 6". */
  total: number;
  status: TourStatus;
};

export type TourContextValue = TourState & {
  /**
   * Start a registered tour. `at` jumps to a step id or index; `force` ignores a
   * recorded completion, which is what a "Take a tour" button passes.
   */
  start: (tourId: string, options?: { at?: string | number; force?: boolean }) => void;
  /** Advance; completes the tour on the last step. */
  next: () => void;
  back: () => void;
  /** Jump within the running tour by step id or zero-based index. */
  goTo: (step: string | number) => void;
  /** End the running tour and record the outcome. Defaults to `"dismissed"`. */
  finish: (status?: TourCompletionStatus) => void;
  /** Has this tour been completed or dismissed at its current `version`? */
  isFinished: (tourId: string) => boolean;
  /** Forget completions so tours are eligible again — a "Replay tours" button. */
  reset: (tourId?: string) => void;
  /** Registered tours, for building a "Take a tour" menu. */
  tours: TourDefinition[];
};

export const TourContext = createContext<TourContextValue | null>(null);

/** Access the tour API. Must be called under a `<TourProvider>`. */
export function useTour(): TourContextValue {
  const ctx = useContext(TourContext);
  if (!ctx) throw new Error("useTour must be used within a <TourProvider>");
  return ctx;
}
