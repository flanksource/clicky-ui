import { useEffect, useRef, useState, type ReactNode } from "react";
import {
  autoUpdate,
  flip,
  FloatingFocusManager,
  FloatingPortal,
  offset,
  shift,
  useClick,
  useDismiss,
  useFloating,
  useInteractions,
  useListNavigation,
  useRole,
} from "@floating-ui/react";
import { cn } from "../lib/utils";
import { Button, type ButtonProps } from "../components/button";
import { Icon, type StaticIconComponent } from "../data/Icon";
import { UiChevronDown } from "../icons";
import { useEscapeLayer, useFloatingZIndex } from "./modalStack";

export type DropdownMenuItem = {
  /** Visible label. */
  label: ReactNode;
  /** Called when the item is chosen. */
  onSelect: () => void;
  /** Iconify name or imported icon component rendered before the label. */
  icon?: string | StaticIconComponent;
  /** Browser tooltip for the item. */
  title?: string;
  /** Disable selection. */
  disabled?: boolean;
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

export function DropdownMenu({
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
  const listRef = useRef<(HTMLElement | null)[]>([]);

  const onOpenChangeRef = useRef(onOpenChange);
  onOpenChangeRef.current = onOpenChange;
  useEffect(() => {
    onOpenChangeRef.current?.(open);
  }, [open]);

  const { refs, floatingStyles, context } = useFloating<HTMLDivElement>({
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
    listRef,
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

  return (
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
              className={cn(
                "min-w-[8rem] rounded-md border border-border bg-popover py-1 shadow-md",
                menuClassName,
              )}
              {...getFloatingProps()}
            >
              {header != null && (
                <div className="border-b border-border px-3 py-1.5">{header}</div>
              )}
              {children
                ? children(closeMenu)
                : items?.map((item, i) => (
                    <button
                      key={i}
                      ref={(node) => {
                        listRef.current[i] = node;
                      }}
                      type="button"
                      role="menuitem"
                      tabIndex={i === activeIndex ? 0 : -1}
                      disabled={item.disabled}
                      title={item.title}
                      className="flex w-full items-center gap-2 px-3 py-1.5 text-left text-xs text-popover-foreground hover:bg-accent hover:text-accent-foreground disabled:pointer-events-none disabled:opacity-50"
                      {...getItemProps({
                        onClick: () => {
                          item.onSelect();
                          closeMenu();
                        },
                        onKeyDown: (event) => {
                          if (event.key === "Enter" || event.key === " ") {
                            event.preventDefault();
                            item.onSelect();
                            closeMenu();
                          }
                        },
                      })}
                    >
                      {item.icon && (
                        <Icon
                          {...(typeof item.icon === "string"
                            ? { name: item.icon }
                            : { icon: item.icon })}
                        />
                      )}
                      {item.label}
                    </button>
                  ))}
              {footer != null && (
                <div className="border-t border-border px-3 py-1.5">{footer}</div>
              )}
            </div>
          </FloatingFocusManager>
        </FloatingPortal>
      )}
    </div>
  );
}
