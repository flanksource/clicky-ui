import { lazy, Suspense, useEffect, useId, type ReactNode } from "react";
import {
  autoUpdate,
  flip,
  FloatingFocusManager,
  offset,
  shift,
  useFloating,
  useInteractions,
  useRole,
} from "@floating-ui/react";
import type { Placement } from "@floating-ui/react";
import { cn } from "../lib/utils";
import { Button } from "../components/button";
import { Icon } from "../data/Icon";
import { UiArrowLeft, UiArrowRight, UiClose } from "../icons";
import type { TourLabels, TourStep } from "./tour-types";
import { zIndex } from "./zIndex";

// `Markdown` pulls in CodeBlock -> shiki/marked. A tour card body is a
// paragraph, so a consumer with no markdown steps should not carry that graph.
const Markdown = lazy(() =>
  import("../data/Markdown").then((module) => ({ default: module.Markdown })),
);

/** Where an anchorless step's card sits — the same slot the spotlight would centre on. */
const CENTERED_STYLE = {
  position: "fixed",
  top: "50%",
  left: "50%",
  transform: "translate(-50%, -50%)",
} as const;

export type TourCardProps = {
  step: TourStep;
  anchor: HTMLElement | null;
  /** 1-based position among enabled steps. */
  current: number;
  total: number;
  labels: TourLabels;
  /** Shown instead of the nav hint when the step is waiting on the operator. */
  blockedHint: ReactNode | null;
  canGoBack: boolean;
  canGoNext: boolean;
  isLast: boolean;
  /** Rendered under the nav row; the tour's link back to its written guide. */
  footer?: ReactNode;
  onBack: () => void;
  onNext: () => void;
  onDismiss: () => void;
  className?: string | undefined;
};

function StepBody({ step }: { step: TourStep }) {
  if (step.markdown !== undefined) {
    return (
      <Suspense fallback={<p className="whitespace-pre-wrap text-sm">{step.markdown}</p>}>
        <Markdown text={step.markdown} className="text-sm" />
      </Suspense>
    );
  }
  return <div className="text-sm text-muted-foreground">{step.body}</div>;
}

export function TourCard(props: TourCardProps) {
  const { step, anchor, current, total, labels, blockedHint, isLast } = props;
  const titleId = useId();
  const bodyId = useId();
  const placement: Placement = step.placement ?? "bottom";

  const { refs, floatingStyles, context } = useFloating({
    open: true,
    placement,
    middleware: [offset(12), flip(), shift({ padding: 8 })],
    whileElementsMounted: autoUpdate,
  });
  const { getFloatingProps } = useInteractions([useRole(context, { role: "dialog" })]);

  // In an effect, not during render: setPositionReference schedules a state
  // update, so calling it inline re-renders forever.
  useEffect(() => {
    if (anchor) refs.setPositionReference(anchor);
  }, [anchor, refs]);

  const card = (
    <div
      // Always the floating element so FloatingFocusManager has a node to manage;
      // only an anchored card takes floating-ui's computed position.
      ref={refs.setFloating}
      // No `aria-modal`: it hides the rest of the document from assistive tech,
      // which would hide the very element the step is describing.
      role="dialog"
      aria-labelledby={titleId}
      aria-describedby={bodyId}
      data-tour-card=""
      className={cn(
        "w-[min(22rem,calc(100vw-2rem))] rounded-lg border border-border bg-popover p-density-4 text-popover-foreground shadow-xl",
        props.className,
        step.cardClassName,
      )}
      // One element in one tree position whether or not there is an anchor: a
      // structural switch here would unmount and remount the card the moment a
      // waited-for anchor resolves, losing focus and any in-flight transition.
      style={{
        ...(anchor ? floatingStyles : CENTERED_STYLE),
        zIndex: zIndex.tour + zIndex.tourCardOffset,
      }}
      {...getFloatingProps()}
    >
      <div className="flex items-start justify-between gap-density-2">
        <h2 id={titleId} className="text-sm font-semibold">
          {step.title}
        </h2>
        <Button
          variant="ghost"
          size="icon"
          className="-mr-1 -mt-1 size-7"
          aria-label={labels.close}
          onClick={props.onDismiss}
        >
          <Icon icon={UiClose} className="size-4" />
        </Button>
      </div>

      <div id={bodyId} className="mt-density-2">
        <StepBody step={step} />
      </div>

      {blockedHint ? (
        <p className="mt-density-2 rounded-md border border-border bg-muted/50 p-density-2 text-xs text-muted-foreground">
          {blockedHint}
        </p>
      ) : null}

      <div className="mt-density-4 flex items-center justify-between gap-density-2">
        <span className="text-xs tabular-nums text-muted-foreground">
          {labels.counter(current, total)}
        </span>
        <div className="flex items-center gap-density-2">
          <Button variant="ghost" size="sm" onClick={props.onDismiss}>
            {labels.skip}
          </Button>
          <Button
            variant="outline"
            size="sm"
            disabled={!props.canGoBack}
            onClick={props.onBack}
          >
            <Icon icon={UiArrowLeft} className="size-3.5" />
            {labels.back}
          </Button>
          <Button size="sm" disabled={!props.canGoNext} onClick={props.onNext}>
            {isLast ? labels.done : labels.next}
            {isLast ? null : <Icon icon={UiArrowRight} className="size-3.5" />}
          </Button>
        </div>
      </div>

      {props.footer ? (
        <div className="mt-density-2 border-t border-border pt-density-2 text-xs text-muted-foreground">
          {props.footer}
        </div>
      ) : null}
    </div>
  );

  return (
    <FloatingFocusManager context={context} modal={false} returnFocus initialFocus={-1}>
      {card}
    </FloatingFocusManager>
  );
}
