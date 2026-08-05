import type { ReactNode } from "react";
import { UiZoomIn, UiZoomOut } from "../../icons";
import { cn } from "../../lib/utils";
import { HoverCard } from "../../overlay/HoverCard";
import { Icon, type StaticIconComponent } from "../Icon";

export type CellFilterMode = "include" | "exclude";

export type CellFilterChange = {
  key: string;
  value: string;
  mode: CellFilterMode | undefined;
};

export function CellFilterActions({
  children,
  value,
  displayValue = value,
  mode,
  onChange,
}: {
  children: ReactNode;
  value: string;
  displayValue?: string;
  mode?: CellFilterMode | undefined;
  onChange: (mode: CellFilterMode | undefined) => void;
}) {
  const trigger = <span className="relative inline-flex min-w-0">{children}</span>;
  return (
    <HoverCard placement="top" delay={120} arrow={false} trigger={trigger} cardClassName="!p-1">
      <span className="inline-flex items-center gap-0.5">
        <CellFilterButton
          label={`Include ${displayValue}`}
          icon={UiZoomIn}
          active={mode === "include"}
          activeClassName="bg-green-500/20 text-green-700 dark:text-green-400"
          onClick={() => onChange(mode === "include" ? undefined : "include")}
        />
        <CellFilterButton
          label={`Exclude ${displayValue}`}
          icon={UiZoomOut}
          active={mode === "exclude"}
          activeClassName="bg-red-500/20 text-red-700 dark:text-red-400"
          onClick={() => onChange(mode === "exclude" ? undefined : "exclude")}
        />
      </span>
    </HoverCard>
  );
}

function CellFilterButton({
  label,
  icon,
  active,
  activeClassName,
  onClick,
}: {
  label: string;
  icon: StaticIconComponent;
  active: boolean;
  activeClassName: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      aria-label={label}
      aria-pressed={active}
      title={label}
      onClick={(event) => {
        event.stopPropagation();
        onClick();
      }}
      className={cn(
        "inline-flex h-5 w-5 items-center justify-center rounded text-muted-foreground",
        "hover:bg-accent hover:text-foreground",
        active && activeClassName,
      )}
    >
      <Icon icon={icon} className="text-xs" />
    </button>
  );
}
