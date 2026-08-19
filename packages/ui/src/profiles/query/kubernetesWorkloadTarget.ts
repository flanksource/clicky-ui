import {
  namespaceKey,
  parseWorkloadKey,
  type WorkloadKind,
} from "../../components/workload-picker-utils";

const providerKindByPickerKind: Partial<Record<WorkloadKind, string>> = {
  pod: "Pod",
  deployment: "Deployment",
  statefulset: "StatefulSet",
  daemonset: "DaemonSet",
};

const pickerKindByProviderKind = Object.fromEntries(
  Object.entries(providerKindByPickerKind).map(([picker, provider]) => [provider, picker]),
) as Record<string, WorkloadKind>;

function selectorValue(query: string, field: string): string {
  const match = query.match(new RegExp(`(?:^|\\s)${field}=([^\\s|()]+)`));
  return match?.[1] ?? "";
}

// kubernetesWorkloadTargetValue reads the picker value back out of a saved
// query. A `namespace=` selector with no kind/name is a namespace-scoped query —
// every workload in it — and comes back as the namespace-only key so the picker
// shows the namespace instead of opening blank.
export function kubernetesWorkloadTargetValue(query: string): string {
  const providerKind = selectorValue(query, "kind");
  const namespace = selectorValue(query, "namespace");
  const name = selectorValue(query, "name");
  const pickerKind = pickerKindByProviderKind[providerKind];
  if (pickerKind && namespace && name) return `${namespace}/${pickerKind}/${name}`;
  return namespaceKey(namespace);
}

// withKubernetesWorkloadTarget renders the picker value as the provider's target
// selector. A namespace-only value keeps the `namespace=` selector on its own,
// which the provider resolves to every pod in that namespace.
export function withKubernetesWorkloadTarget(value: string): string {
  if (!value) return "";

  const target = parseWorkloadKey(value);
  if (!target.namespace) {
    throw new Error(`expected a namespaced Kubernetes workload, got ${value}`);
  }
  if (!target.name) return `namespace=${target.namespace}`;
  if (!target.kind) {
    throw new Error(`expected a namespaced Kubernetes workload, got ${value}`);
  }
  const providerKind = providerKindByPickerKind[target.kind];
  if (!providerKind) {
    throw new Error(`unsupported Kubernetes workload kind ${target.kind}`);
  }
  return `kind=${providerKind} namespace=${target.namespace} name=${target.name}`;
}
