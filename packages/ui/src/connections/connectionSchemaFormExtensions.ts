import { createElement } from "react";
import { JsonSchemaForm } from "../components/JsonSchemaForm";
import type { PostExtension } from "../components/json-schema-form-runtime-types";
import type { JsonSchemaObject } from "../components/json-schema-form-types";
import type { SecretValueSource } from "../components/SecretKeySelector";
import { type SecretFormLoaders } from "../components/secret-form-extension";
import { stripTrailingSlashes } from "../lib/string";
import { ConnectionNamespaceField } from "./connectionNamespaceField";
import type { ConnectionFormExtensions } from "./connectionsPageModel";
import { ConnectionKubernetesField } from "./ConnectionKubernetesField";
import {
  connectionKubernetesSelection,
  kubernetesURL,
  type KubernetesSelection,
} from "./connectionKubernetesSelection";
import { ConnectionSecretField } from "./ConnectionSecretField";

const NAMESPACE_COMPONENT = "k8s-namespace-selector";
const SECRET_SOURCES_HINT = "x-clicky-secret-sources";
const URL_SOURCES_HINT = "x-clicky-url-sources";

const ALL_SECRET_SOURCES: readonly SecretValueSource[] = [
  "secret",
  "configmap",
  "helm",
  "serviceaccount",
  "onepassword",
  "value",
];
const DEFAULT_URL_SOURCES = ALL_SECRET_SOURCES.filter(
  (source) => source !== "serviceaccount",
);

/** Fetches `url` and returns its JSON body, rejecting on a non-2xx answer. */
export type ConnectionJsonFetcher = <T>(url: string) => Promise<T>;

export type ConnectionSchemaFormExtensionsOptions = {
  /** Where the commons-db connections service is mounted, e.g. `/api/v1`. */
  apiBase: string;
  /** The connection JSON Schema the service serves; its root carries the source hints. */
  schema: JsonSchemaObject;
  /** Defaults to `fetch`, the request the dashboard and Test / Resolve use. */
  fetcher?: ConnectionJsonFetcher;
};

export type ConnectionSecretSources = {
  secretSources: SecretValueSource[];
  urlSources: SecretValueSource[];
};

const fetchJson: ConnectionJsonFetcher = async <T>(url: string) => {
  const response = await fetch(url, {
    headers: { Accept: "application/json" },
  });
  if (!response.ok) {
    throw new Error(
      `GET ${url} failed with ${response.status}: ${(await response.text()).trim()}`,
    );
  }
  return (await response.json()) as T;
};

function sourcesHint(
  schema: JsonSchemaObject,
  hint: string,
  fallback: readonly SecretValueSource[],
): SecretValueSource[] {
  const declared = schema[hint];
  if (declared === undefined) return [...fallback];
  if (!Array.isArray(declared) || declared.length === 0) {
    throw new Error(
      `connection schema ${hint} must be a non-empty array of secret sources`,
    );
  }
  return declared.map((source) => {
    if (!ALL_SECRET_SOURCES.includes(source as SecretValueSource)) {
      throw new Error(
        `connection schema ${hint} lists unknown source ${JSON.stringify(source)}; expected one of ${ALL_SECRET_SOURCES.join(", ")}`,
      );
    }
    return source as SecretValueSource;
  });
}

/**
 * The value sources a connection form offers, read from the schema's root
 * `x-clicky-secret-sources` / `x-clicky-url-sources` hints (the per-app policy
 * commons-db serves). A hint the schema omits falls back to every source, and
 * for URLs to every source but `serviceaccount`.
 */
export function connectionSecretSources(
  schema: JsonSchemaObject,
): ConnectionSecretSources {
  return {
    secretSources: sourcesHint(schema, SECRET_SOURCES_HINT, ALL_SECRET_SOURCES),
    urlSources: sourcesHint(schema, URL_SOURCES_HINT, DEFAULT_URL_SOURCES),
  };
}

function namespaceQuery(namespace: string): string {
  return namespace ? `&namespace=${encodeURIComponent(namespace)}` : "";
}

/** The secret-catalog loaders, on `{apiBase}/connections/{secrets,workloads,…}`. */
export function connectionSecretLoaders({
  apiBase,
  fetcher = fetchJson,
}: {
  apiBase: string;
  fetcher?: ConnectionJsonFetcher;
}): SecretFormLoaders {
  const base = `${stripTrailingSlashes(apiBase)}/connections`;
  return {
    loadResources: (kind, namespace) =>
      fetcher(`${base}/secrets?kind=${kind}${namespaceQuery(namespace)}`),
    loadKeyPreview: (kind, name, namespace) =>
      fetcher(
        `${base}/secrets/preview?kind=${kind}&name=${encodeURIComponent(name)}${namespaceQuery(namespace)}`,
      ),
    loadServiceAccounts: (namespace) =>
      fetcher(
        `${base}/secrets?kind=serviceaccount${namespaceQuery(namespace)}`,
      ),
    loadOnePasswordVaults: () => fetcher(`${base}/secrets/onepassword/vaults`),
    loadOnePasswordItems: (vaultID) =>
      fetcher(
        `${base}/secrets/onepassword/items?vault=${encodeURIComponent(vaultID)}`,
      ),
    loadOnePasswordFields: (vaultID, itemID) =>
      fetcher(
        `${base}/secrets/onepassword/fields?vault=${encodeURIComponent(vaultID)}&item=${encodeURIComponent(itemID)}`,
      ),
    loadWorkloads: (namespace, kinds) =>
      fetcher(
        `${base}/workloads?namespace=${encodeURIComponent(namespace)}&kinds=${kinds.join(",")}`,
      ),
  };
}

/**
 * The connection form's Kubernetes pickers, built from the served schema: the
 * namespace selector (`x-clicky-component: "k8s-namespace-selector"`, skipped on
 * read-only fields) and the secret / URL selectors, offering only the sources
 * the schema's `x-clicky-*-sources` hints allow. Every lookup goes to
 * `{apiBase}/connections/…`, the routes commons-db mounts with its secret
 * catalog. `ConnectionsPage` applies this by default; an
 * EntityExplorerApp host passes it as its form extensions.
 */
export function connectionSchemaFormExtensions({
  apiBase,
  schema,
  fetcher = fetchJson,
}: ConnectionSchemaFormExtensionsOptions): Required<ConnectionFormExtensions> {
  const sources = connectionSecretSources(schema);
  const namespacesUrl = `${stripTrailingSlashes(apiBase)}/connections/namespaces`;
  const createLoaders = (selection: KubernetesSelection) =>
    connectionSecretLoaders({
      apiBase,
      fetcher: (url) => fetcher(kubernetesURL(url, selection)),
    });
  const namespacePost: PostExtension = (field, nodes, context) => {
    if (
      field.key === "properties" &&
      field.schema.properties?.kubeconfig &&
      field.schema.properties?.kubecontext
    ) {
      const { kubeconfig, kubecontext, ...rest } = field.schema.properties;
      const renderGroup = (title: string, groupSchema: JsonSchemaObject) =>
        createElement(
          "section",
          { className: "space-y-2", "aria-label": title },
          createElement(
            "h3",
            { className: "text-sm font-medium border-b pb-2" },
            title,
          ),
          createElement(JsonSchemaForm, {
            schema: groupSchema,
            value: (field.value ?? {}) as Record<string, unknown>,
            onChange: field.onChange,
            ...(context?.rootValue ? {rootValue: context.rootValue} : {}),
            ...(context?.onRootChange ? {onRootChange: context.onRootChange} : {}),
            ...(context?.instancePath ? {instancePath: context.instancePath} : {}),
            readOnly: field.readOnly === true,
            post: [namespacePost],
            showPreferencesMenu: false,
          }),
        );
      return {
        label: null,
        value: createElement(
          "div",
          { className: "space-y-4" },
          renderGroup("Kubernetes resolution", {
            type: "object",
            "x-columns": 2,
            properties: { kubeconfig, kubecontext },
          }),
          Object.keys(rest).length
            ? renderGroup(field.label, { ...field.schema, type: "object", properties: rest })
            : null,
        ),
      };
    }
    const selection = connectionKubernetesSelection(context?.rootValue);
    const component = field.schema["x-clicky-component"];
    if (
      !field.readOnly &&
      (component === "k8s-context-selector" ||
        component === "k8s-kubeconfig-selector")
    ) {
      return {
        ...nodes,
        value: createElement(ConnectionKubernetesField, {
          field,
          context,
          base: `${stripTrailingSlashes(apiBase)}/connections`,
          fetcher,
        }),
      };
    }
    if (
      !field.readOnly &&
      (component === "k8s-secret-selector" || component === "k8s-url-selector")
    ) {
      return {
        ...nodes,
        value: createElement(ConnectionSecretField, {
          field,
          createLoaders,
          selection,
          namespace:
            typeof context?.rootValue?.namespace === "string"
              ? context.rootValue.namespace
              : "",
          ...sources,
        }),
      };
    }
    if (
      field.readOnly ||
      field.schema["x-clicky-component"] !== NAMESPACE_COMPONENT
    )
      return nodes;
    return {
      label: nodes.label,
      value: createElement(ConnectionNamespaceField, {
        field,
        selection,
        fetcher,
        namespacesUrl,
      }),
    };
  };
  return { pre: [], post: [namespacePost] };
}
