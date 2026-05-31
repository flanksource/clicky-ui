import { useState } from "react";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { Properties, type PropertiesItem } from "./Properties";

const meta: Meta<typeof Properties> = {
  title: "Data/Properties",
  component: Properties,
  args: {
    items: [
      { key: "namespace", value: "production" },
      { key: "owner", value: "platform" },
    ],
    density: "comfortable",
  },
  parameters: {
    layout: "padded",
    docs: {
      description: {
        component:
          "Two-column property list for dense metadata, raw payload fields, and detail panels. Rows support custom renderers, label icons, prefix/suffix actions, and expandable child content.",
      },
    },
  },
};

export default meta;
type Story = StoryObj<typeof Properties>;

const baseItems: PropertiesItem<string>[] = [
  { key: "namespace", value: "claims-demo" },
  { key: "pod", value: "policy-api-644b55c866-mg7tg" },
  { key: "container", value: "policy-api" },
  { key: "logger", value: "com.example.policy.filter.ServiceRequestFilter" },
  { key: "thread", value: "http-nio-8080-exec-6" },
];

export const Default: Story = {
  args: { items: baseItems },
};

export const WithIconsAndSubtitles: Story = {
  args: {
    items: [
      { key: "namespace", value: "claims-demo", subtitle: "Kubernetes namespace" },
      { key: "pod", value: "policy-api-644b55c866-mg7tg", subtitle: "Source pod" },
      { key: "container", value: "policy-api", subtitle: "Container name within pod" },
      { key: "timestamp", value: "2026-05-03T10:09:30.288Z", subtitle: "ECS @timestamp" },
      {
        key: "logger",
        value: "com.example.policy.filter.ServiceRequestFilter",
        subtitle: "Java logger",
      },
    ],
    labelIcon: (key) => {
      switch (key) {
        case "namespace":
          return "k8s-namespace";
        case "pod":
          return "k8s-pod";
        case "container":
          return "server";
        case "timestamp":
          return "clock";
        case "logger":
          return "log";
        default:
          return "info-circle";
      }
    },
  },
};

export const WithActions: Story = {
  args: {
    items: baseItems,
    suffixActions: [
      {
        id: "copy",
        icon: "copy",
        label: (key) => `Copy ${key}`,
        onClick: (_key, value) => {
          // eslint-disable-next-line no-console
          console.log("copy", value);
        },
      },
      {
        id: "edit",
        icon: "edit",
        label: (key) => `Edit ${key}`,
        onClick: (_key, value) => {
          // eslint-disable-next-line no-console
          console.log("edit", value);
        },
      },
    ],
  },
};

export const Expandable: Story = {
  render: () => {
    const [open, setOpen] = useState<Record<string, boolean>>({ tags: true });
    const items: PropertiesItem<unknown>[] = [
      { key: "namespace", value: "claims-demo" },
      { key: "pod", value: "policy-api-644b55c866-mg7tg" },
      {
        key: "tags",
        value: ["env=prod", "team=platform", "tier=api"],
        expandable: true,
        expanded: open.tags ?? false,
        onToggle: (next) => setOpen((s) => ({ ...s, tags: next })),
        renderChildren: () => (
          <Properties
            density="compact"
            items={["env=prod", "team=platform", "tier=api"].map((t, i) => ({
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
            items={Object.entries({
              "service.name": "policy-api",
              "process.thread.name": "http-nio-8080-exec-6",
            }).map(([k, v]) => ({ key: `attributes.${k}`, value: v }))}
          />
        ),
      },
    ];
    return (
      <Properties
        density="compact"
        items={items}
        prefixActions={[
          {
            id: "expand",
            icon: "expand-all",
            label: (key) => `Expand ${key}`,
            visible: (_k, _v, item) => !!item.expandable,
            disabled: (_k, _v, item) => !!item.expanded,
            onClick: (_k, _v, item) => item.onToggle?.(true),
          },
          {
            id: "collapse",
            icon: "collapse-all",
            label: (key) => `Collapse ${key}`,
            visible: (_k, _v, item) => !!item.expandable,
            disabled: (_k, _v, item) => !item.expanded,
            onClick: (_k, _v, item) => item.onToggle?.(false),
          },
        ]}
        suffixActions={[
          {
            id: "copy",
            icon: "copy",
            label: (key) => `Copy ${key}`,
            onClick: () => {},
          },
        ]}
      />
    );
  },
};

export const KitchenSink: Story = {
  render: () => {
    const [open, setOpen] = useState<Record<string, boolean>>({});
    const items: PropertiesItem<unknown>[] = [
      { key: "namespace", value: "claims-demo" },
      { key: "pod", value: "policy-api-644b55c866-mg7tg", subtitle: "Source pod" },
      { key: "timestamp", value: "2026-05-03T10:09:30.288Z", subtitle: "ECS @timestamp" },
      { key: "thread", value: "http-nio-8080-exec-6" },
      { key: "logger", value: "com.example.policy.filter.ServiceRequestFilter" },
      {
        key: "code",
        value: "GET /v1/policies?status=ACTIVE\nAccept: application/json",
        subtitle: "Sample request",
      },
      {
        key: "tags",
        value: ["env=prod", "team=platform", "tier=api", "region=eu-west-1"],
        expandable: true,
        expanded: open.tags ?? false,
        onToggle: (next) => setOpen((s) => ({ ...s, tags: next })),
        renderChildren: () => (
          <Properties
            density="compact"
            items={["env=prod", "team=platform", "tier=api", "region=eu-west-1"].map((t, i) => ({
              key: `tags.${i}`,
              value: t,
            }))}
          />
        ),
      },
      { key: "secret", value: "ssh-rsa AAA...", hidden: true },
    ];

    return (
      <Properties
        items={items}
        labelIcon={(key) => {
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
        }}
        prefixActions={[
          {
            id: "expand",
            icon: "expand-all",
            label: (key) => `Expand ${key}`,
            visible: (_k, _v, item) => !!item.expandable,
            disabled: (_k, _v, item) => !!item.expanded,
            onClick: (_k, _v, item) => item.onToggle?.(true),
          },
          {
            id: "collapse",
            icon: "collapse-all",
            label: (key) => `Collapse ${key}`,
            visible: (_k, _v, item) => !!item.expandable,
            disabled: (_k, _v, item) => !item.expanded,
            onClick: (_k, _v, item) => item.onToggle?.(false),
          },
        ]}
        suffixActions={[
          {
            id: "copy",
            icon: "copy",
            label: (key) => `Copy ${key}`,
            onClick: (_k, value) => {
              if (typeof navigator !== "undefined" && navigator.clipboard?.writeText) {
                void navigator.clipboard.writeText(String(value));
              }
            },
          },
          {
            id: "view",
            icon: "eye",
            label: (key) => `View ${key}`,
            onClick: () => {},
          },
        ]}
      />
    );
  },
};

export const Compact: Story = {
  args: {
    density: "compact",
    items: baseItems,
  },
};

export const LongList: Story = {
  args: {
    items: Array.from({ length: 50 }, (_, i) => ({
      key: `attribute_${i.toString().padStart(2, "0")}`,
      value: `value-${i}`,
    })),
    density: "compact",
  },
};
