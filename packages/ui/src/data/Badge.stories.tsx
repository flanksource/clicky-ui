import type { ReactNode } from "react";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { Badge } from "./Badge";

const meta: Meta<typeof Badge> = {
  title: "Data/Badge",
  component: Badge,
  parameters: {
    layout: "padded",
  },
};

export default meta;
type Story = StoryObj<typeof Badge>;

const TONES = ["neutral", "success", "danger", "warning", "info"] as const;
const LEGACY_VARIANTS = ["soft", "solid", "outline"] as const;

const STATUS_BADGES = [
  { label: "Healthy", value: "ready", status: "success" as const, icon: "lucide:check" },
  { label: "Degraded", value: "latency", status: "warning" as const, icon: "lucide:triangle-alert" },
  { label: "Failed", value: "blocked", status: "error" as const, icon: "lucide:circle-x" },
  { label: "Pending", value: "queued", status: "info" as const, icon: "lucide:info" },
];

const FIELD_VALUE_BADGES = [
  ["engine", "postgresql"],
  ["env", "production"],
  ["region", "eu-west-1"],
  ["tier", "critical"],
  ["owner", "platform"],
  ["cluster", "mission-control"],
  ["backup", "nightly"],
  ["retention", "35d"],
  ["replicas", "3"],
  ["cost-center", "infra-ops"],
] as const;

const WRAPPING_BADGES = [
  ["container", "ghcr.io/flanksource/platform/incident-commander-controller"],
  ["image", "ghcr.io/flanksource/platform/incident-commander:v1.4.200-build.12"],
  ["from", "sha256:42e5e2378f81f1b8d0355ab5b12a47f3b7ac91dbd5f3f65a174d4021c9d3eb18"],
  ["to", "sha256:8cd15af2d1364a5cb4f8df25e7c6291e67c9dbf6d137db4403228c4a37d00412"],
] as const;

const TRUNCATION_BADGES = [
  {
    label: "prefix",
    value: "incident-commander-controller-production-eu-west-1",
    truncate: "prefix" as const,
    maxWidth: 20,
  },
  {
    label: "suffix",
    value: "mission-control-platform-config-reconciliation-job",
    truncate: "suffix" as const,
    maxWidth: 20,
  },
  {
    label: "arn",
    value: "arn:aws:eks:eu-west-1:123456789012:cluster/production-mission-control",
    truncate: "arn" as const,
    maxWidth: 20,
  },
  {
    label: "image",
    value: "ghcr.io/flanksource/platform/mission-control-api:v2.4.1-build.17",
    truncate: "image" as const,
    maxWidth: 20,
  },
  {
    label: "path",
    value: "/configs/production/platform/mission-control.yaml",
    truncate: "path" as const,
    maxWidth: 20,
  },
  {
    label: "url",
    value: "https://console.flanksource.com/configs/production/mission-control.yaml?env=prod",
    truncate: "url" as const,
    maxWidth: 20,
  },
  {
    label: "auto",
    value: "ghcr.io/flanksource/platform/mission-control-worker:v2.4.1-build.17",
    truncate: "auto" as const,
    maxWidth: 20,
  },
] as const;

function StoryStack({ children }: { children: ReactNode }) {
  return <div className="space-y-density-3">{children}</div>;
}

function StoryGroup({
  title,
  description,
  children,
}: {
  title: string;
  description?: string;
  children: ReactNode;
}) {
  return (
    <div className="space-y-density-2">
      <div className="space-y-1">
        <h3 className="text-sm font-semibold text-foreground">{title}</h3>
        {description && <p className="text-xs text-muted-foreground">{description}</p>}
      </div>
      {children}
    </div>
  );
}

export const Overview: Story = {
  render: () => (
    <div className="flex flex-wrap gap-density-2">
      <Badge variant="status" status="success" label="Build" value="passing" icon="lucide:check" />
      <Badge variant="metric" label="Latency" value="45ms" icon="lucide:activity" />
      <Badge variant="custom" label="v2.4.1" icon="lucide:git-branch" color="#eef2ff" textColor="#4338ca" />
      <Badge variant="outlined" label="Kubernetes" icon="lucide:boxes" borderColor="#326ce5" textColor="#326ce5" />
      <Badge variant="label" label="env" value="production" color="#dcfce7" textColor="#15803d" />
    </div>
  ),
};

export const LegacyMatrix: Story = {
  render: () => (
    <StoryStack>
      {LEGACY_VARIANTS.map((variant) => (
        <div key={variant} className="flex flex-wrap items-center gap-density-2">
          <span className="w-20 text-xs text-muted-foreground">{variant}</span>
          {TONES.map((tone) => (
            <Badge key={tone} tone={tone} variant={variant}>
              {tone}
            </Badge>
          ))}
        </div>
      ))}
      <div className="flex flex-wrap items-center gap-density-2">
        <Badge tone="danger" variant="solid" count={12}>
          errors
        </Badge>
        <Badge tone="success" icon="codicon:check">
          passed
        </Badge>
        <Badge tone="warning" size="lg">
          needs review
        </Badge>
      </div>
    </StoryStack>
  ),
};

export const StatusBadges: Story = {
  render: () => (
    <div className="flex flex-wrap gap-density-2">
      {STATUS_BADGES.map(({ label, value, status, icon }) => (
        <Badge key={label} variant="status" status={status} label={label} value={value} icon={icon} size="xs" />
      ))}
    </div>
  ),
};

export const CustomOutlinedColors: Story = {
  render: () => (
    <div className="flex flex-wrap gap-density-2">
      <Badge variant="outlined" label="Kubernetes" icon="lucide:boxes" borderColor="#326ce5" textColor="#326ce5" size="xs" />
      <Badge variant="outlined" label="Helm" icon="lucide:ship-wheel" borderColor="#0f1689" textColor="#0f1689" size="xs" />
      <Badge variant="outlined" label="Flux" icon="lucide:zap" borderColor="#5468ff" textColor="#5468ff" size="xs" />
      <Badge variant="outlined" label="ArgoCD" icon="lucide:route" borderColor="#ef7b4d" textColor="#ef7b4d" size="xs" />
    </div>
  ),
};

export const LabelValueHooks: Story = {
  render: () => (
    <div className="rounded-lg border border-border bg-muted/40 p-density-3">
      <div className="flex flex-wrap gap-density-2">
        <Badge
          variant="label"
          label="container"
          value="incident-commander"
          color="#dbeafe"
          textColor="#1d4ed8"
          size="xs"
          className="bg-background"
          labelClassName="uppercase tracking-[0.03em]"
          valueClassName="font-mono text-foreground"
        />
        <Badge
          variant="label"
          label="namespace"
          value="mc"
          color="#dcfce7"
          textColor="#15803d"
          size="xs"
          className="bg-background"
          labelClassName="uppercase tracking-[0.03em]"
          valueClassName="font-semibold text-foreground"
        />
        <Badge
          variant="label"
          label="strategy"
          value="rolling"
          color="#ede9fe"
          textColor="#6d28d9"
          size="xs"
          className="bg-background"
          labelClassName="uppercase tracking-[0.03em]"
          valueClassName="font-medium text-foreground"
        />
      </div>
    </div>
  ),
};

export const Sizes: Story = {
  render: () => (
    <div className="flex flex-wrap items-center gap-density-2">
      <Badge variant="status" status="success" label="xxs" size="xxs" icon="lucide:check" />
      <Badge variant="status" status="success" label="xs" size="xs" icon="lucide:check" />
      <Badge variant="status" status="success" label="sm" size="sm" icon="lucide:check" />
      <Badge variant="status" status="success" label="md" size="md" icon="lucide:check" />
      <Badge variant="status" status="success" label="lg" size="lg" icon="lucide:check" />
    </div>
  ),
};

export const Shapes: Story = {
  render: () => (
    <div className="flex flex-wrap gap-density-2">
      <Badge variant="status" status="info" label="pill" shape="pill" size="xs" icon="lucide:shield-check" />
      <Badge variant="status" status="info" label="rounded" shape="rounded" size="xs" icon="lucide:shield-check" />
      <Badge variant="status" status="info" label="square" shape="square" size="xs" icon="lucide:shield-check" />
    </div>
  ),
};

export const WrappedMetadata: Story = {
  render: () => (
    <StoryStack>
      <StoryGroup
        title="Dense field:value bands"
        description="Let compact metadata wrap across lines before switching to a table."
      >
        <div className="rounded-lg border border-border bg-muted/40 p-density-3">
          <div className="flex max-w-[28rem] flex-wrap gap-density-2">
            {FIELD_VALUE_BADGES.map(([label, value]) => (
              <Badge
                key={label}
                variant="label"
                label={label}
                value={value}
                color="#dbeafe"
                textColor="#1d4ed8"
                size="xxs"
                className="bg-background"
                labelClassName="uppercase tracking-[0.03em]"
                valueClassName="font-medium text-foreground"
              />
            ))}
          </div>
        </div>
      </StoryGroup>
      <StoryGroup
        title="Wrapped xxs badges for long values"
        description="Use wrap when dense metadata must stay badge-shaped but long values cannot remain single-line."
      >
        <div className="rounded-lg border border-border bg-muted/40 p-density-3">
          <div className="flex max-w-[28rem] flex-wrap gap-density-2">
            {WRAPPING_BADGES.map(([label, value]) => (
              <Badge
                key={label}
                variant="label"
                label={label}
                value={value}
                color={label === "to" ? "#dcfce7" : "#dbeafe"}
                textColor={label === "to" ? "#15803d" : "#1d4ed8"}
                size="xxs"
                wrap
                maxWidth={20}
                className="bg-background"
                labelClassName="uppercase tracking-[0.03em]"
                valueClassName="font-mono text-foreground"
              />
            ))}
          </div>
        </div>
      </StoryGroup>
      <StoryGroup
        title="Truncation styles"
        description="Use maxWidth with semantic truncation modes when values must stay single-line but preserve the meaningful part."
      >
        <div className="rounded-lg border border-border bg-muted/40 p-density-3">
          <div className="flex max-w-[32rem] flex-wrap gap-density-2">
            {TRUNCATION_BADGES.map(({ label, value, truncate, maxWidth }) => (
              <Badge
                key={label}
                variant="label"
                label={label}
                value={value}
                color="#dbeafe"
                textColor="#1d4ed8"
                size="xxs"
                maxWidth={maxWidth}
                truncate={truncate}
                className="bg-background"
                labelClassName="uppercase tracking-[0.03em]"
                valueClassName="font-mono text-foreground"
              />
            ))}
          </div>
        </div>
      </StoryGroup>
    </StoryStack>
  ),
};

export const Clickable: Story = {
  render: () => (
    <div className="flex flex-wrap gap-density-2">
      <Badge variant="outlined" label="Docs" size="xs" href="https://flanksource.com" target="_blank" borderColor="#326ce5" textColor="#326ce5" />
      <Badge variant="custom" label="release notes" size="xs" href="#release-notes" color="#f5f3ff" textColor="#6d28d9" borderColor="#ddd6fe" />
      <Badge variant="label" label="run" value="3482" size="xs" href="#run-3482" className="bg-background" color="#dbeafe" textColor="#1d4ed8" />
    </div>
  ),
};

export const BestPractices: Story = {
  render: () => (
    <StoryStack>
      <div className="rounded-lg border border-border bg-muted/40 p-density-3">
        <ul className="list-disc space-y-1 pl-4 text-sm text-foreground">
          <li>Use badges for scan-friendly metadata and state, not for long explanations.</li>
          <li>Reserve stronger color for semantics like risk, state, or workflow stage.</li>
          <li>Prefer `size=&quot;xs&quot;` for rows that mix prose with many metadata tokens.</li>
          <li>Use split `label | value` badges when field names repeat across rows.</li>
          <li>Turn on `wrap` before adding one-off CSS for long metadata values.</li>
        </ul>
      </div>
      <div className="rounded-lg border border-border overflow-hidden">
        <div className="grid grid-cols-[10rem_1fr_9rem] border-b border-border bg-muted/40 text-xs font-semibold text-muted-foreground">
          <div className="px-density-3 py-density-2">service</div>
          <div className="px-density-3 py-density-2">status</div>
          <div className="px-density-3 py-density-2">version</div>
        </div>
        <div className="grid grid-cols-[10rem_1fr_9rem] items-center border-b border-border/60 text-sm">
          <div className="px-density-3 py-density-2">api-gateway</div>
          <div className="px-density-3 py-density-2">
            <Badge variant="status" status="success" label="Healthy" value="ready" size="xs" icon="lucide:check" />
          </div>
          <div className="px-density-3 py-density-2">
            <Badge variant="custom" label="v2.4.1" size="xs" color="#eef2ff" textColor="#4338ca" borderColor="#c7d2fe" />
          </div>
        </div>
        <div className="grid grid-cols-[10rem_1fr_9rem] items-center text-sm">
          <div className="px-density-3 py-density-2">worker-pool</div>
          <div className="px-density-3 py-density-2">
            <Badge variant="status" status="warning" label="Degraded" value="backpressure" size="xs" icon="lucide:triangle-alert" />
          </div>
          <div className="px-density-3 py-density-2">
            <Badge variant="outlined" label="canary" size="xs" borderColor="#f59e0b" textColor="#b45309" />
          </div>
        </div>
      </div>
    </StoryStack>
  ),
};

export const MixedUsage: Story = {
  render: () => (
    <div className="flex flex-wrap gap-density-2">
      <Badge variant="metric" label="CPU" value="42%" icon="lucide:activity" size="xs" />
      <Badge variant="metric" label="Memory" value="8.2 GB" icon="lucide:server" size="xs" />
      <Badge variant="metric" label="Uptime" value="99.9%" icon="lucide:cloud" size="xs" />
      <Badge variant="metric" label="Latency" value="12ms" icon="lucide:clock-3" size="xs" />
      <Badge variant="custom" color="#fdf2f8" textColor="#be185d" label="Production" icon="lucide:rocket" size="xs" />
      <Badge variant="custom" color="#ecfdf5" textColor="#065f46" label="Secured" icon="lucide:lock" size="xs" />
      <Badge variant="custom" color="#fffbeb" textColor="#92400e" label="Beta" icon="lucide:zap" size="xs" />
      <Badge variant="custom" color="#eef2ff" textColor="#4338ca" label="v2.4.1" icon="lucide:git-branch" size="xs" />
    </div>
  ),
};
