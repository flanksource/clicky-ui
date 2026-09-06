import { useId } from "react";
import { Icon } from "../data/Icon";
import { UiClose, UiSearch } from "../icons";

export function FormFieldFilter({
  value,
  onChange,
}: {
  value: string;
  onChange: (value: string) => void;
}) {
  const id = useId();
  return (
    <div className="flex min-w-0 flex-col gap-1">
      <label htmlFor={id} className="text-xs text-muted-foreground">
        Filter fields and values
      </label>
      <div className="relative">
        <Icon
          icon={UiSearch}
          className="pointer-events-none absolute left-2 top-1/2 -translate-y-1/2 text-xs text-muted-foreground"
        />
        <input
          id={id}
          type="text"
          aria-label="Filter fields"
          placeholder="Search names, values, or tags…"
          value={value}
          onChange={(event) => onChange(event.target.value)}
          onKeyDown={(event) => event.stopPropagation()}
          className="h-7 w-full rounded-md border border-input bg-background pl-7 pr-7 text-xs text-foreground outline-none placeholder:text-placeholder focus-visible:ring-2 focus-visible:ring-ring"
        />
        {value !== "" && (
          <button
            type="button"
            aria-label="Clear filter"
            onClick={() => onChange("")}
            className="absolute right-1.5 top-1/2 inline-flex -translate-y-1/2 items-center justify-center text-muted-foreground hover:text-foreground"
          >
            <Icon icon={UiClose} className="text-xs" />
          </button>
        )}
      </div>
    </div>
  );
}
