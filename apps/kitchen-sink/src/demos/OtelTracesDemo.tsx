import { useState } from "react";
import { Button } from "@flanksource/clicky-ui/components";
import { useRouter } from "@flanksource/clicky-ui";
import { OtelTraceDetail, OtelTraceSearch, OtelTraceTable, type OtelSearchValues } from "@flanksource/clicky-ui/data";
import { traceExample, searchExample } from "../../../../packages/ui/src/data/traces/otel/fixtures";

export function OtelTracesDemo() {
  const { navigate, pathname } = useRouter();
  const params = new URLSearchParams(window.location.search);
  const [opened, setOpened] = useState(false);
  const [selected, setSelected] = useState("root");
  const [value, setValue] = useState<OtelSearchValues>({ source: "example-search", lookback: "1h", minSpans: 2 });
  const href = (trace?: string, span?: string) => {
    const query = new URLSearchParams(window.location.search);
    query.set("view", "profile"); query.delete("trace"); query.delete("span");
    if (trace) query.set("trace", trace);
    if (span) query.set("span", span);
    return `${pathname}?${query}`;
  };
  if (params.get("view") === "profile") return <OtelTraceTable spans={traceExample.spans} {...(params.get("trace") ? { selectedTraceId: params.get("trace")! } : {})} {...(params.get("span") ? { selectedSpanId: params.get("span")! } : {})} traceHref={href} onSelectTrace={trace => navigate(href(trace))} onSelectSpan={span => navigate(href(params.get("trace") ?? undefined, span), { replace: true })} />;
  if (opened) return <div className="space-y-3"><Button variant="link" onClick={() => setOpened(false)}>Back to trace search</Button><OtelTraceDetail trace={traceExample} selectedSpanId={selected} onSelectSpan={setSelected} /></div>;
  return <OtelTraceSearch value={value} result={searchExample} sources={[{ id: "example-search", name: "Example OpenSearch", type: "opensearch" }]} allowRecords={false} onChange={next => setValue(previous => ({ ...previous, ...next }))} onOpen={() => setOpened(true)} href={() => "?demo=otel-traces"} onCancel={() => undefined} onRetry={() => undefined} />;
}
