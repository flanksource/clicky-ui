import { ObjectArrayEditor } from "./ObjectArrayEditor";
import { OBJECT_ARRAY_ROUTES, OBJECT_ARRAY_SCHEMA } from "./object-array-data";

export function ObjectArrayPattern() {
  return (
    <ObjectArrayEditor
      schema={OBJECT_ARRAY_SCHEMA}
      initial={{ routes: OBJECT_ARRAY_ROUTES.map((route) => ({ ...route })) }}
      idPrefix="design-system-object-arrays"
    />
  );
}
