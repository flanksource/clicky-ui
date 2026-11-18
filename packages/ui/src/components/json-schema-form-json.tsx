import { useState } from "react";
import { InputField } from "./InputField";
import type { FieldControl } from "./json-schema-form-types";

export function JsonControl({ field, fieldId, readOnly }: { field: FieldControl; fieldId: string; readOnly: boolean }) {
  const serialized = field.nullable && field.value == null ? "" : JSON.stringify(field.value, null, 2) ?? "";
  const [draft, setDraft] = useState<{ source: string; text: string; error?: string }>({ source: serialized, text: serialized });
  const text = draft.source === serialized ? draft.text : serialized;
  const error = draft.source === serialized ? draft.error : undefined;
  return <div className="min-w-0">
    <InputField as="textarea" id={fieldId} aria-label={field.label} value={text} readOnly={readOnly} inputClassName="min-h-28 font-mono text-xs"
      clearable={field.nullable === true} clearLabel={`Clear ${field.label} to null`} onClear={() => { field.onChange(null); setDraft({ source: "", text: "" }); }}
      aria-invalid={Boolean(error)} onChange={(next) => {
        try {
          const value: unknown = JSON.parse(next);
          field.onChange(value);
          setDraft({ source: JSON.stringify(value, null, 2) ?? "", text: next });
        } catch (error) {
          setDraft({ source: serialized, text: next, error: error instanceof Error ? error.message : String(error) });
        }
      }} />
    {error && <p role="alert" className="text-xs text-destructive">{error}</p>}
  </div>;
}
