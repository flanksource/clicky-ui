import { NamespacePicker } from "../components/NamespacePicker";
import type { FieldControl } from "../components/json-schema-form-types";

/**
 * The connection form's namespace control. `loadNamespaces` must keep a stable
 * identity across renders: NamespacePicker reloads whenever it changes.
 */
export function ConnectionNamespaceField({
  field,
  loadNamespaces,
}: {
  field: FieldControl;
  loadNamespaces: () => Promise<string[]>;
}) {
  return (
    <NamespacePicker
      value={typeof field.value === "string" ? field.value : ""}
      onChange={field.onChange}
      loadNamespaces={loadNamespaces}
    />
  );
}
