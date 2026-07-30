import { useMemo, useState, type ReactNode } from "react";
import {
  UiBraces,
  UiChatDots,
  UiCoins,
  UiFileText,
  UiListDashes,
  UiSealCheck,
  UiStrategy,
} from "../../icons";
import { cn } from "../../lib/utils";
import { TabButton } from "../TabButton";
import { formatCost, costTotal } from "./session-cost";
import { SessionInspectorPanel } from "./SessionInspector.panels";
import {
  SessionInspectorHeader,
  SessionInspectorSidebar,
} from "./SessionInspector.summary";
import { SessionTranscript } from "./SessionInspector.transcript";
import {
  isSessionCollectionInput,
  type SessionCollectionInput,
  type SessionCollectionItem,
  type SessionInspectorInput,
} from "./SessionInspector.collection";
import { SessionHierarchyPicker } from "./SessionInspector.hierarchy";
import { useSessionHierarchy } from "./SessionInspector.hierarchy-state";
import { SessionViewer, type SessionViewerProps } from "./SessionViewer";
import type { SessionInput } from "./SessionViewer.model";
import type { UnifiedSessionInput } from "./SessionViewer.unified";

export type SessionInspectorTab =
  | "transcript"
  | "files"
  | "plan"
  | "approvals"
  | "costs"
  | "metadata"
  | "raw";

export interface SessionInspectorProps {
  session: SessionInspectorInput;
  className?: string;
  defaultTab?: SessionInspectorTab;
  transcriptProps?: Omit<SessionViewerProps, "session">;
  renderSessionActions?: (item: SessionCollectionItem) => ReactNode;
  /** Receives edits made in the Plan tab. The inspector also keeps the draft visible locally. */
  onPlanChange?: (content: string) => void;
  composer?: ReactNode;
}

const TABS = [
  { id: "transcript", label: "Transcript", icon: UiChatDots },
  { id: "files", label: "Files", icon: UiFileText },
  { id: "plan", label: "Plan", icon: UiStrategy },
  { id: "approvals", label: "Approvals", icon: UiSealCheck },
  { id: "costs", label: "Costs", icon: UiCoins },
  { id: "metadata", label: "Metadata", icon: UiListDashes },
  { id: "raw", label: "Raw", icon: UiBraces },
] as const;

export function SessionInspector({
  session,
  className,
  defaultTab = "transcript",
  transcriptProps,
  renderSessionActions,
  onPlanChange,
  composer,
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
      ...(composer ? { composer } : {}),
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
  composer,
}: Omit<SessionInspectorProps, "session"> & {
  collection: SessionCollectionInput;
}) {
  const hierarchy = useSessionHierarchy(collection);
  const [tab, setTab] = useState<SessionInspectorTab>(defaultTab);
  const transcriptClassName = cn("h-full", transcriptProps?.className);
  const panelDetail = tab === "costs" ? hierarchy.filtered : hierarchy.current;
  // TEMP: debug
  console.log(
    hierarchy.filtered.messages?.map((message) => message.parts),
    hierarchy.checked,
  );

  return (
    <div
      className={cn(
        "flex h-full min-h-0 w-full max-w-full flex-col overflow-hidden rounded-xl border border-border bg-background text-sm shadow-sm",
        className,
      )}
    >
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
      <div
        role="tablist"
        aria-label="Session detail view"
        className="flex shrink-0 overflow-x-auto border-b border-border px-density-2"
      >
        {TABS.map((item) => {
          const count = tabCount(item.id, hierarchy.current);
          return (
            <TabButton
              key={item.id}
              active={tab === item.id}
              onClick={() => setTab(item.id)}
              label={tabLabel(
                item.id,
                item.label,
                item.id === "costs" ? hierarchy.filtered : hierarchy.current,
              )}
              icon={item.icon}
              variant="underline"
              {...(count === undefined ? {} : { count })}
              className="shrink-0 py-density-2 [&_svg]:text-muted-foreground"
            />
          );
        })}
      </div>
      <div className="grid min-h-0 flex-1 overflow-y-auto lg:grid-cols-[minmax(0,1fr)_18rem] lg:overflow-hidden">
        <main className="flex min-h-[28rem] min-w-0 flex-col lg:min-h-0">
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
              />
            )}
          </div>
          {composer ? (
            <div className="shrink-0 border-t border-border p-density-3">
              {composer}
            </div>
          ) : null}
        </main>
        <SessionInspectorSidebar session={hierarchy.current} />
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
}: Pick<
  SessionInspectorProps,
  "className" | "defaultTab" | "transcriptProps" | "composer"
> & {
  session: SessionInput;
}) {
  const [tab, setTab] = useState<SessionInspectorTab>(defaultTab);
  const transcriptClassName = cn("h-full", transcriptProps?.className);
  return (
    <div
      className={cn(
        "flex h-full min-h-0 w-full max-w-full flex-col overflow-hidden rounded-xl border border-border bg-background text-sm shadow-sm",
        className,
      )}
    >
      <div
        role="tablist"
        aria-label="Session detail view"
        className="flex shrink-0 overflow-x-auto border-b border-border px-density-2"
      >
        {TABS.map((item) => (
          <TabButton
            key={item.id}
            active={tab === item.id}
            onClick={() => setTab(item.id)}
            label={item.label}
            icon={item.icon}
            variant="underline"
            className="shrink-0 py-density-2 [&_svg]:text-muted-foreground"
          />
        ))}
      </div>
      <div className="flex min-h-0 flex-1 flex-col overflow-hidden">
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
        {composer ? (
          <div className="shrink-0 border-t border-border p-density-3">
            {composer}
          </div>
        ) : null}
      </div>
    </div>
  );
}

function tabCount(tab: SessionInspectorTab, session?: UnifiedSessionInput) {
  switch (tab) {
    case "files":
      return (
        (session?.files?.read?.length ?? 0) +
        (session?.files?.written?.length ?? 0)
      );
    case "approvals":
      return (
        (session?.approvals?.approved ?? 0) + (session?.approvals?.denied ?? 0)
      );
    default:
      return undefined;
  }
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

function tabLabel(
  tab: SessionInspectorTab,
  label: string,
  session?: UnifiedSessionInput,
) {
  if (tab !== "costs") return label;
  const total = costTotal(session?.cost);
  return total ? `${label} ${formatCost(total)}` : label;
}

function asUnifiedSession(
  session: SessionInput,
): UnifiedSessionInput | undefined {
  if (typeof session !== "object" || session === null || Array.isArray(session))
    return undefined;
  return session as UnifiedSessionInput;
}
