import { useId } from "react";
import { Combobox } from "../../../components/Combobox";
import type { ComboboxOption } from "../../../components/combobox-types";
import { Button } from "../../../components/button";
import { cn } from "../../../lib/utils";
import { Avatar } from "../../Avatar";
import type { GitPickerProps } from "./types";
import { usePickerItems } from "./use-picker-items";

export interface ReferenceChoice extends ComboboxOption { author?: string; date?: string; detail?: string }

export function ReferencePicker<T>({ label, plural, option, custom, ...props }: GitPickerProps<T> & {
  label: string;
  plural: string;
  option: (item: T) => ReferenceChoice;
  custom?: (value: string) => ComboboxOption | null;
}) {
  const id = useId();
  const data = usePickerItems(props);
  const options = data.items.map((item) => {
    const choice = option(item);
    return { ...choice, descriptionLayout: "inline" as const,
      title: [choice.title ?? choice.label, choice.description].filter(Boolean).join("\n"),
      ...(props.optionTrailing ? { trailing: props.optionTrailing(item) } : {}) };
  });
  const selected = options.find((item) => item.value === props.value);
  const error = props.error ?? data.error;
  const loading = props.loading || data.loading;
  return <div className={cn("min-w-0 space-y-1.5", props.className)}>
    <label htmlFor={id} className="block text-sm font-medium text-foreground">{label}</label>
    {props.help && <p id={`${id}-help`} className="text-xs text-muted-foreground">{props.help}</p>}
    <Combobox id={id} ariaLabel={label} value={props.value} options={options}
      menuWidth={720}
      onChange={(value) => props.onChange(value, data.items.find((item) => option(item).value === value))}
      allowCustomValue={Boolean(custom)} {...(custom ? { onNew: custom } : {})}
      placeholder={props.placeholder ?? `Search ${plural}…`} loading={loading} disabled={props.disabled ?? false}
      {...(props.size ? { size: props.size } : {})} invalid={Boolean(error)} describedBy={error ? `${id}-error` : props.help ? `${id}-help` : `${id}-status`}
      footer={`${options.length} ${plural} · Search by name, author or revision`} />
    {error ? <div id={`${id}-error`} role="alert" className="text-xs text-destructive">
      <p>{error.message}</p>{(props.load || props.onRetry) && <Button type="button" variant="ghost" size="sm" onClick={props.onRetry ?? data.retry} aria-label={`Retry ${plural}`}>Retry</Button>}
    </div> : <p id={`${id}-status`} role="status" className="text-xs text-muted-foreground">{loading ? `Loading ${plural}…` : options.length === 0 ? `No ${plural} found.` : null}</p>}
    {data.hasMore && <Button type="button" variant="ghost" size="sm" loading={loading} onClick={data.loadMore} aria-label={`Load more ${plural}`}>Load more</Button>}
    {selected && (selected.author || selected.detail) && <div aria-live="polite" className="space-y-1 text-sm">
      {selected.author && <div className="flex items-center gap-2 text-xs text-muted-foreground"><Avatar alt={selected.author} size="xs" variant="mono" /><span>{selected.author}{selected.date ? ` · ${selected.date}` : ""}</span></div>}
      {selected.detail && <p className="break-words text-xs text-foreground">{selected.detail}</p>}
    </div>}
  </div>;
}
