import { useState, type ReactNode } from "react";
import { cn } from "../../lib/utils";
import { SessionInspectorPanel } from "./SessionInspector.panels";
import { CompactSessionInspectorToolbar } from "./SessionInspector.compact";
import { InspectorTabs } from "./SessionInspector.tabs";
import {
  inspectorTabs,
  type SessionInspectorTab,
} from "./SessionInspector.tabs.model";
import { useInspectorTab } from "./SessionInspector.tab-state";
import { SessionViewer, type SessionViewerProps } from "./SessionViewer";
import {
  getSessionMetadata,
  type SessionInput,
  type SessionMetadataSummary,
} from "./SessionViewer.model";

/** The inspector for a non-unified session (legacy entries or raw log text):
 *  only the transcript carries content, so it has no hierarchy or facets. */
export function LegacySessionInspector({
  session,
  className,
  defaultTab = "transcript",
  tab: controlledTab,
  onTabChange,
  transcriptProps,
  composer,
  layout = "default",
  metadata,
  toolbarActions,
}: {
  session: SessionInput;
  className?: string;
  defaultTab?: SessionInspectorTab;
  tab?: SessionInspectorTab;
  onTabChange?: (tab: SessionInspectorTab) => void;
  transcriptProps?: Omit<SessionViewerProps, "session">;
  composer?: ReactNode;
  layout?: "default" | "compact";
  metadata?: SessionMetadataSummary;
  toolbarActions?: ReactNode;
}) {
  const compact = layout === "compact";
  const [menuHost, setMenuHost] = useState<HTMLSpanElement | null>(null);
  const [tab, setTab] = useInspectorTab(
    defaultTab,
    false,
    controlledTab,
    onTabChange,
  );
  const transcriptClassName = cn("h-full", transcriptProps?.className);
  const compactTabs = inspectorTabs(false);
  const compactMetadata = metadata ?? getSessionMetadata(session);
  const viewerProps = compact
    ? {
        ...transcriptProps,
        menuContainer: menuHost,
        showMenu: menuHost !== null && transcriptProps?.showMenu !== false,
      }
    : transcriptProps;
  return (
    <div
      className={cn(
        "flex h-full min-h-0 w-full max-w-full flex-col overflow-hidden bg-background text-sm",
        compact
          ? "@container rounded-none border-0 shadow-none"
          : "rounded-xl border border-border shadow-sm",
        className,
      )}
    >
      {compact ? (
        <CompactSessionInspectorToolbar
          tabs={compactTabs}
          activeTab={tab}
          onSelect={(next) => setTab(next as SessionInspectorTab)}
          onMenuHost={setMenuHost}
          {...(compactMetadata ? { metadata: compactMetadata } : {})}
          {...(toolbarActions ? { toolbarActions } : {})}
        />
      ) : (
        <InspectorTabs tab={tab} tabs={compactTabs} onSelect={setTab} />
      )}
      <div className="flex min-h-0 flex-1 flex-col overflow-hidden">
        {compact ? (
          <>
            <div
              className={cn(
                "min-h-0 flex-1 overflow-hidden",
                tab !== "transcript" && "hidden",
              )}
            >
              <SessionViewer
                session={session}
                scrollable
                showRowMetadata
                {...viewerProps}
                className={transcriptClassName}
                showHeader={false}
                showContextMeter={false}
              />
            </div>
            {tab !== "transcript" ? (
              <div className="min-h-0 flex-1 overflow-auto p-density-4">
                <SessionInspectorPanel
                  tab={tab}
                  detail={undefined}
                  session={session}
                />
              </div>
            ) : null}
          </>
        ) : (
          <div className="min-h-0 flex-1 overflow-hidden">
            {tab === "transcript" ? (
              <SessionViewer
                session={session}
                scrollable
                showRowMetadata
                {...transcriptProps}
                className={transcriptClassName}
              />
            ) : (
              <SessionInspectorPanel
                tab={tab}
                detail={undefined}
                session={session}
              />
            )}
          </div>
        )}
        {composer ? (
          <div className="shrink-0 border-t border-border p-density-3">
            {composer}
          </div>
        ) : null}
      </div>
    </div>
  );
}
