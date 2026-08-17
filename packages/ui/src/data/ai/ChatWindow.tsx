import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ComponentType,
} from "react";
import type { Props as RndProps } from "react-rnd";
import { cn } from "../../lib/utils";
import { Button } from "../../components/button";
import { Icon } from "../Icon";
import { UiAdd, UiClose, UiFullscreen, UiGitBranch } from "../../icons";
import { Chat } from "../chat/Chat";
import { forkChatSession, type CaptainChatSession } from "../chat/approval";
import type {
  ChatBudgetConfig,
  ChatUsageSummary,
  ClaudePermissionMode,
} from "../chat/types";
import { useChatWindowManager } from "./chat-window-context";
import { ThreadPicker } from "./ThreadPicker";
import { ContextBadges } from "./ContextBadges";
import {
  ToolPreferences,
  type ToolMeta,
  type ToolMode,
} from "./ToolPreferences";
import type { ChatContextItem } from "./context";
import { chatWindowRequestBody } from "./ChatWindowRequestBody";
import {
  loadChatPreferences,
  saveChatPreferences,
  type StoredChatPreferences,
} from "./ChatWindow.preferences";
import { useChatWindowRuntime } from "./ChatWindow.runtime";
import { useChatWindowCatalogs } from "./ChatWindow.catalogs";
import {
  effectiveToolPreferences,
  normalizeToolCatalog,
} from "./ChatWindow.tool-catalog";
import { useChatThreadSetup } from "./ChatWindow.thread";
import { ChatThreadSetupStatus } from "./ChatWindow.thread-status";
import type { ChatWindowProps } from "./ChatWindow.types";
export type {
  ChatContextPickerRenderProps,
  ChatWindowProps,
} from "./ChatWindow.types";

const EMPTY_TOOLS: ToolMeta[] = [];

const MAXIMIZE_CSS = `
.chat-maximized .react-draggable {
  transform: none !important;
  width: auto !important;
  height: auto !important;
  inset: 0 !important;
  position: absolute !important;
}`;

/** A draggable, resizable floating chat window. It lazy-loads `react-rnd` (an
 *  optional dependency, so consumers of just the inner <Chat> never pull it)
 *  and renders the existing <Chat> beneath a drag-handle header with thread
 *  switching, a context-badge row and optional tool preferences. */
export function ChatWindow({
  panel,
  chat,
  title = "Assistant",
  sessionsApi = "/api/chat/sessions",
  threadsSource,
  contextTypeConfig,
  tools,
  defaultToolMode = "ask",
  toolsApi = "/api/chat/tools",
  runtimesApi = null,
  toolRenderers,
  headerExtras,
  renderContextPicker,
}: ChatWindowProps) {
  const { updatePanel, closePanel, bringToFront, maximizePanel, openPanel } =
    useChatWindowManager();
  const threadSetup = useChatThreadSetup({
    threadId: panel.threadId,
    api: sessionsApi,
    source: threadsSource,
    onCreated: (threadId) => updatePanel(panel.id, { threadId }),
  });
  const [Rnd, setRnd] = useState<ComponentType<RndProps> | null>(null);
  const [storedPrefs] = useState<StoredChatPreferences>(() =>
    loadChatPreferences(),
  );
  const [budget, setBudget] = useState<ChatBudgetConfig>(
    chat?.budget ?? storedPrefs.budget ?? {},
  );
  const [permissionMode, setPermissionMode] = useState<ClaudePermissionMode>(
    chat?.permissionMode ?? storedPrefs.permissionMode ?? "default",
  );
  const [usage, setUsage] = useState<ChatUsageSummary | null>(null);
  const [titleRefresh, setTitleRefresh] = useState(0);
  // Only the modes the user picked in the popover are stored. Everything else
  // is derived, so a surface's declared defaults still reach tools the user has
  // never touched (see effectiveToolPreferences).
  const [explicitToolPrefs, setExplicitToolPrefs] = useState<
    Record<string, ToolMode>
  >(storedPrefs.toolPrefs ?? {});
  const [fetchedTools, setFetchedTools] = useState<ToolMeta[] | undefined>(
    undefined,
  );
  const [toolsLoading, setToolsLoading] = useState(false);
  const [toolsError, setToolsError] = useState<string | null>(null);
  const resolvedTools = tools ?? fetchedTools ?? EMPTY_TOOLS;
  const modelsApi =
    chat?.modelsApi === undefined ? "/api/chat/models" : chat.modelsApi;
  const {
    models: resolvedModels,
    runtimeFamilies,
    loading: catalogLoading,
    error: catalogError,
    retry: retryCatalogs,
  } = useChatWindowCatalogs({
    models: chat?.models,
    modelsApi,
    runtimesApi,
  });
  const {
    runtime,
    temperature,
    reasoningEfforts,
    handleRuntimeChange,
    handleModelChange,
    handleReasoningEffortChange,
    handleTemperatureChange,
    replaceRuntimeIdentity,
    replaceRuntime,
  } = useChatWindowRuntime({
    chat,
    initialModel: panel.initialModel,
    models: resolvedModels,
    storedRuntime: storedPrefs.runtime,
  });
  const [messageCount, setMessageCount] = useState(0);
  const [runtimeBound, setRuntimeBound] = useState(false);
  const [forking, setForking] = useState(false);
  const runtimeLocked = runtimeBound || messageCount > 0;
  const preferredRuntimeRef = useRef(runtime);

  useEffect(() => {
    if (!runtimeLocked) preferredRuntimeRef.current = runtime;
  }, [runtime, runtimeLocked]);

  useEffect(() => {
    setMessageCount(0);
    setRuntimeBound(false);
    setUsage(null);
    replaceRuntime(preferredRuntimeRef.current);
  }, [panel.threadId, replaceRuntime]);

  useEffect(() => {
    if (chat?.budget !== undefined) setBudget(chat.budget);
  }, [chat?.budget]);

  useEffect(() => {
    if (chat?.permissionMode !== undefined)
      setPermissionMode(chat.permissionMode);
  }, [chat?.permissionMode]);

  useEffect(() => {
    if (tools || toolsApi === null) return;
    let active = true;
    setToolsLoading(true);
    setToolsError(null);
    fetch(toolsApi)
      .then((r) =>
        r.ok ? r.json() : Promise.reject(new Error(`tools ${r.status}`)),
      )
      .then((data) => {
        if (!active) return;
        setFetchedTools(normalizeToolCatalog(data));
      })
      .catch((err) => {
        if (!active) return;
        setToolsError(err instanceof Error ? err.message : String(err));
      })
      .finally(() => {
        if (active) setToolsLoading(false);
      });
    return () => {
      active = false;
    };
  }, [tools, toolsApi]);

  useEffect(() => {
    saveChatPreferences({
      runtime: runtimeLocked ? preferredRuntimeRef.current : runtime,
      ...(budget.cost !== undefined || budget.maxTokens !== undefined
        ? { budget }
        : {}),
      permissionMode,
      toolPrefs: explicitToolPrefs,
    });
  }, [budget, permissionMode, runtime, runtimeLocked, explicitToolPrefs]);

  const toolPrefs = useMemo(
    () =>
      effectiveToolPreferences({
        tools: resolvedTools,
        explicit: explicitToolPrefs,
        surfaceDefaults: panel.toolDefaults,
        fallback: defaultToolMode,
      }),
    [defaultToolMode, explicitToolPrefs, panel.toolDefaults, resolvedTools],
  );

  // The popover hands back the whole map, so the keys that differ from the
  // currently effective modes are exactly what the user just changed.
  const handleToolPrefsChange = useCallback(
    (next: Record<string, ToolMode>) => {
      setExplicitToolPrefs((prev) => {
        const updated = { ...prev };
        for (const [name, mode] of Object.entries(next)) {
          if (toolPrefs[name] !== mode) updated[name] = mode;
        }
        return updated;
      });
    },
    [toolPrefs],
  );

  useEffect(() => {
    let active = true;
    import("react-rnd").then((m) => {
      if (active) setRnd(() => m.Rnd as unknown as ComponentType<RndProps>);
    });
    return () => {
      active = false;
    };
  }, []);

  const removeContext = useCallback(
    (id: string) =>
      updatePanel(panel.id, {
        contextItems: panel.contextItems.filter((c) => c.id !== id),
      }),
    [updatePanel, panel.id, panel.contextItems],
  );

  const addContextItems = useCallback(
    (items: ChatContextItem[]) =>
      updatePanel(panel.id, {
        contextItems: [
          ...panel.contextItems,
          ...items.filter(
            (item, index) =>
              !panel.contextItems.some((existing) => existing.id === item.id) &&
              items.findIndex((candidate) => candidate.id === item.id) ===
                index,
          ),
        ],
      }),
    [panel.contextItems, panel.id, updatePanel],
  );
  const addContext = useCallback(
    (item: ChatContextItem) => addContextItems([item]),
    [addContextItems],
  );

  const mergedBody = chatWindowRequestBody({
    base: chat?.body,
    contextItems: panel.contextItems,
    tools: resolvedTools,
    toolPrefs,
  });

  const initialPrompt = panel.initialPrompt ?? chat?.initialPrompt ?? null;
  const handleInitialPromptSent = useCallback(() => {
    if (panel.initialPrompt) updatePanel(panel.id, { initialPrompt: null });
    chat?.onInitialPromptSent?.();
  }, [chat, panel.id, panel.initialPrompt, updatePanel]);
  const handleUsage = useCallback(
    (snapshot: ChatUsageSummary) => {
      setUsage(snapshot);
      // A settled turn is also when the backend has named the conversation, so
      // this is what refreshes the picker's label.
      setTitleRefresh((value) => value + 1);
      chat?.onUsage?.(snapshot);
    },
    [chat],
  );
  const handlePermissionModeChange = useCallback(
    (next: ClaudePermissionMode) => {
      setPermissionMode(next);
      chat?.onPermissionModeChange?.(next);
    },
    [chat],
  );
  const handleSessionHydrated = useCallback(
    (session: CaptainChatSession) => {
      if (session.id !== panel.threadId) return;
      setRuntimeBound(
        Boolean(session.runtime?.model && session.runtime.backend),
      );
      if (session.runtime?.model && session.runtime.backend) {
        replaceRuntimeIdentity(session.runtime);
      }
      chat?.onSessionHydrated?.(session);
    },
    [chat, panel.threadId, replaceRuntimeIdentity],
  );
  const handleMessageCountChange = useCallback(
    (count: number) => {
      setMessageCount(count);
      chat?.onMessageCountChange?.(count);
    },
    [chat],
  );
  const handleFork = useCallback(async () => {
    if (!sessionsApi || !panel.threadId || messageCount === 0 || forking)
      return;
    setForking(true);
    try {
      const fork = await forkChatSession(sessionsApi, panel.threadId);
      openPanel({ threadId: fork.id });
    } catch (error) {
      console.warn("clicky-ui: failed to fork chat session", error);
    } finally {
      setForking(false);
    }
  }, [forking, messageCount, openPanel, panel.threadId, sessionsApi]);

  const header = (
    <div className="chat-drag-handle flex cursor-move items-center gap-1 border-b border-border bg-muted/40 px-2 py-1.5">
      {threadsSource != null || sessionsApi !== null ? (
        <ThreadPicker
          threadId={panel.threadId}
          onSelect={(tid) => updatePanel(panel.id, { threadId: tid })}
          onNew={() => updatePanel(panel.id, { threadId: null })}
          refreshToken={titleRefresh}
          {...(threadsSource
            ? { source: threadsSource }
            : sessionsApi !== null
              ? { api: sessionsApi }
              : {})}
        />
      ) : (
        <span className="px-1 text-sm font-medium">{title}</span>
      )}
      <div className="flex-1" />
      {headerExtras}
      <ToolPreferences
        tools={resolvedTools}
        value={toolPrefs}
        onChange={handleToolPrefsChange}
        models={resolvedModels}
        runtime={runtime}
        onRuntimeChange={handleRuntimeChange}
        runtimeFamilies={runtimeFamilies}
        reasoningEfforts={reasoningEfforts}
        permissionMode={permissionMode}
        onPermissionModeChange={handlePermissionModeChange}
        temperature={temperature}
        onTemperatureChange={handleTemperatureChange}
        budget={budget}
        onBudgetChange={setBudget}
        usage={usage}
        runtimeLocked={runtimeLocked}
        {...(sessionsApi ? { costsApi: sessionsApi } : {})}
        {...(panel.threadId ? { threadId: panel.threadId } : {})}
        toolsLoading={toolsLoading}
        toolsError={toolsError}
        catalogLoading={catalogLoading}
        catalogError={catalogError}
        onCatalogRetry={retryCatalogs}
      />
      {sessionsApi && (
        <Button
          variant="ghost"
          size="icon"
          title={
            messageCount === 0
              ? "Send a message before forking this conversation"
              : "Fork conversation into a new window"
          }
          disabled={!panel.threadId || messageCount === 0 || forking}
          onClick={() => void handleFork()}
        >
          <Icon icon={UiGitBranch} className="size-4" />
        </Button>
      )}
      <Button
        variant="ghost"
        size="icon"
        title="New window"
        onClick={() => openPanel()}
      >
        <Icon icon={UiAdd} className="size-4" />
      </Button>
      <Button
        variant="ghost"
        size="icon"
        title={panel.maximized ? "Restore" : "Maximize"}
        onClick={() => maximizePanel(panel.id)}
      >
        <Icon icon={UiFullscreen} className="size-4" />
      </Button>
      <Button
        variant="ghost"
        size="icon"
        title="Close"
        onClick={() => closePanel(panel.id)}
      >
        <Icon icon={UiClose} className="size-4" />
      </Button>
    </div>
  );

  const frame = (
    <div className="flex h-full flex-col overflow-hidden rounded-lg border border-border bg-background shadow-xl">
      {header}
      {(renderContextPicker || panel.contextItems.length > 0) && (
        <div className="flex flex-wrap items-center gap-1.5 border-b border-border px-2 py-1.5">
          {renderContextPicker?.({
            items: panel.contextItems,
            onAdd: addContext,
            onAddMany: addContextItems,
          })}
          <ContextBadges
            items={panel.contextItems}
            onRemove={removeContext}
            className="px-0 py-0"
            {...(contextTypeConfig ? { typeConfig: contextTypeConfig } : {})}
          />
        </div>
      )}
      <div className="min-h-0 flex-1">
        {threadSetup.blocked ? (
          <ChatThreadSetupStatus setup={threadSetup} />
        ) : (
          <Chat
            key={panel.threadId ?? `new-${panel.id}`}
            {...chat}
            {...(resolvedModels.length
              ? { models: resolvedModels, modelsApi: null }
              : {})}
            runtime={runtime}
            {...(runtimeFamilies ? { runtimeFamilies } : {})}
            permissionMode={permissionMode}
            onRuntimeChange={handleRuntimeChange}
            onModelChange={handleModelChange}
            onReasoningEffortChange={handleReasoningEffortChange}
            budget={budget}
            onUsage={handleUsage}
            runtimeLocked={runtimeLocked}
            onMessageCountChange={handleMessageCountChange}
            onSessionHydrated={handleSessionHydrated}
            {...(panel.threadId ? { threadId: panel.threadId } : {})}
            sessionsApi={sessionsApi}
            tools={resolvedTools}
            {...(toolRenderers ? { toolRenderers } : {})}
            body={mergedBody}
            initialPrompt={initialPrompt}
            onInitialPromptSent={handleInitialPromptSent}
          />
        )}
      </div>
    </div>
  );

  const outerClass = cn(
    "fixed pointer-events-none",
    panel.maximized ? "inset-4 chat-maximized" : "inset-0",
  );

  // Until react-rnd loads (and as a graceful fallback if it never does) the
  // window is statically positioned — still usable, just not draggable.
  if (!Rnd) {
    return (
      <div className={outerClass} style={{ zIndex: panel.zIndex }}>
        <div
          className="pointer-events-auto h-full"
          style={
            panel.maximized
              ? { position: "relative", width: "100%", height: "100%" }
              : {
                  position: "absolute",
                  left: panel.x,
                  top: panel.y,
                  width: panel.width,
                  height: panel.height,
                }
          }
        >
          {frame}
        </div>
      </div>
    );
  }

  return (
    <div className={outerClass} style={{ zIndex: panel.zIndex }}>
      <style>{MAXIMIZE_CSS}</style>
      <Rnd
        default={{
          x: panel.x,
          y: panel.y,
          width: panel.width,
          height: panel.height,
        }}
        style={{ pointerEvents: "auto" }}
        minWidth={360}
        minHeight={400}
        bounds="parent"
        dragHandleClassName="chat-drag-handle"
        disableDragging={panel.maximized}
        enableResizing={!panel.maximized}
        onDragStart={() => bringToFront(panel.id)}
        onDragStop={(_e, d) => updatePanel(panel.id, { x: d.x, y: d.y })}
        onResizeStop={(_e, _dir, ref, _delta, pos) =>
          updatePanel(panel.id, {
            width: ref.offsetWidth,
            height: ref.offsetHeight,
            x: pos.x,
            y: pos.y,
          })
        }
      >
        {frame}
      </Rnd>
    </div>
  );
}

/** Renders every open window for the current {@link useChatWindowManager}.
 *  Drop one of these near the root alongside a <ChatFab/>. */
export function ChatWindowLayer(props: Omit<ChatWindowProps, "panel">) {
  const { panels } = useChatWindowManager();
  return (
    <>
      {panels.map((panel) => (
        <ChatWindow key={panel.id} panel={panel} {...props} />
      ))}
    </>
  );
}
