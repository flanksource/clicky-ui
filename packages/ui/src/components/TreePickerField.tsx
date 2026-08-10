import { useEffect, useLayoutEffect, useRef, useState, type ReactNode, type Ref } from "react";
import { createPortal } from "react-dom";
import { cn } from "../lib/utils";
import { Icon } from "../data/Icon";
import { UiChevronDown } from "../icons";
import { Tree, type TreeProps } from "../data/Tree";
import { useEscapeLayer, useFloatingZIndex } from "../overlay/modalStack";
import { inputSizeClass, type FormSize } from "./json-schema-form-size";

// Upper bound the open panel grows to so wide trees show full labels before
// truncating; the panel is never narrower than the trigger.
const PANEL_MAX_WIDTH_PX = 480;
// Tallest the panel gets when the viewport allows it.
const PANEL_MAX_HEIGHT_PX = 480;
// Below this there is not enough room to be worth opening downward, so the panel
// flips above the trigger instead.
const PANEL_MIN_HEIGHT_PX = 200;
// Breathing room kept between the panel and the viewport edge.
const VIEWPORT_MARGIN_PX = 8;

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
  /** Highlights the committed node inside the open tree. */
  selected?: T | null;
  /**
   * Force-opens the `selected` node's ancestors so the current value is always
   * visible when the panel opens, however deep its branch. Requires `selected`.
   */
  revealSelected?: boolean;
  /** Renders the tree's expand/collapse + filter toolbar. */
  showControls?: boolean;
  /** Accessible name for the tree inside the panel. */
  ariaLabel?: string;
  /** Empty-state content when `roots` is empty. */
  empty?: ReactNode;
  /** Current-selection display in the trigger; falls back to `placeholder`. */
  label?: ReactNode;
  placeholder?: string;
  disabled?: boolean;
  size?: FormSize;
  className?: string;
  triggerClassName?: string;
  panelClassName?: string;
  renderTrigger?: (props: TreePickerTriggerProps) => ReactNode;
  /**
   * Sticky row pinned below the tree inside the open panel — an escape hatch
   * from a dropdown that has run out of room (a fuller browser, a "create new")
   * rather than another node. It is handed `close` because acting on it almost
   * always means leaving the dropdown behind.
   */
  renderFooter?: (props: { close: () => void }) => ReactNode;
}

export interface TreePickerTriggerProps {
  open: boolean;
  disabled: boolean;
  triggerRef: Ref<HTMLButtonElement>;
  toggle: () => void;
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
  selected,
  revealSelected,
  showControls,
  ariaLabel,
  empty,
  label,
  placeholder = "Select…",
  disabled,
  size,
  className,
  triggerClassName,
  panelClassName,
  renderTrigger,
  renderFooter,
}: TreePickerFieldProps<T>) {
  const [open, setOpen] = useState(false);
  const floatingZ = useFloatingZIndex();
  const [pos, setPos] = useState<
    { top: number; left: number; width: number; maxWidth: number; maxHeight: number } | null
  >(null);
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
      const anchor = rootRef.current;
      if (!anchor) return;
      const rect = anchor.getBoundingClientRect();
      const viewportCap = window.innerWidth - rect.left - VIEWPORT_MARGIN_PX;
      const maxWidth = Math.max(rect.width, Math.min(PANEL_MAX_WIDTH_PX, viewportCap));
      // Fit the panel to the room the trigger actually has, and flip it above
      // when there is more room up there. Without this the panel keeps its full
      // height wherever the trigger sits, so a trigger low on the page pushes
      // the panel's bottom past the viewport — taking the sticky footer, and
      // any escape hatch pinned to it, out of reach entirely.
      const below = window.innerHeight - rect.bottom - VIEWPORT_MARGIN_PX - 4;
      const above = rect.top - VIEWPORT_MARGIN_PX - 4;
      const flip = below < PANEL_MIN_HEIGHT_PX && above > below;
      const available = Math.max(flip ? above : below, PANEL_MIN_HEIGHT_PX);
      const maxHeight = Math.min(PANEL_MAX_HEIGHT_PX, available);
      setPos({
        top: flip ? Math.max(VIEWPORT_MARGIN_PX, rect.top - 4 - maxHeight) : rect.bottom + 4,
        left: rect.left,
        width: rect.width,
        maxWidth,
        maxHeight,
      });
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
      {renderTrigger ? (
        renderTrigger({
          open,
          disabled: Boolean(disabled),
          triggerRef: anchorRef,
          toggle: () => {
            if (!disabled) setOpen((current) => !current);
          },
        })
      ) : (
        <button
          ref={anchorRef}
          type="button"
          disabled={disabled}
          aria-haspopup="tree"
          aria-expanded={open}
          onClick={() => setOpen((current) => !current)}
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
      )}

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
              // Computed rather than constant: the popup has to clear whatever
              // modal is open, and a modal sits at zIndex.modal (10000). A
              // hardcoded z-50 renders the tree behind any dialog it is opened
              // in — see ../overlay/zIndex.
              zIndex: floatingZ,
              // Grow to fit the widest row/toolbar, but never narrower than the
              // trigger nor wider than maxWidth — so labels show in full and the
              // toolbar's intrinsic-width search input never forces a scrollbar.
              minWidth: pos.width,
              width: "max-content",
              maxWidth: pos.maxWidth,
              maxHeight: pos.maxHeight,
            }}
            className={cn(
              // Height comes from the measured maxHeight above, not a viewport
              // fraction: 60vh is the same number wherever the trigger sits, and
              // a trigger low on the page needs a shorter panel, not an equal one.
              "flex flex-col overflow-hidden rounded-md border border-border bg-popover shadow-md",
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
                {...(selected !== undefined ? { selected } : {})}
                {...(revealSelected !== undefined ? { revealSelected } : {})}
                {...(showControls !== undefined ? { showControls } : {})}
                {...(ariaLabel !== undefined ? { ariaLabel } : {})}
                {...(empty !== undefined ? { empty } : {})}
                onSelect={(node) => {
                  if (!isSelectable || isSelectable(node)) {
                    onSelect(node);
                    setOpen(false);
                  }
                }}
              />
            </div>
            {renderFooter && (
              <div className="shrink-0 border-t border-border bg-popover">
                {renderFooter({ close: () => setOpen(false) })}
              </div>
            )}
          </div>,
          document.body,
        )}
    </div>
  );
}
