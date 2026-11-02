import { useState } from "react";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { OtelTraceDetail } from "./OtelTraceDetail";
import { traceExample } from "./fixtures";

const meta = { title: "Data/Traces/OpenTelemetry detail", component: OtelTraceDetail, parameters: { layout: "fullscreen" }, args: { trace: traceExample, onSelectSpan: () => undefined } } satisfies Meta<typeof OtelTraceDetail>;
export default meta;
type Story = StoryObj<typeof meta>;
function Interactive() {
  const [selected, setSelected] = useState("root");
  return <OtelTraceDetail trace={traceExample} selectedSpanId={selected} onSelectSpan={setSelected} />;
}
export const Default: Story = { render: () => <Interactive /> };
