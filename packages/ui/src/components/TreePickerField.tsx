import { useEffect, useLayoutEffect, useRef, useState, type ReactNode } from "react";
import { createPortal } from "react-dom";
import { cn } from "../lib/utils";
import { Icon } from "../data/Icon";
import { UiChevronDown } from "../icons";
import { Tree, type TreeProps } from "../data/Tree";
import { useEscapeLayer } from "../overlay/modalStack";
import { inputSizeClass, type FormSize } from "./json-schema-form-size";

// Upper bound the open panel grows to so wide trees show full labels before
// truncating; the panel is never narrower than the trigger.
const PANEL_MAX_WIDTH_PX = 480;

export interface TreePickerFieldProps<T> {
  /** Root nodes of the tree to browse. */
  roots: T[];
  getKey: (node: T) => string | number;
  getChildren: (node: T) => T[] | undefined;
  renderRow: TreeProps<T>["renderRow"];
  getSearchText?: (node: T) => string;
  defaultOpen?: (node: T, depth: number) => boolean;
  /**
   * Decides which nodes commit a selection when clicked. A click on a
   * non-selectable node still toggles its expansion (it never closes the
   * picker). Defaults to every node selectable.
   */
  isSelectable?: (node: T) => boolean;
  /** Fires for a selectable node, then closes the dropdown. */
  onSelect: (node: T) => void;
  /** Current-selection display in the trigger; falls back to `placeholder`. */
  label?: ReactNode;
  placeholder?: string;
  disabled?: boolean;
  size?: FormSize;
  className?: string;
  triggerClassName?: string;
  panelClassName?: string;
}

// TreePickerField is a form-field-styled trigger (matching Combobox's closed
// input) that opens a portal-anchored dropdown holding a Tree. The dropdown is
// positioned with fixed coordinates measured from the trigger so it escapes any
// overflow-hidden / scroll ancestor (e.g. a modal body). A click on a selectable
// node commits and closes; a non-selectable node only toggles expansion.
export function TreePickerField<T>({
  roots,
  getKey,
  getChildren,
  renderRow,
  getSearchText,
  defaultOpen,
  isSelectable,
  onSelect,
  label,
  placeholder = "Select…",
  disabled,
  size,
  className,
  triggerClassName,
  panelClassName,
}: TreePickerFieldProps<T>) {
  const [open, setOpen] = useState(false);
  const [pos, setPos] = useState<{ top: number; left: number; width: number; maxWidth: number } | null>(
    null,
  );
  const rootRef = useRef<HTMLDivElement>(null);
  const anchorRef = useRef<HTMLButtonElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);

  useEscapeLayer(open, () => {
    setOpen(false);
    anchorRef.current?.focus();
  });

  // Position the portaled panel from the trigger rect, repositioning while open.
  useLayoutEffect(() => {
    if (!open) {
      setPos(null);
      return;
    }
    const update = () => {
      const anchor = anchorRef.current;
      if (!anchor) return;
      const rect = anchor.getBoundingClientRect();
      const viewportCap = window.innerWidth - rect.left - 8;
      const maxWidth = Math.max(rect.width, Math.min(PANEL_MAX_WIDTH_PX, viewportCap));
      setPos({ top: rect.bottom + 4, left: rect.left, width: rect.width, maxWidth });
    };
    update();
    window.addEventListener("scroll", update, true);
    window.addEventListener("resize", update);
    return () => {
      window.removeEventListener("scroll", update, true);
      window.removeEventListener("resize", update);
    };
  }, [open]);

  // Dismiss on an outside pointer-down (the trigger and panel are exempt).
  useEffect(() => {
    if (!open) return;
    const onPointerDown = (e: MouseEvent) => {
      const target = e.target as Node;
      if (!rootRef.current?.contains(target) && !panelRef.current?.contains(target)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", onPointerDown);
    return () => document.removeEventListener("mousedown", onPointerDown);
  }, [open]);

  return (
    <div ref={rootRef} className={cn("relative", className)}>
      <button
        ref={anchorRef}
        type="button"
        disabled={disabled}
        aria-haspopup="tree"
        aria-expanded={open}
        onClick={() => setOpen((o) => !o)}
        className={cn(
          "relative flex w-full items-center rounded-md border border-input bg-background text-left text-foreground",
          size ? inputSizeClass[size] : "h-control-h px-control-px text-sm",
          "pr-8",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1",
          "disabled:cursor-not-allowed disabled:opacity-50",
          triggerClassName,
        )}
      >
        <span className={cn("min-w-0 flex-1 truncate", label == null && "text-muted-foreground")}>
          {label ?? placeholder}
        </span>
        <span className="pointer-events-none absolute right-0 flex h-full items-center px-2 text-muted-foreground">
          <Icon icon={UiChevronDown} className="text-xs" />
        </span>
      </button>

      {open &&
        pos &&
        createPortal(
          <div
            ref={panelRef}
            data-slot="tree-picker-popup"
            style={{
              position: "fixed",
              top: pos.top,
              left: pos.left,
              // Grow to fit the widest row/toolbar, but never narrower than the
              // trigger nor wider than maxWidth — so labels show in full and the
              // toolbar's intrinsic-width search input never forces a scrollbar.
              minWidth: pos.width,
              width: "max-content",
              maxWidth: pos.maxWidth,
            }}
            className={cn(
              "z-50 flex max-h-[60vh] flex-col overflow-hidden rounded-md border border-border bg-popover shadow-md",
              panelClassName,
            )}
          >
            <div className="min-h-0 flex-1 overflow-auto">
              <Tree<T>
                roots={roots}
                getKey={getKey}
                getChildren={getChildren}
                renderRow={renderRow}
                {...(getSearchText ? { getSearchText } : {})}
                {...(defaultOpen ? { defaultOpen } : {})}
                onSelect={(node) => {
                  if (!isSelectable || isSelectable(node)) {
                    onSelect(node);
                    setOpen(false);
                  }
                }}
              />
            </div>
          </div>,
          document.body,
        )}
    </div>
  );
}
