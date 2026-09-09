import type { ReactNode } from "react";
import { cn } from "../../lib/utils";

/** Small display components shared by the SessionInspector detail panels
 *  (costs, metadata, approvals, …) — kept in their own module so panel files
 *  can depend on them without importing each other. The value builders they are
 *  used with live in SessionInspector.panel-values, which exports no components
 *  so that neither module loses fast refresh to the other. */

export function EmptyState({
  children,
  compact = false,
}: {
  children: ReactNode;
  compact?: boolean;
}) {
  return (
    <div
      className={cn(
        "rounded-md border border-dashed border-border text-sm text-muted-foreground",
        compact ? "p-density-3" : "p-density-6 text-center"
      )}
    >
      {children}
    </div>
  );
}

export function SimpleList({
  title,
  rows,
}: {
  title: string;
  rows: Array<{ key: string; title?: ReactNode; detail?: ReactNode }>;
}) {
  return (
    <section>
      <h3 className="mb-density-2 text-xs font-semibold uppercase text-muted-foreground">
        {title}
      </h3>
      <ul className="divide-y divide-border rounded-md border border-border">
        {rows.map((row) => (
          <li key={row.key} className="px-density-3 py-density-2">
            <div className="text-sm font-medium">{row.title || row.key}</div>
            {row.detail ? (
              <div className="mt-0.5 text-xs text-muted-foreground">
                {row.detail}
              </div>
            ) : null}
          </li>
        ))}
      </ul>
    </section>
  );
}

