import type { ReactNode } from "react";
import { cn } from "../lib/utils";

// AppShell is the top-bar application shell — the horizontal-header counterpart
// to the sidebar-oriented AppLayout. A sticky header holds a brand mark, primary
// nav, a centered search slot, and a right-aligned actions cluster, with an
// optional second toolbar row beneath it; the content area fills and scrolls
// independently. All regions are slots so the host owns their behaviour.

export type AppShellProps = {
  /** Brand mark / wordmark, pinned left. */
  brand?: ReactNode;
  /** Primary navigation, after the brand. */
  nav?: ReactNode;
  /** Centered search slot; grows to fill and is width-capped. */
  search?: ReactNode;
  /** Right-aligned cluster (org switcher, status, theme toggle, …). */
  actions?: ReactNode;
  /** Optional second header row for filters / bulk actions. */
  toolbar?: ReactNode;
  /** Main content; fills the remaining height. */
  children: ReactNode;
  /** Classes applied to the shell root. */
  className?: string;
  /** Classes applied to the top header row. */
  headerClassName?: string;
  /** Classes applied to the toolbar row. */
  toolbarClassName?: string;
  /** Max width of the centered search slot. Defaults to 28rem. */
  searchMaxWidth?: string | number;
};

export function AppShell({
  brand,
  nav,
  search,
  actions,
  toolbar,
  children,
  className,
  headerClassName,
  toolbarClassName,
  searchMaxWidth = "28rem",
}: AppShellProps) {
  return (
    <div className={cn("flex h-full min-h-0 w-full flex-col bg-background", className)}>
      <header className="shrink-0 border-b border-border bg-card">
        <div
          className={cn(
            "flex h-14 items-center gap-density-3 px-density-4",
            headerClassName,
          )}
        >
          {brand && <div className="flex shrink-0 items-center gap-density-2">{brand}</div>}
          {nav && <div className="flex shrink-0 items-center">{nav}</div>}
          {search !== undefined && (
            <div className="flex min-w-0 flex-1 justify-center">
              <div className="w-full" style={{ maxWidth: searchMaxWidth }}>
                {search}
              </div>
            </div>
          )}
          {/* When there's no search, keep the actions pushed right. */}
          {search === undefined && <div className="flex-1" />}
          {actions && (
            <div className="flex shrink-0 items-center gap-density-2">{actions}</div>
          )}
        </div>
        {toolbar && (
          <div
            className={cn(
              "flex items-center gap-density-2 border-t border-border bg-muted px-density-4 py-density-2",
              toolbarClassName,
            )}
          >
            {toolbar}
          </div>
        )}
      </header>
      <main className="min-h-0 min-w-0 flex-1 overflow-hidden">{children}</main>
    </div>
  );
}
