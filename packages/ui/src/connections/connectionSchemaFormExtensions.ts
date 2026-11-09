import { createElement } from "react";
import { JsonSchemaForm } from "../components/JsonSchemaForm";
import { effectiveProperties } from "../components/json-schema-form-conditionals";
import { rehydrateRefs } from "../components/json-schema-form-refs";
import type {
  PostExtension,
  PostExtensionContext,
  PreExtension,
} from "../components/json-schema-form-runtime-types";
import type {
  FieldControl,
  JsonSchemaObject,
  JsonSchemaProperty,
} from "../components/json-schema-form-types";
import { isPlainObject } from "../lib/collections";
import { ConnectionHostPortField } from "./ConnectionHostPortField";
import { InputField } from "../components/InputField";
import type { EndpointExtraMode } from "../components/EndpointSelector.model";
import { UiHardDrive } from "../icons";
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
  /**
   * Where kubeconfig / kubecontext are edited: `"form"` (default) renders them
   * as a form row; `"external"` leaves them out for a host that places
   * `ConnectionKubernetesContext` elsewhere, e.g. in the dialog header.
   */
  kubernetes?: "form" | "external";
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

/** The selected connection type's root fields and its nested `properties` fields. */
type ConnectionBranch = {
  root: Record<string, JsonSchemaProperty>;
  nested: Record<string, JsonSchemaProperty>;
};

type RootEditor = Required<
  Pick<PostExtensionContext, "rootValue" | "onRootChange">
>;

const hoisted = (prop: JsonSchemaProperty | undefined) =>
  prop?.["x-clicky-hoist"] === true;

/** A hoisted host and port render as one `host : port` row. */
const pairsHostPort = (branch: ConnectionBranch) =>
  hoisted(branch.nested.host) && hoisted(branch.nested.port);

/**
 * The editable URL selector whose mode tabs carry the `host : port` pair as
 * one more mode, when the branch has both.
 */
const hostPortEndpointKey = (branch: ConnectionBranch) =>
  pairsHostPort(branch)
    ? Object.keys(branch.root).find((key) => {
        const prop = branch.root[key];
        return (
          prop?.["x-clicky-component"] === "k8s-url-selector" &&
          prop.readOnly !== true
        );
      })
    : undefined;

/** An editable namespace picker renders beside the name, on the name's row. */
const namespaceBesideName = (branch: ConnectionBranch) =>
  branch.root.name !== undefined &&
  branch.root.name.readOnly !== true &&
  branch.root.namespace?.["x-clicky-component"] === NAMESPACE_COMPONENT &&
  branch.root.namespace.readOnly !== true;

/** kubeconfig / kubecontext render as one row in place of their own section. */
const kubernetesOnOneRow = (branch: ConnectionBranch) =>
  branch.nested.kubeconfig !== undefined && branch.nested.kubecontext !== undefined;

function rootEditor(context: {
  rootValue?: Record<string, unknown> | undefined;
  onRootChange?: ((next: Record<string, unknown>) => void) | undefined;
}): RootEditor | undefined {
  return context.rootValue && context.onRootChange
    ? { rootValue: context.rootValue, onRootChange: context.onRootChange }
    : undefined;
}

function rootProperties(root: Record<string, unknown>): Record<string, unknown> {
  return isPlainObject(root.properties) ? root.properties : {};
}

/** Writes one key of the connection's `properties` map; an empty value removes it. */
function setRootProperty(editor: RootEditor, key: string, next: string) {
  const properties = { ...rootProperties(editor.rootValue) };
  if (next) properties[key] = next;
  else delete properties[key];
  editor.onRootChange({ ...editor.rootValue, properties });
}

/** A `properties.<key>` field rendered outside its object, editing the root value. */
function rootPropertyField(
  editor: RootEditor,
  key: string,
  schema: JsonSchemaProperty,
): FieldControl {
  return {
    key,
    kind: "string",
    label: schema.title ?? key,
    ...(schema.description ? { description: schema.description } : {}),
    required: false,
    schema,
    value: rootProperties(editor.rootValue)[key],
    onChange: (next) =>
      setRootProperty(editor, key, typeof next === "string" ? next : ""),
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
  kubernetes = "form",
}: ConnectionSchemaFormExtensionsOptions): Required<ConnectionFormExtensions> {
  const sources = connectionSecretSources(schema);
  const namespacesUrl = `${stripTrailingSlashes(apiBase)}/connections/namespaces`;
  const createLoaders = (selection: KubernetesSelection) =>
    connectionSecretLoaders({
      apiBase,
      fetcher: (url) => fetcher(kubernetesURL(url, selection)),
    });
  const resolvedSchema = rehydrateRefs(schema);
  const branchOf = (root: Record<string, unknown>): ConnectionBranch => {
    const properties = effectiveProperties(resolvedSchema, root).properties;
    return { root: properties, nested: properties.properties?.properties ?? {} };
  };
  const base = `${stripTrailingSlashes(apiBase)}/connections`;
  const kubernetesField = (field: FieldControl, context: PostExtensionContext) =>
    createElement(ConnectionKubernetesField, { field, context, base, fetcher });

  const layoutPre: PreExtension = (field, ctx) => {
    const editor = rootEditor(ctx);
    if (!editor || field.readOnly) return field;
    const branch = branchOf(editor.rootValue);
    if (hoisted(field.schema) && pairsHostPort(branch)) {
      if (field.key === "port") return null;
      // The URL selector's Host:Port mode renders the pair.
      if (field.key === "host" && hostPortEndpointKey(branch)) return null;
      if (field.key === "host") {
        return { ...field, label: `${field.label}:${branch.nested.port?.title ?? "Port"}` };
      }
    }
    // The endpoint mode tabs need the full row to stay on one line.
    if (field.schema["x-clicky-component"] === "k8s-url-selector") {
      return { ...field, colSpan: "full" };
    }
    if (namespaceBesideName(branch)) {
      // The name's row renders the namespace picker beside it.
      if (field.key === "namespace") return null;
      if (field.key === "name") return { ...field, colSpan: "full" };
    }
    return field;
  };

  const namespaceField = (field: FieldControl, root: Record<string, unknown>) =>
    createElement(ConnectionNamespaceField, {
      field,
      selection: connectionKubernetesSelection(root),
      fetcher,
      namespacesUrl,
    });

  const columnLabel = (text: string) =>
    createElement("span", { className: "text-sm font-medium" }, text);

  /** Kubeconfig and kubecontext on one labelled row. */
  const kubernetesRow = (editor: RootEditor, branch: ConnectionBranch) => {
    const { kubeconfig, kubecontext } = branch.nested;
    if (!kubeconfig || !kubecontext) {
      throw new Error("connection kubernetes row needs kubeconfig and kubecontext");
    }
    return createElement(
      "div",
      { className: "grid grid-cols-1 gap-x-2 gap-y-1.5 sm:grid-cols-2", role: "group", "aria-label": "Kubernetes" },
      columnLabel(kubeconfig.title ?? "Kubeconfig"),
      columnLabel(kubecontext.title ?? "Kubecontext"),
      kubernetesField(rootPropertyField(editor, "kubeconfig", kubeconfig), editor),
      kubernetesField(rootPropertyField(editor, "kubecontext", kubecontext), editor),
    );
  };

  /** The URL selector's `Host:Port` mode: host and port inputs editing `properties`. */
  const hostPortEndpointMode = (
    editor: RootEditor,
    branch: ConnectionBranch,
  ): EndpointExtraMode => {
    const { host, port } = branch.nested;
    if (!host || !port) {
      throw new Error("connection Host:Port mode needs host and port");
    }
    const values = rootProperties(editor.rootValue);
    const text = (key: string) =>
      typeof values[key] === "string" ? values[key] : "";
    const hostLabel = host.title ?? "Host";
    return {
      id: "host-port",
      label: hostLabel,
      icon: UiHardDrive,
      active: text("host") !== "" || text("port") !== "",
      content: createElement(
        "div",
        { className: "space-y-1" },
        createElement(ConnectionHostPortField, {
          host: createElement(InputField, {
            "aria-label": hostLabel,
            placeholder: hostLabel,
            ...(host.description ? { title: host.description } : {}),
            value: text("host"),
            onChange: (next: string) => setRootProperty(editor, "host", next),
          }),
          port: text("port"),
          portSchema: port,
          onPortChange: (next) => setRootProperty(editor, "port", next),
        }),
        host.description
          ? createElement(
              "p",
              { className: "text-xs text-muted-foreground" },
              host.description,
            )
          : null,
      ),
    };
  };

  const namespacePost: PostExtension = (field, nodes, context) => {
    const editor = context ? rootEditor(context) : undefined;
    const branch = editor ? branchOf(editor.rootValue) : undefined;
    if (editor && branch && field.key === "name" && namespaceBesideName(branch)) {
      const namespace = branch.root.namespace!;
      const namespaceControl: FieldControl = {
        key: "namespace",
        kind: "string",
        label: namespace.title ?? "Namespace",
        required: false,
        schema: namespace,
        value: editor.rootValue.namespace,
        onChange: (next) => editor.onRootChange({ ...editor.rootValue, namespace: next }),
      };
      return {
        label: createElement(
          "div",
          { className: "grid grid-cols-2 gap-2" },
          nodes.label,
          columnLabel(namespaceControl.label),
        ),
        value: createElement(
          "div",
          { className: "grid grid-cols-2 gap-2" },
          nodes.value,
          namespaceField(namespaceControl, editor.rootValue),
        ),
      };
    }
    if (
      editor &&
      branch &&
      !field.readOnly &&
      field.key === "host" &&
      hoisted(field.schema) &&
      pairsHostPort(branch)
    ) {
      const port = rootProperties(editor.rootValue).port;
      return {
        ...nodes,
        value: createElement(ConnectionHostPortField, {
          host: nodes.value,
          port: typeof port === "string" ? port : "",
          portSchema: branch.nested.port ?? {},
          onPortChange: (next) => setRootProperty(editor, "port", next),
        }),
      };
    }
    if (
      field.key === "properties" &&
      field.schema.properties?.kubeconfig &&
      field.schema.properties?.kubecontext
    ) {
      const { kubeconfig, kubecontext, ...others } = field.schema.properties;
      const kubernetesOnRow =
        !field.readOnly && editor && branch && kubernetesOnOneRow(branch)
          ? kubernetesRow(editor, branch)
          : undefined;
      // Hoisted fields (host/port/database) already render beside the URL.
      const rest = Object.fromEntries(
        Object.entries(others).filter(([, property]) => property["x-clicky-hoist"] !== true),
      );
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
          kubernetes === "external" ? null : kubernetesOnRow ??
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
      return { ...nodes, value: kubernetesField(field, context ?? {}) };
    }
    if (
      !field.readOnly &&
      (component === "k8s-secret-selector" || component === "k8s-url-selector")
    ) {
      const hostPortMode =
        editor && branch && field.key === hostPortEndpointKey(branch)
          ? hostPortEndpointMode(editor, branch)
          : undefined;
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
          endpointExtraMode: hostPortMode,
          ...sources,
        }),
      };
    }
    if (
      field.readOnly ||
      field.schema["x-clicky-component"] !== NAMESPACE_COMPONENT
    )
      return nodes;
    return { label: nodes.label, value: namespaceField(field, context?.rootValue ?? {}) };
  };
  return { pre: [layoutPre], post: [namespacePost] };
}
