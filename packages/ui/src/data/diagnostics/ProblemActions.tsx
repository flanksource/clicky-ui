import { useCallback, useState } from "react";
import { Button } from "../../components/button";
import { ContextMenu } from "../../overlay/ContextMenu";
import {
  DropdownMenu,
  type DropdownMenuItem,
} from "../../overlay/DropdownMenu";
import { Icon } from "../Icon";
import { UiEllipsis } from "../../icons";

export function ProblemActions({
  items,
  label = "Problem actions",
}: {
  items: DropdownMenuItem[];
  label?: string;
}) {
  const [target, setTarget] = useState<HTMLElement | null>(null);
  const bind = useCallback(
    (el: HTMLSpanElement | null) =>
      setTarget(el?.closest("tr") ?? el?.parentElement ?? null),
    [],
  );
  if (!items.length) return null;
  return (
    <span
      ref={bind}
      className="shrink-0"
      onClick={(event) => event.stopPropagation()}
      onKeyDown={(event) => event.stopPropagation()}
    >
      <DropdownMenu
        menuLabel={label}
        items={items}
        trigger={
          <Button
            variant="ghost"
            size="icon"
            className="size-7 text-muted-foreground"
            aria-label={label}
          >
            <Icon icon={UiEllipsis} />
          </Button>
        }
      />
      <ContextMenu contextTarget={target} menuLabel={label} menuItems={items} />
    </span>
  );
}
