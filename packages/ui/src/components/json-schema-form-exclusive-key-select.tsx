import { Select } from "./select";

// ExclusiveKeySelect is the row label of exclusive keys (see exclusiveKeys): a
// dropdown of the keys by their titles, choosing the one the row's control
// edits. The control keeps an accessible name through a visually hidden label.
export function ExclusiveKeySelect({ keys, value, fieldId, disabled, onChange }: {
  keys: { key: string; label: string }[];
  value: string;
  /** The row control's input id. */
  fieldId: string;
  disabled: boolean;
  onChange: (key: string) => void;
}) {
  const chosen = keys.find((option) => option.key === value)?.label ?? value;
  return (
    <div className="w-36 shrink-0">
      <label htmlFor={fieldId} className="sr-only">{chosen}</label>
      <Select
        id={`${fieldId}-key`}
        aria-label={keys.map((option) => option.label).join(" / ")}
        value={value}
        disabled={disabled}
        options={keys.map((option) => ({ value: option.key, label: option.label }))}
        onChange={(event) => onChange(event.target.value)}
        className="h-7 text-xs font-medium"
      />
    </div>
  );
}
