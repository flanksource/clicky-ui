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

function OpenTrace() {
  const [loaded, setLoaded] = useState(3);
  const [minimum, setMinimum] = useState(">=10ms");
  const spans = traceExample.spans.slice(0, loaded);
  const matching = minimum ? new Set(spans.filter(span => span.durationMs >= 10).map(span => span.spanId)) : undefined;
  return (
    <OtelTraceTable
      {...meta.args}
      selectedTraceId={traceExample.summary.traceId}
      externalFilters={[{ key: "filter.duration_ms", kind: "text", label: "Span duration", value: minimum, onChange: setMinimum }]}
      openTrace={{
        spans,
        total: traceExample.spans.length,
        loading: false,
        ...(loaded < traceExample.spans.length ? { onLoadMore: () => setLoaded(traceExample.spans.length) } : {}),
        ...(matching ? { matchingSpanIds: matching } : {}),
      }}
    />
  );
}
/** The open trace is fetched apart from the listing, paged, and the listing filters pick spans inside it. */
export const OpenTracePagedAndFiltered: Story = { render: () => <OpenTrace /> };
