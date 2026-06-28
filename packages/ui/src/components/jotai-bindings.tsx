import { FilterBar } from "./FilterBar";
import { JsonSchemaForm } from "./JsonSchemaForm";
import {
  useJotaiFilterBarProps,
  useJotaiJsonSchemaFormProps,
  type JotaiFilterBarProps,
  type JotaiJsonSchemaFormProps,
} from "./jotai-bindings-core";

export function JotaiJsonSchemaForm({ atom, onChange, ...props }: JotaiJsonSchemaFormProps) {
  const controlled = useJotaiJsonSchemaFormProps(atom, onChange);
  return <JsonSchemaForm {...props} {...controlled} />;
}

export function JotaiFilterBar(props: JotaiFilterBarProps) {
  const controlled = useJotaiFilterBarProps(props);
  return <FilterBar {...controlled} />;
}
