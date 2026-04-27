import { useEffect, useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Button } from "../components/button";
import { FilterBar } from "../components/FilterBar";
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

  async function handleSubmit() {
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
  }, [resetKey]);

  return (
    <div className="space-y-3">
      {hasFields ? (
        <FilterBar
          autoSubmit={false}
          filters={formConfig.filters}
          onApply={handleSubmit}
          applyLabel={submitLabel}
          isPending={isSubmitting}
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
    </div>
  );
}
