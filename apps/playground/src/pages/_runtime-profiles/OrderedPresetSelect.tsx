import { IconButton, MultiSelect } from "@flanksource/clicky-ui";
import { UiChevronDown, UiChevronUp } from "@flanksource/clicky-ui/icons";
import { moveItem } from "@flanksource/clicky-ui/utils";
import type { RuntimePreset } from "./contract";

export function OrderedPresetSelect({
  presets,
  value,
  onChange,
}: {
  presets: RuntimePreset[];
  value: string[];
  onChange: (value: string[]) => void;
}) {
  const byId = new Map(presets.map((preset) => [preset.id, preset]));
  const selected = value.map((id) => {
    const preset = byId.get(id);
    if (!preset) throw new Error(`profile references missing preset "${id}"`);
    return preset;
  });

  return (
    <div className="space-y-density-2 rounded-md border border-border p-density-3">
      <div>
        <div className="text-sm font-semibold">Included presets</div>
        <p className="text-xs text-muted-foreground">
          Select reusable behavior, then order presets within their resolution
          scope. The profile spec below is the final profile-owned override.
        </p>
      </div>
      <MultiSelect
        options={presets.map((preset) => ({
          value: preset.id,
          label: preset.name,
          title: preset.description,
        }))}
        value={value}
        onChange={onChange}
        ariaLabel="Profile presets"
        placeholder="Select presets"
        className="w-full"
        triggerClassName="w-full max-w-none"
      />
      {selected.length > 0 && (
        <ol
          aria-label="Preset order"
          className="divide-y divide-border rounded-md border border-border"
        >
          {selected.map((preset, index) => (
            <li
              key={preset.id}
              className="flex min-w-0 items-center gap-density-2 px-density-2 py-density-1"
            >
              <span className="w-5 shrink-0 text-center text-[10px] tabular-nums text-muted-foreground">
                {String(index + 1).padStart(2, "0")}
              </span>
              <div className="min-w-0 flex-1">
                <div className="truncate text-xs font-medium">
                  {preset.name}
                </div>
                <div className="truncate text-[10px] text-muted-foreground">
                  {preset.description}
                </div>
              </div>
              <span className="rounded bg-muted px-1.5 py-0.5 text-[9px] font-medium uppercase text-muted-foreground">
                {preset.scope}
              </span>
              <IconButton
                icon={UiChevronUp}
                label={`Move ${preset.name} up`}
                disabled={index === 0}
                onClick={() => onChange(moveItem(value, index, index - 1))}
              />
              <IconButton
                icon={UiChevronDown}
                label={`Move ${preset.name} down`}
                disabled={index === selected.length - 1}
                onClick={() => onChange(moveItem(value, index, index + 1))}
              />
            </li>
          ))}
        </ol>
      )}
    </div>
  );
}
