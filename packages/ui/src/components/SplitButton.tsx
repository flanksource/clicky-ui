import { useState, type ReactNode } from "react";
import { cn } from "../lib/utils";
import { Button, type ButtonProps } from "./button";
import { Icon, type StaticIconComponent } from "../data/Icon";
import { UiChevronDown, UiChevronUp } from "../icons";
import { DropdownMenu, type DropdownMenuItem } from "../overlay/DropdownMenu";

export type SplitButtonProps = {
  /** Content of the primary action button. */
  label: ReactNode;
  /** Primary action handler. */
  onClick: () => void;
  /** Secondary actions listed in the dropdown menu. */
  items: DropdownMenuItem[];
  /** Icon shown before the primary label. */
  icon?: string | StaticIconComponent;
  /** Variant forwarded to both halves. */
  variant?: ButtonProps["variant"];
  /** Size forwarded to both halves. */
  size?: ButtonProps["size"];
  /** Show a spinner and disable the primary half while pending. */
  loading?: boolean;
  /** Disable both halves. */
  disabled?: boolean;
  /** Horizontal alignment of the menu relative to the trigger. */
  align?: "left" | "right";
  /** Browser tooltip / accessible label for the chevron trigger. */
  title?: string;
  /** Classes applied to the wrapper. */
  className?: string;
  /** Classes applied to the floating menu. */
  menuClassName?: string;
};

export function SplitButton({
  label,
  onClick,
  items,
  icon,
  variant = "default",
  size = "default",
  loading = false,
  disabled = false,
  align = "right",
  title,
  className,
  menuClassName,
}: SplitButtonProps) {
  const [open, setOpen] = useState(false);

  if (items.length === 0) {
    return (
      <Button
        variant={variant}
        size={size}
        loading={loading}
        disabled={disabled}
        onClick={onClick}
        className={className}
      >
        {icon && <Icon {...(typeof icon === "string" ? { name: icon } : { icon })} />}
        {label}
      </Button>
    );
  }

  return (
    <div className={cn("inline-flex items-stretch", className)}>
      <Button
        variant={variant}
        size={size}
        loading={loading}
        disabled={disabled}
        onClick={onClick}
        className="rounded-r-none"
      >
        {icon && <Icon {...(typeof icon === "string" ? { name: icon } : { icon })} />}
        {label}
      </Button>
      <DropdownMenu
        items={items}
        align={align}
        className="items-stretch"
        {...(menuClassName ? { menuClassName } : {})}
        onOpenChange={setOpen}
        trigger={
          <Button
            variant={variant}
            size={size === "default" ? "icon" : size}
            disabled={disabled}
            title={title}
            aria-label={title ?? "Open menu"}
            className={cn(
              "h-auto self-stretch rounded-l-none border-l border-l-current/25 px-2",
              size !== "icon" && "w-8",
            )}
          >
            <Icon icon={open ? UiChevronUp : UiChevronDown} />
          </Button>
        }
      />
    </div>
  );
}
