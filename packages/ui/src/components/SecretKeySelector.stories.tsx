import type { Meta, StoryObj } from "@storybook/react-vite";
import { useState } from "react";
import {
  SecretKeySelector,
  type KeyPreview,
  type SecretKeyValue,
  type SecretKind,
  type SecretResource,
} from "./SecretKeySelector";

const RESOURCES: Record<SecretKind, SecretResource[]> = {
  secret: [
    { name: "db", keys: ["host", "port", "username", "password"] },
    { name: "elastic", keys: ["url", "apiKey"] },
  ],
  configmap: [{ name: "app", keys: ["demo.web_url", "demo.cycle_url"] }],
};

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
};

const loadResources = (kind: SecretKind) => Promise.resolve(RESOURCES[kind]);
const loadKeyPreview = (_kind: SecretKind, name: string) =>
  new Promise<KeyPreview[]>((r) => setTimeout(() => r(PREVIEWS[name] ?? []), 200));

const meta = {
  title: "Components/SecretKeySelector",
  component: SecretKeySelector,
  parameters: {
    docs: {
      description: {
        component:
          "Picks a Secret or ConfigMap and one of its keys, showing a mid-masked preview of each key's value so the operator can tell which key holds the host vs the db vs a password. Fetches nothing itself — the consumer supplies `loadResources` / `loadKeyPreview` getters — and emits a `{kind,name,key}` value.",
      },
    },
  },
} satisfies Meta<typeof SecretKeySelector>;

export default meta;
type Story = StoryObj<typeof meta>;

function Playground({
  initial,
  allowLiteral,
}: {
  initial?: SecretKeyValue;
  allowLiteral?: boolean;
}) {
  const [value, setValue] = useState<SecretKeyValue | undefined>(initial);
  return (
    <div className="w-[34rem] space-y-3">
      <SecretKeySelector
        value={value}
        onChange={setValue}
        loadResources={loadResources}
        loadKeyPreview={loadKeyPreview}
        allowLiteral={allowLiteral}
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
          "With `allowLiteral`, a third **Value** toggle lets the operator type a static inline string instead of referencing a Secret/ConfigMap key. The emitted value is `{kind:'value', value}`.",
      },
    },
  },
  render: () => <Playground allowLiteral initial={{ kind: "value", value: "prod.example.com" }} />,
};
