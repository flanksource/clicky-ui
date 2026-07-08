import { useId } from "react";
import { JsonSchemaForm } from "../../../components/JsonSchemaForm";
import type { JsonSchemaObject } from "../../../components/json-schema-form-types";
import type { AISpecRuntimeValue } from "../SpecRuntimeEditor.model";
import { withRoot } from "./update";

export type SpecRuntimeCLIOptions = {
  /** JsonSchemaForm schema for the backend's extra CLI args. */
  schema: JsonSchemaObject;
};

// Extra cmux CLI args (api.Spec.cliArgs): schema-driven, supplied per backend
// by the host (e.g. captain's /api/captain/ai/cli-options/catalog).
export function CLIArgsSection({
  value,
  onChange,
  cliOptions,
}: {
  value: AISpecRuntimeValue;
  onChange: (value: AISpecRuntimeValue) => void;
  cliOptions: SpecRuntimeCLIOptions;
}) {
  const idPrefix = useId();
  return (
    <JsonSchemaForm
      idPrefix={`spec-cli-${idPrefix}`}
      schema={cliOptions.schema}
      value={value.cliArgs ?? {}}
      onChange={(cliArgs) => onChange(withRoot(value, { cliArgs }))}
      size="sm"
    />
  );
}
