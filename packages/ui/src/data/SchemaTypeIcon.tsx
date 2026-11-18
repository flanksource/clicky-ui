import { Icon } from "./Icon";
import { UiFieldType, UiListTree, UiArray, UiBoolean, UiEnum, UiNumeric, UiObject, UiString } from "../icons";

const TYPE_ICONS = {
  string: UiString,
  number: UiNumeric,
  integer: UiNumeric,
  boolean: UiBoolean,
  object: UiObject,
  array: UiArray,
  const: UiEnum,
  branch: UiListTree,
  group: UiListTree,
  fields: UiObject,
};

export function SchemaTypeIcon({ type }: { type: string }) {
  const icon = type.startsWith("enum(") ? UiEnum : TYPE_ICONS[type as keyof typeof TYPE_ICONS] ?? UiFieldType;
  return <span role="img" aria-label={`${type} type`} title={type} className="inline-flex shrink-0 items-center text-muted-foreground">
    <Icon icon={icon} className="size-4" />
  </span>;
}
