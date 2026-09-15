import type { ResolvedOperation } from "./types";
import { Combobox } from "../components/Combobox";
import { Field } from "../components/Field";
import { operationLabel, schedulableOperations } from "./operation-schedule-model";

export interface OperationPickerProps {
  id: string;
  operations: readonly ResolvedOperation[];
  value: string;
  onChange: (operationId: string) => void;
  disabled?: boolean;
  error?: string;
}

export function OperationPicker(_props: OperationPickerProps) {
  const { id, operations, value, onChange, disabled, error } = _props;
  const options = schedulableOperations(operations).map((operation) => ({
    value: operation.operation.operationId ?? "",
    label: operationLabel(operation),
    ...(operation.operation.description
      ? { description: operation.operation.description }
      : {}),
    ...(operation.operation.tags?.[0] ? { group: operation.operation.tags[0] } : {}),
  }));

  return (
    <Field
      label="Operation"
      htmlFor={id}
      required
      {...(error ? { error } : {})}
    >
      <Combobox
        id={id}
        ariaLabel="Operation"
        options={options}
        value={value}
        onChange={onChange}
        placeholder="Choose an operation"
        allowCustomValue={false}
        required
        ariaRequired
        invalid={Boolean(error)}
        {...(disabled != null ? { disabled } : {})}
      />
    </Field>
  );
}
