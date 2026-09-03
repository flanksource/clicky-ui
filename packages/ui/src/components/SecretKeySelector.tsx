import { createElement, useEffect, useMemo, useState } from "react";
import {
  K8SSecret,
  K8SConfigmap,
  Helm,
  K8SServiceaccount,
  Vault,
} from "@flanksource/icons/mi";
import { type StaticIconComponent } from "../data/Icon";
import { cn } from "../lib/utils";
import { UiEdit } from "../icons";
import { Combobox, type ComboboxOption } from "./Combobox";
import { IconMenuPicker, type IconMenuOption } from "./icon-menu-picker";
import { OnePasswordSelector } from "./OnePasswordSelector";
import type { OnePasswordLoaders } from "./OnePasswordSelector.model";

// SecretKeySelector picks how a credential is sourced and lowers the choice into
// a single reference string the consumer persists. It supports Kubernetes
// Secrets and ConfigMaps (name + key), Helm release values (name + jsonpath
// key), a service-account token (name only), a 1Password reference
// (op://vault/item/field), and a static inline "Value". It is presentational:
// it fetches nothing — the consumer supplies async `loadResources` /
// `loadKeyPreview` (for keyed kinds) and optional `loadServiceAccounts` getters.

/** Kinds that reference a named resource plus one of its keys. */
export type SecretKind = "secret" | "configmap" | "helm";

/** Every source the picker can emit, including the non-keyed ones. */
export type SecretValueSource =
  | SecretKind
  | "serviceaccount"
  | "onepassword"
  | "value";

/** One key's mid-masked preview. `value` is already masked by the consumer. */
export type KeyPreview = { key: string; value: string };

/**
 * The selector's value: a {kind,name,key} reference into a Secret / ConfigMap /
 * Helm release, a service-account token by name, a 1Password op:// reference, or
 * a static inline literal.
 */
export type SecretKeyValue =
  | { kind: SecretKind; name: string; key: string }
  | { kind: "serviceaccount"; name: string }
  | { kind: "onepassword"; ref: string }
  | { kind: "value"; value: string };

/** A named secret/configmap/helm-release and its data key names (values never returned). */
export type SecretResource = { name: string; keys?: string[] };

export type SecretKeySelectorProps = {
  value: SecretKeyValue | undefined;
  onChange: (next: SecretKeyValue | undefined) => void;
  /** Loads the named keyed kind's resources (name + data key names). */
  loadResources: (kind: SecretKind) => Promise<SecretResource[]>;
  /** Loads mid-masked previews for the named keyed resource's keys. */
  loadKeyPreview: (kind: SecretKind, name: string) => Promise<KeyPreview[]>;
  /**
   * Loads the service-account names (no keys) for the "serviceaccount" source.
   * When omitted, that source's name field accepts freeform entry only.
   */
  loadServiceAccounts?: () => Promise<SecretResource[]>;
  /** Loads metadata for the cascading 1Password vault, item, and field pickers. */
  onePassword?: OnePasswordLoaders;
  /**
   * The sources offered in the picker, in order. Defaults to
   * `["secret", "configmap", "value"]` (or drops "value" when `allowLiteral` is
   * false). Pass an explicit list to offer helm / serviceaccount / onepassword.
   */
  sources?: SecretValueSource[];
  /**
   * Shorthand honoured only when `sources` is not supplied: `false` drops the
   * inline "Value" source, leaving Secret/ConfigMap. Ignored when `sources` is
   * given.
   */
  allowLiteral?: boolean;
  /**
   * When true, a chosen name absent from the loaded resources, or a key absent
   * from the chosen keyed resource's keys, is flagged invalid (once the load
   * settles). The onepassword and literal sources are never strict-flagged.
   */
  strict?: boolean;
  className?: string;
};

const DEFAULT_SOURCES: SecretValueSource[] = ["secret", "configmap", "value"];

const SHRINKABLE_FIELD = "max-w-full min-w-0 shrink";
const SOURCE_FIELD = `${SHRINKABLE_FIELD} basis-40 grow-0`;
const RESOURCE_FIELD = `${SHRINKABLE_FIELD} w-full basis-auto grow-0 @min-[22rem]/secret:basis-40`;
const KEY_FIELD = `${SHRINKABLE_FIELD} w-full basis-auto grow @min-[22rem]/secret:basis-72`;
const VALUE_FIELD = `${SHRINKABLE_FIELD} basis-64 grow`;

export function SecretKeySelector({
  value,
  onChange,
  loadResources,
  loadKeyPreview,
  loadServiceAccounts,
  onePassword,
  sources,
  allowLiteral = true,
  strict = false,
  className,
}: SecretKeySelectorProps) {
  const sourceList = useMemo<SecretValueSource[]>(
    () => sources ?? (allowLiteral ? DEFAULT_SOURCES : ["secret", "configmap"]),
    [sources, allowLiteral],
  );

  const source: SecretValueSource = value?.kind ?? sourceList[0] ?? "secret";
  const isKeyed =
    source === "secret" || source === "configmap" || source === "helm";
  const isServiceAccount = source === "serviceaccount";
  const isOnePassword = source === "onepassword";
  const isLiteral = source === "value";
  // A keyed source's refKind drives the loaders; other sources default to "secret".
  const refKind: SecretKind = isKeyed ? (source as SecretKind) : "secret";

  const selectedName =
    value && (value.kind === "serviceaccount" || isRefKind(value))
      ? value.name
      : "";
  const selectedKey = value && isRefKind(value) ? value.key : "";
  const literalValue = value && value.kind === "value" ? value.value : "";
  const opRef = value && value.kind === "onepassword" ? value.ref : "";

  const [resources, setResources] = useState<SecretResource[]>([]);
  const [resourcesLoading, setResourcesLoading] = useState(false);
  const [previews, setPreviews] = useState<KeyPreview[]>([]);
  const [previewLoading, setPreviewLoading] = useState(false);

  // Load the name list for keyed kinds (secret/configmap/helm) and, when a
  // loader is supplied, for the serviceaccount source. Other sources list nothing.
  useEffect(() => {
    const loader = isKeyed
      ? () => loadResources(refKind)
      : isServiceAccount && loadServiceAccounts
        ? loadServiceAccounts
        : null;
    if (!loader) {
      setResources([]);
      return;
    }
    let cancelled = false;
    setResourcesLoading(true);
    loader()
      .then((res) => !cancelled && setResources(res))
      .finally(() => !cancelled && setResourcesLoading(false));
    return () => {
      cancelled = true;
    };
  }, [loadResources, loadServiceAccounts, refKind, isKeyed, isServiceAccount]);

  useEffect(() => {
    if (!isKeyed || !selectedName) {
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
  }, [loadKeyPreview, refKind, selectedName, isKeyed]);

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
  // resource's keys. Only names from a listed source are checked (a
  // serviceaccount source with no loader lists nothing, so it never flags).
  const listsNames = isKeyed || (isServiceAccount && !!loadServiceAccounts);
  const nameInvalid =
    strict &&
    listsNames &&
    !!selectedName &&
    !resourcesLoading &&
    !selectedResource;
  const keyInvalid =
    strict &&
    isKeyed &&
    !!selectedKey &&
    !!selectedResource &&
    !resourcesLoading &&
    !(selectedResource.keys ?? []).includes(selectedKey);

  const setSource = (next: SecretValueSource) => {
    switch (next) {
      case "value":
        return onChange({ kind: "value", value: "" });
      case "onepassword":
        return onChange({ kind: "onepassword", ref: "" });
      case "serviceaccount":
        return onChange({ kind: "serviceaccount", name: "" });
      default:
        return onChange({ kind: next, name: "", key: "" });
    }
  };
  const setName = (name: string) => {
    if (isServiceAccount)
      return onChange(name ? { kind: "serviceaccount", name } : undefined);
    return onChange(
      name ? { kind: refKind, name, key: selectedKey } : undefined,
    );
  };
  const setKey = (key: string) =>
    selectedName
      ? onChange({ kind: refKind, name: selectedName, key })
      : undefined;
  const setLiteral = (v: string) => onChange({ kind: "value", value: v });
  const setOpRef = (ref: string) => onChange({ kind: "onepassword", ref });

  const sourceOptions = useMemo<ComboboxOption[]>(
    () =>
      sourceList.map((k) => ({
        value: k,
        label: SOURCE_LABEL[k],
        icon: createElement(SOURCE_ICON[k], { className: "size-4" }),
      })),
    [sourceList],
  );
  const sourceMenuOptions = useMemo<IconMenuOption<SecretValueSource>[]>(
    () =>
      sourceList.map((kind) => ({
        value: kind,
        label: SOURCE_LABEL[kind],
        icon: SOURCE_ICON[kind],
      })),
    [sourceList],
  );

  return (
    <div
      data-slot="secret-key-selector"
      className={cn("@container/secret w-full min-w-0", className)}
    >
      <div
        className="flex w-full max-w-full min-w-0 flex-nowrap items-center gap-2"
        data-slot="secret-fields"
      >
        <div
          className={cn(SOURCE_FIELD, "@max-md:hidden")}
          data-slot="secret-source-combobox"
        >
          <Combobox
            ariaLabel="Secret value source"
            options={sourceOptions}
            value={source}
            onChange={(next) => setSource(next as SecretValueSource)}
            allowCustomValue={false}
            required
          />
        </div>
        <div
          className="hidden shrink-0 @max-md:!block"
          data-slot="secret-source-menu"
        >
          <IconMenuPicker
            value={source}
            onChange={setSource}
            options={sourceMenuOptions}
            ariaLabel="Secret value source"
            triggerClassName="size-control-h rounded-md border border-input bg-background"
          />
        </div>
        {isLiteral ? (
          <TextField
            value={literalValue}
            onChange={setLiteral}
            placeholder="Static value…"
            ariaLabel="Static value"
          />
        ) : isOnePassword ? (
          (() => {
            if (!onePassword) {
              throw new Error(
                "SecretKeySelector onepassword source requires onePassword loaders",
              );
            }
            return (
              <div className={VALUE_FIELD} data-slot="secret-onepassword-field">
                <OnePasswordSelector
                  value={opRef}
                  onChange={setOpRef}
                  {...onePassword}
                  allowCustomValue
                />
              </div>
            );
          })()
        ) : isServiceAccount ? (
          <div
            className={VALUE_FIELD}
            data-slot="secret-serviceaccount-field"
          >
            <Combobox
              options={nameOptions}
              value={selectedName}
              onChange={setName}
              allowCustomValue
              loading={resourcesLoading}
              invalid={nameInvalid}
              placeholder="Service account…"
            />
          </div>
        ) : (
          <div
            className={cn(
              "flex flex-col items-center gap-2 @min-[22rem]/secret:flex-row",
              SHRINKABLE_FIELD,
              "grow",
            )}
            data-slot="secret-reference-fields"
          >
            <div
              className={RESOURCE_FIELD}
              data-slot="secret-resource-field"
            >
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
            <div className={KEY_FIELD} data-slot="secret-key-field">
              <Combobox
                options={keyOptions}
                value={selectedKey}
                onChange={setKey}
                allowCustomValue
                loading={previewLoading}
                invalid={keyInvalid}
                placeholder={selectedName ? keyPlaceholder(refKind) : "—"}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function TextField({
  value,
  onChange,
  placeholder,
  ariaLabel,
}: {
  value: string;
  onChange: (v: string) => void;
  placeholder: string;
  ariaLabel: string;
}) {
  return (
    <div className={VALUE_FIELD} data-slot="secret-value-fields">
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        aria-label={ariaLabel}
        className={cn(
          "h-control-h w-full min-w-0 rounded border border-input bg-background px-control-px text-sm",
          "outline-none focus-visible:ring-2 focus-visible:ring-ring",
        )}
      />
    </div>
  );
}

// isRefKind narrows to the keyed variants that carry both a name and a key.
function isRefKind(
  v: SecretKeyValue,
): v is { kind: SecretKind; name: string; key: string } {
  return v.kind === "secret" || v.kind === "configmap" || v.kind === "helm";
}

// keyPlaceholder hints the key field: helm keys are jsonpath expressions into
// the merged release values, the others are literal data keys.
function keyPlaceholder(kind: SecretKind): string {
  return kind === "helm" ? "jsonpath…" : "Key…";
}

// Each source's leading glyph. The flanksource FCs carry static metadata that
// doesn't unify with ComponentType, so type the slot as a plain render function.
const SOURCE_ICON: Record<SecretValueSource, StaticIconComponent> = {
  secret: K8SSecret,
  configmap: K8SConfigmap,
  helm: Helm,
  serviceaccount: K8SServiceaccount,
  onepassword: Vault,
  value: UiEdit,
};

const SOURCE_LABEL: Record<SecretValueSource, string> = {
  secret: "Secret",
  configmap: "ConfigMap",
  helm: "Helm",
  serviceaccount: "Service Account",
  onepassword: "1Password",
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
