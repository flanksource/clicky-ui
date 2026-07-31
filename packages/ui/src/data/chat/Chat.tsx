import { useEffect, useMemo, useRef, useState } from "react";
import { useChat } from "@ai-sdk/react";
import {
  DefaultChatTransport,
  lastAssistantMessageIsCompleteWithApprovalResponses,
  type ChatTransport,
  type UIMessage,
} from "ai";
import { cn } from "../../lib/utils";
import { Conversation } from "./Conversation";
import { PromptInput } from "./PromptInput";
import { Suggestions } from "./Suggestion";
import { ModelSelector, EffortSelector } from "./ModelSelector";
import { providerIcon, providerIconColor } from "./provider-icons";
import { ContextMeter } from "./ContextMeter";
import { DEFAULT_REASONING_EFFORTS } from "./effort-icons";
import { defaultChatModelId } from "./models";
import { postToolApproval } from "./approval";
import {
  createAttachmentUploadAdapter,
  type AttachmentLimits,
  type AttachmentUploadAdapter,
} from "./attachment-upload";
import type {
  ChatBudgetConfig,
  ChatModel,
  ChatMessageMetadata,
  ChatUsageSummary,
  ClaudePermissionMode,
  Suggestion,
  ToolResultRenderer,
} from "./types";

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
  /** Thread id to persist this conversation under (forwarded in the body). */
  threadId?: string;
  /** Base endpoint for resolving a tool approval while the provider stream is
   *  still active. The thread and approval ids are appended to this URL. */
  approvalApi?: string | null;
  /** Optional host renderer for recognized completed tool outputs. */
  renderToolResult?: ToolResultRenderer;
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
  reasoningEfforts = DEFAULT_REASONING_EFFORTS,
  defaultReasoningEffort = "",
  reasoningEffort: controlledEffort,
  temperature,
  budget,
  permissionMode,
  onModelChange,
  onReasoningEffortChange,
  onUsage,
  suggestions,
  enableAttachments = false,
  attachmentsApi = "/api/attachments",
  attachmentUpload,
  attachmentLimits,
  threadId,
  approvalApi = null,
  renderToolResult,
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
  const [model, setModel] = useState<string | undefined>(
    controlledModel ?? defaultModel,
  );
  const [effort, setEffort] = useState(
    controlledEffort ?? defaultReasoningEffort,
  );
  const [usage, setUsage] = useState<ChatUsageSummary | null>(null);
  const [approvalError, setApprovalError] = useState<Error | undefined>();
  const lastDefaultModel = useRef(defaultModel);
  const sentInitialPromptId = useRef<number | null>(null);

  useEffect(() => {
    if (!modelsProp) return;
    setModels(modelsProp);
    setModel((m) => m ?? controlledModel ?? defaultChatModelId(modelsProp));
  }, [modelsProp, controlledModel]);

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
        setModel((m) => m ?? controlledModel ?? defaultChatModelId(data));
      })
      .catch((err) =>
        console.warn("clicky-ui: failed to load chat models", err),
      );
    return () => {
      cancelled = true;
    };
  }, [modelsProp, modelsApi, controlledModel]);

  useEffect(() => {
    if (controlledModel === undefined) return;
    setModel(controlledModel);
  }, [controlledModel]);

  useEffect(() => {
    if (controlledEffort === undefined) return;
    setEffort(controlledEffort);
  }, [controlledEffort]);

  useEffect(() => {
    if (controlledModel !== undefined) return;
    if (!defaultModel || defaultModel === lastDefaultModel.current) return;
    lastDefaultModel.current = defaultModel;
    setModel(defaultModel);
  }, [controlledModel, defaultModel]);

  const selectedModel = models.find((m) => m.id === model);
  const showEffort = !selectedModel || selectedModel.reasoning;
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
    ...(model ? { model } : {}),
    ...(selectedModel?.runtime ? { runtime: selectedModel.runtime } : {}),
    ...(effort ? { reasoningEffort: effort } : {}),
    ...(temperature !== undefined ? { temperature } : {}),
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
    sendMessage,
    regenerate,
    addToolApprovalResponse,
    status,
    error,
    clearError,
    stop,
  } = useChat<ChatUIMessage>({
    transport: resolvedTransport,
    sendAutomaticallyWhen: lastAssistantMessageIsCompleteWithApprovalResponses,
    ...(initialMessages
      ? { messages: initialMessages as ChatUIMessage[] }
      : {}),
  });

  useEffect(() => {
    if (!initialPrompt || status !== "ready") return;
    if (sentInitialPromptId.current === initialPrompt.id) return;
    const text = initialPrompt.text.trim();
    if (!text) return;
    sentInitialPromptId.current = initialPrompt.id;
    void sendMessage({ text });
    onInitialPromptSent?.();
  }, [initialPrompt, onInitialPromptSent, sendMessage, status]);

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
    const cost =
      meta.threadCostUsd ?? meta.costBreakdown?.totalUsd ?? meta.cost;
    const snapshot: ChatUsageSummary = {
      usedTokens: meta.contextTokens ?? meta.usage?.totalTokens ?? 0,
      maxTokens: selectedModel?.contextWindow ?? 0,
      messageCount: messages.length,
      ...(cost != null ? { cost } : {}),
      ...(meta.usage ? { usage: meta.usage } : {}),
      ...(meta.costBreakdown ? { costBreakdown: meta.costBreakdown } : {}),
      ...(selectedModel?.label ? { modelLabel: selectedModel.label } : {}),
    };
    setUsage(snapshot);
    onUsageRef.current?.(snapshot);
  }, [messages, status, selectedModel]);

  const onModelSelect = (id: string) => {
    setModel(id);
    onModelChange?.(id);
  };

  const onEffortSelect = (next: string) => {
    setEffort(next);
    onReasoningEffortChange?.(next);
  };

  const resolveToolApproval = async (
    id: string,
    approved: boolean,
    reason?: string,
  ) => {
    setApprovalError(undefined);
    if (approvalApi) {
      try {
        await postToolApproval({
          approvalApi,
          threadId: threadId ?? "",
          approvalId: id,
          approved,
          ...(reason ? { reason } : {}),
        });
      } catch (cause) {
        setApprovalError(
          cause instanceof Error ? cause : new Error(String(cause)),
        );
        return;
      }
    }
    await addToolApprovalResponse(
      reason ? { id, approved, reason } : { id, approved },
    );
  };

  const ModelGlyph = providerIcon(selectedModel?.provider);
  const contextWindow = selectedModel?.contextWindow ?? usage?.maxTokens ?? 0;
  const usedTokens = usage?.usedTokens ?? 0;
  const showContextMeter = Boolean(threadId || selectedModel || usage);
  const toolbar =
    models.length > 0 || showEffort || showContextMeter ? (
      <div className="flex flex-1 items-center gap-2">
        <ModelSelector models={models} value={model} onChange={onModelSelect} />
        {showEffort && (
          <EffortSelector
            efforts={reasoningEfforts}
            value={effort}
            onChange={onEffortSelect}
          />
        )}
        {showContextMeter && (
          <>
            <div className="flex-1" />
            <ContextMeter
              mode="gauge"
              usedPercent={
                contextWindow > 0
                  ? Math.round((usedTokens / contextWindow) * 100)
                  : 0
              }
              usedTokens={usedTokens}
              {...(contextWindow > 0 ? { windowTokens: contextWindow } : {})}
              {...(usage?.messageCount != null
                ? { messageCount: usage.messageCount }
                : {})}
              {...(usage?.cost != null ? { cost: { total: usage.cost } } : {})}
              {...(threadId ? { sessionId: threadId } : {})}
              {...(selectedModel?.label
                ? { model: selectedModel.label }
                : usage?.modelLabel
                  ? { model: usage.modelLabel }
                  : {})}
              {...(effort ? { effort } : {})}
              {...(selectedModel?.runtime?.mode
                ? { executionMode: selectedModel.runtime.mode }
                : {})}
              {...(ModelGlyph ? { modelIcon: ModelGlyph } : {})}
              {...(selectedModel?.provider
                ? {
                    modelIconClassName: providerIconColor(
                      selectedModel.provider,
                    ),
                  }
                : {})}
            />
          </>
        )}
      </div>
    ) : undefined;

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
        {...(model ? { model } : {})}
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
  );
}
