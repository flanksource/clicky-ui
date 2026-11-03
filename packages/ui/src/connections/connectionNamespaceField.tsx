import { NamespacePicker } from "../components/NamespacePicker";
import { useMemo } from "react";
import type { KubernetesSelection } from "./connectionKubernetesSelection";
import { kubernetesURL } from "./connectionKubernetesSelection";
import type { ConnectionJsonFetcher } from "./connectionSchemaFormExtensions";
import type { FieldControl } from "../components/json-schema-form-types";

/**
 * The connection form's namespace control. `loadNamespaces` must keep a stable
 * identity across renders: NamespacePicker reloads whenever it changes.
 */
export function ConnectionNamespaceField({
  field,
  selection,
  fetcher,
  namespacesUrl,
}: {
  field: FieldControl;
  selection: KubernetesSelection;
  fetcher: ConnectionJsonFetcher;
  namespacesUrl: string;
}) {
  const load = useMemo(
    () => () =>
      fetcher<string[]>(
        kubernetesURL(namespacesUrl, {
          kubeconfig: selection.kubeconfig ?? "",
          kubecontext: selection.kubecontext ?? "",
        }),
      ),
    [fetcher, namespacesUrl, selection.kubeconfig, selection.kubecontext],
  );
  return (
    <NamespacePicker
      value={typeof field.value === "string" ? field.value : ""}
      onChange={field.onChange}
      loadNamespaces={load}
    />
  );
}
