import { useCallback, useEffect, useState } from "react";
import type { ChatProps } from "../chat/Chat";
import {
  resolveChatRuntime,
  selectedChatModel,
  withRuntimeField,
} from "../chat/Chat.runtime";
import { DEFAULT_REASONING_EFFORTS } from "../chat/effort-icons";
import type { ChatModel, ChatModelRuntime } from "../chat/types";
import { selectConfiguredChatModel } from "./ChatWindow.models";

export type ChatWindowRuntimeOptions = {
  chat?: Partial<ChatProps> | undefined;
  initialModel?: string | null | undefined;
  models: ChatModel[];
  storedRuntime?: ChatModelRuntime | undefined;
};

export function useChatWindowRuntime({
  chat,
  initialModel,
  models,
  storedRuntime,
}: ChatWindowRuntimeOptions) {
  const reasoningEfforts = chat?.reasoningEfforts ?? DEFAULT_REASONING_EFFORTS;
  const [runtime, setRuntime] = useState<ChatModelRuntime>(() =>
    resolveChatRuntime({
      models,
      current: chat?.runtime ?? chat?.defaultRuntime ?? storedRuntime,
      preferredModel:
        initialModel ??
        chat?.model ??
        (chat?.runtime || chat?.defaultRuntime || storedRuntime
          ? undefined
          : chat?.defaultModel),
      effort: chat?.reasoningEffort ?? chat?.defaultReasoningEffort,
      temperature: chat?.temperature,
      reasoningEfforts,
    }),
  );

  useEffect(() => {
    if (chat?.runtime) {
      setRuntime(chat.runtime);
      return;
    }
    setRuntime((current) => {
      const currentModel = selectedChatModel(models, current)?.id;
      const preferred =
        initialModel ??
        chat?.model ??
        currentModel ??
        current.id ??
        current.model ??
        chat?.defaultModel;
      const configured = models.length
        ? selectConfiguredChatModel(preferred, models)
        : preferred;
      return resolveChatRuntime({
        models,
        current,
        preferredModel: configured,
        effort: chat?.reasoningEffort,
        temperature: chat?.temperature,
        reasoningEfforts,
      });
    });
  }, [
    chat?.defaultModel,
    chat?.model,
    chat?.reasoningEffort,
    chat?.runtime,
    chat?.temperature,
    initialModel,
    models,
    reasoningEfforts,
  ]);

  const selectedModel = selectedChatModel(models, runtime);
  const model = selectedModel?.id ?? runtime.id ?? runtime.model;
  const reasoningEffort = runtime.effort ?? "";

  const handleRuntimeChange = useCallback(
    (next: ChatModelRuntime) => {
      setRuntime(next);
      chat?.onRuntimeChange?.(next);
    },
    [chat],
  );
  const handleModelChange = useCallback(
    (next: string) => {
      setRuntime((current) => {
        if (!next) {
          return withRuntimeField(
            withRuntimeField(current, "id", undefined),
            "model",
            undefined,
          );
        }
        const selected = models.find((candidate) => candidate.id === next);
        if (!selected) {
          return withRuntimeField(
            withRuntimeField(current, "id", undefined),
            "model",
            next,
          );
        }
        return resolveChatRuntime({
          models,
          current,
          preferredModel: selected.id,
          reasoningEfforts,
        });
      });
      chat?.onModelChange?.(next);
    },
    [chat, models, reasoningEfforts],
  );
  const handleReasoningEffortChange = useCallback(
    (next: string) => {
      setRuntime((current) => withRuntimeField(current, "effort", next));
      chat?.onReasoningEffortChange?.(next);
    },
    [chat],
  );
  const handleTemperatureChange = useCallback((next: number | undefined) => {
    setRuntime((current) => withRuntimeField(current, "temperature", next));
  }, []);
  const replaceRuntimeIdentity = useCallback((identity: ChatModelRuntime) => {
    setRuntime((current) => {
      const next: ChatModelRuntime = { ...current };
      delete next.id;
      delete next.mode;
      delete next.model;
      delete next.backend;
      if (identity.model) next.model = identity.model;
      if (identity.backend) next.backend = identity.backend;
      return next;
    });
  }, []);
  const replaceRuntime = useCallback((next: ChatModelRuntime) => {
    setRuntime(next);
  }, []);

  return {
    runtime,
    model,
    reasoningEffort,
    temperature: runtime.temperature,
    reasoningEfforts,
    handleRuntimeChange,
    handleModelChange,
    handleReasoningEffortChange,
    handleTemperatureChange,
    replaceRuntimeIdentity,
    replaceRuntime,
  };
}
