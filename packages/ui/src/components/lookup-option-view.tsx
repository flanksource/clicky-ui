import { cn } from "../lib/utils";
import { LabelIcon } from "../data/Icon";
import type { ComboboxOption } from "./combobox-types";
import type { FieldOption } from "./json-schema-form-types";
import { OptionBadges } from "./lookup-option-badges";
import { TONE_GLYPH_CLASS } from "./json-schema-form-tone";

// fieldOptionToComboboxOption is how a lookup picker draws a FieldOption: the
// leading icon (tinted by `tone`), the description beside the label on one line
// and searchable, and the badges pinned to the right edge.
export function fieldOptionToComboboxOption(option: FieldOption): ComboboxOption {
  const icon = option.icon
    ? option.tone
      ? (
          <span className={cn("inline-flex items-center justify-center rounded p-0.5", TONE_GLYPH_CLASS[option.tone])}>
            <LabelIcon icon={option.icon} />
          </span>
        )
      : option.icon
    : undefined;
  return {
    value: option.value,
    label: option.label,
    selectedLabel: option.label,
    ...(option.description ? { description: option.description, descriptionLayout: "inline" as const } : {}),
    ...(icon ? { icon } : {}),
    ...(option.group ? { group: option.group } : {}),
    ...(option.badges && option.badges.length > 0 ? { trailing: <OptionBadges badges={option.badges} /> } : {}),
    ...(option.description ? { title: `${option.label}\n${option.description}` } : {}),
  };
}
