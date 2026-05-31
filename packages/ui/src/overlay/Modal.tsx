import { useEffect, useRef, useState, type ReactNode } from "react";
import { cn } from "../lib/utils";
import { Icon } from "../data/Icon";
import { UiClose, UiFullscreen, UiFullscreenFilled } from "@flanksource/icons/ui";

export type ModalSize = "sm" | "md" | "lg" | "xl" | "full";

export type ModalProps = {
  /** Controls whether the modal is mounted. */
  open: boolean;
  /** Called when the modal requests to close. */
  onClose: () => void;
  /** Header title and accessible dialog label when it is a string. */
  title?: ReactNode;
  /** Width/height preset for the dialog. */
  size?: ModalSize;
  /** Close when the backdrop is clicked. */
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

export function Modal({
  open,
  onClose,
  title,
  size = "md",
  closeOnBackdrop = true,
  closeOnEsc = true,
  hideClose = false,
  expandable = true,
  className,
  headerSlot,
  footer,
  children,
}: ModalProps) {
  const dialogRef = useRef<HTMLDivElement>(null);
  const [expanded, setExpanded] = useState(false);

  useEffect(() => {
    if (!open) setExpanded(false);
  }, [open]);

  useEffect(() => {
    if (!open || !closeOnEsc) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open, closeOnEsc, onClose]);

  useEffect(() => {
    if (!open) return;
    const prev = document.activeElement as HTMLElement | null;
    dialogRef.current?.focus();
    return () => prev?.focus?.();
  }, [open]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40"
      onClick={closeOnBackdrop ? onClose : undefined}
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
                onClick={onClose}
                aria-label="Close"
                className="text-muted-foreground hover:text-foreground"
              >
                <Icon icon={UiClose} />
              </button>
            )}
          </div>
        )}
        <div className="flex-1 overflow-auto px-density-4 py-density-3">
          {children}
        </div>
        {footer && (
          <div className="px-density-4 py-density-3 border-t border-border">
            {footer}
          </div>
        )}
      </div>
    </div>
  );
}
