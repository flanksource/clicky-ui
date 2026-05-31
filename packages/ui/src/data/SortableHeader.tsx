import type { ReactNode } from "react";
import { cn } from "../lib/utils";
import type { SortDir } from "../hooks/use-sort";

export type SortableHeaderProps = {
  /** Whether this header currently owns the sort state. */
  active: boolean;
  /** Current sort direction when active. */
  dir?: SortDir | undefined;
  /** Called when the header is clicked. */
  onClick: () => void;
  /** Header content alignment. */
  align?: "left" | "right" | "center";
  /** Classes applied to the button. */
  className?: string;
  /** Header label/content. */
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
