import { useState } from "react";
import { Properties, type PropertiesItem } from "@flanksource/clicky-ui";
import { DemoSection } from "./Section";

const baseItems: PropertiesItem<string>[] = [
  { key: "namespace", value: "claims-demo" },
  { key: "pod", value: "policy-api-644b55c866-mg7tg" },
  { key: "container", value: "policy-api" },
  { key: "logger", value: "com.example.policy.filter.ServiceRequestFilter" },
  { key: "thread", value: "http-nio-8080-exec-6" },
];

const iconForKey = (key: string): string => {
  switch (key) {
    case "namespace":
      return "k8s-namespace";
    case "pod":
      return "k8s-pod";
    case "container":
      return "server";
    case "timestamp":
      return "clock";
    case "thread":
      return "tag";
    case "logger":
      return "log";
    case "code":
      return "code";
    case "tags":
      return "label";
    default:
      return "info-circle";
  }
};

function copy(value: unknown) {
  if (typeof navigator !== "undefined" && navigator.clipboard?.writeText) {
    void navigator.clipboard.writeText(typeof value === "string" ? value : JSON.stringify(value));
  }
}

export function PropertiesDemo() {
  const [open, setOpen] = useState<Record<string, boolean>>({ tags: true });

  const expandableItems: PropertiesItem<unknown>[] = [
    { key: "namespace", value: "claims-demo" },
    { key: "pod", value: "policy-api-644b55c866-mg7tg", subtitle: "Source pod" },
    { key: "timestamp", value: "2026-05-03T10:09:30.288Z", subtitle: "ECS @timestamp" },
    {
      key: "tags",
      value: ["env=prod", "team=platform", "tier=api", "region=eu-west-1"],
      expandable: true,
      expanded: open.tags ?? false,
      onToggle: (next) => setOpen((s) => ({ ...s, tags: next })),
      renderChildren: () => (
        <Properties
          density="compact"
          className="mt-density-1"
          items={["env=prod", "team=platform", "tier=api", "region=eu-west-1"].map((t, i) => ({
            key: `tags.${i}`,
            value: t,
          }))}
        />
      ),
    },
    {
      key: "attributes",
      value: { "service.name": "policy-api", "process.thread.name": "http-nio-8080-exec-6" },
      expandable: true,
      expanded: open.attributes ?? false,
      onToggle: (next) => setOpen((s) => ({ ...s, attributes: next })),
      renderChildren: () => (
        <Properties
          density="compact"
          className="mt-density-1"
          items={Object.entries({
            "service.name": "policy-api",
            "process.thread.name": "http-nio-8080-exec-6",
          }).map(([k, v]) => ({ key: `attributes.${k}`, value: v }))}
        />
      ),
    },
    { key: "secret", value: "ssh-rsa AAA...", hidden: true },
  ];

  return (
    <DemoSection
      id="properties"
      title="Properties"
      description="Long lists of K=V entries with optional label icons, subtitles, and per-row prefix/suffix actions. Used by LogsTable's expanded-row detail view."
    >
      <div className="space-y-density-4">
        <div className="space-y-density-2">
          <h3 className="text-sm font-semibold text-muted-foreground">Default</h3>
          <Properties items={baseItems} />
        </div>

        <div className="space-y-density-2">
          <h3 className="text-sm font-semibold text-muted-foreground">Label icons + subtitles</h3>
          <Properties
            items={[
              { key: "namespace", value: "claims-demo", subtitle: "Kubernetes namespace" },
              { key: "pod", value: "policy-api-644b55c866-mg7tg", subtitle: "Source pod" },
              { key: "container", value: "policy-api", subtitle: "Container in pod" },
              { key: "timestamp", value: "2026-05-03T10:09:30.288Z", subtitle: "ECS @timestamp" },
              { key: "logger", value: "com.example.policy.filter.ServiceRequestFilter" },
            ]}
            labelIcon={iconForKey}
          />
        </div>

        <div className="space-y-density-2">
          <h3 className="text-sm font-semibold text-muted-foreground">
            Suffix actions (copy / view / edit)
          </h3>
          <Properties
            items={baseItems}
            suffixActions={[
              {
                id: "copy",
                icon: "copy",
                label: (key) => `Copy ${key}`,
                onClick: (_k, value) => copy(value),
              },
              {
                id: "view",
                icon: "eye",
                label: (key) => `View ${key}`,
                onClick: () => {},
              },
              {
                id: "edit",
                icon: "edit",
                label: (key) => `Edit ${key}`,
                onClick: () => {},
              },
            ]}
          />
        </div>

        <div className="space-y-density-2">
          <h3 className="text-sm font-semibold text-muted-foreground">
            Compact density + expandable nested rows (LogsTable detail view)
          </h3>
          <Properties
            density="compact"
            items={expandableItems}
            labelIcon={iconForKey}
            prefixActions={[
              {
                id: "expand",
                icon: "lucide:zoom-in",
                label: (key) => `Expand ${key}`,
                visible: (_k, _v, item) => !!item.expandable,
                disabled: (_k, _v, item) => !!item.expanded,
                onClick: (_k, _v, item) => item.onToggle?.(true),
              },
              {
                id: "collapse",
                icon: "lucide:zoom-out",
                label: (key) => `Collapse ${key}`,
                visible: (_k, _v, item) => !!item.expandable,
                disabled: (_k, _v, item) => !item.expanded,
                onClick: (_k, _v, item) => item.onToggle?.(false),
              },
            ]}
            suffixActions={[
              {
                id: "copy",
                icon: "lucide:copy",
                label: (key) => `Copy ${key}`,
                onClick: (_k, value) => copy(value),
              },
            ]}
          />
        </div>

        <div className="space-y-density-2">
          <h3 className="text-sm font-semibold text-muted-foreground">
            Long list (50 entries, compact)
          </h3>
          <div className="max-h-96 overflow-auto">
            <Properties
              density="compact"
              items={Array.from({ length: 50 }, (_, i) => ({
                key: `attribute_${i.toString().padStart(2, "0")}`,
                value: `value-${i}`,
              }))}
            />
          </div>
        </div>
      </div>
    </DemoSection>
  );
}
