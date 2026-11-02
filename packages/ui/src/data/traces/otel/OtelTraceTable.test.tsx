import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, expect, it, vi } from "vitest";
import { OtelTraceTable } from "./OtelTraceTable";
import { traceExample } from "./fixtures";

afterEach(cleanup);
const props = { spans: traceExample.spans, onSelectTrace: vi.fn(), onSelectSpan: vi.fn(), traceHref: (id: string) => `?trace=${id}` };

it("opens a trace from loaded spans and keeps the partial-result notice", () => {
  render(<OtelTraceTable {...props} />);
  expect(screen.getByText(/Filters and paging can leave traces incomplete/)).toBeInTheDocument();
  fireEvent.click(screen.getByRole("link", { name: /POST \/orders/ }));
  expect(props.onSelectTrace).toHaveBeenCalledWith(traceExample.summary.traceId);
});

it("shows the selected span and allows returning to the trace list", () => {
  render(<OtelTraceTable {...props} selectedTraceId={traceExample.summary.traceId} selectedSpanId="model" />);
  expect(screen.getByRole("heading", { name: "chat example-model" })).toBeInTheDocument();
  fireEvent.click(screen.getByRole("button", { name: "Back to traces" }));
  expect(props.onSelectTrace).toHaveBeenCalledWith();
});

it("retains server search controls with no rows", () => {
  render(<OtelTraceTable {...props} spans={[]} externalSearch={{ value: "missing", onChange: vi.fn(), placeholder: "Search spans" }} />);
  expect(screen.getByPlaceholderText("Search spans")).toHaveValue("missing");
});

it("reports invalid data instead of rendering a misleading trace", () => {
  render(<OtelTraceTable {...props} spans={[traceExample.spans[0]!, traceExample.spans[0]!]} />);
  expect(screen.getByRole("alert")).toHaveTextContent("duplicate span ids");
});
