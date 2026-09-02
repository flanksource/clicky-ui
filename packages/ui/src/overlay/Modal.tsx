import { useEffect, useRef, useState, type ReactNode } from "react";
import { createPortal } from "react-dom";
import { cn } from "../lib/utils";
import { Icon } from "../data/Icon";
import { Button } from "../components/button";
import {
  UiArrowLeft,
  UiClose,
  UiFullscreen,
  UiFullscreenFilled,
} from "../icons";
import { useEscapeLayer, useModalStack } from "./modalStack";
import { zIndex } from "./zIndex";

export type ModalSize = "sm" | "md" | "lg" | "xl" | "2xl" | "full";

/** Copy for the discard-confirmation prompt shown before a guarded close. */
export type ConfirmCloseOptions = {
  /** Heading of the confirmation prompt. */
  title?: ReactNode;
  /** Body explaining what is lost on close. */
  message?: ReactNode;
  /** Label of the button that proceeds with closing. */
  confirmLabel?: string;
  /** Label of the button that dismisses the prompt and keeps the modal open. */
  cancelLabel?: string;
};

export type ModalProps = {
  /** Controls whether the modal is mounted. */
  open: boolean;
  /** Called when the modal requests to close. */
  onClose: () => void;
  /**
   * Guard every close path (close button, Escape, backdrop) behind a discard
   * confirmation. `true` uses the default copy; pass options to customise it.
   * `onClose` only fires once the user confirms. Set this while the modal holds
   * unsaved edits and clear it (or pass `false`) once there is nothing to lose.
   */
  confirmClose?: boolean | ConfirmCloseOptions;
  /** Header title and accessible dialog label when it is a string. */
  title?: ReactNode;
  /**
   * Secondary header content rendered on its own row directly beneath the title.
   * The title stays a single row alongside the expand/close buttons, so a tall
   * subtitle (e.g. a tab switcher) never pushes those buttons down.
   */
  subtitle?: ReactNode;
  /** Width/height preset for the dialog. */
  size?: ModalSize;
  /** Close when the backdrop is clicked. Off by default; close via Escape or the close button. */
  closeOnBackdrop?: boolean;
  /** Close when Escape is pressed. */
  closeOnEsc?: boolean;
  /** Hide the close button. */
  hideClose?: boolean;
  /** Show an expand/restore button. */
  expandable?: boolean;
  /** Classes applied to the dialog panel. */
  className?: string;
  /** Extra header content rendered before the expand/close buttons. */
  headerSlot?: ReactNode;
  /** Footer content pinned below the scrollable body. */
  footer?: ReactNode;
  /**
   * Whether the body scrolls its overflow. Default `true`. Set `false` when the
   * body owns a single fill-height child that scrolls internally (e.g. a
   * DataTable with a sticky header): the body becomes a non-scrolling flex
   * column, so only that child's own scroll region moves.
   */
  scrollBody?: boolean;
  /** Modal body content. */
  children: ReactNode;
};

const sizeClass: Record<ModalSize, string> = {
  sm: "max-w-sm",
  md: "max-w-md",
  lg: "max-w-2xl",
  xl: "max-w-4xl",
  "2xl": "max-w-6xl",
  full: "max-w-[95vw]",
};

const DEFAULT_CONFIRM: Required<ConfirmCloseOptions> = {
  title: "Discard changes?",
  message: "You have unsaved changes. Closing now will discard them.",
  confirmLabel: "Discard",
  cancelLabel: "Keep editing",
};

const MOBILE_QUERY = "(max-width: 639px)";
const REDUCED_MOTION_QUERY = "(prefers-reduced-motion: reduce)";
const MOBILE_TRANSITION_MS = 200;

export function Modal({
  open,
  onClose,
  confirmClose = false,
  title,
  subtitle,
  size = "md",
  closeOnBackdrop = false,
  closeOnEsc = true,
  hideClose = false,
  expandable = true,
  className,
  headerSlot,
  footer,
  scrollBody = true,
  children,
}: ModalProps) {
  const dialogRef = useRef<HTMLDivElement>(null);
  const closeTimerRef = useRef<number | undefined>(undefined);
  const openFrameRef = useRef<number | undefined>(undefined);
  const [present, setPresent] = useState(open);
  const [mobileVisible, setMobileVisible] = useState(false);
  const { depth } = useModalStack(present);
  const [expanded, setExpanded] = useState(false);
  // When confirmClose is active, a close request opens this prompt instead of
  // closing outright; onClose only fires once the user confirms the discard.
  const [confirming, setConfirming] = useState(false);

  // requestClose is the single entry point for every close affordance. With the
  // guard on, it surfaces the confirmation; otherwise it closes immediately.
  const requestClose = () => {
    if (confirmClose) setConfirming(true);
    else onClose();
  };

  useEffect(() => {
    window.clearTimeout(closeTimerRef.current);
    window.cancelAnimationFrame(openFrameRef.current ?? 0);
    const animateMobile =
      window.matchMedia(MOBILE_QUERY).matches &&
      !window.matchMedia(REDUCED_MOTION_QUERY).matches;

    if (open) {
      setPresent(true);
      if (animateMobile) {
        setMobileVisible(false);
        openFrameRef.current = window.requestAnimationFrame(() => {
          setMobileVisible(true);
        });
      } else {
        setMobileVisible(true);
      }
    } else if (animateMobile) {
      setMobileVisible(false);
      closeTimerRef.current = window.setTimeout(
        () => setPresent(false),
        MOBILE_TRANSITION_MS,
      );
    } else {
      setMobileVisible(false);
      setPresent(false);
    }

    return () => {
      window.clearTimeout(closeTimerRef.current);
      window.cancelAnimationFrame(openFrameRef.current ?? 0);
    };
  }, [open]);

  useEffect(() => {
    if (!open) {
      setExpanded(false);
      setConfirming(false);
    }
  }, [open]);

  // A close guard that disappears mid-prompt (changes saved/reverted) should
  // not leave a stale confirmation dialog up.
  useEffect(() => {
    if (!confirmClose) setConfirming(false);
  }, [confirmClose]);

  useEscapeLayer(
    open,
    () => {
      // While the prompt is up, Escape dismisses the prompt rather than the modal.
      if (confirming) setConfirming(false);
      else requestClose();
    },
    closeOnEsc,
  );

  useEffect(() => {
    if (!open) return;
    const prev = document.activeElement as HTMLElement | null;
    dialogRef.current?.focus();
    return () => prev?.focus?.();
  }, [open]);

  if (!present) return null;

  const overlay = (
    <div
      className={cn(
        "fixed inset-0 flex items-center justify-center p-density-2 sm:p-density-4 max-sm:items-stretch max-sm:justify-end max-sm:p-0 max-sm:!bg-transparent",
        // Nested modals dim less so the dialog they opened over stays visible.
        depth === 0 ? "bg-black/40" : "bg-black/20",
      )}
      // Sits in the modal band of the centralized z-index scale; +depth keeps
      // nested modals above their parent. Floating content (dropdowns, tooltips)
      // computes its z relative to this via useFloatingZIndex so it clears the
      // modal instead of rendering behind it.
      style={{ zIndex: zIndex.modal + depth * zIndex.modalStep }}
      onClick={closeOnBackdrop ? requestClose : undefined}
      role="presentation"
    >
      <div
        ref={dialogRef}
        tabIndex={-1}
        role="dialog"
        aria-modal="true"
        aria-label={typeof title === "string" ? title : undefined}
        data-state={mobileVisible ? "open" : "closed"}
        className={cn(
          "relative flex w-full flex-col overflow-hidden rounded-lg border border-border bg-background shadow-xl",
          "max-sm:!h-dvh max-sm:!max-h-dvh max-sm:!max-w-none max-sm:!rounded-none max-sm:!border-0 max-sm:shadow-none",
          "max-sm:transition-transform max-sm:duration-200 max-sm:ease-out max-sm:motion-reduce:transition-none",
          "max-sm:data-[state=closed]:translate-x-full max-sm:data-[state=open]:translate-x-0",
          expanded ? sizeClass.full : sizeClass[size],
          className,
        )}
        // Inline maxHeight (not an arbitrary Tailwind class) so the panel stays
        // viewport-bounded even when a consumer's Tailwind build can't generate
        // the dvh utility — e.g. www aliases clicky-ui to source but scans the
        // published dist. When expanded, fill the viewport.
        style={{
          maxHeight: "calc(100dvh - 2rem)",
          ...(expanded ? { height: "calc(100dvh - 2rem)" } : {}),
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {(title || subtitle || headerSlot || expandable || !hideClose) && (
          <div className="shrink-0 px-density-4 py-density-3 border-b border-border max-sm:min-h-14 max-sm:bg-background">
            <div className="flex items-center gap-density-2">
              {!hideClose && (
                <Button
                  type="button"
                  onClick={requestClose}
                  variant="ghost"
                  size="icon"
                  aria-label="Back"
                  className="-ml-2 text-foreground sm:hidden"
                >
                  <Icon icon={UiArrowLeft} />
                </Button>
              )}
              {title ? (
                <h2 className="text-sm font-semibold flex-1 max-sm:text-base max-sm:leading-6">
                  {title}
                </h2>
              ) : (
                <span className="flex-1" />
              )}
              {headerSlot}
              {expandable && (
                <button
                  type="button"
                  onClick={() => setExpanded((v) => !v)}
                  aria-label={
                    expanded ? "Restore size" : "Expand to fullscreen"
                  }
                  className="text-muted-foreground hover:text-foreground max-sm:hidden"
                >
                  <Icon icon={expanded ? UiFullscreenFilled : UiFullscreen} />
                </button>
              )}
              {!hideClose && (
                <button
                  type="button"
                  onClick={requestClose}
                  aria-label="Close"
                  className="text-muted-foreground hover:text-foreground max-sm:hidden"
                >
                  <Icon icon={UiClose} />
                </button>
              )}
            </div>
            {subtitle ? <div className="mt-density-2">{subtitle}</div> : null}
          </div>
        )}
        <div
          data-slot="modal-body"
          className={cn(
            "min-h-0 flex-1 px-density-4 py-density-3 max-sm:py-density-4",
            scrollBody
              ? "overflow-auto"
              : "flex flex-col overflow-hidden",
          )}
        >
          {children}
        </div>
        {footer && (
          <div
            data-slot="modal-footer"
            className="shrink-0 px-density-4 py-density-3 border-t border-border max-sm:py-density-4"
          >
            {footer}
          </div>
        )}
        {confirming && (
          <ConfirmClosePrompt
            options={
              confirmClose === true
                ? DEFAULT_CONFIRM
                : { ...DEFAULT_CONFIRM, ...confirmClose }
            }
            onConfirm={() => {
              setConfirming(false);
              onClose();
            }}
            onCancel={() => setConfirming(false)}
          />
        )}
      </div>
    </div>
  );

  // Render into document.body so the fixed-position overlay escapes any ancestor
  // transform/overflow (e.g. a dropdown menu positioned via a CSS transform),
  // which would otherwise trap position:fixed inside that ancestor's box and clip
  // the modal to it.
  return typeof document !== "undefined"
    ? createPortal(overlay, document.body)
    : null;
}

function ConfirmClosePrompt({
  options,
  onConfirm,
  onCancel,
}: {
  options: Required<ConfirmCloseOptions>;
  onConfirm: () => void;
  onCancel: () => void;
}) {
  return (
    <div
      className="absolute inset-0 z-10 flex items-center justify-center rounded-lg bg-background/80 p-density-4 max-sm:rounded-none"
      role="alertdialog"
      aria-modal="true"
      aria-label={
        typeof options.title === "string" ? options.title : "Confirm close"
      }
      onClick={(e) => e.stopPropagation()}
    >
      <div className="w-full max-w-sm rounded-lg border border-border bg-background p-density-4 shadow-xl">
        <h3 className="text-sm font-semibold">{options.title}</h3>
        <p className="mt-density-2 text-sm text-muted-foreground">
          {options.message}
        </p>
        <div className="mt-density-4 flex justify-end gap-density-2">
          <Button variant="ghost" size="sm" onClick={onCancel}>
            {options.cancelLabel}
          </Button>
          <Button variant="destructive" size="sm" onClick={onConfirm}>
            {options.confirmLabel}
          </Button>
        </div>
      </div>
    </div>
  );
}
