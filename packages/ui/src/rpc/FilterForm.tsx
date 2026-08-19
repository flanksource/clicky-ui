import { useEffect, useMemo, useRef, useState, type FormEvent } from "react";
import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { Button } from "../components/button";
import type {
  FilterBarFilter,
  FilterBarMultiFilter,
  FilterBarRangeProps,
} from "../components/FilterBar";
import { Combobox } from "../components/Combobox";
import { TimeRange } from "../components/TimeRange";
import { cn } from "../lib/utils";
import {
  packLookupParameterValues,
  parametersToFormConfig,
  pruneParameterValues,
  buildInitialParameterValues,
  titleCase,
  useDebouncedRecord,
  type ParameterValues,
} from "./formMetadata";
import type { OpenAPIParameter } from "./types";
import { useOpenAPI, type OperationsApiClient } from "./useOperations";

export type FilterFormProps = {
  client: OperationsApiClient;
  path: string;
  method: string;
  parameters?: OpenAPIParameter[];
  initialValues?: ParameterValues | undefined;
  lockedValues?: ParameterValues | undefined;
  hideLocked?: boolean | undefined;
  enableLookup?: boolean | undefined;
  autoSubmit?: boolean | undefined;
  submitLabel?: string | undefined;
  submittingLabel?: string | undefined;
  emptyMessage?: string | undefined;
  isSubmitting?: boolean | undefined;
  className?: string | undefined;
  onSubmit: (values: ParameterValues) => void | Promise<void>;
};

export function FilterForm({
  client,
  path,
  method,
  parameters = [],
  initialValues = {},
  lockedValues = {},
  hideLocked = false,
  enableLookup = method.toUpperCase() === "GET",
  autoSubmit = false,
  submitLabel = "Execute request",
  submittingLabel = "Executing…",
  emptyMessage = "This operation does not require input.",
  isSubmitting = false,
  className,
  onSubmit,
}: FilterFormProps) {
  const resetKey = useMemo(
    () =>
      `${method}:${path}:${JSON.stringify(initialValues)}:${JSON.stringify(lockedValues)}`,
    [initialValues, lockedValues, method, path],
  );
  const [values, setValues] = useState<ParameterValues>(() =>
    buildInitialParameterValues(
      parameters,
      method,
      lockedValues,
      initialValues,
    ),
  );
  const [error, setError] = useState("");
  const debouncedValues = useDebouncedRecord(values, 250);
  const lastAutoSubmitted = useRef<string | null>(null);
  const lookupParameters = useMemo(
    () => packLookupParameterValues(debouncedValues, parameters),
    [debouncedValues, parameters],
  );

  const lookupQuery = useQuery({
    queryKey: ["filter-form-lookup", method, path, lookupParameters],
    queryFn: async () =>
      (await client.lookupFilters?.(path, method, lookupParameters, {
        Accept: "application/json+clicky",
      })) ?? { filters: {} },
    enabled:
      enableLookup &&
      !!client.lookupFilters &&
      parameters.some((param) => param.in === "query"),
    placeholderData: keepPreviousData,
    staleTime: 30_000,
    retry: 0,
  });

  // Shapes come from the spec so a control keeps its identity while the lookup
  // that fills it is in flight; see parametersToFormConfig.
  const { data: spec } = useOpenAPI(client);
  const filterShapes = spec?.components?.["x-clicky-filters"];

  const formConfig = useMemo(
    () =>
      parametersToFormConfig(parameters, values, setValues, {
        lookup: lookupQuery.data,
        components: filterShapes,
        lockedValues,
        hideLocked,
      }),
    [
      filterShapes,
      hideLocked,
      lockedValues,
      lookupQuery.data,
      parameters,
      values,
    ],
  );

  const hasFields =
    formConfig.filters.length > 0 || formConfig.timeRange != null;

  async function handleSubmit(event?: FormEvent) {
    event?.preventDefault();

    const missingRequired = parameters.filter((param) => {
      if (!param.required) return false;
      const value = lockedValues[param.name] ?? values[param.name] ?? "";
      return value.trim() === "";
    });

    if (missingRequired.length > 0) {
      setError(
        `Missing required fields: ${missingRequired.map((param) => titleCase(param.name)).join(", ")}`,
      );
      return;
    }

    setError("");
    await onSubmit(pruneParameterValues(values));
  }

  useEffect(() => {
    setValues(
      buildInitialParameterValues(
        parameters,
        method,
        lockedValues,
        initialValues,
      ),
    );
    setError("");
    lastAutoSubmitted.current = null;
  }, [resetKey]);

  useEffect(() => {
    if (!autoSubmit) {
      return;
    }

    const missingRequired = parameters.filter((param) => {
      if (!param.required) return false;
      const value =
        lockedValues[param.name] ?? debouncedValues[param.name] ?? "";
      return value.trim() === "";
    });
    if (missingRequired.length > 0) {
      return;
    }

    const submittedValues = pruneParameterValues(debouncedValues);
    const signature = JSON.stringify(submittedValues);
    if (lastAutoSubmitted.current === signature) {
      return;
    }

    lastAutoSubmitted.current = signature;
    setError("");
    void onSubmit(submittedValues);
  }, [autoSubmit, debouncedValues, lockedValues, onSubmit, parameters]);

  return (
    <form className="space-y-3" onSubmit={handleSubmit}>
      {hasFields ? (
        <ParameterGrid
          autoSubmit={autoSubmit}
          filters={formConfig.filters}
          isSubmitting={isSubmitting}
          submitLabel={submitLabel}
          submittingLabel={submittingLabel}
          {...(formConfig.timeRange ? { timeRange: formConfig.timeRange } : {})}
          {...(className ? { className } : {})}
        />
      ) : (
        <div className="flex items-center justify-between gap-4">
          <p className="text-sm text-muted-foreground">{emptyMessage}</p>
          <Button type="button" onClick={handleSubmit} disabled={isSubmitting}>
            {isSubmitting ? submittingLabel : submitLabel}
          </Button>
        </div>
      )}

      {error && (
        <div className="rounded-md border border-destructive/40 bg-destructive/5 p-3 text-sm text-destructive">
          {error}
        </div>
      )}
    </form>
  );
}

type ParameterGridProps = {
  filters: FilterBarFilter[];
  timeRange?: FilterBarRangeProps | undefined;
  autoSubmit: boolean;
  isSubmitting: boolean;
  submitLabel: string;
  submittingLabel: string;
  className?: string | undefined;
};

function ParameterGrid({
  filters,
  timeRange,
  autoSubmit,
  isSubmitting,
  submitLabel,
  submittingLabel,
  className,
}: ParameterGridProps) {
  return (
    <div className={cn("space-y-3", className)}>
      <div className="divide-y divide-border border-y border-border">
        {filters.map((filter) => (
          <ParameterRow key={filter.key} filter={filter} />
        ))}
        {timeRange && <TimeRangeRow timeRange={timeRange} />}
      </div>

      {!autoSubmit && (
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
        filter.disabled && "opacity-60",
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
            : (option.title ?? option.value),
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

// TimeRangeRow renders the paired from/to parameters as the native TimeRange
// popover picker (relative-time presets + a date picker) rather than two bare
// text inputs, matching how FilterBar renders its own range control.
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
