import { useState } from "react";
import { Button } from "@flanksource/clicky-ui/components";
import { OtelTraceDetail, OtelTraceSearch, type OtelSearchValues } from "@flanksource/clicky-ui/data";
import { traceExample, searchExample } from "../../../../packages/ui/src/data/traces/otel/fixtures";

export function OtelTracesDemo() {
  const [opened, setOpened] = useState(false);
  const [selected, setSelected] = useState("root");
  const [value, setValue] = useState<OtelSearchValues>({ source: "example-search", lookback: "1h", minSpans: 2 });
  if (opened) return <div className="space-y-3"><Button variant="link" onClick={() => setOpened(false)}>Back to trace search</Button><OtelTraceDetail trace={traceExample} selectedSpanId={selected} onSelectSpan={setSelected} /></div>;
  return <OtelTraceSearch value={value} result={searchExample} sources={[{ id: "example-search", name: "Example OpenSearch", type: "opensearch" }]} allowRecords={false} onChange={next => setValue(previous => ({ ...previous, ...next }))} onOpen={() => setOpened(true)} href={() => "?demo=otel-traces"} onCancel={() => undefined} onRetry={() => undefined} />;
}
