import { useEffect, useRef, useState, type ReactNode } from "react";
import {
  autoUpdate,
  flip,
  FloatingFocusManager,
  FloatingList,
  FloatingNode,
  FloatingPortal,
  FloatingTree,
  offset,
  shift,
  useClick,
  useDismiss,
  useFloating,
  useFloatingNodeId,
  useFloatingTree,
  useInteractions,
  useListNavigation,
  useRole,
} from "@floating-ui/react";
import { cn } from "../lib/utils";
import { Button, type ButtonProps } from "../components/button";
import { Icon, type StaticIconComponent } from "../data/Icon";
import { UiChevronDown } from "../icons";
import { MENU_POPOVER_CLASS, MenuContext } from "./dropdownMenuContext";
import { MenuItemList } from "./DropdownMenuSubmenu";
import { useEscapeLayer, useFloatingZIndex } from "./modalStack";

export type DropdownMenuItem = {
  /** Visible label. */
  label: ReactNode;
  /** Called when the item is chosen. Ignored when the item has `children`. */
  onSelect: () => void;
  /** Iconify name or imported icon component rendered before the label. */
  icon?: string | StaticIconComponent;
  /** CSS colour applied to this item's icon (the glyph fills `currentColor`). */
  iconColor?: string;
  /**
   * Section header. A non-interactive header renders above the first item of
   * each contiguous group — provide items pre-sorted by `group`. Items without
   * a `group` render no header.
   */
  group?: string;
  /** Browser tooltip for the item. */
  title?: string;
  /** Disable selection. */
  disabled?: boolean;
  /**
   * Nested submenu items. When present the item becomes a submenu trigger: it
   * opens a flyout of `children` (recursively) on hover / click / ArrowRight
   * instead of firing `onSelect`.
   */
  children?: DropdownMenuItem[];
};

export type DropdownMenuProps = {
  /** Trigger label. Ignored when `trigger` is provided. */
  label?: ReactNode;
  /** Icon shown before the trigger label. Ignored when `trigger` is provided. */
  icon?: string | StaticIconComponent;
  /** Hide the trailing chevron on the default trigger. */
  hideChevron?: boolean;
  /** Variant forwarded to the default Button trigger. */
  variant?: ButtonProps["variant"];
  /** Size forwarded to the default Button trigger. */
  size?: ButtonProps["size"];
  /** Fully custom trigger. Receives no props; the menu wraps it with open state. */
  trigger?: ReactNode;
  /** Declarative menu items. Provide this or `children`, not both. */
  items?: DropdownMenuItem[];
  /** Custom menu content. Use `closeMenu` to dismiss after a selection. */
  children?: (closeMenu: () => void) => ReactNode;
  /** Rendered at the top of the menu, above the items/children. */
  header?: ReactNode;
  /** Rendered at the bottom of the menu, below the items/children (e.g. a "Show more…" link). */
  footer?: ReactNode;
  /** Horizontal alignment of the menu relative to the trigger. */
  align?: "left" | "right";
  /** Notified whenever the menu opens or closes. */
  onOpenChange?: (open: boolean) => void;
  /** Browser tooltip / accessible label for the default trigger. */
  title?: string;
  /** Accessible label (`aria-label`) for the floating menu element itself. */
  menuLabel?: string;
  /** Classes applied to the wrapper. */
  className?: string;
  /** Classes applied to the floating menu. */
  menuClassName?: string;
};

/**
 * A trigger + floating menu. Flat `items` render as a single list; an item with
 * `children` opens a flyout submenu. The FloatingTree lets every level cooperate
 * on focus and dismissal, so selecting any leaf closes the whole menu.
 */
export function DropdownMenu(props: DropdownMenuProps) {
  return (
    <FloatingTree>
      <DropdownMenuRoot {...props} />
    </FloatingTree>
  );
}

function DropdownMenuRoot({
  label,
  icon,
  hideChevron = false,
  variant = "outline",
  size = "sm",
  trigger,
  items,
  children,
  header,
  footer,
  align = "right",
  onOpenChange,
  title,
  menuLabel,
  className,
  menuClassName,
}: DropdownMenuProps) {
  const [open, setOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState<number | null>(null);
  const floatingZ = useFloatingZIndex();
  const tree = useFloatingTree();
  const nodeId = useFloatingNodeId();
  const elementsRef = useRef<Array<HTMLElement | null>>([]);

  const onOpenChangeRef = useRef(onOpenChange);
  onOpenChangeRef.current = onOpenChange;
  useEffect(() => {
    onOpenChangeRef.current?.(open);
  }, [open]);

  const { refs, floatingStyles, context } = useFloating<HTMLDivElement>({
    // nodeId is always defined inside the FloatingTree; guard for the type only.
    ...(nodeId ? { nodeId } : {}),
    open,
    onOpenChange: setOpen,
    // bottom-end / bottom-start reproduce the previous right/left alignment.
    placement: align === "right" ? "bottom-end" : "bottom-start",
    whileElementsMounted: autoUpdate,
    // offset(4) ≈ the previous mt-1; flip opens upward at the bottom edge and
    // shift slides the menu back on-screen at the horizontal edges.
    middleware: [offset(4), flip({ padding: 8 }), shift({ padding: 8 })],
  });

  const click = useClick(context);
  // useDismiss is React-tree aware: a press inside anything rendered through the
  // menu's `children` render-prop — including a Modal that portals to
  // document.body — propagates via React's synthetic events to the floating
  // element and counts as "inside", so it won't dismiss the menu (which would
  // unmount that child Modal). A Modal owned by a sibling/parent instead of this
  // menu correctly does dismiss the menu, which is harmless since closing the
  // menu does not unmount a Modal it doesn't own.
  const dismiss = useDismiss(context, { escapeKey: false });
  const role = useRole(context, { role: "menu" });
  const listNav = useListNavigation(context, {
    listRef: elementsRef,
    activeIndex,
    onNavigate: setActiveIndex,
    loop: true,
  });

  const { getReferenceProps, getFloatingProps, getItemProps } = useInteractions([
    click,
    dismiss,
    role,
    listNav,
  ]);

  const closeMenu = () => {
    setOpen(false);
    if (refs.domReference.current instanceof HTMLElement) refs.domReference.current.focus();
  };
  useEscapeLayer(open, closeMenu);

  // Selecting any leaf (at any depth) emits a tree-wide "click"; the root closes
  // and restores focus to the trigger.
  const closeMenuRef = useRef(closeMenu);
  closeMenuRef.current = closeMenu;
  useEffect(() => {
    if (!tree) return;
    const onTreeClick = () => closeMenuRef.current();
    tree.events.on("click", onTreeClick);
    return () => tree.events.off("click", onTreeClick);
  }, [tree]);

  return (
    <FloatingNode id={nodeId}>
      <div className={cn("relative inline-flex", className)}>
        {trigger ? (
          <span
            ref={refs.setReference}
            className="inline-flex"
            aria-haspopup="menu"
            aria-expanded={open}
            {...getReferenceProps()}
          >
            {trigger}
          </span>
        ) : (
          <Button
            ref={refs.setReference as React.Ref<HTMLButtonElement>}
            variant={variant}
            size={size}
            title={title}
            aria-haspopup="menu"
            aria-expanded={open}
            {...getReferenceProps()}
          >
            {icon && <Icon {...(typeof icon === "string" ? { name: icon } : { icon })} />}
            {label}
            {!hideChevron && <Icon icon={UiChevronDown} />}
          </Button>
        )}
        {open && (
          <FloatingPortal>
            <FloatingFocusManager context={context} modal={false}>
              <div
                ref={refs.setFloating}
                role="menu"
                aria-label={menuLabel}
                style={{ ...floatingStyles, zIndex: floatingZ }}
                className={cn(MENU_POPOVER_CLASS, menuClassName)}
                {...getFloatingProps()}
              >
                {header != null && (
                  <div className="border-b border-border px-3 py-1.5">{header}</div>
                )}
                {children ? (
                  children(closeMenu)
                ) : (
                  <MenuContext.Provider
                    value={{
                      getItemProps,
                      activeIndex,
                      setActiveIndex,
                      setHasFocusInside: () => {},
                      isOpen: open,
                    }}
                  >
                    <FloatingList elementsRef={elementsRef}>
                      <MenuItemList items={items ?? []} />
                    </FloatingList>
                  </MenuContext.Provider>
                )}
                {footer != null && (
                  <div className="border-t border-border px-3 py-1.5">{footer}</div>
                )}
              </div>
            </FloatingFocusManager>
          </FloatingPortal>
        )}
      </div>
    </FloatingNode>
  );
}
