import { useEffect, useMemo, useRef, useState, type FormEvent } from "react";
import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { Button } from "../components/button";
import { FilterBar } from "../components/FilterBar";
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
import { ParameterGrid } from "./FilterFormFields";

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
  formId?: string | undefined;
  showSubmit?: boolean | undefined;
  excludedParameterNames?: string[] | undefined;
  /** Renders operation controls as form rows or the shared table FilterBar. */
  presentation?: "form" | "filter-bar" | undefined;
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
  formId,
  showSubmit = true,
  excludedParameterNames = [],
  presentation = "form",
  onSubmit,
}: FilterFormProps) {
  const resetKey = useMemo(
    () =>
      `${method}:${path}:${JSON.stringify(initialValues)}:${JSON.stringify(
        lockedValues
      )}`,
    [initialValues, lockedValues, method, path]
  );
  const visibleParameters = useMemo(
    () =>
      parameters.filter(
        (parameter) => !excludedParameterNames.includes(parameter.name)
      ),
    [excludedParameterNames, parameters]
  );
  const [values, setValues] = useState<ParameterValues>(() =>
    buildInitialParameterValues(parameters, method, lockedValues, initialValues)
  );
  const [error, setError] = useState("");
  const debouncedValues = useDebouncedRecord(values, 250);
  const lastAutoSubmitted = useRef<string | null>(null);
  const lookupParameters = useMemo(
    () => packLookupParameterValues(debouncedValues, parameters),
    [debouncedValues, parameters]
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
      parametersToFormConfig(visibleParameters, values, setValues, {
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
      visibleParameters,
      values,
    ]
  );

  const hasFields =
    formConfig.filters.length > 0 ||
    formConfig.search != null ||
    formConfig.timeRange != null;

  async function handleSubmit(event?: FormEvent) {
    event?.preventDefault();

    const missingRequired = parameters.filter((param) => {
      if (!param.required) return false;
      const value = lockedValues[param.name] ?? values[param.name] ?? "";
      return value.trim() === "";
    });

    if (missingRequired.length > 0) {
      setError(
        `Missing required fields: ${missingRequired
          .map((param) => titleCase(param.name))
          .join(", ")}`
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
        initialValues
      )
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
    <form id={formId} className="space-y-3" onSubmit={handleSubmit}>
      {hasFields ? (
        presentation === "filter-bar" ? (
          <FilterBar
            autoSubmit={autoSubmit}
            filters={formConfig.filters}
            overflowMode="wrap"
            {...(formConfig.search ? { search: formConfig.search } : {})}
            {...(formConfig.timeRange
              ? { timeRange: formConfig.timeRange }
              : {})}
            {...(!autoSubmit
              ? {
                  onApply: () => void handleSubmit(),
                  applyLabel: submitLabel,
                  isPending: isSubmitting,
                }
              : {})}
            {...(className ? { className } : {})}
          />
        ) : (
          <ParameterGrid
            autoSubmit={autoSubmit}
            filters={formConfig.filters}
            isSubmitting={isSubmitting}
            submitLabel={submitLabel}
            submittingLabel={submittingLabel}
            showSubmit={showSubmit}
            {...(formConfig.timeRange
              ? { timeRange: formConfig.timeRange }
              : {})}
            {...(className ? { className } : {})}
          />
        )
      ) : (
        <div className="flex items-center justify-between gap-4">
          <p className="text-sm text-muted-foreground">{emptyMessage}</p>
          {showSubmit ? (
            <Button
              type="button"
              onClick={handleSubmit}
              disabled={isSubmitting}
            >
              {isSubmitting ? submittingLabel : submitLabel}
            </Button>
          ) : null}
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
