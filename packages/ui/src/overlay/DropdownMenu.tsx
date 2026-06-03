import { useEffect, useRef, useState, type ReactNode } from "react";
import { cn } from "../lib/utils";
import { Button, type ButtonProps } from "../components/button";
import { Icon, type StaticIconComponent } from "../data/Icon";
import { UiChevronDown } from "../icons";

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
  /** Horizontal alignment of the menu relative to the trigger. */
  align?: "left" | "right";
  /** Notified whenever the menu opens or closes. */
  onOpenChange?: (open: boolean) => void;
  /** Browser tooltip / accessible label for the default trigger. */
  title?: string;
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
  align = "right",
  onOpenChange,
  title,
  className,
  menuClassName,
}: DropdownMenuProps) {
  const [open, setOpen] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);

  const onOpenChangeRef = useRef(onOpenChange);
  onOpenChangeRef.current = onOpenChange;
  useEffect(() => {
    onOpenChangeRef.current?.(open);
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const onMouseDown = (e: MouseEvent) => {
      if (!wrapperRef.current?.contains(e.target as Node)) setOpen(false);
    };
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("mousedown", onMouseDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("mousedown", onMouseDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [open]);

  const closeMenu = () => setOpen(false);
  const toggle = () => setOpen((v) => !v);

  return (
    <div className={cn("relative inline-flex", className)} ref={wrapperRef}>
      {trigger ? (
        <span
          className="contents"
          onClick={toggle}
          aria-haspopup="menu"
          aria-expanded={open}
        >
          {trigger}
        </span>
      ) : (
        <Button
          variant={variant}
          size={size}
          onClick={toggle}
          title={title}
          aria-haspopup="menu"
          aria-expanded={open}
        >
          {icon && <Icon {...(typeof icon === "string" ? { name: icon } : { icon })} />}
          {label}
          {!hideChevron && <Icon icon={UiChevronDown} />}
        </Button>
      )}
      {open && (
        <div
          role="menu"
          className={cn(
            "absolute z-20 mt-1 min-w-[8rem] rounded-md border border-border bg-popover py-1 shadow-md",
            align === "right" ? "right-0" : "left-0",
            menuClassName,
          )}
        >
          {children
            ? children(closeMenu)
            : items?.map((item, i) => (
                <button
                  key={i}
                  type="button"
                  role="menuitem"
                  disabled={item.disabled}
                  title={item.title}
                  onClick={() => {
                    item.onSelect();
                    closeMenu();
                  }}
                  className="flex w-full items-center gap-2 px-3 py-1.5 text-left text-xs text-popover-foreground hover:bg-accent hover:text-accent-foreground disabled:pointer-events-none disabled:opacity-50"
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
        </div>
      )}
    </div>
  );
}
