import type { Meta, StoryObj } from "@storybook/react-vite";
import { useState } from "react";
import type { SecretKind, SecretResource } from "./SecretKeySelector";
import { EndpointSelector } from "./EndpointSelector";
import type {
  EndpointSelectorProps,
  EndpointSelectorValue,
} from "./EndpointSelector.model";
import type { WorkloadKind, WorkloadResource } from "./workload-picker-utils";

const WORKLOADS: Record<WorkloadKind, WorkloadResource[]> = {
  service: [
    {
      name: "opensearch",
      ports: [
        { name: "http", number: 9200 },
        { name: "metrics", number: 9600 },
      ],
    },
    {
      name: "postgres",
      ports: [{ name: "postgres", number: 5432 }],
    },
  ],
  ingress: [
    {
      name: "opensearch",
      hosts: ["search.example.com"],
    },
  ],
  deployment: [{ name: "opensearch" }],
  statefulset: [],
};

const SECRETS: Record<SecretKind, SecretResource[]> = {
  secret: [{ name: "search", keys: ["url"] }],
  configmap: [{ name: "endpoints", keys: ["search"] }],
  helm: [],
};

const loadWorkloads = async (kinds: WorkloadKind[]) =>
  Object.fromEntries(kinds.map((kind) => [kind, WORKLOADS[kind]])) as Record<
    WorkloadKind,
    WorkloadResource[]
  >;

const loadResources = async (kind: SecretKind) => SECRETS[kind];
const loadKeyPreview = async () => [];

function Playground({
  initial,
  ...props
}: {
  initial?: EndpointSelectorValue;
} & Omit<EndpointSelectorProps, "value" | "onChange">) {
  const [value, setValue] = useState<EndpointSelectorValue | undefined>(
    initial,
  );
  return (
    <div className="w-full max-w-3xl space-y-density-3">
      <EndpointSelector value={value} onChange={setValue} {...props} />
      <pre className="overflow-auto rounded-md border border-border bg-muted/30 p-density-3 text-xs">
        {JSON.stringify(value, null, 2)}
      </pre>
    </div>
  );
}

const meta = {
  title: "Components/EndpointSelector",
  component: EndpointSelector,
  parameters: {
    docs: {
      description: {
        component:
          "Selects how an endpoint is reached while keeping discovery consumer-owned. Consumers choose the enabled access modes, provide workload and reference loaders, and adapt the emitted typed value to their persisted format.",
      },
    },
  },
} satisfies Meta<typeof EndpointSelector>;

export default meta;
type Story = StoryObj<typeof meta>;

export const AllAccessModes: Story = {
  render: () => (
    <Playground
      initial={{
        mode: "service",
        target: { kind: "service", name: "opensearch", namespace: "platform" },
        port: "9200",
      }}
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
        loadResources,
        loadKeyPreview,
      }}
      showPath
      showScheme
      showIngressPort
      allowCustomPort
    />
  ),
};

export const OperatorModes: Story = {
  render: () => (
    <Playground
      initial={{
        mode: "service",
        target: { kind: "service", name: "opensearch", namespace: "platform" },
        scheme: "http",
        port: "9200",
        path: "/_cluster/health",
      }}
      namespace="platform"
      modes={["service", "ingress", "url", "api-proxy"]}
      loadWorkloads={loadWorkloads}
      urlSelector={{
        sources: ["secret", "configmap", "value"],
        loadResources,
        loadKeyPreview,
      }}
      defaults={{ scheme: "http", port: "9200" }}
      schemes={["http", "https"]}
      allowCustomScheme={false}
      showPath
      showScheme
      showIngressPort
      allowCustomPort
    />
  ),
};

export const CompactServiceFields: Story = {
  parameters: {
    docs: {
      description: {
        story:
          "The workload, closed scheme choice, compact port, and path share one row at the width used by configuration dialogs.",
      },
    },
  },
  render: () => (
    <div className="w-[45rem] max-w-full">
      <Playground
        initial={{
          mode: "service",
          target: {
            kind: "service",
            name: "opensearch",
            namespace: "platform",
          },
          scheme: "http",
          port: "9200",
          path: "/_cluster/health",
        }}
        namespace="platform"
        modes={["service", "api-proxy", "ingress", "url"]}
        loadWorkloads={loadWorkloads}
        urlSelector={{
          sources: ["secret", "configmap", "value"],
          loadResources,
          loadKeyPreview,
        }}
        schemes={["http", "https"]}
        allowCustomScheme={false}
        showPath
        showScheme
        showIngressPort
        allowCustomPort
      />
    </div>
  ),
};

export const ReferencedUrl: Story = {
  render: () => (
    <Playground
      initial={{
        mode: "url",
        source: { kind: "secret", name: "search", key: "url" },
      }}
      modes={["url", "service"]}
      loadWorkloads={loadWorkloads}
      urlSelector={{
        sources: ["secret", "configmap", "value"],
        loadResources,
        loadKeyPreview,
      }}
    />
  ),
};
