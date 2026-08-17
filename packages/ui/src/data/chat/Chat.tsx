import { useEffect, useMemo, useRef, useState } from "react";
import { useChat } from "@ai-sdk/react";
import { DefaultChatTransport, type ChatTransport, type UIMessage } from "ai";
import { cn } from "../../lib/utils";
import { Conversation } from "./Conversation";
import { PromptInput } from "./PromptInput";
import { Suggestions } from "./Suggestion";
import { DEFAULT_REASONING_EFFORTS } from "./effort-icons";
import { defaultChatModelId } from "./models";
import {
  getChatSession,
  postToolApproval,
  type CaptainChatSession,
} from "./approval";
import { isForkSeedMessage } from "./fork-seed";
import {
  hasStructuredRuntime,
  resolveChatRuntime,
  selectedChatModel,
} from "./Chat.runtime";
import {
  createAttachmentUploadAdapter,
  type AttachmentLimits,
  type AttachmentUploadAdapter,
} from "./attachment-upload";
import { toToolRenderRegistry } from "./tool-render/registry";
import { ToolRenderRegistryProvider } from "./tool-render/context";
import { ChatRuntimeToolbar } from "./ChatRuntimeToolbar";
import type { SpecRuntimeFamily } from "../runtime/runtime-mode";
import type {
  ToolRenderAdapter,
  ToolRenderRegistry,
} from "./tool-render/adapter";
import type {
  ChatBudgetConfig,
  ChatModel,
  ChatMessageMetadata,
  ChatModelRuntime,
  ChatUsageSummary,
  ClaudePermissionMode,
  Suggestion,
  ToolMeta,
  ToolResultRenderer,
} from "./types";
import { usageSnapshotFromMetadata } from "./usage-snapshot";

/** Assistant messages carry token usage + cost the backend rode on the finish
 *  part's `messageMetadata`. */
type ChatUIMessage = UIMessage<ChatMessageMetadata>;

export type ChatProps = {
  /** Endpoint that speaks the AI SDK v6 UI Message Stream protocol.
   *  Ignored when `transport` is supplied. Defaults to "/api/chat". */
  api?: string;
  /** Model menu. When omitted and `modelsApi` is set, it is fetched. */
  models?: ChatModel[];
  /** Endpoint returning the model menu (ModelInfo[]). Defaults to
   *  "/api/chat/models". Set to null to disable fetching. */
  modelsApi?: string | null;
  /** Initially selected model id; otherwise the first configured model. */
  defaultModel?: string;
  /** Controlled selected model id. */
  model?: string;
  /** Initially selected structured runtime. */
  defaultRuntime?: ChatModelRuntime;
  /** Controlled structured runtime. */
  runtime?: ChatModelRuntime;
  /** Runtime families and their host availability. */
  runtimeFamilies?: SpecRuntimeFamily[];
  /** Reasoning-effort options for capable models. */
  reasoningEfforts?: string[];
  /** Initially selected reasoning effort ("" = none). */
  defaultReasoningEffort?: string;
  /** Controlled selected reasoning effort ("" = none). */
  reasoningEffort?: string;
  /** Sampling temperature forwarded to the backend when set. */
  temperature?: number;
  /** Per-request budget forwarded to the backend when set. */
  budget?: ChatBudgetConfig;
  /** Claude Agent SDK permission mode forwarded to the backend when set. */
  permissionMode?: ClaudePermissionMode;
  /** Notified when the user changes the model. */
  onModelChange?: (id: string) => void;
  /** Notified when the user changes any runtime field. */
  onRuntimeChange?: (runtime: ChatModelRuntime) => void;
  /** Notified when the user changes reasoning effort. */
  onReasoningEffortChange?: (effort: string) => void;
  /** Notified when the user changes Claude permission mode. */
  onPermissionModeChange?: (mode: ClaudePermissionMode) => void;
  /** Notified after each assistant turn with a usage snapshot (tokens used out
   *  of the model's context window + cumulative cost), for a usage gauge. */
  onUsage?: (usage: ChatUsageSummary) => void;
  /** Suggested prompts shown on the empty state. */
  suggestions?: Suggestion[];
  /** Enables file/image attachments. */
  enableAttachments?: boolean;
  /** Upload endpoint used before an attachment is added to a chat message. */
  attachmentsApi?: string;
  /** Custom durable upload adapter; overrides attachmentsApi. */
  attachmentUpload?: AttachmentUploadAdapter;
  attachmentLimits?: AttachmentLimits;
  /** Captain thread id used as the AI SDK chat id and forwarded in the body. */
  threadId?: string;
  /** Canonical Captain session endpoint used to hydrate messages and resolve
   *  approvals. The session and approval ids are appended to this URL. */
  sessionsApi?: string | null;
  /** Prevents changing model/backend for an existing Captain session. Effort
   *  and other per-turn generation settings remain editable. */
  runtimeLocked?: boolean;
  /** Reports the number of real (non-fork-seed) persisted/UI messages. */
  onMessageCountChange?: (count: number) => void;
  /** Reports the authoritative Captain session after detail hydration. */
  onSessionHydrated?: (session: CaptainChatSession) => void;
  /** Optional host renderer for recognized completed tool outputs. Takes
   *  priority over `toolRenderers` on the output surface. */
  renderToolResult?: ToolResultRenderer;
  /** Tool catalog, used to resolve each call's input/output JSON Schema so
   *  params and results render with real labels instead of raw JSON. */
  tools?: ToolMeta[];
  /** Domain tool renderers. Host adapters are matched before the built-in
   *  heuristics, which stay as the floor. */
  toolRenderers?: ToolRenderAdapter[] | ToolRenderRegistry;
  /** Extra fields merged into every request body. */
  body?: Record<string, unknown>;
  /** Pre-built transport (e.g. a mock for stories/tests). */
  transport?: ChatTransport<UIMessage>;
  /** Initial messages to seed the conversation. */
  initialMessages?: UIMessage[];
  /** Prompt to send automatically once. A new `id` sends even when text repeats. */
  initialPrompt?: { id: number; text: string } | null;
  /** Called after `initialPrompt` has been handed to the chat transport. */
  onInitialPromptSent?: () => void;
  placeholder?: string;
  emptyState?: React.ReactNode;
  className?: string;
};

/** Self-contained AI chat over a v6-compatible `/api/chat`: a streaming
 *  conversation with model/effort selectors, suggestions, attachments,
 *  per-message copy/regenerate, and human-in-the-loop tool approvals. The
 *  backend owns model selection and tool execution; the selected model,
 *  effort, permission mode and thread id are forwarded in the request body. */
export function Chat({
  api = "/api/chat",
  models: modelsProp,
  modelsApi = "/api/chat/models",
  defaultModel,
  model: controlledModel,
  defaultRuntime,
  runtime: controlledRuntime,
  runtimeFamilies,
  reasoningEfforts = DEFAULT_REASONING_EFFORTS,
  defaultReasoningEffort,
  reasoningEffort: controlledEffort,
  temperature,
  budget,
  permissionMode,
  onModelChange,
  onRuntimeChange,
  onReasoningEffortChange,
  onUsage,
  suggestions,
  enableAttachments = false,
  attachmentsApi = "/api/attachments",
  attachmentUpload,
  attachmentLimits,
  threadId,
  sessionsApi = null,
  runtimeLocked = false,
  onMessageCountChange,
  onSessionHydrated,
  renderToolResult,
  tools,
  toolRenderers,
  body,
  transport,
  initialMessages,
  initialPrompt,
  onInitialPromptSent,
  placeholder,
  emptyState,
  className,
}: ChatProps) {
  const [models, setModels] = useState<ChatModel[]>(modelsProp ?? []);
  const [internalRuntime, setInternalRuntime] = useState<ChatModelRuntime>(
    () =>
      controlledRuntime ??
      resolveChatRuntime({
        models: modelsProp ?? [],
        current: defaultRuntime,
        preferredModel:
          controlledModel ??
          (defaultRuntime
            ? undefined
            : (defaultModel ?? defaultChatModelId(modelsProp ?? []))),
        effort: controlledEffort ?? defaultReasoningEffort,
        temperature,
        reasoningEfforts,
      }),
  );
  const [usage, setUsage] = useState<ChatUsageSummary | null>(null);
  const [approvalError, setApprovalError] = useState<Error | undefined>();
  const [hydratedSessionId, setHydratedSessionId] = useState<string | null>(
    null,
  );
  const lastDefaultModel = useRef(defaultModel);
  const sentInitialPromptId = useRef<number | null>(null);
  const activeThreadRef = useRef(threadId);
  const onMessageCountChangeRef = useRef(onMessageCountChange);
  const onSessionHydratedRef = useRef(onSessionHydrated);
  activeThreadRef.current = threadId;
  onMessageCountChangeRef.current = onMessageCountChange;
  onSessionHydratedRef.current = onSessionHydrated;
  const runtime = controlledRuntime ?? internalRuntime;

  // Provided once here; <ToolCall> reads it from context, so no tool-render
  // props thread through Conversation/Message.
  const toolRegistry = useMemo(
    () => toToolRenderRegistry(toolRenderers, tools ? { tools } : {}),
    [toolRenderers, tools],
  );

  useEffect(() => {
    if (!modelsProp) return;
    setModels(modelsProp);
  }, [modelsProp]);

  // Fetch the model menu unless one was supplied or fetching is disabled.
  useEffect(() => {
    if (modelsProp || !modelsApi) return;
    let cancelled = false;
    fetch(modelsApi)
      .then((r) =>
        r.ok ? r.json() : Promise.reject(new Error(`models ${r.status}`)),
      )
      .then((data: ChatModel[]) => {
        if (cancelled) return;
        setModels(data);
      })
      .catch((err) =>
        console.warn("clicky-ui: failed to load chat models", err),
      );
    return () => {
      cancelled = true;
    };
  }, [modelsProp, modelsApi]);

  useEffect(() => {
    if (controlledRuntime !== undefined) return;
    const defaultChanged =
      Boolean(defaultModel) && defaultModel !== lastDefaultModel.current;
    lastDefaultModel.current = defaultModel;
    setInternalRuntime((current) =>
      resolveChatRuntime({
        models,
        current,
        preferredModel:
          controlledModel ??
          (defaultChanged
            ? defaultModel
            : (selectedChatModel(models, current)?.id ??
              defaultModel ??
              defaultChatModelId(models))),
        effort: controlledEffort,
        temperature,
        reasoningEfforts,
      }),
    );
  }, [
    controlledEffort,
    controlledModel,
    controlledRuntime,
    defaultModel,
    models,
    reasoningEfforts,
    temperature,
  ]);

  const selectedModel = selectedChatModel(models, runtime);
  const structuredRuntime = hasStructuredRuntime(runtime, selectedModel);
  const resolvedAttachmentUpload = useMemo(
    () =>
      attachmentUpload ??
      createAttachmentUploadAdapter({ endpoint: attachmentsApi }),
    [attachmentUpload, attachmentsApi],
  );

  // A function body keeps the transport stable while always sending the latest
  // model/effort/runtime selections.
  const bodyRef = useRef<Record<string, unknown>>({});
  bodyRef.current = {
    ...body,
    ...(structuredRuntime
      ? { runtime }
      : {
          ...(runtime.model ? { model: runtime.model } : {}),
          ...(runtime.effort ? { reasoningEffort: runtime.effort } : {}),
          ...(runtime.temperature !== undefined
            ? { temperature: runtime.temperature }
            : {}),
        }),
    ...(budget && (budget.cost !== undefined || budget.maxTokens !== undefined)
      ? { budget }
      : {}),
    ...(permissionMode ? { permissionMode } : {}),
    ...(threadId ? { threadId } : {}),
  };

  const resolvedTransport = useMemo<ChatTransport<UIMessage>>(
    () =>
      transport ??
      new DefaultChatTransport({ api, body: () => bodyRef.current }),
    [transport, api],
  );

  const {
    messages,
    setMessages,
    sendMessage,
    regenerate,
    status,
    error,
    clearError,
    stop,
  } = useChat<ChatUIMessage>({
    transport: resolvedTransport,
    ...(threadId ? { id: threadId } : {}),
    ...(initialMessages
      ? { messages: initialMessages as ChatUIMessage[] }
      : {}),
  });
  const setMessagesRef = useRef(setMessages);
  setMessagesRef.current = setMessages;

  useEffect(() => {
    if (!sessionsApi || !threadId) return;
    let cancelled = false;
    setHydratedSessionId(null);
    setApprovalError(undefined);
    setMessagesRef.current([]);
    void getChatSession(sessionsApi, threadId)
      .then((session) => {
        if (cancelled) return;
        if (session.id !== threadId) {
          throw new Error(
            `Captain chat session response ID "${session.id}" does not match requested session "${threadId}".`,
          );
        }
        setMessagesRef.current(session.messages as ChatUIMessage[]);
        setHydratedSessionId(session.id);
        onSessionHydratedRef.current?.(session);
      })
      .catch((cause) => {
        if (cancelled) return;
        setApprovalError(
          cause instanceof Error ? cause : new Error(String(cause)),
        );
      });
    return () => {
      cancelled = true;
    };
  }, [sessionsApi, threadId]);

  useEffect(() => {
    onMessageCountChangeRef.current?.(
      messages.filter((message) => !isForkSeedMessage(message)).length,
    );
  }, [messages]);

  useEffect(() => {
    if (!initialPrompt || status !== "ready") return;
    if (sessionsApi && threadId && hydratedSessionId !== threadId) return;
    if (sentInitialPromptId.current === initialPrompt.id) return;
    const text = initialPrompt.text.trim();
    if (!text) return;
    sentInitialPromptId.current = initialPrompt.id;
    void sendMessage({ text });
    onInitialPromptSent?.();
  }, [
    hydratedSessionId,
    initialPrompt,
    onInitialPromptSent,
    sendMessage,
    sessionsApi,
    status,
    threadId,
  ]);

  // Surface a usage snapshot after each settled assistant turn. The backend
  // rides usage/cost on the finish part's messageMetadata; we read it off the
  // last assistant message and resolve maxTokens from the selected model.
  const onUsageRef = useRef(onUsage);
  onUsageRef.current = onUsage;
  useEffect(() => {
    if (status !== "ready") return;
    const last = [...messages].reverse().find((m) => m.role === "assistant");
    const meta = last?.metadata;
    if (!meta) return;
    const snapshot = usageSnapshotFromMetadata(meta, {
      contextWindow: selectedModel?.contextWindow,
      modelLabel: selectedModel?.label,
      messageCount: messages.length,
    });
    setUsage(snapshot);
    onUsageRef.current?.(snapshot);
  }, [messages, status, selectedModel]);

  const handleRuntimeChange = (next: ChatModelRuntime) => {
    if (controlledRuntime === undefined) setInternalRuntime(next);
    onRuntimeChange?.(next);
    const nextModel = selectedChatModel(models, next);
    if (nextModel?.id !== selectedModel?.id) {
      onModelChange?.(nextModel?.id ?? next.id ?? next.model ?? "");
    }
    if ((next.effort ?? "") !== (runtime.effort ?? "")) {
      onReasoningEffortChange?.(next.effort ?? "");
    }
  };

  const resolveToolApproval = async (
    id: string,
    approved: boolean,
    reason?: string,
  ) => {
    const approvalThreadId = threadId;
    setApprovalError(undefined);
    try {
      if (!sessionsApi) {
        throw new Error(
          "A Captain sessions API is required to resolve tool approvals.",
        );
      }
      const session = await postToolApproval({
        sessionsApi,
        sessionId: approvalThreadId ?? "",
        approvalId: id,
        approved,
        ...(reason ? { reason } : {}),
      });
      if (activeThreadRef.current !== approvalThreadId) return;
      if (session.id !== approvalThreadId) {
        throw new Error(
          `Captain chat session response ID "${session.id}" does not match active session "${approvalThreadId ?? ""}".`,
        );
      }
      setMessages(session.messages as ChatUIMessage[]);
    } catch (cause) {
      if (activeThreadRef.current !== approvalThreadId) return;
      setApprovalError(
        cause instanceof Error ? cause : new Error(String(cause)),
      );
    }
  };

  const toolbar = (
    <ChatRuntimeToolbar
      models={models}
      runtime={runtime}
      runtimeFamilies={runtimeFamilies}
      reasoningEfforts={reasoningEfforts}
      selectedModel={selectedModel}
      usage={usage}
      threadId={threadId}
      locked={runtimeLocked}
      onRuntimeChange={handleRuntimeChange}
    />
  );

  const empty =
    messages.length === 0 && (emptyState || suggestions?.length) ? (
      <div className="flex flex-col items-center gap-4">
        {emptyState}
        {suggestions && suggestions.length > 0 && (
          <Suggestions
            suggestions={suggestions}
            onSelect={(text) => void sendMessage({ text })}
          />
        )}
      </div>
    ) : undefined;

  return (
    <ToolRenderRegistryProvider value={toolRegistry}>
      <div className={cn("flex h-full flex-col", className)}>
        <Conversation
          messages={messages}
          status={status}
          error={approvalError ?? error}
          onClearError={() => {
            setApprovalError(undefined);
            clearError();
          }}
          {...(threadId ? { sessionId: threadId } : {})}
          {...(selectedModel?.id
            ? { model: selectedModel.id }
            : runtime.model
              ? { model: runtime.model }
              : {})}
          emptyState={empty}
          onRegenerate={(messageId) => void regenerate({ messageId })}
          onApprove={(id, approved, reason) =>
            void resolveToolApproval(id, approved, reason)
          }
          {...(renderToolResult ? { renderToolResult } : {})}
        />
        <div className="p-4 pt-0">
          <PromptInput
            status={status}
            onStop={() => void stop()}
            placeholder={placeholder}
            enableAttachments={enableAttachments}
            attachmentUpload={resolvedAttachmentUpload}
            {...(selectedModel?.inputMediaTypes
              ? { acceptedMediaTypes: selectedModel.inputMediaTypes }
              : {})}
            {...(attachmentLimits ? { attachmentLimits } : {})}
            toolbar={toolbar}
            onSubmit={(text, files) => void sendMessage({ text, files })}
          />
        </div>
      </div>
    </ToolRenderRegistryProvider>
  );
}
