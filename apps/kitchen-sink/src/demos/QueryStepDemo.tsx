import {
  TestDetailPanel,
  TestRunnerProvider,
  emptyTestFilters,
  verificationAdapters,
  type Test,
  type TestRunnerContext,
} from "@flanksource/clicky-ui";
import { DemoSection } from "./Section";

const TEMPLATE = "SELECT guid FROM AsActivity WHERE StatusCode = $(.params.status)";
const adapters = verificationAdapters();

const sample = (n: number, overrides: Record<string, unknown>) => ({
  sampledAt: `2026-11-09T10:00:${String(10 + n * 2).padStart(2, "0")}Z`,
  database: "app", requestId: 0, blockedBy: 0, blocked: false, user: "reporter", application: "gavel", clientHost: "laptop",
  command: "SELECT", waitType: "", waitResource: "", waitMs: 0, startedAt: "2026-11-09T10:00:00Z",
  transactionStartedAt: "0001-01-01T00:00:00Z", transactionMs: 0, openTransactions: 0, queryId: "", sql: TEMPLATE,
  ...overrides,
});

const sqlServerSamples = [0, 1, 2, 3, 4].map((n) =>
  sample(n, {
    engine: "sqlserver", sessionId: 57, state: "running", elapsedMs: 10_000 + n * 2_000, cpuMs: 4_000 + n * n * 600,
    logicalReads: 80_000 + n * 40_000, reads: 120 + n * 30, writes: 4, memoryBytes: 8 * 1024 * 1024,
    ...(n === 4 ? { waitType: "LCK_M_S", waitMs: 1_800, waitResource: "KEY: 5:72057594038779904 (8194443284a0)", blockedBy: 61, blocked: true } : {}),
  }),
);

const postgresSamples = [0, 1, 2].map((n) =>
  sample(n, { engine: "postgres", sessionId: 4121, state: "active", elapsedMs: 10_000 + n * 2_000, waitType: "Timeout" }),
);

function queryStep(name: string, record: Record<string, unknown>): Test {
  return {
    name, framework: "fixture", running: true,
    detail: { name, kind: "command", state: "running", query: { template: TEMPLATE, params: { status: "02" }, ...record } },
  };
}

function QueryStepPanel({ node }: { node: Test }) {
  const context: TestRunnerContext = {
    tests: [node], selected: node, done: false, filters: emptyTestFilters(), expandAll: null, busy: {}, adapters,
    onSelect: () => {}, onFiltersChange: () => {}, onExpandAllChange: () => {},
  };
  return (
    <TestRunnerProvider value={context}>
      <TestDetailPanel />
    </TestRunnerProvider>
  );
}

export function QueryStepDemo() {
  return (
    <div className="space-y-density-6">
      <DemoSection
        id="query-step-sqlserver"
        title="SQL Server session, blocked"
        description="A slow statement past autoDiagnose: session badge, the latest sample as tiles (CPU, reads, writes, memory, wait, blocked by) and CPU / logical-reads trends."
      >
        <QueryStepPanel
          node={queryStep("slow-report", {
            connection: { name: "lab", type: "sql_server", host: "db01.example.com", port: "1433", user: "reporter", database: "app" },
            session: { engine: "sqlserver", sessionId: 57, server: "db01", database: "app", user: "reporter" },
            diagnose: sqlServerSamples,
            diagnoseDropped: 12,
          })}
        />
      </DemoSection>
      <DemoSection
        id="query-step-postgres"
        title="Postgres session"
        description="Postgres reports no per-session CPU, IO or memory, so only state, elapsed and wait show."
      >
        <QueryStepPanel
          node={queryStep("slow-report", {
            connection: { name: "lab", type: "postgres", host: "pg01.example.com", port: "5432", user: "reporter", database: "app" },
            session: { engine: "postgres", sessionId: 4121, server: "pg01" },
            diagnose: postgresSamples,
          })}
        />
      </DemoSection>
      <DemoSection id="query-step-diagnose-error" title="Sampler could not read activity" description="The diagnose error is a warning; the query itself is unaffected.">
        <QueryStepPanel
          node={queryStep("slow-report", {
            connection: { name: "lab", type: "sql_server", host: "db01.example.com", port: "1433", database: "app" },
            session: { engine: "sqlserver", sessionId: 57, server: "db01" },
            diagnoseError: "the login lacks VIEW SERVER STATE; run GRANT VIEW SERVER STATE TO reporter",
          })}
        />
      </DemoSection>
    </div>
  );
}
