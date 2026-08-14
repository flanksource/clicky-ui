import { parseWorkloadKey, type WorkloadKind } from "../../components/workload-picker-utils";

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

export function kubernetesWorkloadTargetValue(query: string): string {
  const providerKind = selectorValue(query, "kind");
  const namespace = selectorValue(query, "namespace");
  const name = selectorValue(query, "name");
  const pickerKind = pickerKindByProviderKind[providerKind];
  return pickerKind && namespace && name ? `${namespace}/${pickerKind}/${name}` : "";
}

export function withKubernetesWorkloadTarget(value: string): string {
  if (!value) return "";

  const target = parseWorkloadKey(value);
  if (!target.namespace || !target.kind || !target.name) {
    throw new Error(`expected a namespaced Kubernetes workload, got ${value}`);
  }
  const providerKind = providerKindByPickerKind[target.kind];
  if (!providerKind) {
    throw new Error(`unsupported Kubernetes workload kind ${target.kind}`);
  }
  return `kind=${providerKind} namespace=${target.namespace} name=${target.name}`;
}
