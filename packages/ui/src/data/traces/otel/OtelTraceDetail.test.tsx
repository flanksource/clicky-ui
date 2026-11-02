import { useState } from "react";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, expect, it } from "vitest";
import { OtelTraceDetail } from "./OtelTraceDetail";
import { traceExample } from "./fixtures";

afterEach(cleanup);
it("opens a grouped call's inspector and steps to the next visible span", () => {
  function Harness() {
    const [selected, setSelected] = useState("root");
    return <OtelTraceDetail trace={traceExample} selectedSpanId={selected} onSelectSpan={setSelected} />;
  }
  render(<Harness />);
  fireEvent.click(screen.getByRole("button", { name: "Expand database group" }));
  const rows = document.querySelectorAll<HTMLElement>("[data-row-id]");
  fireEvent.click(Array.from(rows).find(row => row.dataset.rowId === "orders")!);
  expect(screen.getByRole("heading", { name: "SELECT" })).toBeTruthy();
  expect(screen.getByText("SELECT * FROM orders", { selector: "pre" })).toBeTruthy();
  fireEvent.keyDown(screen.getByLabelText("Span waterfall"), { key: "ArrowDown" });
  expect(screen.getByText("SELECT * FROM customers", { selector: "pre" })).toBeTruthy();
});

it("clips long SQL statements until explicitly expanded", () => {
  const statement = "SELECT * FROM orders; ".repeat(100);
  const trace = { ...traceExample, spans: traceExample.spans.map(span => span.spanId === "orders" ? { ...span, attributes: { ...span.attributes, "db.statement": statement } } : span) };
  render(<OtelTraceDetail trace={trace} selectedSpanId="orders" onSelectSpan={() => undefined} />);
  expect(screen.queryByText(statement, { selector: "pre" })).toBeNull();
  fireEvent.click(screen.getByRole("button", { name: /Show all .* characters/ }));
  expect(screen.getByText(statement.trim(), { selector: "pre" })).toBeTruthy();
});
