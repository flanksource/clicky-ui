import type { ReactNode } from "react";
import { Select } from "./select";
import { Button } from "./button";
import { ClearableFieldGroup } from "./clearable-field-group";
import { inputSizeClass } from "./json-schema-form-size";
import { seedUnionBranch } from "./json-schema-form-union-model";
import { nullableGroupClearable } from "./json-schema-form-utils";
import type { FieldControl, RenderContext } from "./json-schema-form-types";

// clearInHeader is set when the field's section header row already carries the
// clear-to-null action, so the body is not wrapped in a second bordered box.
export function NullableControl({
  field,
  fieldId,
  ctx,
  clearInHeader = false,
  children,
}: {
  field: FieldControl;
  fieldId: string;
  ctx: RenderContext;
  clearInHeader?: boolean;
  children: ReactNode;
}) {
  const readOnly = ctx.readOnly || field.readOnly === true;
  const empty = field.value === null || field.value === undefined;
  let control = children;
  if (field.kind === "boolean") {
    control = (
      <Select
        clearable
        clearLabel={`Clear ${field.label} to null`}
        onClear={() => field.onChange(null)}
        id={fieldId}
        aria-label={field.label}
        disabled={readOnly}
        className={inputSizeClass[ctx.size]}
        value={empty ? "" : String(field.value)}
        options={[
          { value: "", label: "" },
          { value: "true", label: "Yes" },
          { value: "false", label: "No" },
        ]}
        onChange={(event) =>
          field.onChange(
            event.target.value === "" ? null : event.target.value === "true",
          )
        }
      />
    );
  } else if (empty && ["object", "array", "string-map"].includes(field.kind)) {
    control = readOnly ? (
      <span />
    ) : (
      <Button
        variant="outline"
        size="sm"
        onClick={() => field.onChange(seedUnionBranch(field.schema))}
      >
        Add {field.label}
      </Button>
    );
  }
  return (
    <ClearableFieldGroup
      clearable={!clearInHeader && nullableGroupClearable(field, readOnly)}
      clearLabel={`Clear ${field.label} to null`}
      onClear={() => field.onChange(null)}
    >
      {control}
    </ClearableFieldGroup>
  );
}
