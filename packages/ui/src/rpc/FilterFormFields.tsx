import { Button } from "../components/button";
import { Combobox } from "../components/Combobox";
import {
  type FilterBarFilter,
  type FilterBarMultiFilter,
  type FilterBarRangeProps,
} from "../components/FilterBar";
import { TimeRange } from "../components/TimeRange";
import { cn } from "../lib/utils";

export type ParameterGridProps = {
  filters: FilterBarFilter[];
  timeRange?: FilterBarRangeProps | undefined;
  autoSubmit: boolean;
  isSubmitting: boolean;
  submitLabel: string;
  submittingLabel: string;
  className?: string | undefined;
  showSubmit?: boolean | undefined;
};

export function ParameterGrid({
  filters,
  timeRange,
  autoSubmit,
  isSubmitting,
  submitLabel,
  submittingLabel,
  className,
  showSubmit = true,
}: ParameterGridProps) {
  return (
    <div className={cn("space-y-3", className)}>
      <div className="divide-y divide-border border-y border-border">
        {filters.map((filter) => (
          <ParameterRow key={filter.key} filter={filter} />
        ))}
        {timeRange && <TimeRangeRow timeRange={timeRange} />}
      </div>

      {!autoSubmit && showSubmit && (
        <div className="flex justify-end">
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? submittingLabel : submitLabel}
          </Button>
        </div>
      )}
    </div>
  );
}

function ParameterRow({ filter }: { filter: FilterBarFilter }) {
  const id = `clicky-param-${filter.key.replace(/[^a-zA-Z0-9_-]/g, "-")}`;

  return (
    <div
      title={filter.description}
      className={cn(
        "grid grid-cols-1 gap-2 py-2 sm:grid-cols-[minmax(8rem,14rem)_minmax(0,1fr)] sm:items-center",
        filter.disabled && "opacity-60"
      )}
    >
      <label htmlFor={id} className="text-sm font-medium text-muted-foreground">
        {filter.label}
      </label>
      <div className="min-w-0">{renderParameterInput(filter, id)}</div>
    </div>
  );
}

function renderParameterInput(filter: FilterBarFilter, id: string) {
  if (filter.kind === "date-range") {
    return (
      <TimeRange
        kind={filter.timeEnabled === false ? "date" : "time"}
        label={filter.label}
        align="left"
        from={filter.from ?? ""}
        to={filter.to ?? ""}
        onApply={filter.onApply}
        {...(filter.disabled !== undefined
          ? { disabled: filter.disabled }
          : {})}
        {...(filter.presets ? { presets: filter.presets } : {})}
        {...(filter.timeEnabled !== undefined
          ? { timeEnabled: filter.timeEnabled }
          : {})}
        {...(filter.timeZone ? { timeZone: filter.timeZone } : {})}
        {...(filter.timeZones ? { timeZones: filter.timeZones } : {})}
        {...(filter.fromPlaceholder
          ? { fromPlaceholder: filter.fromPlaceholder }
          : {})}
        {...(filter.toPlaceholder
          ? { toPlaceholder: filter.toPlaceholder }
          : {})}
      />
    );
  }

  if (filter.kind === "enum") {
    return (
      <select
        id={id}
        aria-label={filter.label}
        className={inputClassName}
        value={filter.value}
        disabled={filter.disabled}
        onChange={(event) => filter.onChange(event.target.value)}
      >
        <option value="">{filter.placeholder ?? ""}</option>
        {filter.options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label ?? option.value}
          </option>
        ))}
      </select>
    );
  }

  if (filter.kind === "boolean") {
    return (
      <div className="flex h-8 items-center">
        <input
          id={id}
          type="checkbox"
          aria-label={filter.label}
          className="h-4 w-4 accent-primary disabled:cursor-not-allowed"
          checked={filter.value}
          disabled={filter.disabled}
          onChange={(event) => filter.onChange(event.target.checked)}
        />
      </div>
    );
  }

  if (filter.kind === "lookup") {
    const listId = `${id}-options`;
    return (
      <>
        <input
          id={id}
          type={filter.inputType === "number" ? "number" : "text"}
          aria-label={filter.label}
          className={inputClassName}
          {...(filter.placeholder !== undefined
            ? { placeholder: filter.placeholder }
            : {})}
          value={filter.value}
          list={listId}
          disabled={filter.disabled}
          onChange={(event) => filter.onChange(event.target.value)}
        />
        <datalist id={listId}>
          {filter.options.map((option) => (
            <option
              key={option.value}
              value={option.value}
              label={option.label ?? option.value}
              disabled={option.disabled}
            />
          ))}
        </datalist>
      </>
    );
  }

  if (filter.kind === "lookup-multi") {
    const listId = `${id}-options`;
    return (
      <>
        <input
          id={id}
          type="text"
          aria-label={filter.label}
          className={inputClassName}
          {...(filter.placeholder !== undefined
            ? { placeholder: filter.placeholder }
            : {})}
          value={filter.value.join(", ")}
          list={listId}
          disabled={filter.disabled}
          onChange={(event) =>
            filter.onChange(splitCommaValues(event.target.value))
          }
        />
        <datalist id={listId}>
          {filter.options.map((option) => (
            <option
              key={option.value}
              value={option.value}
              label={option.label ?? option.value}
              disabled={option.disabled}
            />
          ))}
        </datalist>
      </>
    );
  }

  if (filter.kind === "multi") {
    return <MultiParameterInput filter={filter} id={id} />;
  }

  if (filter.kind === "text") {
    return (
      <input
        id={id}
        type="text"
        aria-label={filter.label}
        className={inputClassName}
        {...(filter.placeholder !== undefined
          ? { placeholder: filter.placeholder }
          : {})}
        value={filter.value}
        disabled={filter.disabled}
        onChange={(event) => filter.onChange(event.target.value)}
      />
    );
  }

  return (
    <input
      id={id}
      type="text"
      aria-label={filter.label}
      className={inputClassName}
      value={JSON.stringify(filter.value)}
      disabled
      readOnly
    />
  );
}

function MultiParameterInput({
  filter,
  id,
}: {
  filter: FilterBarMultiFilter;
  id: string;
}) {
  const moreCount =
    filter.truncated && filter.total
      ? Math.max(filter.total - filter.options.length, 0)
      : 0;
  return (
    <Combobox
      multiple
      id={id}
      ariaLabel={filter.label}
      value={Object.keys(filter.value)}
      options={filter.options.map((option) => ({
        value: option.value,
        label:
          typeof option.label === "string"
            ? option.label
            : option.title ?? option.value,
        ...(option.disabled !== undefined ? { disabled: option.disabled } : {}),
        ...(option.title !== undefined ? { title: option.title } : {}),
      }))}
      onChange={(values) => {
        const next: FilterBarMultiFilter["value"] = {};
        for (const value of values)
          next[value] = filter.value[value] ?? "include";
        filter.onChange(next);
      }}
      allowCustomValue={filter.allowCustomValue ?? false}
      {...(filter.placeholder !== undefined
        ? { placeholder: filter.placeholder }
        : {})}
      {...(filter.disabled !== undefined ? { disabled: filter.disabled } : {})}
      {...(filter.className !== undefined
        ? { className: filter.className }
        : {})}
      {...(moreCount > 0
        ? { footer: `… and ${moreCount.toLocaleString()} more` }
        : {})}
    />
  );
}

function TimeRangeRow({ timeRange }: { timeRange: FilterBarRangeProps }) {
  return (
    <div className="grid grid-cols-1 gap-2 py-2 sm:grid-cols-[minmax(8rem,14rem)_minmax(0,1fr)] sm:items-center">
      <div className="text-sm font-medium text-muted-foreground">
        Time range
      </div>
      <div className="min-w-0">
        <TimeRange
          kind={timeRange.timeEnabled ? "time" : "date"}
          label="Time range"
          align="left"
          from={timeRange.from ?? ""}
          to={timeRange.to ?? ""}
          onApply={timeRange.onApply}
          {...(timeRange.presets ? { presets: timeRange.presets } : {})}
          {...(timeRange.timeEnabled !== undefined
            ? { timeEnabled: timeRange.timeEnabled }
            : {})}
          {...(timeRange.timeZone ? { timeZone: timeRange.timeZone } : {})}
          {...(timeRange.timeZones ? { timeZones: timeRange.timeZones } : {})}
          {...(timeRange.fromPlaceholder
            ? { fromPlaceholder: timeRange.fromPlaceholder }
            : {})}
          {...(timeRange.toPlaceholder
            ? { toPlaceholder: timeRange.toPlaceholder }
            : {})}
        />
      </div>
    </div>
  );
}

function splitCommaValues(value: string) {
  return value
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
}

const inputClassName =
  "h-8 w-full min-w-0 rounded-md border border-input bg-background px-2 text-sm text-foreground outline-none placeholder:text-placeholder disabled:cursor-not-allowed disabled:bg-muted/40 focus-visible:ring-2 focus-visible:ring-ring";
