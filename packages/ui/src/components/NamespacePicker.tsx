import { useEffect, useMemo, useState } from "react";
import { Combobox, type ComboboxOption } from "./Combobox";

// NamespacePicker selects a Kubernetes namespace. It is presentational: it
// fetches nothing — the consumer supplies an async `loadNamespaces` getter (e.g.
// backed by `/api/v1/namespaces`). The selected namespace is the value other
// form widgets (secret/workload pickers) read to scope their own lookups.

export type NamespacePickerProps = {
  /** Controlled selected namespace (or "" when cleared). */
  value: string;
  onChange: (value: string) => void;
  /** Async getter the component calls once to load namespace names. */
  loadNamespaces: () => Promise<string[]>;
  /**
   * When true, a non-empty value absent from the loaded set (once loading
   * settles) is flagged invalid. The value is still shown; freeform entry is
   * marked, not rejected.
   */
  strict?: boolean;
  placeholder?: string;
  className?: string;
};

export function NamespacePicker({
  value,
  onChange,
  loadNamespaces,
  strict = false,
  placeholder = "Select namespace…",
  className,
}: NamespacePickerProps) {
  const [namespaces, setNamespaces] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    loadNamespaces()
      .then((res) => {
        if (!cancelled) setNamespaces(res);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [loadNamespaces]);

  const options = useMemo<ComboboxOption[]>(() => {
    const opts = namespaces.map((ns) => ({ value: ns, label: ns }));
    // Pin a current value not present in the loaded set so the selection stays
    // visible (e.g. a namespace the user lacks list permission for).
    if (value && !namespaces.includes(value)) return [{ value, label: value }, ...opts];
    return opts;
  }, [namespaces, value]);

  const invalid = useMemo(
    () => strict && !!value && !loading && !namespaces.includes(value),
    [strict, value, loading, namespaces],
  );

  return (
    <Combobox
      options={options}
      value={value}
      onChange={onChange}
      allowCustomValue
      loading={loading}
      invalid={invalid}
      placeholder={placeholder}
      {...(className ? { className } : {})}
    />
  );
}
