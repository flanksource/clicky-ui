import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { EndpointSelector } from "./EndpointSelector";
import {
  parseEndpointValue,
  serializeEndpointValue,
  type EndpointSelectorValue,
} from "./EndpointSelector.model";
import {
  parseSecretRef,
  serializeSecretRef,
} from "./SecretKeySelector.model";
import {
  SecretKeySelector,
  type SecretKeyValue,
} from "./SecretKeySelector";
import type { FieldControl } from "./json-schema-form-types";
import type { SecretFormExtensionOptions } from "./secret-form-extension";

export type SecretFormFieldProps = SecretFormExtensionOptions & {
  field: FieldControl;
  namespace: string;
  allowWorkload: boolean;
};

function defaultSecretValue(source: unknown): SecretKeyValue | undefined {
  switch (source) {
    case "value":
      return { kind: "value", value: "" };
    case "onepassword":
      return { kind: "onepassword", ref: "" };
    case "serviceaccount":
      return { kind: "serviceaccount", name: "" };
    case "secret":
    case "configmap":
    case "helm":
      return { kind: source, name: "", key: "" };
    default:
      return undefined;
  }
}

function useFieldDraft<T>({
  raw,
  parsed,
  seeded,
  serialize,
  onChange,
}: {
  raw: unknown;
  parsed: T | undefined;
  seeded: T | undefined;
  serialize: (next: T | undefined) => string;
  onChange: (next: unknown) => void;
}): [T | undefined, (next: T | undefined) => void] {
  const rawString = typeof raw === "string" ? raw : "";
  const [draft, setDraft] = useState<T | undefined>();
  const committed = useRef(rawString);

  useEffect(() => {
    if (rawString === committed.current) return;
    committed.current = rawString;
    setDraft(undefined);
  }, [rawString]);

  const commit = useCallback(
    (next: T | undefined) => {
      setDraft(next);
      const serialized = serialize(next);
      committed.current = serialized;
      onChange(serialized);
    },
    [onChange, serialize],
  );

  return [draft ?? parsed ?? seeded, commit];
}

export function SecretFormField({
  field,
  namespace,
  allowWorkload,
  loaders,
  secretSources,
  urlSources,
}: SecretFormFieldProps) {
  const loadResources = useCallback(
    (kind: Parameters<typeof loaders.loadResources>[0]) =>
      loaders.loadResources(kind, namespace),
    [loaders, namespace],
  );
  const loadKeyPreview = useCallback(
    (kind: Parameters<typeof loaders.loadKeyPreview>[0], name: string) =>
      loaders.loadKeyPreview(kind, name, namespace),
    [loaders, namespace],
  );
  const loadServiceAccounts = useCallback(
    () => loaders.loadServiceAccounts(namespace),
    [loaders, namespace],
  );
  const loadWorkloads = useCallback(
    (kinds: Parameters<typeof loaders.loadWorkloads>[1]) =>
      loaders.loadWorkloads(namespace, kinds),
    [loaders, namespace],
  );
  const onePassword = useMemo(
    () => ({
      loadVaults: loaders.loadOnePasswordVaults,
      loadItems: loaders.loadOnePasswordItems,
      loadFields: loaders.loadOnePasswordFields,
    }),
    [loaders],
  );

  const defaultSource = field.schema["x-clicky-default-source"];
  const [secretValue, changeSecret] = useFieldDraft<SecretKeyValue>({
    raw: field.value,
    parsed: parseSecretRef(field.value),
    seeded: defaultSecretValue(defaultSource),
    serialize: serializeSecretRef,
    onChange: field.onChange,
  });
  const endpointSeed = defaultSecretValue(defaultSource);
  const [endpointValue, changeEndpoint] = useFieldDraft<EndpointSelectorValue>({
    raw: field.value,
    parsed: parseEndpointValue(field.value),
    seeded: endpointSeed ? { mode: "url", source: endpointSeed } : undefined,
    serialize: serializeEndpointValue,
    onChange: field.onChange,
  });

  if (allowWorkload) {
    return (
      <EndpointSelector
        value={endpointValue}
        onChange={changeEndpoint}
        namespace={namespace}
        modes={[
          "url",
          "service",
          "cluster-ip",
          "api-proxy",
          "ingress",
          "port-forward",
        ]}
        loadWorkloads={loadWorkloads}
        urlSelector={{
          loadResources,
          loadKeyPreview,
          loadServiceAccounts,
          onePassword,
          ...(urlSources ? { sources: urlSources } : {}),
        }}
        showPath
        showIngressPort
        allowCustomPort
      />
    );
  }

  return (
    <SecretKeySelector
      value={secretValue}
      onChange={changeSecret}
      loadResources={loadResources}
      loadKeyPreview={loadKeyPreview}
      loadServiceAccounts={loadServiceAccounts}
      onePassword={onePassword}
      {...(secretSources ? { sources: secretSources } : {})}
    />
  );
}
