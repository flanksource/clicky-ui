import { useState } from "react";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { fn } from "storybook/test";
import { CACHE_MBEAN, CACHE_VALUES } from "../fixtures/mbeans";
import { mergeMBeanReadings } from "../model/mbean-readings";
import { MBeanDetailView } from "./MBeanDetailView";

type Args = { canWrite: boolean; view: string };

function Demo({ canWrite, view: initial }: Args) {
  const [view, setView] = useState(initial);
  return (
    <div className="max-w-3xl p-4">
      <MBeanDetailView
        info={CACHE_MBEAN}
        attributes={mergeMBeanReadings(CACHE_MBEAN, CACHE_VALUES)}
        view={view}
        onViewChange={setView}
        canWrite={canWrite}
        onWriteAttribute={fn(async () => {})}
        onInvoke={fn(async () => "order 42")}
        extraTabs={[{ id: "host", label: "Host tab", content: <p className="text-sm">Host-supplied content for this MBean.</p> }]}
      />
    </div>
  );
}

const meta = {
  title: "JVM/MBeanDetailView",
  component: Demo,
  args: { canWrite: true, view: "attributes" },
} satisfies Meta<typeof Demo>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Writable: Story = {};
export const ReadOnly: Story = { args: { canWrite: false } };
export const Operations: Story = { args: { view: "operations" } };
export const Notifications: Story = { args: { view: "notifications" } };
