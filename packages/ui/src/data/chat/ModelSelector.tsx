import { Combobox } from "../../components/Combobox";
import { cn } from "../../lib/utils";
import { providerIcon } from "./provider-icons";
import type { ChatModel } from "./types";

export type ModelSelectorProps = {
  models: ChatModel[];
  /** Currently selected model id. */
  value?: string | undefined;
  onChange: (id: string) => void;
  className?: string;
};

/** A searchable model picker driven by the backend model menu, showing each
 *  provider's brand icon. Models whose provider is not configured are disabled
 *  rather than hidden, so the menu communicates what would be available with the
 *  right API key. */
export function ModelSelector({ models, value, onChange, className }: ModelSelectorProps) {
  if (models.length === 0) return null;
  const selected = models.find((m) => m.id === value);
  const SelectedGlyph = providerIcon(selected?.provider);
  return (
    <Combobox
      ariaLabel="Model"
      value={value ?? ""}
      onChange={onChange}
      allowCustomValue={false}
      required
      size="sm"
      className={cn("w-48", className)}
      {...(SelectedGlyph ? { prefix: <SelectedGlyph className="size-4" /> } : {})}
      options={models.map((m) => {
        const Icon = providerIcon(m.provider);
        return {
          value: m.id,
          label: m.reasoning ? `${m.label} ·🧠` : m.label,
          ...(Icon ? { icon: <Icon className="size-4" /> } : {}),
          disabled: m.configured === false,
        };
      })}
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
 *  value means "no extended thinking". Strict: only the listed options commit. */
export function EffortSelector({ efforts, value, onChange, className }: EffortSelectorProps) {
  return (
    <Combobox
      ariaLabel="Reasoning effort"
      value={value ?? ""}
      onChange={onChange}
      allowCustomValue={false}
      required
      size="sm"
      className={cn("w-36", className)}
      options={[
        { value: "", label: "No reasoning" },
        ...efforts.map((e) => ({ value: e, label: `${e[0]?.toUpperCase()}${e.slice(1)} reasoning` })),
      ]}
    />
  );
}
