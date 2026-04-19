import type { ReactNode } from "react";
import { cn } from "../lib/utils";
import type { SortDir } from "../hooks/use-sort";

export type SortableHeaderProps = {
  active: boolean;
  dir?: SortDir | undefined;
  onClick: () => void;
  align?: "left" | "right" | "center";
  className?: string;
  children: ReactNode;
};

export function SortableHeader({
  active,
  dir,
  onClick,
  align = "left",
  className,
  children,
}: SortableHeaderProps) {
  const alignCls =
    align === "right" ? "justify-end" : align === "center" ? "justify-center" : "justify-start";
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "inline-flex items-center gap-1 cursor-pointer select-none hover:text-foreground",
        active ? "text-primary" : "text-muted-foreground",
        alignCls,
        className,
      )}
    >
      {children}
      {active ? (
        <span aria-hidden>{dir === "asc" ? "↑" : "↓"}</span>
      ) : (
        <span aria-hidden className="opacity-40">
          ↕
        </span>
      )}
    </button>
  );
}
