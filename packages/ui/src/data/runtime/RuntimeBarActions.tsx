import type { ReactNode } from "react";
import { UiDotsVertical } from "../../icons";
import { cn } from "../../lib/utils";
import type { DropdownMenuItem } from "../../overlay/DropdownMenu";
import { Icon, type StaticIconComponent } from "../Icon";
import { RuntimeSegment } from "./RuntimeBarSegment";

/**
 * A run setting offered by the runtime bar. Its choices are `DropdownMenuItem`s
 * so the inline and collapsed renderings are the SAME list: inline it is a
 * segment's menu, collapsed it is a flyout submenu of the ⋮ menu. Anything that
 * cannot be a menu item (a multi-select, reorder buttons) belongs in a modal
 * reached from an item, not in this list.
 */
export type RuntimeBarAction = {
  id: string;
  /** Menu entry label when collapsed; also the inline segment's menu label. */
  label: string;
  icon?: StaticIconComponent | undefined;
  iconClassName?: string | undefined;
  /** Tooltip on the inline segment, e.g. "Permission posture — Plan". */
  title: string;
  /** Inline segment caption: key + glyph + current value. */
  caption: ReactNode;
  /** Only supplied settings are candidates for inline display. */
  isSet: boolean;
  /** Custom editor shared by the inline dropdown and overflow submenu. */
  header?: ReactNode;
  /** Choices, identical inline and collapsed. */
  items: DropdownMenuItem[];
};

export type RuntimeBarActionsProps = {
  fields?: RuntimeBarAction[] | undefined;
  /** Always-collapsed entries listed after the fields, e.g. Advanced. */
  menu?: DropdownMenuItem[] | undefined;
  /** False collapses every field into the ⋮ menu. */
  inline?: boolean | undefined;
  menuLabel?: string | undefined;
  /** Renders its own bar chrome instead of fusing onto the bar's border. */
  standalone?: boolean | undefined;
  className?: string | undefined;
  /** Number of supplied fields that fit beside the runtime identity. */
  visibleCount?: number | undefined;
};

/**
 * The runtime bar's host-level settings plus a ⋮ menu. It fuses onto the
 * bar border, or renders its own border when used independently.
 */
export function RuntimeBarActions({
  fields = [],
  menu = [],
  inline = true,
  menuLabel = "Runtime options",
  standalone = false,
  className,
  visibleCount = fields.length,
}: RuntimeBarActionsProps) {
  const inlineFields = inline
    ? fields.filter((field) => field.isSet).slice(0, visibleCount)
    : [];
  const menuItems: DropdownMenuItem[] = [
    ...fields.map((field) => ({
      label: field.label,
      ...(field.icon ? { icon: field.icon } : {}),
      ...(field.iconClassName ? { iconClassName: field.iconClassName } : {}),
      // Ignored: an item with `children` is a submenu trigger, not a leaf.
      onSelect: () => {},
      children: field.items,
      ...(field.header ? { header: field.header } : {}),
    })),
    ...menu,
  ];
  if (inlineFields.length === 0 && menuItems.length === 0) return null;

  return (
    <div
      data-runtime-bar-section="actions"
      className={cn(
        "flex h-control-h shrink-0 items-stretch",
        standalone
          ? "w-fit overflow-hidden rounded-md border border-input bg-background"
          : "border-l border-border",
        className,
      )}
    >
      {inlineFields.map((field) => (
        <RuntimeSegment
          key={field.id}
          menuLabel={field.label}
          title={field.title}
          items={field.items}
          {...(field.header ? { header: field.header } : {})}
        >
          {field.caption}
        </RuntimeSegment>
      ))}
      {menuItems.length > 0 && (
        <RuntimeSegment
          menuLabel={menuLabel}
          title={menuLabel}
          items={menuItems}
          hideChevron
        >
          <Icon
            icon={UiDotsVertical}
            className="size-4 shrink-0 text-muted-foreground"
          />
        </RuntimeSegment>
      )}
    </div>
  );
}
