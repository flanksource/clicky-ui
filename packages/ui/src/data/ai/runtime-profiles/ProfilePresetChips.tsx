import { Button } from "../../../components/button";
import { IconButton } from "../../../components/IconButton";
import { UiAdd, UiClose } from "../../../icons";
import { DropdownMenu } from "../../../overlay/DropdownMenu";
import { Icon } from "../../Icon";
import type { RuntimePreset } from "../runtime-profile";

// A profile's presets as an ordered, editable chip row. Order is resolution
// order: adding appends, so reordering is remove-then-add.
export function ProfilePresetChips({
  included,
  presets,
  onChange,
}: {
  included: RuntimePreset[];
  presets: RuntimePreset[];
  onChange: (presetIds: string[]) => void;
}) {
  const ids = included.map((preset) => preset.id);
  const available = presets.filter((preset) => !ids.includes(preset.id));

  return (
    <div className="flex flex-wrap items-center gap-1.5">
      <span className="text-xs font-medium text-muted-foreground">Presets</span>
      <ol aria-label="Profile presets" className="contents">
        {included.map((preset, index) => (
          <li
            key={preset.id}
            title={preset.description}
            className="inline-flex items-center gap-1 rounded-full border border-border bg-muted/40 py-0.5 pl-2 pr-1 text-xs"
          >
            <span className="text-[10px] tabular-nums text-muted-foreground">{index + 1}</span>
            <span className="font-medium">{preset.name}</span>
            <IconButton
              icon={UiClose}
              label={`Remove preset ${preset.name}`}
              iconClassName="size-3"
              onClick={() => onChange(ids.filter((id) => id !== preset.id))}
            />
          </li>
        ))}
      </ol>
      {available.length > 0 && (
        <DropdownMenu
          align="left"
          menuLabel="Add preset"
          items={available.map((preset) => ({
            label: preset.name,
            ...(preset.description ? { title: preset.description } : {}),
            onSelect: () => onChange([...ids, preset.id]),
          }))}
          trigger={
            <Button size="sm" variant="ghost" aria-label="Add preset" className="h-6 px-1.5 text-xs">
              <Icon icon={UiAdd} className="size-3.5" />
              Preset
            </Button>
          }
        />
      )}
    </div>
  );
}
