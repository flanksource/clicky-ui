import { useEffect, useMemo, useState, type ReactNode } from "react";
import { cn } from "../../lib/utils";
import { SessionInspectorPanel } from "./SessionInspector.panels";
import {
  SessionInspectorHeader,
  SessionInspectorSidebar,
} from "./SessionInspector.summary";
import { CompactSessionInspectorToolbar } from "./SessionInspector.compact";
import { InspectorTabs } from "./SessionInspector.tabs";
import {
  hasStructuredOutput,
  inspectorTabs,
  type SessionInspectorTab,
} from "./SessionInspector.tabs.model";
import { SessionTranscript } from "./SessionInspector.transcript";
import {
  isSessionCollectionInput,
  type SessionCollectionInput,
  type SessionCollectionItem,
  type SessionInspectorInput,
} from "./SessionInspector.collection";
import {
  SessionHierarchyPicker,
  SessionHierarchyTree,
} from "./SessionInspector.hierarchy";
import { useSessionHierarchy } from "./SessionInspector.hierarchy-state";
import { type ApprovalResolveHandler } from "./SessionInspector.approvals-model";
import { SessionViewer, type SessionViewerProps } from "./SessionViewer";
import {
  getSessionMetadata,
  type SessionInput,
  type SessionMetadataSummary,
} from "./SessionViewer.model";
import type { UnifiedSessionInput } from "./SessionViewer.unified";

export type { SessionInspectorTab } from "./SessionInspector.tabs.model";

export interface SessionInspectorProps {
  session: SessionInspectorInput;
  className?: string;
  /** Compact keeps tabs, runtime context, host actions, and session options on one line. */
  layout?: "default" | "compact";
  /** Runtime metadata to display in the compact context bar. Defaults to session metadata. */
  metadata?: SessionMetadataSummary;
  /** Host controls rendered before Session options in the compact toolbar. */
  toolbarActions?: ReactNode;
  defaultTab?: SessionInspectorTab;
  transcriptProps?: Omit<SessionViewerProps, "session">;
  renderSessionActions?: (item: SessionCollectionItem) => ReactNode;
  /** Receives edits made in the Plan tab. The inspector also keeps the draft visible locally. */
  onPlanChange?: (content: string) => void;
  /** Resolves one pending tool approval from the Approvals tab. Omitted, the
   *  tab still lists pending requests but renders no Approve/Deny controls. */
  onResolveApproval?: ApprovalResolveHandler;
  composer?: ReactNode;
}

export function SessionInspector({
  session,
  className,
  defaultTab = "transcript",
  transcriptProps,
  renderSessionActions,
  onPlanChange,
  onResolveApproval,
  composer,
  layout = "default",
  metadata,
  toolbarActions,
}: SessionInspectorProps) {
  const detail = useMemo(
    () =>
      isSessionCollectionInput(session) ? undefined : asUnifiedSession(session),
    [session],
  );
  const collection = useMemo(
    () =>
      isSessionCollectionInput(session)
        ? session
        : detail
          ? singleSessionCollection(detail)
          : undefined,
    [detail, session],
  );

  if (collection) {
    const optionalProps = {
      ...(className ? { className } : {}),
      ...(transcriptProps ? { transcriptProps } : {}),
      ...(renderSessionActions ? { renderSessionActions } : {}),
      ...(onPlanChange ? { onPlanChange } : {}),
      ...(onResolveApproval ? { onResolveApproval } : {}),
      ...(composer ? { composer } : {}),
      ...(layout === "compact" ? { layout } : {}),
      ...(metadata ? { metadata } : {}),
      ...(toolbarActions ? { toolbarActions } : {}),
    };
    return (
      <CollectionSessionInspector
        collection={collection}
        defaultTab={defaultTab}
        {...optionalProps}
      />
    );
  }

  return (
    <LegacySessionInspector
      session={session as SessionInput}
      defaultTab={defaultTab}
      {...(className ? { className } : {})}
      {...(transcriptProps ? { transcriptProps } : {})}
      {...(composer ? { composer } : {})}
      {...(layout === "compact" ? { layout } : {})}
      {...(metadata ? { metadata } : {})}
      {...(toolbarActions ? { toolbarActions } : {})}
    />
  );
}

function CollectionSessionInspector({
  collection,
  className,
  defaultTab = "transcript",
  transcriptProps,
  renderSessionActions,
  onPlanChange,
  onResolveApproval,
  composer,
  layout = "default",
  metadata,
  toolbarActions,
}: Omit<SessionInspectorProps, "session"> & {
  collection: SessionCollectionInput;
}) {
  const hierarchy = useSessionHierarchy(collection);
  const compact = layout === "compact";
  const [menuHost, setMenuHost] = useState<HTMLSpanElement | null>(null);
  const outputVisible = hasStructuredOutput(hierarchy.current);
  const [tab, setTab] = useState<SessionInspectorTab>(
    defaultTab === "output" && !outputVisible ? "transcript" : defaultTab,
  );
  const transcriptClassName = cn("h-full", transcriptProps?.className);
  const panelDetail = tab === "costs" ? hierarchy.filtered : hierarchy.current;
  const compactMetadata = metadata ?? getSessionMetadata(hierarchy.current);
  const compactTabs = inspectorTabs(
    outputVisible,
    hierarchy.current,
    hierarchy.filtered,
  );
  const compactMenuHeader = (
    <div className="w-[min(38rem,calc(100vw-4rem))]">
      <p className="px-1 pb-1 text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
        Session content
      </p>
      <SessionHierarchyTree
        collection={collection}
        state={hierarchy}
        {...(renderSessionActions ? { renderSessionActions } : {})}
        className="h-[min(32rem,52vh)]"
      />
      {transcriptProps?.menuHeader ? (
        <div className="mt-1 border-t border-border pt-1">
          {transcriptProps.menuHeader}
        </div>
      ) : null}
    </div>
  );
  const compactTranscriptProps = compact
    ? {
        ...transcriptProps,
        menuContainer: menuHost,
        menuHeader: compactMenuHeader,
        showMenu: menuHost !== null && transcriptProps?.showMenu !== false,
      }
    : transcriptProps;

  useEffect(() => {
    if (tab === "output" && !outputVisible) setTab("transcript");
  }, [outputVisible, tab]);

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
        <>
          <SessionInspectorHeader session={hierarchy.current} />
          <div
            role="toolbar"
            aria-label="Session content controls"
            className="flex shrink-0 justify-start border-b border-border px-density-2 py-density-2"
          >
            <SessionHierarchyPicker
              collection={collection}
              state={hierarchy}
              {...(renderSessionActions ? { renderSessionActions } : {})}
            />
          </div>
          <InspectorTabs tab={tab} tabs={compactTabs} onSelect={setTab} />
        </>
      )}
      <div
        className={cn(
          "min-h-0 flex-1 overflow-y-auto",
          !compact &&
            "grid lg:grid-cols-[minmax(0,1fr)_18rem] lg:overflow-hidden",
        )}
      >
        <main
          className={cn(
            "flex min-w-0 flex-col",
            compact ? "min-h-0" : "min-h-[28rem] lg:min-h-0",
          )}
        >
          {compact ? (
            <>
              <div
                className={cn(
                  "min-h-0 flex-1 overflow-hidden",
                  tab !== "transcript" && "hidden",
                )}
              >
                <SessionTranscript
                  session={hierarchy.filtered}
                  viewerProps={{
                    ...compactTranscriptProps,
                    className: transcriptClassName,
                  }}
                />
              </div>
              {tab !== "transcript" ? (
                <div className="min-h-0 flex-1 overflow-auto p-density-4">
                  <SessionInspectorPanel
                    tab={tab}
                    detail={panelDetail}
                    session={hierarchy.current}
                    {...(onPlanChange ? { onPlanChange } : {})}
                    {...(onResolveApproval ? { onResolveApproval } : {})}
                  />
                </div>
              ) : null}
            </>
          ) : (
            <div
              className={cn(
                "min-h-0 flex-1",
                tab === "transcript"
                  ? "overflow-hidden"
                  : "overflow-auto p-density-4",
              )}
            >
              {tab === "transcript" ? (
                <SessionTranscript
                  session={hierarchy.filtered}
                  viewerProps={{
                    ...transcriptProps,
                    className: transcriptClassName,
                  }}
                />
              ) : (
                <SessionInspectorPanel
                  tab={tab}
                  detail={panelDetail}
                  session={hierarchy.current}
                  {...(onPlanChange ? { onPlanChange } : {})}
                  {...(onResolveApproval ? { onResolveApproval } : {})}
                />
              )}
            </div>
          )}
          {composer ? (
            <div className="shrink-0 border-t border-border p-density-3">
              {composer}
            </div>
          ) : null}
        </main>
        {!compact ? (
          <SessionInspectorSidebar session={hierarchy.current} />
        ) : null}
      </div>
    </div>
  );
}

function LegacySessionInspector({
  session,
  className,
  defaultTab = "transcript",
  transcriptProps,
  composer,
  layout = "default",
  metadata,
  toolbarActions,
}: Pick<
  SessionInspectorProps,
  | "className"
  | "defaultTab"
  | "transcriptProps"
  | "composer"
  | "layout"
  | "metadata"
  | "toolbarActions"
> & {
  session: SessionInput;
}) {
  const compact = layout === "compact";
  const [menuHost, setMenuHost] = useState<HTMLSpanElement | null>(null);
  const [tab, setTab] = useState<SessionInspectorTab>(
    defaultTab === "output" ? "transcript" : defaultTab,
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

function singleSessionCollection(
  session: UnifiedSessionInput,
): SessionCollectionInput {
  const id = session.id || "session";
  return {
    kind: "session-collection",
    id,
    currentSessionId: id,
    sessions: [{ id, session }],
  };
}

function asUnifiedSession(
  session: SessionInput,
): UnifiedSessionInput | undefined {
  if (typeof session !== "object" || session === null || Array.isArray(session))
    return undefined;
  return session as UnifiedSessionInput;
}
