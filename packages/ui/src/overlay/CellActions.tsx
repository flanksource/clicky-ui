import { useEffect, type ButtonHTMLAttributes, type ReactNode } from "react";
import { Icon, type StaticIconComponent } from "../data/Icon";
import { cn } from "../lib/utils";
import type { DropdownMenuItem } from "./DropdownMenu";
import { ContextMenu } from "./ContextMenu";

export type CellActionsProps = {
  contextTarget: HTMLElement | null;
  menuLabel: string;
  menuItems: DropdownMenuItem[];
  children: ReactNode;
  className?: string;
};

export type CellActionButtonProps = Omit<
  ButtonHTMLAttributes<HTMLButtonElement>,
  "children" | "onClick"
> & {
  label: string;
  icon: StaticIconComponent;
  onSelect: () => void;
};

export function CellActions({
  contextTarget,
  menuLabel,
  menuItems,
  children,
  className,
}: CellActionsProps) {
  useEffect(() => {
    if (!contextTarget) return;
    contextTarget.classList.add("group/cell-actions");
    return () => contextTarget.classList.remove("group/cell-actions");
  }, [contextTarget]);

  return (
    <>
      <span
        className={cn(
          "ms-1 inline-flex items-center gap-0.5 align-middle",
          className,
        )}
        contentEditable={false}
      >
        {children}
      </span>
      <ContextMenu
        contextTarget={contextTarget}
        menuLabel={menuLabel}
        menuItems={menuItems}
      />
    </>
  );
}

export function CellActionButton({
  label,
  icon,
  onSelect,
  className,
  title = label,
  onMouseDown,
  ...props
}: CellActionButtonProps) {
  return (
    <button
      {...props}
      type="button"
      title={title}
      aria-label={label}
      className={cn(
        "inline-flex size-5 items-center justify-center rounded-full p-1 text-muted-foreground opacity-70 transition-colors transition-opacity hover:bg-primary/10 hover:text-primary hover:opacity-100 focus-visible:bg-primary/10 focus-visible:text-primary focus-visible:opacity-100 focus-visible:outline-none group-hover/cell-actions:opacity-95",
        className,
      )}
      onMouseDown={(event) => {
        event.preventDefault();
        onMouseDown?.(event);
      }}
      onClick={(event) => {
        event.preventDefault();
        event.stopPropagation();
        onSelect();
      }}
    >
      <Icon icon={icon} className="text-sm" />
    </button>
  );
}
