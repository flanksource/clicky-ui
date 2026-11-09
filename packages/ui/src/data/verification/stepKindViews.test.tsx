import { describe, expect, it } from "vitest";
import { render } from "@testing-library/react";
import { StepQuerySection } from "./stepKindViews";
import { readQuery, type StepQuery } from "./stepKind";

const TEMPLATE = "SELECT 1";
const SQL_SERVER_SPID = 57;
const POSTGRES_PID = 4121;
const MYSQL_CONNECTION = 88;
const CLICKHOUSE_QUERY_ID = "3f6a-query";
const SERVER = "db01";
const SAMPLE_ELAPSED_MS = 12_500;
const SAMPLE_CPU_MS = 9_000;
const BLOCKER = 61;
const WAIT_RESOURCE = "KEY: 5:72057594038779904 (8194443284a0)";
const ERROR = "sql server login lacks VIEW SERVER STATE";

const ZERO_TIME = "0001-01-01T00:00:00Z";

const sample = (overrides: Record<string, unknown> = {}) => ({
  sampledAt: "2026-11-09T10:00:10Z", engine: "sqlserver", database: "app", sessionId: SQL_SERVER_SPID, requestId: 0,
  blockedBy: 0, blocked: false, user: "reporter", application: "gavel", clientHost: "laptop", state: "running", command: "SELECT",
  waitType: "", waitResource: "", waitMs: 0, startedAt: "2026-11-09T10:00:00Z", transactionStartedAt: ZERO_TIME,
  elapsedMs: SAMPLE_ELAPSED_MS, transactionMs: 0, cpuMs: SAMPLE_CPU_MS, logicalReads: 120_000, reads: 300, writes: 12,
  memoryBytes: 8 * 1024 * 1024, openTransactions: 0, queryId: "", sql: "SELECT 1", ...overrides,
});

function queryOf(record: Record<string, unknown>): StepQuery {
  const result = readQuery({ query: { template: TEMPLATE, ...record } });
  if (result.kind !== "query") throw new Error(`expected a query, got ${JSON.stringify(result)}`);
  return result.query;
}

const section = () => document.querySelector<HTMLElement>("[data-step-section='query']")!;
const sessionBadge = () => section().querySelector<HTMLElement>("[data-query-session]");
const diagnose = () => section().querySelector<HTMLElement>("[data-query-diagnose]");
const tile = (label: string) => diagnose()?.querySelector<HTMLElement>(`[data-metric='${label}']`) ?? null;

describe("a query step's server session badge", () => {
  const cases: [string, Record<string, unknown>, string][] = [
    ["sqlserver", { engine: "sqlserver", sessionId: SQL_SERVER_SPID }, `spid ${SQL_SERVER_SPID}`],
    ["postgres", { engine: "postgres", sessionId: POSTGRES_PID }, `pid ${POSTGRES_PID}`],
    ["mysql", { engine: "mysql", sessionId: MYSQL_CONNECTION }, `conn ${MYSQL_CONNECTION}`],
    ["clickhouse", { engine: "clickhouse", sessionId: 0, queryId: CLICKHOUSE_QUERY_ID }, `query ${CLICKHOUSE_QUERY_ID}`],
  ];

  it.each(cases)("labels a %s session by its own id kind", (_engine, session, text) => {
    render(<StepQuerySection query={queryOf({ connection: { name: "lab", type: "sql" }, session })} />);
    expect(sessionBadge()).toHaveTextContent(text);
  });

  it("names the server beside the session badge, within the connection row", () => {
    render(<StepQuerySection query={queryOf({ connection: { name: "lab", type: "sql" }, session: { engine: "sqlserver", sessionId: SQL_SERVER_SPID, server: SERVER } })} />);
    const row = section().querySelector<HTMLElement>("[data-query-connection]")!;
    expect(row).toContainElement(sessionBadge());
    expect(row.querySelector("[data-query-target='server']")).toHaveTextContent(SERVER);
  });

  it("shows no session badge when the step recorded no session", () => {
    render(<StepQuerySection query={queryOf({ connection: { name: "lab", type: "sqlite" } })} />);
    expect(sessionBadge()).toBeNull();
    expect(diagnose()).toBeNull();
  });
});

describe("a query step's diagnose block", () => {
  const sqlServer = { engine: "sqlserver", sessionId: SQL_SERVER_SPID };

  it("shows the latest sqlserver sample as metric tiles, with CPU, reads, writes and memory", () => {
    const latest = sample({ sampledAt: "2026-11-09T10:00:12Z", cpuMs: SAMPLE_CPU_MS, waitType: "LCK_M_S", waitResource: WAIT_RESOURCE, waitMs: 2_000, blockedBy: BLOCKER, blocked: true });
    render(<StepQuerySection query={queryOf({ session: sqlServer, diagnose: [sample({ cpuMs: 1_000 }), latest] })} />);
    const shown = [...diagnose()!.querySelectorAll("[data-metric]")].map((el) => el.getAttribute("data-metric"));
    expect(shown).toEqual(["State", "Elapsed", "CPU", "Logical reads", "Reads", "Writes", "Memory", "Wait", "Blocked by"]);
    expect(tile("CPU")).toHaveTextContent("9.0s");
    expect(tile("Elapsed")).toHaveTextContent("12.5s");
    expect(tile("Memory")).toHaveTextContent("8 MB");
    expect(tile("Wait")).toHaveTextContent("LCK_M_S");
    expect(tile("Blocked by")).toHaveTextContent(String(BLOCKER));
    expect(diagnose()!.querySelector("[data-query-diagnose-wait-resource]")).toHaveTextContent(WAIT_RESOURCE);
  });

  it("omits Blocked by when the session is not blocked", () => {
    render(<StepQuerySection query={queryOf({ session: sqlServer, diagnose: [sample()] })} />);
    expect(tile("Blocked by")).toBeNull();
    expect(tile("CPU")).not.toBeNull();
  });

  it("hides the metrics postgres never reports (CPU, reads, writes, memory)", () => {
    const pg = sample({ engine: "postgres", sessionId: POSTGRES_PID, cpuMs: 0, logicalReads: 0, reads: 0, writes: 0, memoryBytes: 0, waitType: "Timeout", state: "active" });
    render(<StepQuerySection query={queryOf({ session: { engine: "postgres", sessionId: POSTGRES_PID }, diagnose: [pg] })} />);
    const shown = [...diagnose()!.querySelectorAll("[data-metric]")].map((el) => el.getAttribute("data-metric"));
    expect(shown).toEqual(["State", "Elapsed", "Wait"]);
    expect(tile("State")).toHaveTextContent("active");
    expect(diagnose()!.querySelector("[data-query-spark]")).toBeNull();
  });

  it("counts the samples, including the older ones dropped, and sparkles CPU and logical reads across them", () => {
    const samples = [1, 2, 3].map((n) => sample({ sampledAt: `2026-11-09T10:00:0${n}Z`, cpuMs: n * 1_000, logicalReads: n * 10 }));
    render(<StepQuerySection query={queryOf({ session: sqlServer, diagnose: samples, diagnoseDropped: 7 })} />);
    expect(diagnose()!.querySelector("[data-query-diagnose-count]")).toHaveTextContent("3 samples · 7 older dropped");
    expect([...diagnose()!.querySelectorAll("[data-query-spark]")].map((el) => el.getAttribute("data-query-spark"))).toEqual(["cpu", "logicalReads"]);
  });

  it("renders the diagnose error as a warning line, with no tiles when no sample arrived", () => {
    render(<StepQuerySection query={queryOf({ session: sqlServer, diagnoseError: ERROR })} />);
    expect(diagnose()!.querySelector("[data-query-diagnose-error]")).toHaveTextContent(ERROR);
    expect(diagnose()!.querySelectorAll("[data-metric]")).toHaveLength(0);
  });
});
