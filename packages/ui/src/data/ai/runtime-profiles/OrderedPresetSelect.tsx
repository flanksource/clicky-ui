import { IconButton } from "../../../components/IconButton";
import { MultiSelect } from "../../../components/MultiSelect";
import { UiChevronDown, UiChevronUp, UiTrash } from "../../../icons";
import { moveItem } from "../../../lib/collections";
import type { RuntimePreset } from "../runtime-profile";
import { presetForRef } from "../../../lib/runtime-profile-model";

export function OrderedPresetSelect({
  presets,
  value,
  onChange,
}: {
  presets: RuntimePreset[];
  value: string[];
  onChange: (value: string[]) => void;
}) {
  const rows = value.map((ref) => ({
    ref,
    preset: presetForRef(ref, presets),
  }));
  const selectedIds = rows.map(({ ref, preset }) => preset?.id ?? ref);

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
          ...(preset.description ? { title: preset.description } : {}),
        }))}
        value={selectedIds}
        onChange={onChange}
        ariaLabel="Profile presets"
        placeholder="Select presets"
        className="w-full"
        triggerClassName="w-full max-w-none"
      />
      {rows.length > 0 && (
        <ol
          aria-label="Preset order"
          className="divide-y divide-border rounded-md border border-border"
        >
          {rows.map(({ ref, preset }, index) => (
            <li
              key={`${ref}-${index}`}
              className="flex min-w-0 items-center gap-density-2 px-density-2 py-density-1"
            >
              <span className="w-5 shrink-0 text-center text-[10px] tabular-nums text-muted-foreground">
                {String(index + 1).padStart(2, "0")}
              </span>
              {preset ? (
                <PresetRow preset={preset} />
              ) : (
                <MissingPresetRow reference={ref} />
              )}
              {preset ? (
                <>
                  <IconButton
                    icon={UiChevronUp}
                    label={`Move ${preset.name} up`}
                    disabled={index === 0}
                    onClick={() => onChange(moveItem(value, index, index - 1))}
                  />
                  <IconButton
                    icon={UiChevronDown}
                    label={`Move ${preset.name} down`}
                    disabled={index === rows.length - 1}
                    onClick={() => onChange(moveItem(value, index, index + 1))}
                  />
                </>
              ) : (
                <IconButton
                  icon={UiTrash}
                  label={`Remove missing preset ${ref}`}
                  className="hover:text-destructive"
                  onClick={() =>
                    onChange(
                      value.filter((_, itemIndex) => itemIndex !== index),
                    )
                  }
                />
              )}
            </li>
          ))}
        </ol>
      )}
    </div>
  );
}

function PresetRow({ preset }: { preset: RuntimePreset }) {
  return (
    <>
      <div className="min-w-0 flex-1">
        <div className="truncate text-xs font-medium">{preset.name}</div>
        <div className="truncate text-[10px] text-muted-foreground">
          {preset.description}
        </div>
      </div>
      <span className="rounded bg-muted px-1.5 py-0.5 text-[9px] font-medium uppercase text-muted-foreground">
        {preset.scope}
      </span>
    </>
  );
}

function MissingPresetRow({ reference }: { reference: string }) {
  return (
    <>
      <div className="min-w-0 flex-1 text-muted-foreground">
        <div className="truncate text-xs font-medium italic">{reference}</div>
        <div className="truncate text-[10px]">
          Missing preset — not in this catalog.
        </div>
      </div>
      <span className="rounded bg-destructive/10 px-1.5 py-0.5 text-[9px] font-medium uppercase text-destructive">
        missing
      </span>
    </>
  );
}
