import { Icon } from "../data/Icon";
import { FilterPill } from "../data/FilterPill";
import { UiClose } from "../icons";
import type { ComboboxOption, ComboboxTriStateMode } from "./combobox-types";

export function ComboboxTags({
  disabled,
  modes,
  onRemove,
  onSetMode,
  options,
  values,
}: {
  disabled: boolean | undefined;
  /** Per-value include/exclude modes; set only in tristate mode. */
  modes: Record<string, ComboboxTriStateMode> | undefined;
  onRemove: (value: string) => void;
  onSetMode: (value: string, mode: string) => void;
  options: ComboboxOption[];
  values: string[];
}) {
  return values.map((value, index) => {
    const option = options.find((entry) => entry.value === value);
    const label = option?.selectedLabel ?? option?.label ?? value;
    const mode = modes?.[value];
    const remove = !disabled && (
      <button
        type="button"
        aria-label={`Remove ${label}`}
        className="shrink-0 text-muted-foreground hover:text-foreground"
        onMouseDown={(event) => event.preventDefault()}
        onClick={() => onRemove(value)}
      >
        <Icon icon={UiClose} className="size-3" />
      </button>
    );

    // A tristate pill carries its mode in the same colours the menu rows use.
    // The pill body flips include ↔ exclude; returning to neutral is what the
    // close button means, so the two affordances never overlap.
    if (mode) {
      return (
        <span
          key={`${value}-${index}`}
          data-combobox-tag={value}
          data-combobox-tag-mode={mode}
          className="inline-flex h-6 max-w-full items-center gap-1"
        >
          <FilterPill
            mode={mode}
            label={label}
            title={mode === "include" ? `${label} included` : `${label} excluded`}
            className="max-w-full"
            {...(disabled
              ? {}
              : {
                  onClick: () =>
                    onSetMode(value, mode === "include" ? "exclude" : "include"),
                })}
          />
          {remove}
        </span>
      );
    }

    return (
      <span
        key={`${value}-${index}`}
        data-combobox-tag={value}
        className="inline-flex h-6 max-w-full items-center gap-1 rounded-md bg-muted px-2 text-xs"
      >
        <span className="truncate">{label}</span>
        {remove}
      </span>
    );
  });
}
