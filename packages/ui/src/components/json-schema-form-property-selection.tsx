import { useEffect, useState } from "react";
import { LabelIcon } from "../data/Icon";
import { FilterPill } from "../data/FilterPill";
import { ComboboxTag } from "./ComboboxTags";
import { useLookupFetcher } from "./form-lookup-context";
import type {
  FieldControl,
  FieldOption,
  RenderContext,
} from "./json-schema-form-types";

export function PropertySelectionPreview({
  field,
  ctx,
}: {
  field: FieldControl;
  ctx: RenderContext;
}) {
  const fetcher = useLookupFetcher();
  const descriptor = field.lookup;
  const rootValue = ctx.rootValue;
  const [options, setOptions] = useState<FieldOption[]>([]);
  const [error, setError] = useState<string>();
  useEffect(() => {
    if (!descriptor || !fetcher) return;
    let cancelled = false;
    setOptions([]);
    setError(undefined);
    fetcher({
      descriptor,
      query: "",
      ...(rootValue ? { rootValue } : {}),
    }).then(
      (next) => {
        if (!cancelled) setOptions(next);
      },
      (cause: unknown) => {
        if (!cancelled)
          setError(`Unable to load ${field.label}: ${String(cause)}`);
      },
    );
    return () => {
      cancelled = true;
    };
  }, [descriptor, fetcher, rootValue, field.label]);
  const choices = descriptor && fetcher ? options : (field.options ?? []);
  const multiple = field.kind === "array" || descriptor?.multi === true;
  const selected = Array.isArray(field.value)
    ? field.value.map(String)
    : field.value == null || field.value === ""
      ? []
      : [String(field.value)];
  const values =
    field.arrayDisplay === "filter-pills" && selected.length === 0
      ? choices.map((option) => option.value)
      : selected;
  return (
    <div className="flex min-w-0 flex-wrap items-center gap-1">
      {values.length === 0 && <span className="text-muted-foreground">—</span>}
      {values.map((value, index) => {
        const option = choices.find((candidate) => candidate.value === value);
        if (field.arrayDisplay === "filter-pills")
          return (
            <FilterPill
              key={`${value}-${index}`}
              label={option?.label ?? value}
              mode="active"
            />
          );
        if (multiple)
          return (
            <ComboboxTag
              key={`${value}-${index}`}
              value={value}
              {...(option ? { option } : {})}
            />
          );
        return (
          <span
            key={value}
            className="inline-flex min-w-0 items-center gap-1.5"
          >
            <LabelIcon
              icon={option?.icon}
              className="shrink-0 text-muted-foreground"
            />
            <span>{option?.label ?? value}</span>
            {option?.description && (
              <span className="text-muted-foreground">
                {option.description}
              </span>
            )}
          </span>
        );
      })}
      {error && (
        <span role="alert" className="text-xs text-destructive">
          {error}
        </span>
      )}
    </div>
  );
}
