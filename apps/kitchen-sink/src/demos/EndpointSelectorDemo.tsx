import { useState } from "react";
import {
  EndpointSelector,
  type EndpointSelectorValue,
  type SecretKind,
  type WorkloadKind,
  type WorkloadResource,
} from "@flanksource/clicky-ui";
import { DemoSection } from "./Section";

const WORKLOADS: Record<WorkloadKind, WorkloadResource[]> = {
  service: [
    {
      name: "opensearch",
      ports: [
        { name: "http", number: 9200 },
        { name: "metrics", number: 9600 },
      ],
    },
  ],
  ingress: [
    {
      name: "opensearch",
      hosts: ["search.example.com"],
    },
  ],
  pod: [],
  deployment: [{ name: "opensearch" }],
  statefulset: [],
  daemonset: [],
};

const loadWorkloads = async (kinds: WorkloadKind[]) =>
  Object.fromEntries(kinds.map((kind) => [kind, WORKLOADS[kind]])) as Record<
    WorkloadKind,
    WorkloadResource[]
  >;

export function EndpointSelectorDemo() {
  const [value, setValue] = useState<EndpointSelectorValue | undefined>({
    mode: "service",
    target: { kind: "service", name: "opensearch", namespace: "platform" },
    scheme: "http",
    port: "9200",
  });

  return (
    <DemoSection
      id="endpoint-selector"
      title="EndpointSelector"
      description="Consumer-scoped endpoint access modes with Kubernetes discovery and URL references."
    >
      <div className="max-w-3xl space-y-density-3">
        <EndpointSelector
          value={value}
          onChange={setValue}
          namespace="platform"
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
            sources: ["secret", "configmap", "value"],
            loadResources: async (_kind: SecretKind) => [],
            loadKeyPreview: async () => [],
          }}
          schemes={["http", "https"]}
          showScheme
          showPath
          showIngressPort
          allowCustomPort
        />
        <pre className="overflow-auto rounded-md border border-border bg-muted/30 p-density-3 text-xs">
          {JSON.stringify(value, null, 2)}
        </pre>
      </div>
    </DemoSection>
  );
}
