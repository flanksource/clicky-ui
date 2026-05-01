import { useEffect, useMemo, useRef, useState, type FormEvent } from "react";
import { useQuery } from "@tanstack/react-query";
import { Button } from "../components/button";
import type {
  FilterBarFilter,
  FilterBarMultiFilter,
  FilterBarRangeProps,
} from "../components/FilterBar";
import { FilterPill, type FilterMode } from "../data/FilterPill";
import { Icon } from "../data/Icon";
import { cn } from "../lib/utils";
import {
  packParameterValues,
  parametersToFormConfig,
  pruneParameterValues,
  buildInitialParameterValues,
  titleCase,
  useDebouncedRecord,
  type ParameterValues,
} from "./formMetadata";
import type { OpenAPIParameter } from "./types";
import type { OperationsApiClient } from "./useOperations";

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
    () => `${method}:${path}:${JSON.stringify(initialValues)}:${JSON.stringify(lockedValues)}`,
    [initialValues, lockedValues, method, path],
  );
  const [values, setValues] = useState<ParameterValues>(() =>
    buildInitialParameterValues(parameters, method, lockedValues, initialValues),
  );
  const [error, setError] = useState("");
  const debouncedValues = useDebouncedRecord(values, 250);
  const lastAutoSubmitted = useRef<string | null>(null);

  const lookupQuery = useQuery({
    queryKey: ["filter-form-lookup", method, path, debouncedValues],
    queryFn: async () =>
      (await client.lookupFilters?.(
        path,
        method,
        packParameterValues(debouncedValues, parameters),
        { Accept: "application/json+clicky" },
      )) ?? { filters: {} },
    enabled:
      enableLookup && !!client.lookupFilters && parameters.some((param) => param.in === "query"),
    staleTime: 30_000,
    retry: 0,
  });

  const formConfig = useMemo(
    () =>
      parametersToFormConfig(parameters, values, setValues, {
        lookup: lookupQuery.data,
        lockedValues,
        hideLocked,
      }),
    [hideLocked, lockedValues, lookupQuery.data, parameters, values],
  );

  const hasFields = formConfig.filters.length > 0 || formConfig.timeRange != null;

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
    setValues(buildInitialParameterValues(parameters, method, lockedValues, initialValues));
    setError("");
    lastAutoSubmitted.current = null;
  }, [resetKey]);

  useEffect(() => {
    if (!autoSubmit) {
      return;
    }

    const missingRequired = parameters.filter((param) => {
      if (!param.required) return false;
      const value = lockedValues[param.name] ?? debouncedValues[param.name] ?? "";
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
        <option value="">{filter.placeholder ?? `Any ${filter.label.toLowerCase()}`}</option>
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
          placeholder={filter.placeholder ?? "Value"}
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
          placeholder={filter.placeholder ?? "value-1, value-2"}
          value={filter.value.join(", ")}
          list={listId}
          disabled={filter.disabled}
          onChange={(event) => filter.onChange(splitCommaValues(event.target.value))}
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
        placeholder={filter.placeholder ?? "Value"}
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

function MultiParameterInput({ filter, id }: { filter: FilterBarMultiFilter; id: string }) {
  const [query, setQuery] = useState("");
  const showOptionFilter = filter.options.length > 7;
  const visibleOptions = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    if (!normalized) return filter.options;
    return filter.options.filter((option) =>
      multiOptionText(option).toLowerCase().includes(normalized),
    );
  }, [filter.options, query]);

  const setMode = (value: string, mode: FilterMode) => {
    if (filter.disabled) return;
    const next = { ...filter.value };
    if (mode === "include" || mode === "exclude") {
      next[value] = mode;
    } else {
      delete next[value];
    }
    filter.onChange(next);
  };

  return (
    <div
      id={id}
      role="group"
      aria-label={filter.label}
      className="rounded-md border border-input bg-background p-2"
    >
      {showOptionFilter && (
        <label className="mb-2 flex items-center gap-2 rounded-md border border-input bg-background px-2">
          <Icon name="codicon:search" className="shrink-0 text-muted-foreground" />
          <input
            type="search"
            aria-label={`Filter ${filter.label} options`}
            className="h-8 min-w-0 flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground"
            placeholder={`Filter ${filter.label.toLowerCase()}`}
            value={query}
            disabled={filter.disabled}
            onChange={(event) => setQuery(event.target.value)}
          />
        </label>
      )}

      <div className="max-h-56 space-y-1 overflow-auto">
        {visibleOptions.map((option) => {
          const mode: FilterMode = filter.value[option.value] ?? "neutral";
          return (
            <FilterPill
              key={option.value}
              className="w-full justify-between"
              label={option.label}
              mode={mode}
              title={option.title ?? multiOptionText(option)}
              togglePosition="right"
              onModeChange={(next) => setMode(option.value, next)}
            />
          );
        })}
        {visibleOptions.length === 0 && (
          <div className="px-2 py-3 text-sm text-muted-foreground">No options found</div>
        )}
      </div>
    </div>
  );
}

function multiOptionText(option: FilterBarMultiFilter["options"][number]) {
  const label = typeof option.label === "string" ? option.label : "";
  return [option.value, label, option.title ?? ""].filter(Boolean).join(" ");
}

function TimeRangeRow({ timeRange }: { timeRange: FilterBarRangeProps }) {
  const fromId = "clicky-param-from";
  const toId = "clicky-param-to";
  const from = timeRange.from ?? "";
  const to = timeRange.to ?? "";

  return (
    <div className="grid grid-cols-1 gap-2 py-2 sm:grid-cols-[minmax(8rem,14rem)_minmax(0,1fr)] sm:items-center">
      <div className="text-sm font-medium text-muted-foreground">Time range</div>
      <div className="grid min-w-0 grid-cols-1 gap-2 sm:grid-cols-2">
        <label className="min-w-0">
          <span className="sr-only">From</span>
          <input
            id={fromId}
            type="text"
            aria-label="From"
            className={inputClassName}
            placeholder={timeRange.fromPlaceholder ?? "From"}
            value={from}
            onChange={(event) => timeRange.onApply(event.target.value, to)}
          />
        </label>
        <label className="min-w-0">
          <span className="sr-only">To</span>
          <input
            id={toId}
            type="text"
            aria-label="To"
            className={inputClassName}
            placeholder={timeRange.toPlaceholder ?? "To"}
            value={to}
            onChange={(event) => timeRange.onApply(from, event.target.value)}
          />
        </label>
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
  "h-8 w-full min-w-0 rounded-md border border-input bg-background px-2 text-sm text-foreground outline-none placeholder:text-muted-foreground disabled:cursor-not-allowed disabled:bg-muted/40 focus-visible:ring-2 focus-visible:ring-ring";
