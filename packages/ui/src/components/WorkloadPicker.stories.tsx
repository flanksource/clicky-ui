import type { Meta, StoryObj } from "@storybook/react-vite";
import { useState } from "react";
import {
  WorkloadPicker,
  type WorkloadKind,
  type WorkloadPickerProps,
  type WorkloadResource,
} from "./WorkloadPicker";

const FIXTURE: Record<WorkloadKind, WorkloadResource[]> = {
  service: [{ name: "demo-svc" }, { name: "activemq-svc" }],
  ingress: [{ name: "demo-ing", hosts: ["demo.example.com"] }],
  deployment: [{ name: "demo-web" }, { name: "palette-web" }],
  statefulset: [{ name: "demo-cycle" }, { name: "sqlserver" }],
};

// makeLoader fakes the consumer's `loadWorkloads` getter: it resolves after
// `delay` ms (so the loading spinner is visible in the Loading story) with the
// `source` resources for only the requested kinds.
function makeLoader(
  delay = 300,
  source: Partial<Record<WorkloadKind, WorkloadResource[]>> = FIXTURE,
) {
  return (kinds: WorkloadKind[]): Promise<Record<WorkloadKind, WorkloadResource[]>> =>
    new Promise((resolve) =>
      setTimeout(() => {
        const out = {} as Record<WorkloadKind, WorkloadResource[]>;
        for (const k of kinds) out[k] = source[k] ?? [];
        resolve(out);
      }, delay),
    );
}

// Playground renders the picker over a value-echo panel so the emitted workload
// name (what `onChange` returns) is visible for every story.
function Playground({
  initial = "",
  ...props
}: { initial?: string } & Omit<WorkloadPickerProps, "value" | "onChange">) {
  const [value, setValue] = useState(initial);
  return (
    <div className="w-80 space-y-3">
      <WorkloadPicker value={value} onChange={setValue} {...props} />
      <div className="rounded-md border border-border bg-muted/30 px-3 py-2 font-mono text-xs">
        value={JSON.stringify(value)}
      </div>
    </div>
  );
}

const meta = {
  title: "Components/WorkloadPicker",
  component: WorkloadPicker,
  parameters: {
    docs: {
      description: {
        component:
          "Selects a Kubernetes workload (Service / Ingress / Deployment / StatefulSet) for an endpoint. Options from every kind are merged into one Combobox, grouped by kind via Combobox group headers and labelled with the kind's icon. Fetches nothing itself — the consumer supplies the async `loadWorkloads` getter. An ingress emits its first host (the routable address) as the value, labelled with the ingress name for context; every other kind emits its name.",
      },
    },
  },
} satisfies Meta<typeof WorkloadPicker>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: () => <Playground loadWorkloads={makeLoader()} />,
};

export const Grouped: Story = {
  parameters: {
    docs: {
      description: {
        story:
          "All four kinds load, producing four group headers (Service / Ingress / Deployment / StatefulSet) in the dropdown. Each option's value is a `kind/name` key (an ingress uses `ingress/<host>`), shown in the value panel; the dropdown label stays the human name.",
      },
    },
  },
  render: () => <Playground initial="service/demo-svc" loadWorkloads={makeLoader(0)} />,
};

export const Namespaced: Story = {
  parameters: {
    docs: {
      description: {
        story:
          "With a `namespace`, the emitted value is fully qualified as `namespace/kind/name` — pick a workload and watch the value panel.",
      },
    },
  },
  render: () => <Playground namespace="demo" loadWorkloads={makeLoader(0)} />,
};

export const Loading: Story = {
  parameters: {
    docs: { description: { story: "A slow loader keeps the spinner visible while options resolve." } },
  },
  render: () => <Playground loadWorkloads={makeLoader(100000)} />,
};

export const ServicesOnly: Story = {
  parameters: {
    docs: {
      description: {
        story: "Restricting `kinds` to a subset offers a single group (no headers for absent kinds).",
      },
    },
  },
  render: () => <Playground loadWorkloads={makeLoader(0)} kinds={["service"]} />,
};

export const Empty: Story = {
  parameters: {
    docs: {
      description: {
        story: "When the loader returns no workloads, the dropdown shows the Combobox's “No results” state.",
      },
    },
  },
  render: () => <Playground loadWorkloads={makeLoader(0, {})} />,
};
