import { useCallback } from "react";
import { WorkloadPicker } from "../../components/WorkloadPicker";
import type {
  WorkloadKind,
  WorkloadResource,
} from "../../components/workload-picker-utils";
import type { BrowserTarget } from "../connections/connectionBrowserModel";
import { fetchJSON } from "../connections/connectionBrowserModel";
import {
  kubernetesWorkloadTargetValue,
  withKubernetesWorkloadTarget,
} from "./kubernetesWorkloadTarget";

type KubernetesWorkloadTargetPickerProps = {
  baseUrl: string;
  target: Extract<BrowserTarget, { kind: "kubernetes-workload" }>;
  query: string;
  onChange: (query: string) => void;
};

export function KubernetesWorkloadTargetPicker({
  baseUrl,
  target,
  query,
  onChange,
}: KubernetesWorkloadTargetPickerProps) {
  const loadNamespaces = useCallback(
    () => fetchJSON<string[]>(`${baseUrl}/namespaces`),
    [baseUrl],
  );
  const loadWorkloads = useCallback(
    (kinds: WorkloadKind[], namespace?: string) => {
      if (!namespace) {
        return Promise.reject(
          new Error("Kubernetes workload discovery requires a namespace"),
        );
      }
      const query = new URLSearchParams({
        namespace,
        kinds: kinds.join(","),
      });
      return fetchJSON<Record<WorkloadKind, WorkloadResource[]>>(
        `${baseUrl}/workloads?${query.toString()}`,
      );
    },
    [baseUrl],
  );

  return (
    <div className="space-y-density-2">
      <p className="text-xs font-medium text-foreground">{target.label}</p>
      <WorkloadPicker
        value={kubernetesWorkloadTargetValue(query)}
        onChange={(value) => onChange(withKubernetesWorkloadTarget(value))}
        loadNamespaces={loadNamespaces}
        loadWorkloads={loadWorkloads}
        kinds={target.kinds}
        allowNamespaceSelection
        allowCustomValue={false}
        strict
      />
    </div>
  );
}
