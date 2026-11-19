import { useId, useState } from "react";
import { Combobox } from "../../../components/Combobox";
import type { ComboboxOption } from "../../../components/combobox-types";
import { Button } from "../../../components/button";
import { cn } from "../../../lib/utils";
import { Avatar } from "../../Avatar";
import type { GitPickerProps } from "./types";
import { usePickerItems } from "./use-picker-items";

export interface ReferenceChoice extends ComboboxOption { author?: string; date?: string; detail?: string }

/** How many options of a group show before its "Show more", and how many each click adds. */
export interface ReferenceGroupLimit { group: string; limit: number; plural: string }

// limitGroups keeps the first `limit × pages` options of each limited group (the
// caller orders them newest first) and reports how many each group hides. The
// selected option always stays, so the control can show its label.
function limitGroups<O extends ComboboxOption>(options: O[], limits: readonly ReferenceGroupLimit[], pages: Record<string, number>, selected: string) {
  const seen: Record<string, number> = {};
  const hidden: Record<string, number> = {};
  const shown = options.filter((choice) => {
    const limit = limits.find((entry) => entry.group === choice.group);
    if (!limit) return true;
    const index = (seen[limit.group] = (seen[limit.group] ?? 0) + 1);
    if (index <= limit.limit * (pages[limit.group] ?? 1) || choice.value === selected) return true;
    hidden[limit.group] = (hidden[limit.group] ?? 0) + 1;
    return false;
  });
  return { shown, hidden };
}

export function ReferencePicker<T>({ label, plural, option, custom, groupLimits = [], ...props }: GitPickerProps<T> & {
  label: string;
  plural: string;
  option: (item: T) => ReferenceChoice;
  custom?: (value: string) => ComboboxOption | null;
  /** Caps groups of a long list until the user searches; a search always reaches every option. */
  groupLimits?: readonly ReferenceGroupLimit[];
}) {
  const id = useId();
  const data = usePickerItems(props);
  const [query, setQuery] = useState("");
  const [pages, setPages] = useState<Record<string, number>>({});
  const all = data.items.map((item) => {
    const choice = option(item);
    return { ...choice, descriptionLayout: "inline" as const, layout: "responsive" as const,
      title: [choice.title ?? choice.label, choice.description].filter(Boolean).join("\n"),
      ...(props.optionTrailing ? { trailing: props.optionTrailing(item) } : {}) };
  });
  const { shown: options, hidden } = query.trim() || groupLimits.length === 0
    ? { shown: all, hidden: {} as Record<string, number> }
    : limitGroups(all, groupLimits, pages, props.value);
  const more = groupLimits.filter((entry) => (hidden[entry.group] ?? 0) > 0);
  const summary = `${all.length} ${plural} · Search by name, author or revision`;
  const footer = more.length === 0 ? summary : <div className="space-y-1">
    <div className="flex flex-wrap gap-1">
      {more.map((entry) => {
        const count = Math.min(entry.limit, hidden[entry.group]!);
        return <Button key={entry.group} type="button" variant="ghost" size="sm" className="h-6 px-2 text-xs"
          onMouseDown={(event) => event.preventDefault()}
          onClick={() => setPages((previous) => ({ ...previous, [entry.group]: (previous[entry.group] ?? 1) + 1 }))}>
          Show {count} more {entry.plural}
        </Button>;
      })}
    </div>
    <p>Showing {options.length} of {summary}</p>
  </div>;
  const selected = all.find((item) => item.value === props.value);
  const error = props.error ?? data.error;
  const loading = props.loading || data.loading;
  return <div className={cn("min-w-0 space-y-1.5", props.className)}>
    <label htmlFor={id} className={props.showLabel === false ? "sr-only" : "block text-sm font-medium text-foreground"}>{label}</label>
    {props.help && <p id={`${id}-help`} className="text-xs text-muted-foreground">{props.help}</p>}
    <Combobox id={id} ariaLabel={label} value={props.value} options={options}
      menuWidth={720}
      onChange={(value) => props.onChange(value, data.items.find((item) => option(item).value === value))}
      allowCustomValue={Boolean(custom)} {...(custom ? { onNew: custom } : {})}
      placeholder={props.placeholder ?? `Search ${plural}…`} loading={loading} disabled={props.disabled ?? false}
      {...(props.size ? { size: props.size } : {})} invalid={Boolean(error)} describedBy={error ? `${id}-error` : props.help ? `${id}-help` : `${id}-status`}
      {...(groupLimits.length > 0 ? { onInputValueChange: setQuery } : {})}
      footer={footer} />
    {error ? <div id={`${id}-error`} role="alert" className="text-xs text-destructive">
      <p>{error.message}</p>{(props.load || props.onRetry) && <Button type="button" variant="ghost" size="sm" onClick={props.onRetry ?? data.retry} aria-label={`Retry ${plural}`}>Retry</Button>}
    </div> : <p id={`${id}-status`} role="status" className="text-xs text-muted-foreground">{loading ? `Loading ${plural}…` : all.length === 0 ? `No ${plural} found.` : null}</p>}
    {data.hasMore && <Button type="button" variant="ghost" size="sm" loading={loading} onClick={data.loadMore} aria-label={`Load more ${plural}`}>Load more</Button>}
    {selected && (selected.author || selected.detail) && <div aria-live="polite" className="space-y-1 text-sm">
      {selected.author && <div className="flex items-center gap-2 text-xs text-muted-foreground"><Avatar alt={selected.author} size="xs" variant="mono" /><span>{selected.author}{selected.date ? ` · ${selected.date}` : ""}</span></div>}
      {selected.detail && <p className="break-words text-xs text-foreground">{selected.detail}</p>}
    </div>}
  </div>;
}
