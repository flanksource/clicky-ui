import { useMemo } from "react";
import { SecretFormField } from "../components/SecretFormField";
import type { FieldControl } from "../components/json-schema-form-types";
import type { EndpointExtraMode } from "../components/EndpointSelector.model";
import type { ConnectionSecretSources } from "./connectionSchemaFormExtensions";
import type { SecretFormLoaders } from "../components/secret-form-extension";
import type { KubernetesSelection } from "./connectionKubernetesSelection";

export function ConnectionSecretField({
  field,
  createLoaders,
  selection,
  namespace,
  endpointExtraMode,
  ...sources
}: ConnectionSecretSources & {
  field: FieldControl;
  createLoaders: (selection: KubernetesSelection) => SecretFormLoaders;
  selection: KubernetesSelection;
  namespace: string;
  endpointExtraMode?: EndpointExtraMode | undefined;
}) {
  const loaders = useMemo(
    () =>
      createLoaders({
        kubeconfig: selection.kubeconfig ?? "",
        kubecontext: selection.kubecontext ?? "",
      }),
    [createLoaders, selection.kubeconfig, selection.kubecontext],
  );
  return (
    <SecretFormField
      key={`${selection.kubeconfig ?? ""}/${selection.kubecontext ?? ""}`}
      field={field}
      namespace={namespace}
      allowWorkload={field.schema["x-clicky-component"] === "k8s-url-selector"}
      loaders={loaders}
      {...(endpointExtraMode ? { endpointExtraMode } : {})}
      {...sources}
    />
  );
}
