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
import { providerIcon } from "./provider-icons";
import { ContextUsage } from "./ContextUsage";
import type { ChatModel, ChatMessageMetadata, ChatUsageSummary, Suggestion, ToolResultRenderer } from "./types";

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
  /** Reasoning-effort options for capable models. */
  reasoningEfforts?: string[];
  /** Initially selected reasoning effort ("" = none). */
  defaultReasoningEffort?: string;
  /** Notified when the user changes the model. */
  onModelChange?: (id: string) => void;
  /** Notified after each assistant turn with a usage snapshot (tokens used out
   *  of the model's context window + cumulative cost), for a usage gauge. */
  onUsage?: (usage: ChatUsageSummary) => void;
  /** Suggested prompts shown on the empty state. */
  suggestions?: Suggestion[];
  /** Enables file/image attachments. */
  enableAttachments?: boolean;
  /** "manual" forwards a tool-approval policy hint to the backend. */
  toolApproval?: "auto" | "manual";
  /** Thread id to persist this conversation under (forwarded in the body). */
  threadId?: string;
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

const DEFAULT_EFFORTS = ["low", "medium", "high"];

/** Self-contained AI chat over a v6-compatible `/api/chat`: a streaming
 *  conversation with model/effort selectors, suggestions, attachments,
 *  per-message copy/regenerate, and human-in-the-loop tool approvals. The
 *  backend owns model selection and tool execution; the selected model,
 *  effort, approval policy and thread id are forwarded in the request body. */
export function Chat({
  api = "/api/chat",
  models: modelsProp,
  modelsApi = "/api/chat/models",
  defaultModel,
  reasoningEfforts = DEFAULT_EFFORTS,
  defaultReasoningEffort = "",
  onModelChange,
  onUsage,
  suggestions,
  enableAttachments = false,
  toolApproval,
  threadId,
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
  const [model, setModel] = useState<string | undefined>(defaultModel);
  const [effort, setEffort] = useState(defaultReasoningEffort);
  const [usage, setUsage] = useState<ChatUsageSummary | null>(null);
  const lastDefaultModel = useRef(defaultModel);
  const sentInitialPromptId = useRef<number | null>(null);

  // Fetch the model menu unless one was supplied or fetching is disabled.
  useEffect(() => {
    if (modelsProp || !modelsApi) return;
    let cancelled = false;
    fetch(modelsApi)
      .then((r) => (r.ok ? r.json() : Promise.reject(new Error(`models ${r.status}`))))
      .then((data: ChatModel[]) => {
        if (cancelled) return;
        setModels(data);
        setModel((m) => m ?? data.find((d) => d.configured !== false)?.id);
      })
      .catch((err) => console.warn("clicky-ui: failed to load chat models", err));
    return () => {
      cancelled = true;
    };
  }, [modelsProp, modelsApi]);

  useEffect(() => {
    if (!defaultModel || defaultModel === lastDefaultModel.current) return;
    lastDefaultModel.current = defaultModel;
    setModel(defaultModel);
  }, [defaultModel]);

  const selectedModel = models.find((m) => m.id === model);
  const showEffort = !selectedModel || selectedModel.reasoning;

  // A function body keeps the transport stable while always sending the latest
  // model/effort/policy selections.
  const bodyRef = useRef<Record<string, unknown>>({});
  bodyRef.current = {
    ...body,
    ...(model ? { model } : {}),
    ...(effort ? { reasoningEffort: effort } : {}),
    ...(toolApproval ? { toolApproval } : {}),
    ...(threadId ? { threadId } : {}),
  };

  const resolvedTransport = useMemo<ChatTransport<UIMessage>>(
    () => transport ?? new DefaultChatTransport({ api, body: () => bodyRef.current }),
    [transport, api],
  );

  const { messages, sendMessage, regenerate, addToolApprovalResponse, status, error, clearError, stop } =
    useChat<ChatUIMessage>({
      transport: resolvedTransport,
      sendAutomaticallyWhen: lastAssistantMessageIsCompleteWithApprovalResponses,
      ...(initialMessages ? { messages: initialMessages as ChatUIMessage[] } : {}),
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
    const cost = meta.threadCostUsd ?? meta.cost;
    const snapshot: ChatUsageSummary = {
      usedTokens: meta.contextTokens ?? meta.usage?.totalTokens ?? 0,
      maxTokens: selectedModel?.contextWindow ?? 0,
      messageCount: messages.length,
      ...(cost != null ? { cost } : {}),
      ...(selectedModel?.label ? { modelLabel: selectedModel.label } : {}),
    };
    setUsage(snapshot);
    onUsageRef.current?.(snapshot);
  }, [messages, status, selectedModel]);

  const onModelSelect = (id: string) => {
    setModel(id);
    onModelChange?.(id);
  };

  const ModelGlyph = providerIcon(selectedModel?.provider);
  const toolbar = models.length > 0 || showEffort || (usage && usage.maxTokens > 0) ? (
    <div className="flex flex-1 items-center gap-2">
      <ModelSelector models={models} value={model} onChange={onModelSelect} />
      {showEffort && (
        <EffortSelector efforts={reasoningEfforts} value={effort} onChange={setEffort} />
      )}
      {usage && usage.maxTokens > 0 && (
        <>
          <div className="flex-1" />
          <ContextUsage
            usedTokens={usage.usedTokens}
            maxTokens={usage.maxTokens}
            {...(usage.messageCount != null ? { messageCount: usage.messageCount } : {})}
            {...(usage.cost != null ? { cost: usage.cost } : {})}
            {...(usage.modelLabel ? { modelLabel: usage.modelLabel } : {})}
            {...(ModelGlyph ? { modelIcon: ModelGlyph } : {})}
          />
        </>
      )}
    </div>
  ) : undefined;

  const empty = (messages.length === 0 && (emptyState || suggestions?.length)) ? (
    <div className="flex flex-col items-center gap-4">
      {emptyState}
      {suggestions && suggestions.length > 0 && (
        <Suggestions suggestions={suggestions} onSelect={(text) => void sendMessage({ text })} />
      )}
    </div>
  ) : undefined;

  return (
    <div className={cn("flex h-full flex-col", className)}>
      <Conversation
        messages={messages}
        status={status}
        error={error}
        onClearError={clearError}
        emptyState={empty}
        onRegenerate={(messageId) => void regenerate({ messageId })}
        onApprove={(id, approved, reason) =>
          void addToolApprovalResponse(reason ? { id, approved, reason } : { id, approved })
        }
        {...(renderToolResult ? { renderToolResult } : {})}
      />
      <div className="p-4 pt-0">
        <PromptInput
          status={status}
          onStop={() => void stop()}
          placeholder={placeholder}
          enableAttachments={enableAttachments}
          toolbar={toolbar}
          onSubmit={(text, files) => void sendMessage({ text, files })}
        />
      </div>
    </div>
  );
}
