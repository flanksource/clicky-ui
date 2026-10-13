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
import { useMediaQuery } from "../../hooks/use-media-query";
import { Chat } from "../chat/Chat";
import { forkChatSession, type CaptainChatSession } from "../chat/approval";
import type {
  ChatBudgetConfig,
  ChatUsageSummary,
  ClaudePermissionMode,
} from "../chat/types";
import { useChatWindowManager } from "./chat-window-context";
import { ChatWindowHeader } from "./ChatWindow.header";
import { ContextBadges } from "./ContextBadges";
import type { ToolMeta } from "./ToolPreferences";
import type { ChatContextItem } from "./context";
import { chatWindowRequestBody } from "./ChatWindowRequestBody";
import {
  loadChatPreferences,
  saveChatPreferences,
  type StoredChatPreferences,
} from "./ChatWindow.preferences";
import { useChatWindowRuntime } from "./ChatWindow.runtime";
import { useChatWindowCatalogs } from "./ChatWindow.catalogs";
import { normalizeToolCatalog } from "./ChatWindow.tool-catalog";
import {
  effectiveToolPolicies,
  withUserRule,
} from "./ToolPreferences.model";
import type {
  PermissionPolicy,
  PermissionRule,
} from "../chat/tool-policy";
import { useChatThreadSetup } from "./ChatWindow.thread";
import { ChatThreadSetupStatus } from "./ChatWindow.thread-status";
import type { ChatWindowProps } from "./ChatWindow.types";
import {
  CHAT_WINDOW_MOBILE_QUERY,
  ChatWindowFloating,
  ChatWindowSheet,
} from "./ChatWindow.placement";
export { CHAT_WINDOW_MOBILE_QUERY };
export type {
  ChatContextPickerRenderProps,
  ChatWindowProps,
} from "./ChatWindow.types";

const EMPTY_TOOLS: ToolMeta[] = [];

/** A draggable, resizable floating chat window — or, below
 *  {@link CHAT_WINDOW_MOBILE_QUERY}, a full-screen sheet. It lazy-loads `react-rnd` (an
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
  defaultToolPolicy = "ask",
  toolsApi = "/api/chat/tools",
  runtimesApi = null,
  toolRenderers,
  headerExtras,
  renderContextPicker,
}: ChatWindowProps) {
  const {
    panels,
    updatePanel,
    closePanel,
    bringToFront,
    maximizePanel,
    openPanel,
  } = useChatWindowManager();
  const mobile = useMediaQuery(CHAT_WINDOW_MOBILE_QUERY);
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
  const [titleRefresh, setTitleRefresh] = useState(0);
  // Only the rules the user actually toggled are stored. Everything else is
  // derived, so a surface's rules still reach tools the user never touched, and
  // a group toggle keeps applying as the catalog grows.
  const [userToolRules, setUserToolRules] = useState<PermissionPolicy>(
    storedPrefs.toolRules ?? [],
  );
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
    runtimeFamilies: chat?.runtimeFamilies,
    runtimesApi,
  });
  const {
    runtime,
    reasoningEfforts,
    handleRuntimeChange,
    handleModelChange,
    handleReasoningEffortChange,
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
  const threadIdRef = useRef(panel.threadId);
  threadIdRef.current = panel.threadId;

  useEffect(() => {
    if (!runtimeLocked) preferredRuntimeRef.current = runtime;
  }, [runtime, runtimeLocked]);

  useEffect(() => {
    setMessageCount(0);
    setRuntimeBound(false);
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
      toolRules: userToolRules,
    });
  }, [budget, permissionMode, runtime, runtimeLocked, userToolRules]);

  const toolPrefs = useMemo(
    () =>
      effectiveToolPolicies({
        tools: resolvedTools,
        surfacePolicy: panel.toolPolicy,
        userRules: userToolRules,
        fallback: defaultToolPolicy,
      }),
    [defaultToolPolicy, panel.toolPolicy, resolvedTools, userToolRules],
  );

  // The popover hands back the one rule the toggle means, not a whole map, so
  // which control was used survives into the request.
  const handleToolRule = useCallback((rule: PermissionRule) => {
    setUserToolRules((prev) => withUserRule(prev, rule));
  }, []);

  useEffect(() => {
    if (mobile) return;
    let active = true;
    import("react-rnd").then((m) => {
      if (active) setRnd(() => m.Rnd as unknown as ComponentType<RndProps>);
    });
    return () => {
      active = false;
    };
  }, [mobile]);

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
    surfacePolicy: panel.toolPolicy,
    userPolicy: userToolRules,
  });

  const initialPrompt = panel.initialPrompt ?? chat?.initialPrompt ?? null;
  const handleInitialPromptConsumed = useCallback(() => {
    if (panel.initialPrompt) updatePanel(panel.id, { initialPrompt: null });
    chat?.onInitialPromptConsumed?.();
  }, [chat, panel.id, panel.initialPrompt, updatePanel]);
  const proposedPrompts = panel.proposedPrompts?.length
    ? panel.proposedPrompts
    : (chat?.proposedPrompts ?? null);
  const handleProposedPromptsConsumed = useCallback(() => {
    if (panel.proposedPrompts?.length)
      updatePanel(panel.id, { proposedPrompts: [] });
    chat?.onProposedPromptsConsumed?.();
  }, [chat, panel.id, panel.proposedPrompts, updatePanel]);
  const handleUsage = useCallback(
    (snapshot: ChatUsageSummary) => {
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
      // A hydrated session names its runtime as (model, mode). Requiring a
      // `backend` key here left every loaded session unbound — the picker kept
      // its defaults and the next send posted a runtime the thread had not
      // agreed to.
      setRuntimeBound(Boolean(session.runtime?.model && session.runtime.mode));
      if (session.runtime?.model && session.runtime.mode) {
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
    const sourceThreadId = panel.threadId;
    setForking(true);
    try {
      const fork = await forkChatSession(sessionsApi, sourceThreadId);
      if (threadIdRef.current !== sourceThreadId) return;
      openPanel({ threadId: fork.id });
    } catch (error) {
      console.warn("clicky-ui: failed to fork chat session", error);
    } finally {
      setForking(false);
    }
  }, [forking, messageCount, openPanel, panel.threadId, sessionsApi]);

  const header = (
    <ChatWindowHeader
      mobile={mobile}
      title={title}
      threadId={panel.threadId}
      maximized={panel.maximized}
      threadsSource={threadsSource}
      sessionsApi={sessionsApi}
      titleRefresh={titleRefresh}
      headerExtras={headerExtras}
      toolPreferences={{
        tools: resolvedTools,
        value: toolPrefs,
        onRule: handleToolRule,
        rules: userToolRules,
        onRulesChange: setUserToolRules,
        models: resolvedModels,
        runtime,
        onRuntimeChange: handleRuntimeChange,
        runtimeFamilies,
        reasoningEfforts,
        permissionMode,
        onPermissionModeChange: handlePermissionModeChange,
        budget,
        onBudgetChange: setBudget,
        runtimeLocked,
        ...(sessionsApi ? { costsApi: sessionsApi } : {}),
        ...(panel.threadId ? { threadId: panel.threadId } : {}),
        toolsLoading,
        toolsError,
        catalogLoading,
        catalogError,
        onCatalogRetry: retryCatalogs,
      }}
      hasMessages={messageCount > 0}
      forkDisabled={!panel.threadId || messageCount === 0 || forking}
      onSelectThread={(threadId) => updatePanel(panel.id, { threadId })}
      onNewThread={() => updatePanel(panel.id, { threadId: null })}
      onFork={() => void handleFork()}
      onNewWindow={() => openPanel()}
      onMaximize={() => maximizePanel(panel.id)}
      onClose={() => closePanel(panel.id)}
    />
  );

  const frame = (
    <div
      className={cn(
        "flex h-full flex-col overflow-hidden bg-background",
        !mobile && "rounded-lg border border-border shadow-xl",
      )}
    >
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
            onInitialPromptConsumed={handleInitialPromptConsumed}
            proposedPrompts={proposedPrompts}
            onProposedPromptsConsumed={handleProposedPromptsConsumed}
          />
        )}
      </div>
    </div>
  );

  const layerStyle = { zIndex: panel.zIndex };

  if (mobile) {
    const front = panels.reduce((top, p) => (p.zIndex >= top.zIndex ? p : top));
    return (
      <ChatWindowSheet layerStyle={layerStyle} hidden={front.id !== panel.id}>
        {frame}
      </ChatWindowSheet>
    );
  }

  return (
    <ChatWindowFloating
      panel={panel}
      layerStyle={layerStyle}
      Rnd={Rnd}
      onDragStart={() => bringToFront(panel.id)}
      onGeometryChange={(partial) => updatePanel(panel.id, partial)}
    >
      {frame}
    </ChatWindowFloating>
  );
}

/** Renders every open window for the current {@link useChatWindowManager}.
 *  Below {@link CHAT_WINDOW_MOBILE_QUERY} each is a full-screen sheet and only
 *  the most recently focused one is visible. Drop one of these near the root alongside a <ChatFab/>. */
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
