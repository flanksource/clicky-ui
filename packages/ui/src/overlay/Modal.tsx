import { useEffect, useRef, useState, type ReactNode } from "react";
import { cn } from "../lib/utils";
import { Icon } from "../data/Icon";
import { Button } from "../components/button";
import { UiClose, UiFullscreen, UiFullscreenFilled } from "../icons";
import { useModalStack } from "./modalStack";

export type ModalSize = "sm" | "md" | "lg" | "xl" | "full";

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
  /** Modal body content. */
  children: ReactNode;
};

const sizeClass: Record<ModalSize, string> = {
  sm: "max-w-sm max-h-[90vh]",
  md: "max-w-md max-h-[90vh]",
  lg: "max-w-2xl max-h-[90vh]",
  xl: "max-w-4xl max-h-[90vh]",
  full: "max-w-[95vw] max-h-[95vh]",
};

const DEFAULT_CONFIRM: Required<ConfirmCloseOptions> = {
  title: "Discard changes?",
  message: "You have unsaved changes. Closing now will discard them.",
  confirmLabel: "Discard",
  cancelLabel: "Keep editing",
};

export function Modal({
  open,
  onClose,
  confirmClose = false,
  title,
  size = "md",
  closeOnBackdrop = false,
  closeOnEsc = true,
  hideClose = false,
  expandable = true,
  className,
  headerSlot,
  footer,
  children,
}: ModalProps) {
  const dialogRef = useRef<HTMLDivElement>(null);
  const { isTop, depth } = useModalStack(open);
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

  useEffect(() => {
    // Only the topmost modal handles Escape so a keypress closes one nested
    // layer at a time instead of every open modal at once.
    if (!open || !closeOnEsc || !isTop) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== "Escape") return;
      // While the prompt is up, Escape dismisses the prompt rather than the modal.
      if (confirming) setConfirming(false);
      else requestClose();
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open, closeOnEsc, isTop, confirming, confirmClose, onClose]);

  useEffect(() => {
    if (!open) return;
    const prev = document.activeElement as HTMLElement | null;
    dialogRef.current?.focus();
    return () => prev?.focus?.();
  }, [open]);

  if (!open) return null;

  return (
    <div
      className={cn(
        "fixed inset-0 flex items-center justify-center",
        // Nested modals dim less so the dialog they opened over stays visible.
        depth === 0 ? "bg-black/40" : "bg-black/20",
      )}
      style={{ zIndex: 50 + depth * 10 }}
      onClick={closeOnBackdrop ? requestClose : undefined}
      role="presentation"
    >
      <div
        ref={dialogRef}
        tabIndex={-1}
        role="dialog"
        aria-modal="true"
        aria-label={typeof title === "string" ? title : undefined}
        className={cn(
          "relative bg-background border border-border rounded-lg shadow-xl w-full flex flex-col",
          expanded ? sizeClass.full : sizeClass[size],
          className,
        )}
        onClick={(e) => e.stopPropagation()}
      >
        {(title || headerSlot || expandable || !hideClose) && (
          <div className="flex items-center gap-density-2 px-density-4 py-density-3 border-b border-border">
            {title ? (
              <h2 className="text-sm font-semibold flex-1">{title}</h2>
            ) : (
              <span className="flex-1" />
            )}
            {headerSlot}
            {expandable && (
              <button
                type="button"
                onClick={() => setExpanded((v) => !v)}
                aria-label={expanded ? "Restore size" : "Expand to fullscreen"}
                className="text-muted-foreground hover:text-foreground"
              >
                <Icon icon={expanded ? UiFullscreenFilled : UiFullscreen} />
              </button>
            )}
            {!hideClose && (
              <button
                type="button"
                onClick={requestClose}
                aria-label="Close"
                className="text-muted-foreground hover:text-foreground"
              >
                <Icon icon={UiClose} />
              </button>
            )}
          </div>
        )}
        <div className="flex-1 overflow-auto px-density-4 py-density-3">{children}</div>
        {footer && <div className="px-density-4 py-density-3 border-t border-border">{footer}</div>}
        {confirming && (
          <ConfirmClosePrompt
            options={confirmClose === true ? DEFAULT_CONFIRM : { ...DEFAULT_CONFIRM, ...confirmClose }}
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
      className="absolute inset-0 z-10 flex items-center justify-center rounded-lg bg-background/80 p-density-4"
      role="alertdialog"
      aria-modal="true"
      aria-label={typeof options.title === "string" ? options.title : "Confirm close"}
      onClick={(e) => e.stopPropagation()}
    >
      <div className="w-full max-w-sm rounded-lg border border-border bg-background p-density-4 shadow-xl">
        <h3 className="text-sm font-semibold">{options.title}</h3>
        <p className="mt-density-2 text-sm text-muted-foreground">{options.message}</p>
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
