import { useState } from "react";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { OtelTraceTable } from "./OtelTraceTable";
import { traceExample } from "./fixtures";

const meta = { title: "Data/Traces/OpenTelemetry rows", component: OtelTraceTable, parameters: { layout: "fullscreen" }, args: { spans: traceExample.spans, traceHref: id => `?trace=${id}`, onSelectTrace: () => undefined, onSelectSpan: () => undefined } } satisfies Meta<typeof OtelTraceTable>;
export default meta;
type Story = StoryObj<typeof meta>;
function Interactive() {
  const [trace, setTrace] = useState<string>();
  const [span, setSpan] = useState<string>();
  return <OtelTraceTable {...meta.args} {...(trace ? { selectedTraceId: trace } : {})} {...(span ? { selectedSpanId: span } : {})} onSelectTrace={setTrace} onSelectSpan={setSpan} />;
}
export const Default: Story = { render: () => <Interactive /> };
export const Empty: Story = { args: { spans: [], externalSearch: { value: "", onChange: () => undefined, placeholder: "Search spans" } } };
