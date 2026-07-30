import { cn } from "../lib/utils";
import type { JsonSchemaFormError } from "./json-schema-form-error-types";

export function FieldErrorMessages({
  errors,
}: {
  errors: JsonSchemaFormError[];
}) {
  return (
    <span data-jsf-errors>
      {errors.map((error, index) => (
        <span
          key={`${error.schemaPath ?? ""}:${error.keyword ?? ""}:${
            error.message
          }:${index}`}
          className="block"
        >
          {error.message}
        </span>
      ))}
    </span>
  );
}

export function FieldErrorText({
  errors,
  className,
}: {
  errors: JsonSchemaFormError[];
  className?: string;
}) {
  if (errors.length === 0) return null;
  return (
    <p className={cn("text-xs text-destructive", className)}>
      <FieldErrorMessages errors={errors} />
    </p>
  );
}

export function FormErrorSummary({
  errors,
}: {
  errors: JsonSchemaFormError[];
}) {
  if (errors.length === 0) return null;
  return (
    <div
      role="alert"
      aria-label="Form errors"
      className="rounded-md border border-destructive/40 bg-destructive/5 px-3 py-2 text-xs text-destructive"
    >
      <p className="font-medium">Review the following errors:</p>
      <ul className="mt-1 list-disc space-y-0.5 pl-4">
        {errors.map((error, index) => (
          <li
            key={`${error.instancePath}:${error.schemaPath ?? ""}:${
              error.message
            }:${index}`}
          >
            {error.instancePath
              ? `${error.instancePath}: ${error.message}`
              : error.message}
          </li>
        ))}
      </ul>
    </div>
  );
}
