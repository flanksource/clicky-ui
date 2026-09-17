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

  return (
    <div className="flex items-baseline gap-2 text-sm">
      <span className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
        {pageGroup(active)}
      </span>
      <span className="text-muted-foreground">›</span>
      <span className="font-medium">{pageTitle(active)}</span>
      {breadcrumbs.map((segment, index) => (
        <Fragment key={`${segment}-${index}`}>
          <span className="text-muted-foreground">›</span>
          <span
            className={cn(
              "truncate font-mono text-xs",
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
        <span className="truncate text-xs text-muted-foreground">
          {pageDescription(active)}
        </span>
      )}
    </div>
  );
}
