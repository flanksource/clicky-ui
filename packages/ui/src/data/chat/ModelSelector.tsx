import { Select } from "../../components/select";
import { cn } from "../../lib/utils";
import type { ChatModel } from "./types";

export type ModelSelectorProps = {
  models: ChatModel[];
  /** Currently selected model id. */
  value?: string | undefined;
  onChange: (id: string) => void;
  className?: string;
};

/** A model picker driven by the backend model menu. Models whose provider is
 *  not configured are disabled rather than hidden, so the menu communicates
 *  what would be available with the right API key. */
export function ModelSelector({ models, value, onChange, className }: ModelSelectorProps) {
  if (models.length === 0) return null;
  return (
    <Select
      aria-label="Model"
      value={value ?? ""}
      onChange={(e) => onChange(e.target.value)}
      className={cn("h-8 text-xs", className)}
      options={models.map((m) => ({
        value: m.id,
        label: m.reasoning ? `${m.label} ·🧠` : m.label,
        disabled: m.configured === false,
      }))}
    />
  );
}

export type EffortSelectorProps = {
  efforts: string[];
  value?: string | undefined;
  onChange: (effort: string) => void;
  className?: string;
};

/** Reasoning-effort picker, shown only for reasoning-capable models. The empty
 *  value means "no extended thinking". */
export function EffortSelector({ efforts, value, onChange, className }: EffortSelectorProps) {
  return (
    <Select
      aria-label="Reasoning effort"
      value={value ?? ""}
      onChange={(e) => onChange(e.target.value)}
      className={cn("h-8 w-auto text-xs", className)}
      options={[
        { value: "", label: "No reasoning" },
        ...efforts.map((e) => ({ value: e, label: `${e[0]?.toUpperCase()}${e.slice(1)} reasoning` })),
      ]}
    />
  );
}
