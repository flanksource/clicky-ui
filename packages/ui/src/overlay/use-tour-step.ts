import { useEffect, useRef, useState } from "react";
import { describeTarget, nextStepIndex } from "./tour-model";
import type {
  TourDefinition,
  TourMissingAnchor,
  TourStep,
  TourStepContext,
  TourStepErrorInfo,
} from "./tour-types";

/**
 * The per-step effects of a running tour, kept out of the renderer: route
 * hand-off, the missing-anchor policy, `onEnter`/`onExit`, and the active-anchor
 * marker.
 */

/**
 * Asks the host to navigate when the entered step lives on a different route.
 * The tour deliberately does NOT then wait on the route changing — the anchor
 * appearing is the only readiness signal, so one mechanism covers route change,
 * lazy chunk, and data fetch, and the same steps still run where there is no
 * router at all.
 */
export function useStepRoute(options: {
  step: TourStep | undefined;
  context: TourStepContext | null;
  onNavigate: ((route: string, ctx: TourStepContext) => void | Promise<void>) | undefined;
}): { navigating: boolean; pendingRoute: boolean } {
  const { step, context, onNavigate } = options;
  const routeRef = useRef<string | null>(null);
  const [navigating, setNavigating] = useState(false);
  const contextRef = useRef(context);
  contextRef.current = context;

  const pendingRoute = step?.route !== undefined && step.route !== routeRef.current;

  useEffect(() => {
    if (!step || step.route === undefined || step.route === routeRef.current) return;
    const route = step.route;
    routeRef.current = route;
    const ctx = contextRef.current;
    if (!onNavigate || !ctx) return;
    setNavigating(true);
    void Promise.resolve(onNavigate(route, ctx)).finally(() => setNavigating(false));
    // Once per entered step whose route differs; the context object changes as
    // the anchor resolves and must not retrigger navigation.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [step?.id]);

  return { navigating, pendingRoute };
}

/**
 * Applies the missing-anchor policy. `"center"` (the default) keeps the step and
 * its counter but always warns and reports, so a broken anchor is loud without
 * being fatal in front of a user; `"skip"` silently rewrites the tour and is
 * opt-in; `"fail"` is for stories and tests.
 */
export function useMissingAnchorPolicy(options: {
  definition: TourDefinition;
  step: TourStep | undefined;
  index: number;
  missing: boolean;
  policy: TourMissingAnchor;
  onStepError: ((info: TourStepErrorInfo) => void) | undefined;
  onSkip: (nextIndex: number | null) => void;
}): void {
  const { definition, step, index, missing, policy, onStepError, onSkip } = options;
  const skipRef = useRef(onSkip);
  skipRef.current = onSkip;

  useEffect(() => {
    if (!missing || !step) return;
    const target = describeTarget(step.target);
    const message = `Tour "${definition.id}" step "${step.id}": anchor ${target} never appeared`;
    if (policy === "fail") throw new Error(message);

    console.warn(`clicky-ui ${message}`);
    onStepError?.({ tourId: definition.id, step, index, reason: "anchor-timeout", target });
    if (policy === "skip") skipRef.current(nextStepIndex(definition.steps, index, "next"));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [missing, step?.id, policy]);
}

/** Marks the spotlit element so styles and end-to-end tests can find it. */
export function useActiveAnchorMarker(anchor: HTMLElement | null): void {
  useEffect(() => {
    if (!anchor) return;
    anchor.dataset.tourActive = "true";
    return () => {
      delete anchor.dataset.tourActive;
    };
  }, [anchor]);
}

/** Runs `onEnter` once the step has settled, and `onExit` when it is left. */
export function useStepLifecycle(options: {
  step: TourStep | undefined;
  context: TourStepContext | null;
  settled: boolean;
}): void {
  const { step, context, settled } = options;
  const contextRef = useRef(context);
  contextRef.current = context;

  useEffect(() => {
    if (!step || !settled) return;
    const ctx = contextRef.current;
    if (!ctx) return;
    void step.onEnter?.(ctx);
    return () => step.onExit?.(ctx);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [step?.id, settled]);
}
