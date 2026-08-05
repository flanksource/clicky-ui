import { useEffect, useMemo, useRef, useState } from "react";
import { FloatingPortal } from "@floating-ui/react";
import { useHotkey } from "../hooks/use-hotkey";
import { useEscapeLayer, useTourLayer } from "./modalStack";
import { TourCard } from "./TourCard";
import { TourSpotlight } from "./TourSpotlight";
import {
  activeSteps,
  DEFAULT_TOUR_LABELS,
  displayPosition,
  nextStepIndex,
  validateTourDefinition,
} from "./tour-model";
import type { TourStatus } from "./tour-context";
import { useTourAnchor } from "./use-tour-anchor";
import { useTourRect } from "./use-tour-rect";
import {
  useActiveAnchorMarker,
  useMissingAnchorPolicy,
  useStepLifecycle,
  useStepRoute,
} from "./use-tour-step";
import type {
  TourDefinition,
  TourDirection,
  TourInteraction,
  TourLabels,
  TourMissingAnchor,
  TourRoot,
  TourRootSource,
  TourStepContext,
  TourStepErrorInfo,
} from "./tour-types";

/**
 * Controlled renderer for one running tour: spotlight + step card + the step
 * lifecycle (exit -> navigate -> wait for anchor -> enter).
 *
 * It contains no `document` lookup of its own — every anchor query goes through
 * tour-anchor.ts against a configurable root, which is what lets the same steps
 * run over a mocked UI inside a shadow root.
 */

const DEFAULT_ANCHOR_TIMEOUT_MS = 3_000;
const DEFAULT_NAVIGATE_TIMEOUT_MS = 8_000;
const DEFAULT_PADDING = 8;

export type TourProps = {
  /** The tour to render. Validated on first mount. */
  definition: TourDefinition;
  /** Zero-based index of the visible step, into `definition.steps`. */
  index: number;
  /** Requests a different step; the owner clamps and commits it. */
  onIndexChange: (index: number, direction: TourDirection) => void;
  /** The user reached the end. */
  onComplete: () => void;
  /** The user left early (Skip, Escape, close). */
  onDismiss: () => void;
  /**
   * Called when the entered step's `route` differs from the route the tour is
   * already on. The library never imports a router.
   */
  onNavigate?: ((route: string, ctx: TourStepContext) => void | Promise<void>) | undefined;
  /** Where anchors are queried. Defaults to `document`. */
  anchorRoot?: TourRootSource | undefined;
  /**
   * Element the overlay portals into. Defaults to `document.body`. Pass a node
   * inside your shadow tree so the overlay is shadow-styled and scoped —
   * `FloatingPortal` takes an HTMLElement, not a ShadowRoot, which is why this is
   * a separate prop from `anchorRoot`. Note `position: fixed` resolves against a
   * transformed ancestor, so a transformed container scopes the dim to itself
   * (wanted for an embedded demo, surprising in an app).
   */
  portalContainer?: HTMLElement | null | undefined;
  /** Policy when an anchor never appears. Defaults to `"center"`. */
  missingAnchor?: TourMissingAnchor | undefined;
  /** Anchor wait budget for a same-route step, in ms. */
  anchorTimeoutMs?: number | undefined;
  /** Anchor wait budget after `onNavigate`, in ms. */
  navigateTimeoutMs?: number | undefined;
  /** Default spotlight padding in px. */
  padding?: number | undefined;
  /** Pointer behaviour of the dim layer. */
  interaction?: TourInteraction | undefined;
  /**
   * Bind arrow keys to Back/Next. Defaults to true. This preempts arrow-key page
   * scrolling while the tour runs; set false to keep it.
   */
  keyboard?: boolean | undefined;
  /** Dismiss on Escape. Defaults to true. */
  closeOnEsc?: boolean | undefined;
  /** Scroll each anchor into view on entry. Defaults to true. */
  scrollIntoView?: boolean | undefined;
  /** Copy overrides; unset keys fall back to `DEFAULT_TOUR_LABELS`. */
  labels?: Partial<TourLabels> | undefined;
  /** Reported on every anchor timeout, alongside a console warning. */
  onStepError?: ((info: TourStepErrorInfo) => void) | undefined;
  /** Reports the live step state, so a provider can expose it through `useTour()`. */
  onStatusChange?: ((status: TourStatus) => void) | undefined;
  /** Classes applied to the step card. */
  className?: string | undefined;
  /** Classes applied to the dim layer, e.g. `bg-black/60`. */
  backdropClassName?: string | undefined;
};

function viewOf(source: TourRootSource): Window | null {
  const root: TourRoot | null = (typeof source === "function" ? source() : source) ?? null;
  if (!root) return null;
  if (root instanceof Document) return root.defaultView;
  return root.ownerDocument?.defaultView ?? null;
}

function useViewport(root: TourRootSource): { width: number; height: number } {
  const [size, setSize] = useState({ width: 0, height: 0 });

  useEffect(() => {
    const view = viewOf(root);
    if (!view) return;
    const measure = () => setSize({ width: view.innerWidth, height: view.innerHeight });
    measure();
    view.addEventListener("resize", measure);
    return () => view.removeEventListener("resize", measure);
  }, [root]);

  return size;
}

export function Tour(props: TourProps) {
  const {
    definition,
    index,
    onIndexChange,
    onComplete,
    onDismiss,
    onNavigate,
    portalContainer,
    missingAnchor = "center",
    anchorTimeoutMs = DEFAULT_ANCHOR_TIMEOUT_MS,
    navigateTimeoutMs = DEFAULT_NAVIGATE_TIMEOUT_MS,
    padding = DEFAULT_PADDING,
    interaction = "allow-anchor",
    keyboard = true,
    closeOnEsc = true,
    scrollIntoView = true,
    onStepError,
  } = props;

  // A getter rather than `document` directly, so the default is also safe under
  // SSR where there is no document to reference at render time.
  const anchorRoot: TourRootSource = useMemo(
    () => props.anchorRoot ?? (() => (typeof document === "undefined" ? null : document)),
    [props.anchorRoot],
  );

  const validated = useRef<string | null>(null);
  if (validated.current !== definition.id) {
    validateTourDefinition(definition);
    validated.current = definition.id;
  }

  const labels: TourLabels = useMemo(
    () => ({ ...DEFAULT_TOUR_LABELS, ...props.labels }),
    [props.labels],
  );

  const steps = definition.steps;
  const step = steps[index];
  const total = activeSteps(steps).length;
  const viewport = useViewport(anchorRoot);

  const contextSeed = useMemo<TourStepContext | null>(
    () => (step ? { step, index, total, anchor: null, direction: "jump" } : null),
    [step, index, total],
  );
  const { navigating, pendingRoute } = useStepRoute({ step, context: contextSeed, onNavigate });

  const anchorState = useTourAnchor({
    root: anchorRoot,
    target: step?.target,
    timeoutMs:
      pendingRoute || navigating ? navigateTimeoutMs : (step?.timeoutMs ?? anchorTimeoutMs),
    scrollIntoView,
    key: `${definition.id}:${step?.id ?? ""}`,
  });

  const context = useMemo<TourStepContext | null>(
    () => (step ? { step, index, total, anchor: anchorState.anchor, direction: "jump" } : null),
    [step, index, total, anchorState.anchor],
  );

  const backIndex = nextStepIndex(steps, index, "back");
  const forwardIndex = nextStepIndex(steps, index, "next");
  const missing = anchorState.state === "missing";
  const policy = step?.onMissing ?? missingAnchor;

  // A step that names what the operator must do is waiting on THEM, so Next stays
  // shut until its anchor resolves. Advancing anyway would narrate a stop they
  // never reached.
  //
  // The LAST step is exempt: there its button is Done, which ends the tour rather
  // than moving to an unreachable stop. Blocking it would leave the only exit as
  // abandoning a tour the operator has otherwise finished — so a tour ending on a
  // waiting step could never be completed at all.
  const waiting = missing && step?.hint !== undefined && step.hintOptional !== true;
  const isLast = forwardIndex === null;
  const blocked = waiting && !isLast;

  const goNext = () => {
    if (blocked) return;
    if (forwardIndex === null) onComplete();
    else onIndexChange(forwardIndex, "next");
  };
  const goBack = () => {
    if (backIndex !== null) onIndexChange(backIndex, "back");
  };

  useMissingAnchorPolicy({
    definition,
    step,
    index,
    missing,
    policy,
    onStepError,
    onSkip: (next) => (next === null ? onComplete() : onIndexChange(next, "next")),
  });
  useActiveAnchorMarker(anchorState.anchor);
  useStepLifecycle({ step, context, settled: anchorState.state !== "waiting" });

  useTourLayer(true);
  useEscapeLayer(true, onDismiss, closeOnEsc);
  // Lower-case combos: use-hotkey matches against `event.key.toLowerCase()`.
  useHotkey("arrowright", goNext, { enabled: keyboard, priority: 10 });
  useHotkey("arrowleft", goBack, { enabled: keyboard, priority: 10 });

  const anchored = anchorState.state === "found" ? anchorState.anchor : null;
  const cutout = useTourRect(anchored, {
    padding: step?.padding ?? padding,
    radius: step?.radius,
  });

  // "missing" still shows a card (centred), so it reads as active rather than
  // leaving the provider stuck reporting a wait that already gave up.
  const liveStatus: TourStatus = navigating
    ? "navigating"
    : anchorState.state === "waiting"
      ? "waiting"
      : "active";
  const { onStatusChange } = props;
  useEffect(() => onStatusChange?.(liveStatus), [liveStatus, onStatusChange]);

  if (!step) return null;
  if (missing && policy === "skip") return null;

  return (
    <FloatingPortal {...(portalContainer ? { root: portalContainer } : {})}>
      <div
        data-tour-id={definition.id}
        data-tour-step={step.id}
        data-tour-state={navigating ? "navigating" : anchorState.state}
      >
        <span role="status" aria-live="polite" className="sr-only">
          {labels.announce(
            displayPosition(steps, index),
            total,
            typeof step.title === "string" ? step.title : step.id,
          )}
        </span>

        {anchored ? (
          <TourSpotlight
            cutout={cutout}
            viewport={viewport}
            interaction={interaction}
            className={props.backdropClassName}
          />
        ) : null}

        <TourCard
          step={step}
          anchor={anchored}
          current={displayPosition(steps, index)}
          total={total}
          labels={labels}
          blockedHint={missing ? (step.hint ?? null) : null}
          canGoBack={backIndex !== null}
          canGoNext={!blocked}
          isLast={isLast}
          {...(definition.footer ? { footer: definition.footer } : {})}
          onBack={goBack}
          onNext={goNext}
          onDismiss={onDismiss}
          className={props.className}
        />
      </div>
    </FloatingPortal>
  );
}
