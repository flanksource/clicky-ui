import { useEffect, useRef, type ReactNode } from "react";
import { cn } from "../lib/utils";
import { Icon } from "../data/Icon";

export type ModalSize = "sm" | "md" | "lg" | "xl" | "full";

export type ModalProps = {
  open: boolean;
  onClose: () => void;
  title?: ReactNode;
  size?: ModalSize;
  closeOnBackdrop?: boolean;
  closeOnEsc?: boolean;
  hideClose?: boolean;
  className?: string;
  headerSlot?: ReactNode;
  footer?: ReactNode;
  children: ReactNode;
};

const sizeClass: Record<ModalSize, string> = {
  sm: "max-w-sm",
  md: "max-w-md",
  lg: "max-w-2xl",
  xl: "max-w-4xl",
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
  className,
  headerSlot,
  footer,
  children,
}: ModalProps) {
  const dialogRef = useRef<HTMLDivElement>(null);

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
          sizeClass[size],
          className,
        )}
        onClick={(e) => e.stopPropagation()}
      >
        {(title || headerSlot || !hideClose) && (
          <div className="flex items-center gap-density-2 px-density-4 py-density-3 border-b border-border">
            {title && <h2 className="text-sm font-semibold flex-1">{title}</h2>}
            {headerSlot}
            {!hideClose && (
              <button
                type="button"
                onClick={onClose}
                aria-label="Close"
                className="text-muted-foreground hover:text-foreground"
              >
                <Icon name="codicon:close" />
              </button>
            )}
          </div>
        )}
        <div className="flex-1 overflow-auto px-density-4 py-density-3">{children}</div>
        {footer && <div className="px-density-4 py-density-3 border-t border-border">{footer}</div>}
      </div>
    </div>
  );
}
