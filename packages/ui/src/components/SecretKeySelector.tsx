import { useEffect, useMemo, useState, type ReactNode } from "react";
import { K8SSecret, K8SConfigmap } from "@flanksource/icons/mi";
import { cn } from "../lib/utils";
import { UiEdit } from "../icons";
import { Combobox, type ComboboxOption } from "./Combobox";

// SecretKeySelector picks a Secret or ConfigMap and one of its keys, with a
// mid-masked preview of every key's value so the operator can tell which key
// holds the host vs the db vs a password. It also offers a "Value" mode (on by
// default; opt out with `allowLiteral={false}`) for typing a static inline
// string. It is presentational: it fetches nothing — the consumer supplies
// async `loadResources` / `loadKeyPreview` getters. It emits a discriminated
// value the consumer lowers into whatever reference shape it needs.

export type SecretKind = "secret" | "configmap";

/** Toggle options: the two resource kinds plus the inline-literal mode. */
export type SecretValueSource = SecretKind | "value";

/** One key's mid-masked preview. `value` is already masked by the consumer. */
export type KeyPreview = { key: string; value: string };

/**
 * The selector's value: either a {kind,name,key} reference into a Secret /
 * ConfigMap, or a static inline literal ({kind:"value", value}).
 */
export type SecretKeyValue =
  | { kind: SecretKind; name: string; key: string }
  | { kind: "value"; value: string };

/** A named secret/configmap and its data key names (values never returned). */
export type SecretResource = { name: string; keys?: string[] };

export type SecretKeySelectorProps = {
  value: SecretKeyValue | undefined;
  onChange: (next: SecretKeyValue | undefined) => void;
  /** Loads the named kind's resources (name + data key names). */
  loadResources: (kind: SecretKind) => Promise<SecretResource[]>;
  /** Loads mid-masked previews for the named resource's keys. */
  loadKeyPreview: (kind: SecretKind, name: string) => Promise<KeyPreview[]>;
  /**
   * Offer a third "Value" toggle for typing a static inline literal. Enabled by
   * default; pass `false` to restrict the selector to Secret/ConfigMap
   * references only.
   */
  allowLiteral?: boolean;
  /**
   * When true, a chosen secret/configmap name absent from the loaded resources,
   * or a key absent from the chosen resource's keys, is flagged invalid (once
   * the respective load settles). The reference doesn't exist in the namespace.
   * The literal "Value" mode is never strict-flagged.
   */
  strict?: boolean;
  className?: string;
};

export function SecretKeySelector({
  value,
  onChange,
  loadResources,
  loadKeyPreview,
  allowLiteral = true,
  strict = false,
  className,
}: SecretKeySelectorProps) {
  const source: SecretValueSource = value?.kind ?? "secret";
  const isLiteral = source === "value";
  // A literal value carries no resource kind; the loaders default to "secret".
  const refKind: SecretKind = isLiteral ? "secret" : source;
  const selectedName = value && value.kind !== "value" ? value.name : "";
  const selectedKey = value && value.kind !== "value" ? value.key : "";
  const literalValue = value && value.kind === "value" ? value.value : "";

  const [resources, setResources] = useState<SecretResource[]>([]);
  const [resourcesLoading, setResourcesLoading] = useState(false);
  const [previews, setPreviews] = useState<KeyPreview[]>([]);
  const [previewLoading, setPreviewLoading] = useState(false);

  useEffect(() => {
    // Literal mode references no resource, so skip the list fetch entirely.
    if (isLiteral) return;
    let cancelled = false;
    setResourcesLoading(true);
    loadResources(refKind)
      .then((res) => !cancelled && setResources(res))
      .finally(() => !cancelled && setResourcesLoading(false));
    return () => {
      cancelled = true;
    };
  }, [loadResources, refKind, isLiteral]);

  useEffect(() => {
    if (!selectedName) {
      setPreviews([]);
      return;
    }
    let cancelled = false;
    setPreviewLoading(true);
    loadKeyPreview(refKind, selectedName)
      .then((res) => !cancelled && setPreviews(res))
      .catch(() => !cancelled && setPreviews([]))
      .finally(() => !cancelled && setPreviewLoading(false));
    return () => {
      cancelled = true;
    };
  }, [loadKeyPreview, refKind, selectedName]);

  const nameOptions = useMemo<ComboboxOption[]>(
    () => resources.map((r) => ({ value: r.name, label: r.name })),
    [resources],
  );
  const selectedResource = useMemo(
    () => resources.find((r) => r.name === selectedName),
    [resources, selectedName],
  );
  const keyOptions = useMemo(
    () => buildKeyOptions(selectedResource?.keys ?? [], previews, selectedKey),
    [selectedResource, selectedKey, previews],
  );

  // Strict validity: the name is invalid when it names no loaded resource; the
  // key is invalid when, with a resolved resource, it isn't one of that
  // resource's keys. The key list comes from the resource list (not previews),
  // so both are gated on resourcesLoading only.
  const nameInvalid = strict && !!selectedName && !resourcesLoading && !selectedResource;
  const keyInvalid =
    strict &&
    !!selectedKey &&
    !!selectedResource &&
    !resourcesLoading &&
    !(selectedResource.keys ?? []).includes(selectedKey);

  // Switching source resets the selection: a resource kind clears name+key; the
  // literal mode seeds an empty string (so onChange emits a value-kind value).
  const setSource = (next: SecretValueSource) =>
    onChange(next === "value" ? { kind: "value", value: "" } : { kind: next, name: "", key: "" });
  const setName = (name: string) =>
    onChange(name ? { kind: refKind, name, key: selectedKey } : undefined);
  const setKey = (key: string) =>
    selectedName ? onChange({ kind: refKind, name: selectedName, key }) : undefined;
  const setLiteral = (v: string) => onChange({ kind: "value", value: v });

  const sources: SecretValueSource[] = allowLiteral
    ? ["secret", "configmap", "value"]
    : ["secret", "configmap"];

  return (
    <div className={cn("flex items-center gap-2", className)}>
      <div className="flex shrink-0 overflow-hidden rounded border border-border text-xs">
        {sources.map((k) => {
          const Glyph = SOURCE_ICON[k];
          return (
            <button
              key={k}
              type="button"
              onClick={() => setSource(k)}
              className={cn(
                "flex items-center gap-1 whitespace-nowrap px-2 py-1",
                source === k
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted text-muted-foreground hover:bg-accent",
              )}
            >
              <Glyph className="h-3.5 w-3.5" />
              {SOURCE_LABEL[k]}
            </button>
          );
        })}
      </div>
      {isLiteral ? (
        <input
          type="text"
          value={literalValue}
          onChange={(e) => setLiteral(e.target.value)}
          placeholder="Static value…"
          className={cn(
            "h-control-h min-w-0 flex-1 rounded border border-input bg-background px-control-px text-sm",
            "outline-none focus-visible:ring-2 focus-visible:ring-ring",
          )}
        />
      ) : (
        <>
          <div className="w-44 shrink-0">
            <Combobox
              options={nameOptions}
              value={selectedName}
              onChange={setName}
              allowCustomValue
              loading={resourcesLoading}
              invalid={nameInvalid}
              placeholder={`Select ${refKind}…`}
            />
          </div>
          <div className="min-w-0 flex-1">
            <Combobox
              options={keyOptions}
              value={selectedKey}
              onChange={setKey}
              allowCustomValue
              loading={previewLoading}
              invalid={keyInvalid}
              placeholder={selectedName ? "Key…" : "—"}
            />
          </div>
        </>
      )}
    </div>
  );
}

// Icons share a className-only call shape; the flanksource FCs carry extra
// static metadata that doesn't unify with ComponentType, so type the slot as a
// plain render function instead.
const SOURCE_ICON: Record<SecretValueSource, (p: { className?: string }) => ReactNode> = {
  secret: K8SSecret,
  configmap: K8SConfigmap,
  value: UiEdit,
};

const SOURCE_LABEL: Record<SecretValueSource, string> = {
  secret: "Secret",
  configmap: "ConfigMap",
  value: "Value",
};

// buildKeyOptions labels each key with its mid-masked preview value when one is
// available. A selected key absent from the list is pinned so the selection
// stays visible.
function buildKeyOptions(
  keys: string[],
  previews: KeyPreview[],
  selectedKey: string,
): ComboboxOption[] {
  const masked = new Map(previews.map((p) => [p.key, p.value]));
  const base = keys.map((k) => ({
    value: k,
    label: masked.has(k) ? `${k} — ${masked.get(k)}` : k,
  }));
  if (selectedKey && !base.some((o) => o.value === selectedKey)) {
    return [{ value: selectedKey, label: selectedKey }, ...base];
  }
  return base;
}
