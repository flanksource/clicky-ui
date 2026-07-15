import {
  useCallback,
  useEffect,
  useState,
  type ComponentType,
  type ReactNode,
} from "react";
import type { Props as RndProps } from "react-rnd";
import { cn } from "../../lib/utils";
import { Button } from "../../components/button";
import { Icon } from "../Icon";
import { UiAdd, UiClose, UiFullscreen } from "../../icons";
import { Chat, type ChatProps } from "../chat/Chat";
import type {
  ChatBudgetConfig,
  ChatModel,
  ChatUsageSummary,
  ClaudePermissionMode,
} from "../chat/types";
import {
  useChatWindowManager,
  type ChatWindowState,
} from "./chat-window-context";
import { ThreadPicker, type ThreadSource } from "./ThreadPicker";
import { ContextBadges } from "./ContextBadges";
import {
  ToolPreferences,
  type ToolMeta,
  type ToolMode,
} from "./ToolPreferences";
import type { ContextTypeConfig } from "./context";
import { chatWindowRequestBody } from "./ChatWindowRequestBody";

export type ChatWindowProps = {
  panel: ChatWindowState;
  /** Props forwarded to the inner <Chat>. The window manages `threadId` and
   *  merges attached context / tool preferences into `body` on top of these. */
  chat?: Partial<ChatProps>;
  /** Header title shown when the thread picker is disabled. */
  title?: ReactNode;
  /** Thread switcher endpoint, or null to hide the picker. Defaults to
   *  "/api/chat/threads". Ignored when `threadsSource` is set. */
  threadsApi?: string | null;
  /** Inject the thread list/delete directly instead of fetching `threadsApi`
   *  (e.g. an app that loads conversations via its own client). Shows the
   *  picker regardless of `threadsApi`. */
  threadsSource?: ThreadSource;
  /** Maps context item `type` to an icon/colour for the badge row. */
  contextTypeConfig?: ContextTypeConfig;
  /** When provided, a tool-preferences popover is shown and forwarded as
   *  `body.toolPreferences`. Tools default to "ask" (approval required); the
   *  user can switch any tool to On/Auto/Off from the popover. */
  tools?: ToolMeta[];
  /** Initial mode assigned to tools when they first load. Defaults to "ask". */
  defaultToolMode?: ToolMode;
  /** Backend tool catalog endpoint. Defaults to "/api/chat/tools"; null disables fetching. */
  toolsApi?: string | null;
  /** Extra controls rendered in the header, e.g. a <ContextUsage/> gauge. */
  headerExtras?: ReactNode;
};

type StoredChatPreferences = {
  model?: string;
  reasoningEffort?: string;
  temperature?: number;
  budget?: ChatBudgetConfig;
  permissionMode?: ClaudePermissionMode;
  toolPrefs?: Record<string, ToolMode>;
};

const CHAT_PREFS_STORAGE_KEY = "clicky-ui.chat-window.preferences";
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
  threadsApi = "/api/chat/threads",
  threadsSource,
  contextTypeConfig,
  tools,
  defaultToolMode = "ask",
  toolsApi = "/api/chat/tools",
  headerExtras,
}: ChatWindowProps) {
  const { updatePanel, closePanel, bringToFront, maximizePanel, openPanel } =
    useChatWindowManager();
  const [Rnd, setRnd] = useState<ComponentType<RndProps> | null>(null);
  const [storedPrefs] = useState<StoredChatPreferences>(() =>
    loadChatPreferences(),
  );
  const initialModel =
    panel.initialModel ??
    chat?.model ??
    chat?.defaultModel ??
    storedPrefs.model;
  const [model, setModel] = useState<string | undefined>(initialModel);
  const [reasoningEffort, setReasoningEffort] = useState(
    chat?.reasoningEffort ??
      chat?.defaultReasoningEffort ??
      storedPrefs.reasoningEffort ??
      "",
  );
  const [temperature, setTemperature] = useState<number | undefined>(
    chat?.temperature ?? storedPrefs.temperature,
  );
  const [budget, setBudget] = useState<ChatBudgetConfig>(
    chat?.budget ?? storedPrefs.budget ?? {},
  );
  const [permissionMode, setPermissionMode] = useState<ClaudePermissionMode>(
    chat?.permissionMode ?? storedPrefs.permissionMode ?? "default",
  );
  const [usage, setUsage] = useState<ChatUsageSummary | null>(null);
  const [toolPrefs, setToolPrefs] = useState<Record<string, ToolMode>>(
    storedPrefs.toolPrefs ?? {},
  );
  const [fetchedTools, setFetchedTools] = useState<ToolMeta[] | undefined>(
    undefined,
  );
  const [toolsLoading, setToolsLoading] = useState(false);
  const [toolsError, setToolsError] = useState<string | null>(null);
  const [fetchedModels, setFetchedModels] = useState<ChatModel[]>([]);

  const resolvedTools = tools ?? fetchedTools ?? EMPTY_TOOLS;
  const modelsApi =
    chat?.modelsApi === undefined ? "/api/chat/models" : chat.modelsApi;
  const resolvedModels = chat?.models ?? fetchedModels;

  useEffect(() => {
    if (chat?.model !== undefined) setModel(chat.model);
  }, [chat?.model]);

  useEffect(() => {
    if (chat?.model !== undefined || panel.initialModel) return;
    if (chat?.defaultModel) setModel(chat.defaultModel);
  }, [chat?.defaultModel, chat?.model, panel.initialModel]);

  useEffect(() => {
    if (chat?.reasoningEffort !== undefined)
      setReasoningEffort(chat.reasoningEffort);
  }, [chat?.reasoningEffort]);

  useEffect(() => {
    if (chat?.temperature !== undefined) setTemperature(chat.temperature);
  }, [chat?.temperature]);

  useEffect(() => {
    if (chat?.budget !== undefined) setBudget(chat.budget);
  }, [chat?.budget]);

  useEffect(() => {
    if (chat?.permissionMode !== undefined)
      setPermissionMode(chat.permissionMode);
  }, [chat?.permissionMode]);

  useEffect(() => {
    if (panel.initialModel) setModel(panel.initialModel);
  }, [panel.initialModel]);

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
    if (chat?.models || !modelsApi) return;
    let active = true;
    fetch(modelsApi)
      .then((r) =>
        r.ok ? r.json() : Promise.reject(new Error(`models ${r.status}`)),
      )
      .then((data: ChatModel[]) => {
        if (!active) return;
        setFetchedModels(data);
        setModel(
          (current) =>
            current ?? data.find((item) => item.configured !== false)?.id,
        );
      })
      .catch((err) =>
        console.warn("clicky-ui: failed to load chat models", err),
      );
    return () => {
      active = false;
    };
  }, [chat?.models, modelsApi]);

  useEffect(() => {
    saveChatPreferences({
      ...(model ? { model } : {}),
      ...(reasoningEffort ? { reasoningEffort } : {}),
      ...(temperature !== undefined ? { temperature } : {}),
      ...(budget.cost !== undefined || budget.maxTokens !== undefined
        ? { budget }
        : {}),
      permissionMode,
      toolPrefs,
    });
  }, [budget, model, permissionMode, reasoningEffort, temperature, toolPrefs]);

  // Seed any tool the user hasn't configured yet from the backend default
  // permission; existing choices are preserved. Handles async catalog loads.
  useEffect(() => {
    if (!resolvedTools.length) return;
    setToolPrefs((prev) => {
      const next = { ...prev };
      let changed = false;
      for (const t of resolvedTools) {
        const key = t.name;
        if (next[key] === undefined) {
          next[key] = t.defaultPermission ?? defaultToolMode;
          changed = true;
        }
      }
      return changed ? next : prev;
    });
  }, [defaultToolMode, resolvedTools]);

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

  const mergedBody = chatWindowRequestBody({
    base: chat?.body,
    contextItems: panel.contextItems,
    tools: resolvedTools,
    toolPrefs,
  });

  const initialPrompt = panel.initialPrompt ?? chat?.initialPrompt ?? null;
  const defaultModel = panel.initialModel ?? chat?.defaultModel;
  const handleInitialPromptSent = useCallback(() => {
    if (panel.initialPrompt) updatePanel(panel.id, { initialPrompt: null });
    chat?.onInitialPromptSent?.();
  }, [chat, panel.id, panel.initialPrompt, updatePanel]);
  const handleUsage = useCallback(
    (snapshot: ChatUsageSummary) => {
      setUsage(snapshot);
      chat?.onUsage?.(snapshot);
    },
    [chat],
  );
  const handleModelChange = useCallback(
    (next: string) => {
      setModel(next);
      chat?.onModelChange?.(next);
    },
    [chat],
  );
  const handleReasoningEffortChange = useCallback(
    (next: string) => {
      setReasoningEffort(next);
      chat?.onReasoningEffortChange?.(next);
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

  const header = (
    <div className="chat-drag-handle flex cursor-move items-center gap-1 border-b border-border bg-muted/40 px-2 py-1.5">
      {threadsSource != null || threadsApi !== null ? (
        <ThreadPicker
          threadId={panel.threadId}
          onSelect={(tid) => updatePanel(panel.id, { threadId: tid })}
          onNew={() => updatePanel(panel.id, { threadId: null })}
          {...(threadsSource
            ? { source: threadsSource }
            : threadsApi !== null
              ? { api: threadsApi }
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
        onChange={setToolPrefs}
        models={resolvedModels}
        model={model}
        onModelChange={handleModelChange}
        reasoningEfforts={chat?.reasoningEfforts ?? ["low", "medium", "high"]}
        reasoningEffort={reasoningEffort}
        onReasoningEffortChange={handleReasoningEffortChange}
        permissionMode={permissionMode}
        onPermissionModeChange={handlePermissionModeChange}
        temperature={temperature}
        onTemperatureChange={setTemperature}
        budget={budget}
        onBudgetChange={setBudget}
        usage={usage}
        toolsLoading={toolsLoading}
        toolsError={toolsError}
      />
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
      <ContextBadges
        items={panel.contextItems}
        onRemove={removeContext}
        {...(contextTypeConfig ? { typeConfig: contextTypeConfig } : {})}
      />
      <div className="min-h-0 flex-1">
        <Chat
          {...chat}
          {...(resolvedModels.length
            ? { models: resolvedModels, modelsApi: null }
            : {})}
          {...(defaultModel ? { defaultModel } : {})}
          {...(model ? { model } : {})}
          reasoningEffort={reasoningEffort}
          permissionMode={permissionMode}
          onModelChange={handleModelChange}
          onReasoningEffortChange={handleReasoningEffortChange}
          {...(temperature !== undefined ? { temperature } : {})}
          budget={budget}
          onUsage={handleUsage}
          {...(panel.threadId ? { threadId: panel.threadId } : {})}
          body={mergedBody}
          initialPrompt={initialPrompt}
          onInitialPromptSent={handleInitialPromptSent}
        />
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

function loadChatPreferences(): StoredChatPreferences {
  if (typeof window === "undefined") return {};
  try {
    const raw = window.localStorage.getItem(CHAT_PREFS_STORAGE_KEY);
    if (!raw) return {};
    const parsed = JSON.parse(raw) as StoredChatPreferences;
    if (!parsed || typeof parsed !== "object") return {};
    const { toolPrefs: rawToolPrefs, ...rest } = parsed;
    const toolPrefs = normalizeToolPreferences(rawToolPrefs);
    return {
      ...rest,
      ...(toolPrefs ? { toolPrefs } : {}),
    };
  } catch {
    return {};
  }
}

function saveChatPreferences(prefs: StoredChatPreferences) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(CHAT_PREFS_STORAGE_KEY, JSON.stringify(prefs));
  } catch {
    // Ignore storage quota/privacy failures; chat stays functional.
  }
}

function normalizeToolCatalog(data: unknown): ToolMeta[] {
  const tools = Array.isArray(data)
    ? data
    : data &&
        typeof data === "object" &&
        Array.isArray((data as { tools?: unknown }).tools)
      ? (data as { tools: unknown[] }).tools
      : [];
  return tools.flatMap((tool) => normalizeToolMeta(tool));
}

function normalizeToolMeta(tool: unknown): ToolMeta[] {
  if (!tool || typeof tool !== "object") return [];
  const item = tool as Record<string, unknown>;
  const name = stringValue(item.name);
  if (!name) return [];
  const label =
    stringValue(item.label) ??
    stringValue(item.title) ??
    stringValue(item.operationName) ??
    name;
  const defaultPermission = normalizeToolModeValue(
    item.defaultPermission ?? item.defaultMode,
  );
  const group = stringValue(item.group);
  const parent = stringValue(item.parent);
  const entity = stringValue(item.entity);
  const preferenceKey = stringValue(item.preferenceKey);
  const icon = stringValue(item.icon);
  const description = stringValue(item.description);
  const hints = stringArrayValue(item.hints);
  const source = stringValue(item.source);
  const server = stringValue(item.server);
  const method = stringValue(item.method);
  const path = stringValue(item.path);
  const operationName = stringValue(item.operationName);
  const title = stringValue(item.title);
  const strict = booleanValue(item.strict);
  const annotations = annotationsValue(item.annotations);
  const inputSchema = schemaValue(item.inputSchema);
  const outputSchema = schemaValue(item.outputSchema);
  return [
    {
      name,
      label,
      ...(group ? { group } : {}),
      ...(parent ? { parent } : {}),
      ...(entity ? { entity } : {}),
      ...(preferenceKey ? { preferenceKey } : {}),
      ...(defaultPermission ? { defaultPermission } : {}),
      ...(icon ? { icon } : {}),
      ...(description ? { description } : {}),
      ...(hints ? { hints } : {}),
      ...(source ? { source } : {}),
      ...(server ? { server } : {}),
      ...(method ? { method } : {}),
      ...(path ? { path } : {}),
      ...(operationName ? { operationName } : {}),
      ...(title ? { title } : {}),
      ...(strict !== undefined ? { strict } : {}),
      ...(annotations ? { annotations } : {}),
      ...(inputSchema ? { inputSchema } : {}),
      ...(outputSchema ? { outputSchema } : {}),
    },
  ];
}

function stringValue(value: unknown): string | undefined {
  return typeof value === "string" && value.trim() ? value : undefined;
}

function stringArrayValue(value: unknown): string[] | undefined {
  if (!Array.isArray(value)) return undefined;
  const values = value.filter(
    (item): item is string =>
      typeof item === "string" && item.trim().length > 0,
  );
  return values.length > 0 ? values : undefined;
}

function schemaValue(value: unknown): ToolMeta["inputSchema"] | undefined {
  if (!value || typeof value !== "object" || Array.isArray(value))
    return undefined;
  return value as ToolMeta["inputSchema"];
}

function booleanValue(value: unknown): boolean | undefined {
  return typeof value === "boolean" ? value : undefined;
}

function annotationsValue(value: unknown): ToolMeta["annotations"] | undefined {
  if (!value || typeof value !== "object" || Array.isArray(value))
    return undefined;
  return value as ToolMeta["annotations"];
}

function normalizeToolPreferences(
  value: unknown,
): Record<string, ToolMode> | undefined {
  if (!value || typeof value !== "object" || Array.isArray(value))
    return undefined;
  const prefs: Record<string, ToolMode> = {};
  for (const [key, rawMode] of Object.entries(value)) {
    const mode = normalizeToolModeValue(rawMode);
    if (key && mode) prefs[key] = mode;
  }
  return Object.keys(prefs).length ? prefs : undefined;
}

function normalizeToolModeValue(value: unknown): ToolMode | undefined {
  if (typeof value !== "string") return undefined;
  switch (value.trim().toLowerCase()) {
    case "on":
    case "enabled":
      return "on";
    case "ask":
      return "ask";
    case "off":
    case "disabled":
      return "off";
    case "auto":
      return "auto";
    default:
      return undefined;
  }
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
