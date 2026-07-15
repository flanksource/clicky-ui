import { Icon, type StaticIconComponent } from "../../Icon";
import { UiEdit, UiListDashes, UiLock } from "../../../icons";
import { cn } from "../../../lib/utils";
import type { AISpecRuntimeValue } from "../SpecRuntimeEditor.model";
import type { PermissionListEntry } from "./permissions-model";
import {
  SPEC_RUNTIME_PRESETS,
  activeSpecPreset,
  applySpecPreset,
  type SpecRuntimePresetId,
} from "./presets";

const PRESET_ICONS: Record<SpecRuntimePresetId, StaticIconComponent> = {
  edit: UiEdit,
  plan: UiListDashes,
  readonly: UiLock,
};

// Quick-start cards (design .presets): applying one sets the permission mode
// plus tool policies; any manual permission tweak deactivates the card.
export function PresetCards({
  value,
  entries,
  onChange,
}: {
  value: AISpecRuntimeValue;
  entries: PermissionListEntry[];
  onChange: (value: AISpecRuntimeValue) => void;
}) {
  const active = activeSpecPreset(value, entries);
  return (
    <div className="flex flex-wrap gap-density-2">
      {SPEC_RUNTIME_PRESETS.map((preset) => {
        const on = preset.id === active;
        return (
          <button
            key={preset.id}
            type="button"
            aria-pressed={on}
            onClick={() => onChange(applySpecPreset(value, preset.id, entries))}
            className={cn(
              "min-w-36 flex-1 rounded-lg border p-density-3 text-left transition-colors",
              on
                ? "border-primary bg-primary/10"
                : "border-border bg-card hover:border-muted-foreground/40 hover:shadow-sm",
            )}
          >
            <span className="flex items-center gap-density-2 text-sm font-semibold">
              <Icon
                icon={PRESET_ICONS[preset.id]}
                className="size-4 text-primary"
              />
              {preset.label}
            </span>
            <span className="mt-1 block text-xs leading-snug text-muted-foreground">
              {preset.description}
            </span>
          </button>
        );
      })}
    </div>
  );
}
