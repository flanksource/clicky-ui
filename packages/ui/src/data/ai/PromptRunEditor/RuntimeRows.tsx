import { Button } from "../../../components/button";
import { UiAdd, UiTrash } from "../../../icons";
import { Icon } from "../../Icon";
import type { ChatModel } from "../../chat/types";
import { RuntimeBar } from "../../runtime/RuntimeBar";
import type { SpecRuntimeFamily } from "../../runtime/runtime-mode";
import type { AISpecRuntimeSpec } from "../SpecRuntimeEditor.model";
import {
  modelModeOf,
  runtimeRows,
  singleRuntimeOf,
  withRuntimeRows,
  withSingleRuntime,
  type AIPromptRunValue,
} from "./model";

// Single model: one bar that also owns the run's timeout and max cost.
// Multi-model: one bar per comparison runtime; limits stay shared in the spec.
export function RuntimeRows({
  value,
  onChange,
  models,
  families,
  reasoningEfforts,
  effectiveRuntime,
}: {
  value: AIPromptRunValue;
  onChange: (value: AIPromptRunValue) => void;
  models: ChatModel[];
  families: SpecRuntimeFamily[];
  reasoningEfforts: string[];
  effectiveRuntime: Pick<AISpecRuntimeSpec, "model" | "mode">;
}) {
  const shared = {
    models,
    families,
    reasoningEfforts,
    effectiveModel: effectiveRuntime.model,
    effectiveMode: effectiveRuntime.mode,
  };

  if (modelModeOf(value) === "single") {
    return (
      <div role="group" aria-label="Runtime 1" className="flex min-w-0 items-center">
        <RuntimeBar
          {...shared}
          value={singleRuntimeOf(value)}
          onChange={(next) => onChange(withSingleRuntime(value, next))}
          showTimeout
          showCost
          ariaLabel="Runtime 1 controls"
        />
      </div>
    );
  }

  const rows = runtimeRows(value);
  return (
    <div className="grid grid-cols-1 gap-density-2">
      {rows.map((runtime, index) => (
        <div
          key={index}
          role="group"
          aria-label={`Runtime ${index + 1}`}
          className="flex min-w-0 items-center gap-density-2"
        >
          <RuntimeBar
            {...shared}
            value={runtime}
            onChange={(next) =>
              onChange(
                withRuntimeRows(
                  value,
                  rows.map((item, itemIndex) => (itemIndex === index ? next : item)),
                ),
              )
            }
            ariaLabel={`Runtime ${index + 1} controls`}
          />
          {rows.length > 2 && (
            <Button
              size="sm"
              variant="ghost"
              aria-label={`Remove runtime ${index + 1}`}
              onClick={() =>
                onChange(
                  withRuntimeRows(
                    value,
                    rows.filter((_, itemIndex) => itemIndex !== index),
                  ),
                )
              }
            >
              <Icon icon={UiTrash} className="size-4" />
            </Button>
          )}
        </div>
      ))}
      <Button
        size="sm"
        variant="outline"
        className="w-fit"
        aria-label="Add runtime"
        onClick={() =>
          onChange(
            withRuntimeRows(value, [...rows, rows[0]?.mode ? { mode: rows[0].mode } : {}]),
          )
        }
      >
        <Icon icon={UiAdd} className="size-4" />
        Add runtime
      </Button>
    </div>
  );
}
