import { useEffect, useId, useState } from "react";
import { JsonSchemaForm } from "../../../components/JsonSchemaForm";
import type { JsonSchemaObject } from "../../../components/json-schema-form-types";

// Variables are edited via the prompt's declared schema when present, otherwise
// as a raw JSON object; the raw text is held locally and only committed to the
// host when it parses to an object.
export function VariablesField({
  schema,
  value,
  onChange,
  onValidityChange,
}: {
  schema?: JsonSchemaObject | undefined;
  value: Record<string, unknown>;
  onChange: (next: Record<string, unknown>) => void;
  onValidityChange?: ((valid: boolean) => void) | undefined;
}) {
  const idPrefix = useId();
  const [rawText, setRawText] = useState(() => stringifyVariables(value));
  const [rawError, setRawError] = useState<string | null>(null);
  const [editing, setEditing] = useState(false);
  const serializedValue = stringifyVariables(value);

  useEffect(() => {
    if (editing) return;
    setRawText(serializedValue);
    setRawError(null);
  }, [editing, serializedValue]);

  if (schema) {
    return (
      <JsonSchemaForm
        idPrefix={`prompt-vars-${idPrefix}`}
        schema={schema}
        value={value}
        onChange={(next) => onChange(next as Record<string, unknown>)}
        size="sm"
      />
    );
  }

  const commit = (text: string) => {
    setRawText(text);
    if (!text.trim()) {
      setRawError(null);
      onValidityChange?.(true);
      onChange({});
      return;
    }
    try {
      const parsed = JSON.parse(text);
      if (parsed && typeof parsed === "object" && !Array.isArray(parsed)) {
        setRawError(null);
        onValidityChange?.(true);
        onChange(parsed as Record<string, unknown>);
      } else {
        setRawError("Expected a JSON object");
        onValidityChange?.(false);
      }
    } catch (error) {
      setRawError(error instanceof Error ? error.message : "Invalid JSON");
      onValidityChange?.(false);
    }
  };

  return (
    <div className="space-y-1">
      <textarea
        value={rawText}
        onFocus={() => setEditing(true)}
        onBlur={() => setEditing(false)}
        onChange={(event) => commit(event.target.value)}
        spellCheck={false}
        placeholder="{}"
        aria-label="Variables JSON"
        className="h-28 w-full resize-y rounded-md border border-border bg-background px-density-2 py-density-1 font-mono text-xs outline-none focus:ring-2 focus:ring-ring"
      />
      {rawError && <div className="text-xs text-destructive">{rawError}</div>}
    </div>
  );
}

function stringifyVariables(value: Record<string, unknown>) {
  if (!value || Object.keys(value).length === 0) return "{}";
  return JSON.stringify(value, null, 2);
}
