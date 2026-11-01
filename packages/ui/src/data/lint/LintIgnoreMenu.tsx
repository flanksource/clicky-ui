import { useCallback, useState } from "react";
import { Button } from "../../components/button";
import { ContextMenu } from "../../overlay/ContextMenu";
import { DropdownMenu } from "../../overlay/DropdownMenu";
import { Icon } from "../Icon";
import { UiEllipsis } from "../../icons";
import type { LintAction } from "./types";
import { ignoreMenuItems, type IgnoreHandler } from "./ignore-menu-items";

export function IgnoreActionsMenu({ actions, onIgnore, busy, align = "left" }: { actions: readonly LintAction[]; onIgnore: IgnoreHandler; busy: boolean; align?: "left" | "right" }) {
  return <DropdownMenu label="Actions" variant="ghost" align={align} menuLabel="Finding actions" items={ignoreMenuItems(actions, onIgnore, busy)} />;
}

/**
 * Ignore actions for a tree row: a "⋯" menu at the row's end and the same
 * items on right-click anywhere in the row. Clicks inside never reach the row,
 * so choosing an action does not also select it.
 */
export function LintRowIgnoreMenu({
  actions,
  onIgnore,
  busy,
  label,
}: {
  actions: readonly LintAction[];
  onIgnore: IgnoreHandler;
  busy: boolean;
  label: string;
}) {
  const [row, setRow] = useState<HTMLElement | null>(null);
  // The row element is TreeNode's; the right-click menu binds to it.
  const bindRow = useCallback((el: HTMLElement | null) => setRow(el?.parentElement ?? null), []);
  if (actions.length === 0) return null;
  const items = ignoreMenuItems(actions, onIgnore, busy);
  const menuLabel = `Ignore options for ${label}`;
  return (
    <span
      ref={bindRow}
      className="flex shrink-0 opacity-0 focus-within:opacity-100 [:hover>&]:opacity-100 [[aria-selected=true]>div>&]:opacity-100"
      onClick={(event) => event.stopPropagation()}
      onKeyDown={(event) => event.stopPropagation()}
      data-lint-row-menu=""
    >
      <DropdownMenu
        items={items}
        align="right"
        menuLabel={menuLabel}
        trigger={
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="h-5 w-5 text-muted-foreground"
            aria-label={menuLabel}
            title="Ignore options"
          >
            <Icon icon={UiEllipsis} />
          </Button>
        }
      />
      <ContextMenu contextTarget={row} menuLabel={menuLabel} menuItems={items} />
    </span>
  );
}
