import { lazy, Suspense, useState } from "react";
import { ConnectionPicker, type ConnectionCreateRequest } from "../connections/ConnectionPicker";
import { useConnectionApiBase } from "./form-connection-context";
import type { FieldControl, FieldOption } from "./json-schema-form-types";
import { comboboxAriaProps, toText } from "./json-schema-form-utils";
import type { FormSize } from "./json-schema-form-size";

// The create dialog pulls in the whole schema form; it loads when first opened.
// Besides keeping the dialog out of every form's bundle, the dynamic import
// keeps the module graph one-directional: the form never statically imports
// something that imports the form.
const LazyCreateConnectionDialog = lazy(async () => {
  const mod = await import("../connections/CreateConnectionDialog");
  return { default: mod.CreateConnectionDialog };
});

// connectionTypes reads `x-connection-types` off a `format: "connection"`
// property: absent means any type, present must be a non-empty list of names.
function connectionTypes(field: FieldControl): string[] | undefined {
  const raw = field.schema["x-connection-types"];
  if (raw === undefined) return undefined;
  if (!Array.isArray(raw) || raw.length === 0 || raw.some((type) => typeof type !== "string" || type === "")) {
    throw new Error(
      `${field.key}: x-connection-types must be a non-empty list of connection type names, got ${JSON.stringify(raw)}`,
    );
  }
  return raw as string[];
}

// ConnectionLookupControl is the picker for a `format: "connection"` lookup
// field: the lookup's options in a ConnectionPicker whose value is the
// `connection://` ref. When the form was given a `connectionApiBase` the menu
// ends with "New {type} connection…", which creates one and selects it.
export function ConnectionLookupControl({
  field,
  fieldId,
  readOnly,
  size,
  options,
  loading,
  onSearch,
}: {
  field: FieldControl;
  fieldId: string;
  readOnly: boolean;
  size: FormSize;
  options: FieldOption[];
  loading: boolean;
  onSearch: (query: string) => void;
}) {
  const apiBase = useConnectionApiBase();
  const [creating, setCreating] = useState<ConnectionCreateRequest>();
  const types = connectionTypes(field);

  return (
    <>
      <ConnectionPicker
        id={fieldId}
        options={options}
        value={toText(field.value)}
        onChange={(ref) => field.onChange(ref)}
        disabled={readOnly}
        size={size}
        loading={loading}
        onSearch={onSearch}
        {...(types ? { types } : {})}
        {...(apiBase ? { onCreate: setCreating } : {})}
        {...(field.nullable
          ? { clearable: true, clearLabel: `Clear ${field.label} to null`, onClear: () => field.onChange(null) }
          : {})}
        {...comboboxAriaProps(field, fieldId)}
      />
      {creating && apiBase ? (
        <Suspense fallback={null}>
          <LazyCreateConnectionDialog
            apiBase={apiBase}
            existing={options.map((option) => option.value)}
            {...(creating.type ? { type: creating.type } : {})}
            onClose={() => setCreating(undefined)}
            onCreated={(ref) => {
              field.onChange(ref);
              setCreating(undefined);
              onSearch("");
            }}
          />
        </Suspense>
      ) : null}
    </>
  );
}
