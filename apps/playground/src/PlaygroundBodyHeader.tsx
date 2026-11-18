import { Fragment } from "react";
import { cn } from "@flanksource/clicky-ui";

import {
  pageDescription,
  pageGroup,
  pageMeta,
  pageTitle,
  type PageEntry,
} from "./registry";

export function PlaygroundBodyHeader({ active }: { active: PageEntry }) {
  const breadcrumbs = pageMeta(active)?.appShellBreadcrumbs ?? [];
  const title = pageTitle(active);

  return (
    <div className="flex min-w-0 items-baseline gap-2 text-sm">
      <span className="hidden shrink-0 text-[10px] font-semibold uppercase tracking-wide text-muted-foreground @3xl/workspace:inline">
        {pageGroup(active)}
      </span>
      <span className="hidden text-muted-foreground @3xl/workspace:inline">›</span>
      <span title={title} className="min-w-0 truncate font-medium @3xl/workspace:whitespace-normal">
        {title}
      </span>
      {breadcrumbs.map((segment, index) => (
        <Fragment key={`${segment}-${index}`}>
          <span className="hidden text-muted-foreground @3xl/workspace:inline">›</span>
          <span
            className={cn(
              "hidden truncate font-mono text-xs @3xl/workspace:inline",
              index === breadcrumbs.length - 1
                ? "font-medium text-foreground"
                : "text-muted-foreground",
            )}
          >
            {segment}
          </span>
        </Fragment>
      ))}
      {breadcrumbs.length === 0 && pageDescription(active) && (
        <span className="hidden truncate text-xs text-muted-foreground @3xl/workspace:inline">
          {pageDescription(active)}
        </span>
      )}
    </div>
  );
}
