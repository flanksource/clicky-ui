import { useCallback, useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { Tour, type TourProps } from "./Tour";
import { TourContext, type TourContextValue, type TourStatus } from "./tour-context";
import { activeSteps, nextStepIndex, resolveStepIndex, validateTourDefinition } from "./tour-model";
import {
  isTourFinished,
  localStorageTourStorage,
  type TourCompletion,
  type TourCompletionStatus,
  type TourStorage,
} from "./tour-progress";
import type { TourDefinition, TourStepContext } from "./tour-types";

/**
 * Registry + running state + completion persistence for guided tours. Renders at
 * most one `<Tour>`; everything else reaches it through `useTour()`.
 */

export type TourProviderProps = {
  children: ReactNode;
  /** Tours available to `start(id)`. Each is validated on registration. */
  tours: TourDefinition[];
  /** The app's current route. Used only for auto-start eligibility, never for step sequencing. */
  currentRoute?: string | undefined;
  /** Auto-start route matcher. Defaults to exact match with the trailing slash normalised. */
  matchRoute?: ((tourRoute: string, currentRoute: string) => boolean) | undefined;
  /** Navigation callback threaded into every tour. Required for multi-route tours. */
  onNavigate?: ((route: string, ctx: TourStepContext) => void | Promise<void>) | undefined;
  /** Completion persistence. Defaults to `localStorageTourStorage()`. */
  storage?: TourStorage | undefined;
  /** Fired when a tour ends, either way. */
  onFinish?:
    | ((result: { tourId: string; status: TourCompletionStatus; index: number }) => void)
    | undefined;
  /** Defaults shared by every tour; an explicit `<Tour>` prop still wins. */
  defaults?:
    | Pick<
        TourProps,
        | "anchorRoot"
        | "portalContainer"
        | "missingAnchor"
        | "anchorTimeoutMs"
        | "navigateTimeoutMs"
        | "padding"
        | "interaction"
        | "keyboard"
        | "closeOnEsc"
        | "scrollIntoView"
        | "labels"
        | "onStepError"
        | "backdropClassName"
      >
    | undefined;
};

function normalizeRoute(route: string): string {
  return route.length > 1 && route.endsWith("/") ? route.slice(0, -1) : route;
}

function defaultMatchRoute(tourRoute: string, currentRoute: string): boolean {
  return normalizeRoute(tourRoute) === normalizeRoute(currentRoute);
}

type Running = { tourId: string; index: number };

export function TourProvider(props: TourProviderProps) {
  const {
    children,
    tours,
    currentRoute,
    matchRoute = defaultMatchRoute,
    onNavigate,
    onFinish,
    defaults,
  } = props;

  const storage = useMemo(() => props.storage ?? localStorageTourStorage(), [props.storage]);
  const [completions, setCompletions] = useState<TourCompletion[] | null>(null);
  const [running, setRunning] = useState<Running | null>(null);
  const [status, setStatus] = useState<TourStatus>("idle");

  for (const definition of tours) validateTourDefinition(definition);

  // Auto-start is gated behind this read so a first-run tour never flashes before
  // we know it was already seen.
  useEffect(() => {
    let cancelled = false;
    void Promise.resolve(storage.read()).then((entries) => {
      if (!cancelled) setCompletions(entries);
    });
    return () => {
      cancelled = true;
    };
  }, [storage]);

  const definitionOf = useCallback(
    (tourId: string): TourDefinition => {
      const found = tours.find((tour) => tour.id === tourId);
      if (!found) throw new Error(`Unknown tour "${tourId}"`);
      return found;
    },
    [tours],
  );

  const isFinished = useCallback(
    (tourId: string) => isTourFinished(completions ?? [], definitionOf(tourId)),
    [completions, definitionOf],
  );

  const start = useCallback<TourContextValue["start"]>(
    (tourId, options = {}) => {
      const definition = definitionOf(tourId);
      if (!options.force && isTourFinished(completions ?? [], definition)) return;
      const index = options.at === undefined ? 0 : resolveStepIndex(definition.steps, options.at);
      setRunning({ tourId, index });
      setStatus("waiting");
    },
    [completions, definitionOf],
  );

  const runningRef = useRef(running);
  runningRef.current = running;

  const finish = useCallback<TourContextValue["finish"]>(
    (completionStatus = "dismissed") => {
      const current = runningRef.current;
      if (!current) return;
      const definition = definitionOf(current.tourId);
      const entry: TourCompletion = {
        tourId: current.tourId,
        status: completionStatus,
        version: definition.version ?? 1,
        at: new Date().toISOString(),
      };
      void storage.write(entry);
      setCompletions((prev) => [...(prev ?? []).filter((e) => e.tourId !== entry.tourId), entry]);
      setRunning(null);
      setStatus("idle");
      onFinish?.({ tourId: current.tourId, status: completionStatus, index: current.index });
    },
    [definitionOf, onFinish, storage],
  );

  const reset = useCallback<TourContextValue["reset"]>(
    (tourId) => {
      void storage.clear(tourId);
      setCompletions((prev) => (tourId ? (prev ?? []).filter((e) => e.tourId !== tourId) : []));
    },
    [storage],
  );

  // Honours `enabled()` so a programmatic next/back lands where the card's own
  // buttons would, rather than on a step the tour is skipping.
  const step = useCallback(
    (direction: "next" | "back") => {
      const current = runningRef.current;
      if (!current) return;
      const target = nextStepIndex(definitionOf(current.tourId).steps, current.index, direction);
      if (target === null) {
        if (direction === "next") finish("completed");
        return;
      }
      setRunning({ ...current, index: target });
    },
    [definitionOf, finish],
  );

  const goTo = useCallback<TourContextValue["goTo"]>(
    (step) => {
      setRunning((current) => {
        if (!current) return current;
        return { ...current, index: resolveStepIndex(definitionOf(current.tourId).steps, step) };
      });
    },
    [definitionOf],
  );

  // Auto-start: only on the declared route, only once the completions are known.
  useEffect(() => {
    if (completions === null || running || currentRoute === undefined) return;
    for (const definition of tours) {
      if (!definition.autoStart) continue;
      const route = definition.autoStartRoute ?? definition.steps[0]?.route;
      if (route === undefined || !matchRoute(route, currentRoute)) continue;
      if (isTourFinished(completions, definition)) continue;
      setRunning({ tourId: definition.id, index: 0 });
      setStatus("waiting");
      return;
    }
  }, [completions, running, currentRoute, tours, matchRoute]);

  const definition = running ? definitionOf(running.tourId) : null;

  const value = useMemo<TourContextValue>(
    () => ({
      tourId: running?.tourId ?? null,
      index: running?.index ?? 0,
      total: definition ? activeSteps(definition.steps).length : 0,
      status,
      start,
      next: () => step("next"),
      back: () => step("back"),
      goTo,
      finish,
      isFinished,
      reset,
      tours,
    }),
    [running, definition, status, start, step, goTo, finish, isFinished, reset, tours],
  );

  return (
    <TourContext.Provider value={value}>
      {children}
      {definition && running ? (
        <Tour
          {...defaults}
          definition={definition}
          index={running.index}
          onIndexChange={(index) => setRunning({ tourId: running.tourId, index })}
          onComplete={() => finish("completed")}
          onDismiss={() => finish("dismissed")}
          onStatusChange={setStatus}
          {...(onNavigate ? { onNavigate } : {})}
        />
      ) : null}
    </TourContext.Provider>
  );
}
