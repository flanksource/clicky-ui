import { createElement } from "react";
import { SecretFormField } from "./SecretFormField";
import type {
  PostExtension,
  PostExtensionContext,
} from "./json-schema-form-types";
import type { OnePasswordLoaders } from "./OnePasswordSelector.model";
import type {
  KeyPreview,
  SecretKind,
  SecretResource,
  SecretValueSource,
} from "./SecretKeySelector";
import type {
  WorkloadKind,
  WorkloadResource,
} from "./workload-picker-utils";

export type SecretFormLoaders = {
  loadResources: (
    kind: SecretKind,
    namespace: string,
  ) => Promise<SecretResource[]>;
  loadKeyPreview: (
    kind: SecretKind,
    name: string,
    namespace: string,
  ) => Promise<KeyPreview[]>;
  loadServiceAccounts: (namespace: string) => Promise<SecretResource[]>;
  loadOnePasswordVaults: OnePasswordLoaders["loadVaults"];
  loadOnePasswordItems: OnePasswordLoaders["loadItems"];
  loadOnePasswordFields: OnePasswordLoaders["loadFields"];
  loadWorkloads: (
    namespace: string,
    kinds: WorkloadKind[],
  ) => Promise<Record<WorkloadKind, WorkloadResource[]>>;
};

export type SecretFormExtensionOptions = {
  loaders: SecretFormLoaders;
  secretSources?: SecretValueSource[];
  urlSources?: SecretValueSource[];
  getNamespace?: (rootValue: Record<string, unknown> | undefined) => string;
};

export function createSecretFormExtensions(
  options: SecretFormExtensionOptions,
): { post: PostExtension[] } {
  const post: PostExtension = (field, nodes, context) => {
    const component = field.schema["x-clicky-component"];
    if (
      component !== "k8s-secret-selector" &&
      component !== "k8s-url-selector"
    ) {
      return nodes;
    }
    return {
      label: nodes.label,
      value: createElement(SecretFormField, {
        ...options,
        field,
        namespace: namespaceFor(options, context),
        allowWorkload: component === "k8s-url-selector",
      }),
    };
  };
  return { post: [post] };
}

function namespaceFor(
  options: SecretFormExtensionOptions,
  context: PostExtensionContext | undefined,
): string {
  if (options.getNamespace) return options.getNamespace(context?.rootValue);
  const namespace = context?.rootValue?.namespace;
  return typeof namespace === "string" ? namespace : "";
}
