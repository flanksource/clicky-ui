import { renderToStaticMarkup } from "react-dom/server";
import { fireEvent, render, screen, waitFor, within } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { describe, expect, it, vi } from "vitest";

import { CelEditorPanel } from "./celEditor";
import type { CelEnvironment, CelResponse, CelScope } from "./celExpression";

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

/**
 * An authorization rule: its rows are identities whose keys are the variables,
 * it is run by the host's own engine, and it selects rows rather than computing
 * a value.
 */
const IDENTITIES = [
  { user: "alice", groups: ["OM Super"] },
  { user: "bob", groups: [] },
  { user: "carol", groups: ["OM Super"] },
];
const MATCHER = '"OM Super" in groups';

function ruleEnvironment(evaluate: CelEnvironment["evaluate"] = vi.fn()): CelEnvironment {
  return {
    id: "access-rule",
    label: "Access rule",
    rowName: "",
    rowNoun: "user",
    predicate: true,
    bindings: () => [
      { name: "user", detail: "string · the signed-in login" },
      { name: "groups", detail: "list · the user's groups" },
    ],
    evaluate,
    rowLabel: (row) => String(row.user),
  };
}

const MATCHES: CelResponse = {
  results: [
    { index: 0, value: true, type: "bool" },
    { index: 1, value: false, type: "bool" },
    { index: 2, value: true, type: "bool" },
  ],
};

function renderRule(response: CelResponse, environment = ruleEnvironment()) {
  const client = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  client.setQueryData(["cel-expression", environment.id, MATCHER, IDENTITIES.length], response);
  return renderToStaticMarkup(
    <QueryClientProvider client={client}>
      <CelEditorPanel
        value={MATCHER}
        scope={environment}
        rows={IDENTITIES}
        title="matcher"
        onChange={vi.fn()}
        onClose={vi.fn()}
      />
    </QueryClientProvider>,
  );
}

describe("CelEditorPanel in a host environment", () => {
  it("names the host's environment and offers its variables, not a profile's", () => {
    const html = renderRule(MATCHES);

    expect(html).toContain("Access rule");
    expect(html).toContain("the user&#x27;s groups");
    expect(html).not.toContain("Row scope");
    expect(html).not.toContain(">span<");
  });

  // Both true and false are values, so a coverage tally would call every row
  // "evaluated" — which says nothing about whom the rule selects.
  it("tallies a predicate's matches apart from its misses", () => {
    const html = renderRule(MATCHES);

    expect(html).toContain("2 true");
    expect(html).toContain("1 false");
    expect(html).not.toContain("3 evaluated");
  });

  it("names each row the way the host does rather than by position", () => {
    const html = renderRule(MATCHES);

    expect(html).toContain('aria-label="bob"');
    expect(html).toContain("3 users");
    expect(html).not.toContain("sampled rows");
  });

  it("runs the expression on the host's engine, against the rows it was given", async () => {
    const evaluate = vi.fn<CelEnvironment["evaluate"]>().mockResolvedValue(MATCHES);
    render(
      <QueryClientProvider client={new QueryClient({ defaultOptions: { queries: { retry: false } } })}>
        <CelEditorPanel
          value={MATCHER}
          scope={ruleEnvironment(evaluate)}
          rows={IDENTITIES}
          title="matcher"
          onChange={vi.fn()}
          onClose={vi.fn()}
        />
      </QueryClientProvider>,
    );

    await waitFor(() => expect(screen.getByText("2 true")).toBeInTheDocument());
    expect(evaluate).toHaveBeenCalledWith(MATCHER, IDENTITIES);
  });

  // A matcher must return a bool, so an example that reads a value is one the
  // engine refuses; and the rows' keys are the variables, so the accessor is
  // the bare name.
  it("offers tests on the bare variable for a node picked from an identity", async () => {
    render(
      <QueryClientProvider client={new QueryClient({ defaultOptions: { queries: { retry: false } } })}>
        <CelEditorPanel
          value={MATCHER}
          scope={ruleEnvironment(vi.fn<CelEnvironment["evaluate"]>().mockResolvedValue(MATCHES))}
          rows={IDENTITIES}
          title="matcher"
          onChange={vi.fn()}
          onClose={vi.fn()}
        />
      </QueryClientProvider>,
    );

    fireEvent.click(await within(screen.getByLabelText("user values")).findByText("groups"));
    expect(screen.queryByText("Count the entries")).toBeNull();
    fireEvent.click(await screen.findByText("Is empty"));

    expect(screen.getByLabelText<HTMLTextAreaElement>("CEL expression").value).toBe("size(groups) == 0");
  });
});
