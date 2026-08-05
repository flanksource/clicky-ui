import { Icon } from "../data/Icon";
import { UiClose } from "../icons";
import type { ComboboxOption } from "./combobox-types";

export function ComboboxTags({
  disabled,
  onRemove,
  options,
  values,
}: {
  disabled: boolean | undefined;
  onRemove: (value: string) => void;
  options: ComboboxOption[];
  values: string[];
}) {
  return values.map((value, index) => {
    const option = options.find((entry) => entry.value === value);
    const label = option?.selectedLabel ?? option?.label ?? value;
    return (
      <span
        key={`${value}-${index}`}
        data-combobox-tag={value}
        className="inline-flex h-6 max-w-full items-center gap-1 rounded-md bg-muted px-2 text-xs"
      >
        <span className="truncate">{label}</span>
        {!disabled && (
          <button
            type="button"
            aria-label={`Remove ${label}`}
            className="shrink-0 text-muted-foreground hover:text-foreground"
            onMouseDown={(event) => event.preventDefault()}
            onClick={() => onRemove(value)}
          >
            <Icon icon={UiClose} className="size-3" />
          </button>
        )}
      </span>
    );
  });
}
