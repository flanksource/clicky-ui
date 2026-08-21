import { ContextMeter } from "./ContextMeter";
import { providerIcon, providerIconColor } from "./provider-icons";
import type { ChatModel, ChatModelRuntime, ChatUsageSummary } from "./types";
import { RuntimeBar } from "../runtime/RuntimeBar";
import type { SpecRuntimeFamily } from "../runtime/runtime-mode";

export type ChatRuntimeToolbarProps = {
  models: ChatModel[];
  runtime: ChatModelRuntime;
  runtimeFamilies?: SpecRuntimeFamily[] | undefined;
  reasoningEfforts: string[];
  selectedModel?: ChatModel | undefined;
  usage?: ChatUsageSummary | null | undefined;
  threadId?: string | undefined;
  locked?: boolean | undefined;
  onRuntimeChange: (runtime: ChatModelRuntime) => void;
};

export function ChatRuntimeToolbar({
  models,
  runtime,
  runtimeFamilies,
  reasoningEfforts,
  selectedModel,
  usage,
  threadId,
  locked = false,
  onRuntimeChange,
}: ChatRuntimeToolbarProps) {
  const showRuntimeBar = Boolean(
    runtimeFamilies?.length ||
    models.length ||
    runtime.backend ||
    runtime.id ||
    runtime.model,
  );
  const showContextMeter = Boolean(threadId || selectedModel || usage);
  if (!showRuntimeBar && !showContextMeter) return null;

  const contextWindow = usage?.maxTokens ?? 0;
  const usedTokens = usage?.usedTokens ?? 0;
  const ModelGlyph = providerIcon(usage?.backend);

  return (
    <div className="flex flex-1 items-center gap-2">
      {showRuntimeBar && (
        <RuntimeBar
          variant="combo"
          value={runtime}
          onChange={onRuntimeChange}
          models={models}
          reasoningEfforts={reasoningEfforts}
          locked={locked}
          {...(runtimeFamilies ? { families: runtimeFamilies } : {})}
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
            {...(usage?.backend ? { backend: usage.backend } : {})}
            {...(usage?.executionMode
              ? { executionMode: usage.executionMode }
              : {})}
            {...(usage?.model
              ? { model: usage.model }
              : usage?.modelLabel
                ? { model: usage.modelLabel }
                : {})}
            {...(usage?.captainSessionId
              ? { captainSessionId: usage.captainSessionId }
              : {})}
            {...(usage?.providerSessionId
              ? { providerSessionId: usage.providerSessionId }
              : {})}
            {...(usage?.threadId ? { threadId: usage.threadId } : {})}
            {...(usage?.turnId ? { turnId: usage.turnId } : {})}
            {...(runtime.effort ? { effort: runtime.effort } : {})}
            {...(ModelGlyph ? { modelIcon: ModelGlyph } : {})}
            {...(usage?.backend
              ? {
                  modelIconClassName: providerIconColor(usage.backend),
                }
              : {})}
          />
        </>
      )}
    </div>
  );
}
