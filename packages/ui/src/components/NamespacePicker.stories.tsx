import type { Meta, StoryObj } from "@storybook/react-vite";
import { useState } from "react";
import { NamespacePicker, type NamespacePickerProps } from "./NamespacePicker";

const FIXTURE = ["default", "kube-system", "prod", "staging"];

// makeLoader fakes the consumer's `loadNamespaces` getter: it resolves after
// `delay` ms (so the spinner is visible in the Loading story).
function makeLoader(delay = 300, source = FIXTURE) {
  return (): Promise<string[]> =>
    new Promise((resolve) => setTimeout(() => resolve(source), delay));
}

// Playground renders the picker over a value-echo panel so the emitted namespace
// is visible for every story.
function Playground({
  initial = "",
  ...props
}: { initial?: string } & Omit<NamespacePickerProps, "value" | "onChange">) {
  const [value, setValue] = useState(initial);
  return (
    <div className="w-80 space-y-3">
      <NamespacePicker value={value} onChange={setValue} {...props} />
      <div className="rounded-md border border-border bg-muted/30 px-3 py-2 font-mono text-xs">
        value={JSON.stringify(value)}
      </div>
    </div>
  );
}

const meta = {
  title: "Components/NamespacePicker",
  component: NamespacePicker,
  parameters: {
    docs: {
      description: {
        component:
          "Selects a Kubernetes namespace. Presentational — the consumer supplies the async `loadNamespaces` getter. The selected namespace is the value other form widgets (secret / workload pickers) read to scope their own lookups.",
      },
    },
  },
} satisfies Meta<typeof NamespacePicker>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: () => <Playground loadNamespaces={makeLoader(0)} />,
};

export const Preselected: Story = {
  render: () => <Playground initial="prod" loadNamespaces={makeLoader(0)} />,
};

export const Loading: Story = {
  parameters: {
    docs: { description: { story: "A slow loader keeps the spinner visible while namespaces resolve." } },
  },
  render: () => <Playground loadNamespaces={makeLoader(100000)} />,
};

export const StrictUnknown: Story = {
  parameters: {
    docs: {
      description: {
        story: "In strict mode a value absent from the loaded set is flagged invalid (still shown, pinned first).",
      },
    },
  },
  render: () => <Playground initial="ghost" strict loadNamespaces={makeLoader(0)} />,
};
