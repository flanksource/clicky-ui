import { describe, expect, it } from "vitest";
import { fireEvent, render, within } from "@testing-library/react";
import { TestDetailPanel, TestRunnerProvider, emptyTestFilters, type Test, type TestRunnerContext } from "../test-runner";
import { verificationAdapters } from "./adapters";
import { readQuery } from "./stepKind";

const TEMPLATE = "SELECT guid FROM AsActivity WHERE StatusCode = $(.params.status) AND Size > {{.params.size}}";
const SQL = "SELECT guid FROM AsActivity WHERE StatusCode = @p1 AND Size > @p2";
const STATUS = "02";
const SIZE = 20;
const QUERY_FILE = "queries/staged.sql";

// The record gavel's query kind publishes as `detail.query` (fixtures.QueryMetadataKey).
const query = { template: TEMPLATE, sql: SQL, arguments: [STATUS, SIZE], params: { status: STATUS, size: SIZE } };

const queryStep = (record: unknown): Test => ({
  name: "inspect",
  framework: "fixture",
  passed: true,
  command: TEMPLATE,
  context: { command: TEMPLATE },
  detail: { step: { id: "inspect", kind: "query" }, outputs: { rowCount: 1 }, query: record, cel_trace: "rowCount == 1 -> true" },
});

function renderDetail(node: Test) {
  const context: TestRunnerContext = {
    tests: [node], selected: node, done: true, filters: emptyTestFilters(),
    expandAll: null, busy: {}, adapters: verificationAdapters(),
    onSelect: () => {}, onFiltersChange: () => {}, onExpandAllChange: () => {},
  };
  return render(<TestRunnerProvider value={context}><TestDetailPanel /></TestRunnerProvider>);
}

const querySection = () => document.querySelector<HTMLElement>("[data-step-section='query']");

describe("a query step's query", () => {
  it("shows the authored template first, and the issued SQL on the SQL tab", () => {
    renderDetail(queryStep(query));
    const section = querySection()!;
    const tabs = within(section);
    const code = () => section.querySelector<HTMLElement>("[data-query-code]")!;

    expect(tabs.getByRole("radio", { name: "Template" })).toHaveAttribute("aria-checked", "true");
    expect(code()).toHaveTextContent(TEMPLATE);
    expect(code()).not.toHaveTextContent(SQL);

    fireEvent.click(tabs.getByRole("radio", { name: "SQL" }));

    expect(tabs.getByRole("radio", { name: "SQL" })).toHaveAttribute("aria-checked", "true");
    expect(code()).toHaveTextContent(SQL);
    expect(code()).not.toHaveTextContent(TEMPLATE);
  });

  it("lists the params by name and the bound arguments in order", () => {
    renderDetail(queryStep(query));
    const section = querySection()!;
    const params = [...section.querySelectorAll("[data-query-params] tbody tr")].map((row) => [...row.querySelectorAll("td")].map((cell) => cell.textContent));
    expect(params).toEqual([["status", STATUS], ["size", String(SIZE)]]);
    const args = [...section.querySelectorAll("[data-query-arguments] tbody tr")].map((row) => [...row.querySelectorAll("td")].map((cell) => cell.textContent));
    expect(args).toEqual([["1", STATUS], ["2", String(SIZE)]]);
  });

  it("names the query file the template was read from", () => {
    renderDetail(queryStep({ ...query, queryFile: QUERY_FILE }));
    expect(within(querySection()!).getByText(QUERY_FILE)).toBeInTheDocument();
  });

  it("replaces the Command block, and keeps the query out of the raw detail", () => {
    renderDetail(queryStep(query));
    expect(document.querySelector("[data-step-section='command']")).toBeNull();
    const raw = document.querySelector<HTMLElement>("[data-raw-detail]");
    expect(raw).not.toBeNull();
    expect(raw).toHaveTextContent("cel_trace");
    expect(raw).not.toHaveTextContent("@p1");
  });

  it("disables the SQL tab when no statement was issued, and omits empty params and arguments", () => {
    renderDetail(queryStep({ template: TEMPLATE }));
    const section = querySection()!;
    expect(within(section).getByRole("radio", { name: "SQL" })).toBeDisabled();
    expect(section.querySelector("[data-query-params]")).toBeNull();
    expect(section.querySelector("[data-query-arguments]")).toBeNull();
  });

  it("reports a malformed query by path and falls back to the Command block", () => {
    renderDetail(queryStep({ ...query, arguments: "@p1" }));
    expect(querySection()).toBeNull();
    expect(document.body).toHaveTextContent("detail.query.arguments must be an array");
    expect(document.querySelector("[data-step-section='command']")).toHaveTextContent(TEMPLATE);
  });
});

describe("readQuery", () => {
  it.each([
    [{ sql: SQL }, "detail.query.template must be a string"],
    [{ template: TEMPLATE, sql: 3 }, "detail.query.sql must be a string"],
    [{ template: TEMPLATE, params: [STATUS] }, "detail.query.params must be an object"],
    [{ template: TEMPLATE, queryFile: true }, "detail.query.queryFile must be a string"],
    ["SELECT 1", "detail.query must be an object"],
  ])("rejects %j: %s", (record, error) => {
    expect(readQuery({ query: record })).toEqual({ kind: "invalid", error });
  });

  it("reads a node without detail.query as none, and a null params as absent", () => {
    expect(readQuery({ step: { id: "inspect", kind: "query" } })).toEqual({ kind: "none" });
    expect(readQuery({ query: { template: TEMPLATE, params: null } })).toEqual({ kind: "query", query: { template: TEMPLATE } });
  });
});
