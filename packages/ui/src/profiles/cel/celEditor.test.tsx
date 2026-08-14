import { renderToStaticMarkup } from "react-dom/server";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { describe, expect, it, vi } from "vitest";

import { CelEditorPanel } from "./celEditor";
import type { CelResponse, CelScope } from "./celExpression";

const ROWS = [
  { message: "Timeout after 5006ms", level: "ERROR" },
  { message: "\tat com.acme.pay.Gateway.charge", level: "ERROR" },
  { message: "Timeout after 31ms", level: "WARN" },
];

const EXPRESSION = 'int(row.message.split("after ")[1].split("ms")[0])';

/** What the server returns for an expression that reads nothing from row 2. */
const PARTIAL: CelResponse = {
  results: [
    { index: 0, value: 5006, type: "int" },
    { index: 1, type: "null" },
    { index: 2, value: 31, type: "int" },
  ],
};

/**
 * Renders the dialog with the evaluation already answered.
 *
 * Seeding the cache under the dialog's own key is what lets a static render show
 * the resolved state: react-query serves cached data synchronously, so no DOM,
 * timers or async harness are needed to assert what the dialog makes of a
 * result. It also pins the query key, which is the debounce.
 */
function renderDialog(
  response: CelResponse,
  { scope = "row" as CelScope, expression = EXPRESSION, rows = ROWS } = {},
) {
  const client = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  client.setQueryData(["cel-expression", scope, expression, rows.length], response);
  return renderToStaticMarkup(
    <QueryClientProvider client={client}>
      <CelEditorPanel
        value={expression}
        scope={scope}
        rows={rows}
        title="timeout_ms"
        onChange={vi.fn()}
        onClose={vi.fn()}
      />
    </QueryClientProvider>,
  );
}

describe("CelEditorDialog", () => {
  it("counts the rows that read nothing apart from the ones that worked", () => {
    const html = renderDialog(PARTIAL);

    expect(html).toContain("2 evaluated");
    expect(html).toContain("1 empty");
  });

  it("offers a jump to the next barren row while one remains", () => {
    expect(renderDialog(PARTIAL)).toContain("Next empty row");
  });

  it("offers no jump once every row evaluates", () => {
    const html = renderDialog({
      results: [
        { index: 0, value: 1, type: "int" },
        { index: 1, value: 2, type: "int" },
        { index: 2, value: 3, type: "int" },
      ],
    });

    expect(html).toContain("3 evaluated");
    expect(html).not.toContain("Next empty row");
  });

  it("renders one coverage cell per sampled row, not per returned result", () => {
    const html = renderDialog({ results: [{ index: 0, value: 1, type: "int" }] });

    expect(html).toContain('aria-label="Row 3"');
  });

  it("shows the compiler's own message for a row that failed", () => {
    const html = renderDialog({ results: [{ index: 0, error: "undeclared reference to 'nope'" }] });

    expect(html).toContain("undeclared reference");
    expect(html).toContain("1 failed");
  });

  it("reports a request the server refused to evaluate at all", () => {
    expect(renderDialog({ results: [], error: "expression is empty" })).toContain("expression is empty");
  });

  it("warns when one expression returns more than one type", () => {
    const html = renderDialog({
      results: [
        { index: 0, value: 1, type: "int" },
        { index: 1, value: "x", type: "string" },
        { index: 2, value: 3, type: "int" },
      ],
    });

    expect(html).toContain("returns int | string");
  });

  it("names the scope it was opened in, which the document itself never records", () => {
    expect(renderDialog(PARTIAL, { scope: "batch" })).toContain("Batch scope");
    expect(renderDialog(PARTIAL, { scope: "boundary" })).toContain("Boundary scope");
  });

  it("offers the batch bindings, and none of the row's fields, in the batch scope", () => {
    const html = renderDialog(PARTIAL, { scope: "batch" });

    expect(html).toContain("the grouped rows, oldest first");
    expect(html).not.toContain(">message<");
  });

  // The row's own keys are browsed rather than listed: the tree loads them on
  // expansion, so a static render shows the root it will expand from. What the
  // keys turn into once clicked is pinned in celPath.test.ts, against nodes
  // this same tree produces.
  it("browses the row's values in the row scope", () => {
    const html = renderDialog(PARTIAL);

    expect(html).toContain('aria-label="Row values"');
    expect(html).toContain("{2 properties}");
    // The fixed names stay listed, because they are variables rather than data.
    expect(html).toContain(">row<");
    expect(html).toContain(">span<");
  });

  it("says plainly when there is nothing to evaluate against", () => {
    expect(renderDialog({ results: [] }, { rows: [] })).toContain("nothing sampled yet");
  });
});
