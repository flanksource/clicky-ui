import type { ReactNode } from "react";
import { cn } from "../lib/utils";

export type KeyValueListItem = {
  key: string;
  label: ReactNode;
  value: ReactNode;
  hidden?: boolean;
};

export type KeyValueListProps = {
  items: KeyValueListItem[];
  className?: string;
  rowClassName?: string;
  labelClassName?: string;
  valueClassName?: string;
  emptyMessage?: ReactNode;
};

export function KeyValueList({
  items,
  className,
  rowClassName,
  labelClassName,
  valueClassName,
  emptyMessage = "No details",
}: KeyValueListProps) {
  const visible = items.filter((item) => !item.hidden);

  if (visible.length === 0) {
    return <div className="text-sm text-muted-foreground">{emptyMessage}</div>;
  }

  return (
    <dl className={cn("divide-y divide-border rounded-md border border-border", className)}>
      {visible.map((item) => (
        <div
          key={item.key}
          className={cn(
            "grid grid-cols-[minmax(7rem,12rem)_minmax(0,1fr)] gap-density-3 px-density-3 py-density-2",
            rowClassName,
          )}
        >
          <dt className={cn("text-xs font-medium text-muted-foreground", labelClassName)}>
            {item.label}
          </dt>
          <dd className={cn("min-w-0 text-sm text-foreground", valueClassName)}>{item.value}</dd>
        </div>
      ))}
    </dl>
  );
}
