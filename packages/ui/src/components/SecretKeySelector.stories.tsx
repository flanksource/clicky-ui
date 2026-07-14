import type { Meta, StoryObj } from "@storybook/react-vite";
import { useState } from "react";
import {
  SecretKeySelector,
  type KeyPreview,
  type SecretKeyValue,
  type SecretKind,
  type SecretResource,
  type SecretValueSource,
} from "./SecretKeySelector";

const RESOURCES: Record<SecretKind, SecretResource[]> = {
  secret: [
    { name: "db", keys: ["host", "port", "username", "password"] },
    { name: "elastic", keys: ["url", "apiKey"] },
  ],
  configmap: [{ name: "app", keys: ["demo.web_url", "demo.cycle_url"] }],
  helm: [{ name: "mysql", keys: ["auth.rootPassword", "primary.service.port"] }],
};

const SERVICE_ACCOUNTS: SecretResource[] = [
  { name: "default" },
  { name: "readonly" },
  { name: "deployer" },
];

const PREVIEWS: Record<string, KeyPreview[]> = {
  db: [
    { key: "host", value: "sql-••••.com" },
    { key: "port", value: "1433" },
    { key: "username", value: "sa" },
    { key: "password", value: "••••" },
  ],
  elastic: [
    { key: "url", value: "http••••:9200" },
    { key: "apiKey", value: "••••" },
  ],
  app: [
    { key: "demo.web_url", value: "http••••/PASJava" },
    { key: "demo.cycle_url", value: "http••••/Cycle" },
  ],
  mysql: [
    { key: "auth.rootPassword", value: "••••" },
    { key: "primary.service.port", value: "3306" },
  ],
};

const loadResources = (kind: SecretKind) => Promise.resolve(RESOURCES[kind]);
const loadKeyPreview = (_kind: SecretKind, name: string) =>
  new Promise<KeyPreview[]>((r) => setTimeout(() => r(PREVIEWS[name] ?? []), 200));
const loadServiceAccounts = () => Promise.resolve(SERVICE_ACCOUNTS);

const ALL_SOURCES: SecretValueSource[] = [
  "secret",
  "configmap",
  "helm",
  "serviceaccount",
  "onepassword",
  "value",
];

const meta = {
  title: "Components/SecretKeySelector",
  component: SecretKeySelector,
  parameters: {
    docs: {
      description: {
        component:
          "Picks how a credential is sourced via a searchable **Combobox** and lowers the choice into a single reference the consumer persists. Supports Kubernetes Secret / ConfigMap keys (with a mid-masked preview of each key's value), Helm release values (jsonpath key), a Service Account token (name only), a 1Password `op://vault/item/field` reference, and a static inline **Value**. The offered sources are controlled by `sources` (default Secret/ConfigMap/Value; `allowLiteral={false}` drops Value). Fetches nothing itself — the consumer supplies `loadResources` / `loadKeyPreview` / `loadServiceAccounts` getters.",
      },
    },
  },
} satisfies Meta<typeof SecretKeySelector>;

export default meta;
type Story = StoryObj<typeof meta>;

function Playground({
  initial,
  allowLiteral,
  sources,
}: {
  initial?: SecretKeyValue;
  allowLiteral?: boolean;
  sources?: SecretValueSource[];
}) {
  const [value, setValue] = useState<SecretKeyValue | undefined>(initial);
  return (
    <div className="w-[34rem] space-y-3">
      <SecretKeySelector
        value={value}
        onChange={setValue}
        loadResources={loadResources}
        loadKeyPreview={loadKeyPreview}
        loadServiceAccounts={loadServiceAccounts}
        allowLiteral={allowLiteral}
        sources={sources}
      />
      <div className="rounded-md border border-border bg-muted/30 px-3 py-2 font-mono text-xs">
        value={JSON.stringify(value)}
      </div>
    </div>
  );
}

export const Empty: Story = {
  render: () => <Playground />,
};

export const WithPreview: Story = {
  parameters: {
    docs: { description: { story: "A chosen secret shows masked previews as key labels." } },
  },
  render: () => <Playground initial={{ kind: "secret", name: "db", key: "host" }} />,
};

export const ConfigMap: Story = {
  render: () => <Playground initial={{ kind: "configmap", name: "app", key: "" }} />,
};

export const WithLiteralValue: Story = {
  parameters: {
    docs: {
      description: {
        story:
          "The **Value** toggle (available by default) lets the operator type a static inline string instead of referencing a Secret/ConfigMap key. The emitted value is `{kind:'value', value}`.",
      },
    },
  },
  render: () => <Playground initial={{ kind: "value", value: "prod.example.com" }} />,
};

export const ReferenceOnly: Story = {
  parameters: {
    docs: {
      description: {
        story:
          "Pass `allowLiteral={false}` to restrict the selector to Secret/ConfigMap references and hide the **Value** toggle.",
      },
    },
  },
  render: () => (
    <Playground allowLiteral={false} initial={{ kind: "secret", name: "db", key: "host" }} />
  ),
};

export const AllSources: Story = {
  parameters: {
    docs: {
      description: {
        story:
          "Pass `sources` to offer the full range: Kubernetes Secret / ConfigMap keys, Helm release values (jsonpath key), a Service Account token (name only), a 1Password `op://vault/item/field` reference, and a static Value. The source picker is a searchable **Combobox**.",
      },
    },
  },
  render: () => <Playground sources={ALL_SOURCES} initial={{ kind: "helm", name: "mysql", key: "auth.rootPassword" }} />,
};

export const ServiceAccount: Story = {
  render: () => (
    <Playground sources={ALL_SOURCES} initial={{ kind: "serviceaccount", name: "deployer" }} />
  ),
};

export const OnePassword: Story = {
  render: () => (
    <Playground sources={ALL_SOURCES} initial={{ kind: "onepassword", ref: "op://prod/postgres/password" }} />
  ),
};
