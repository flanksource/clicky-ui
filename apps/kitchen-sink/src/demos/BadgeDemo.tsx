import type { ReactNode } from "react";
import { Badge } from "@flanksource/clicky-ui";
import { DemoRow, DemoSection } from "./Section";

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
] as const;

const WRAPPING_BADGES = [
  ["container", "ghcr.io/flanksource/platform/incident-commander-controller"],
  ["image", "ghcr.io/flanksource/platform/incident-commander:v1.4.200-build.12"],
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

function DemoGroup({
  title,
  children,
}: {
  title: string;
  children: ReactNode;
}) {
  return (
    <div className="space-y-density-2">
      <h3 className="text-sm font-semibold text-foreground">{title}</h3>
      {children}
    </div>
  );
}

export function BadgeDemo() {
  return (
    <DemoSection
      id="badge"
      title="Badge"
      description="Legacy tone chips plus richer status, metadata, and clickable badge patterns."
    >
      <DemoGroup title="Legacy tone × variant matrix">
        {LEGACY_VARIANTS.map((variant) => (
          <DemoRow key={variant} label={variant}>
            {TONES.map((tone) => (
              <Badge key={tone} tone={tone} variant={variant}>
                {tone}
              </Badge>
            ))}
          </DemoRow>
        ))}
        <DemoRow label="Legacy extras">
          <Badge tone="danger" variant="solid" count={12}>
            errors
          </Badge>
          <Badge tone="success" icon="codicon:check">
            passed
          </Badge>
          <Badge tone="warning" size="lg">
            needs review
          </Badge>
        </DemoRow>
      </DemoGroup>

      <DemoGroup title="Semantic status and metadata badges">
        <div className="flex flex-wrap gap-density-2">
          {STATUS_BADGES.map(({ label, value, status, icon }) => (
            <Badge key={label} variant="status" status={status} label={label} value={value} icon={icon} size="xs" />
          ))}
          <Badge variant="metric" label="Latency" value="45ms" icon="lucide:activity" size="xs" />
          <Badge variant="custom" label="v2.4.1" icon="lucide:git-branch" color="#eef2ff" textColor="#4338ca" size="xs" />
          <Badge variant="outlined" label="Kubernetes" icon="lucide:boxes" borderColor="#326ce5" textColor="#326ce5" size="xs" />
        </div>
      </DemoGroup>

      <DemoGroup title="Split label | value badges">
        <div className="rounded-lg border border-border bg-muted/40 p-density-3">
          <div className="flex flex-wrap gap-density-2">
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
      </DemoGroup>

      <DemoGroup title="Wrapping and links">
        <div className="rounded-lg border border-border bg-muted/40 p-density-3">
          <div className="mb-density-2 flex flex-wrap gap-density-2">
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
          <div className="flex flex-wrap gap-density-2">
            <Badge variant="outlined" label="Docs" size="xs" href="https://flanksource.com" target="_blank" borderColor="#326ce5" textColor="#326ce5" />
            <Badge variant="custom" label="release notes" size="xs" href="#release-notes" color="#f5f3ff" textColor="#6d28d9" borderColor="#ddd6fe" />
            <Badge variant="label" label="run" value="3482" size="xs" href="#run-3482" className="bg-background" color="#dbeafe" textColor="#1d4ed8" />
          </div>
        </div>
      </DemoGroup>

      <DemoGroup title="Truncation styles">
        <div className="rounded-lg border border-border bg-muted/40 p-density-3">
          <div className="flex flex-wrap gap-density-2">
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
      </DemoGroup>
    </DemoSection>
  );
}
