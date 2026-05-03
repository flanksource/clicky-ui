import { LogsTable } from "@flanksource/clicky-ui";
import { DemoSection } from "./Section";

const services = ["policy-api", "billing", "claims", "identity", "payments"];
const levels = ["INFO", "WARN", "ERROR", "DEBUG"];
const loggers = [
  "com.example.policy.filter.ServiceRequestFilter",
  "com.example.policy.lookup.PolicyLookup",
  "com.example.policy.workflow.ActivityRunner",
  "com.example.policy.security.AuthFilter",
];
const messages = [
  "Filtering request path: appBanner/bannerInfo",
  "Slow policy lookup for tenant default",
  "Workflow activity completed",
  "Authenticated session token and refreshed user context",
  "Queued async persistence job",
];
const longMessage =
  "Very long request diagnostic payload: policy number 883921 was evaluated across every configured eligibility rule, " +
  "including jurisdiction overrides, rider exclusions, duplicate beneficiary checks, premium allocation validation, " +
  "and a final post-processing step that emitted a verbose audit trail intended to exercise horizontal table scrolling.";

function makeLabels(index: number, service: string) {
  const base: Record<string, string> = {
    namespace: "claims-demo",
    pod: `policy-api-${644 + (index % 4)}b55c866-${["mg7tg", "p9c2k", "q4n8v", "t6x1m"][index % 4]}`,
    team: index % 2 === 0 ? "platform" : "insurance",
    env: index % 3 === 0 ? "prod" : "stage",
    service,
  };

  if (index % 8 !== 0) return base;

  return {
    ...base,
    "trace.id": `trace-${index}-9d1f2a7b`,
    "customer.segment": "enterprise-long-tail",
    "policy.state": "under-review",
    "workflow.name": "policy-issuance-with-extended-validation",
    "workflow.step": "eligibility-and-premium-reconciliation",
    "feature.flag": "new-underwriting-rules",
    "request.path": "/PolicyService/rest/services/policy/appBanner/bannerInfo",
    "node.pool": "policy-workers-critical",
    "deployment.version": `2026.05.${index % 10}`,
    "region.zone": "us-east-1a",
  };
}

function makeLogLine(index: number) {
  const service = services[index % services.length]!;
  const level = levels[index % levels.length]!;
  const logger = loggers[index % loggers.length]!;
  const timestamp = new Date(Date.UTC(2026, 4, 3, 10, 9, 30 + index)).toISOString();
  const jsonMessage =
    index % 11 === 0
      ? JSON.stringify({
          operation: "policy-evaluation",
          policyId: `POL-${10000 + index}`,
          ruleResults: {
            eligibility: "pass",
            premium: index % 2 === 0 ? "pass" : "review",
            beneficiary: "pass",
          },
          timings: { parseMs: 8 + index, dbMs: 32 + index * 2, renderMs: 4 },
        })
      : undefined;
  const message =
    index % 13 === 0 ? longMessage : (jsonMessage ?? messages[index % messages.length]!);
  const labels = makeLabels(index, service);

  return JSON.stringify({
    pod: labels.pod,
    container: service,
    line: JSON.stringify({
      "@timestamp": timestamp,
      "log.level": level,
      message,
      "ecs.version": "1.2.0",
      "service.name": service,
      "event.dataset": service,
      "process.thread.name": `http-nio-8080-exec-${(index % 9) + 1}`,
      "log.logger": logger,
      attributes:
        index % 8 === 0
          ? {
              requestId: `req-${index}-7cf8a0`,
              route: "/policy/eligibility/evaluate",
              elapsedMs: 120 + index,
              payloadBytes: 18_000 + index * 221,
              flags: ["debug", "audit", "rules-v2", "expanded-context"],
            }
          : undefined,
    }),
    timestamp,
    labels,
  });
}

const logs = [
  "plain startup line before JSON logging is configured",
  ...Array.from({ length: 96 }, (_, index) => makeLogLine(index)),
].join("\n");

export function LogsTableDemo() {
  return (
    <DemoSection
      id="logs-table"
      title="LogsTable"
      description="Dark compact DataTable wrapper for plain logs, JSON lines, and Kubernetes log envelopes."
    >
      <div className="h-[72vh] min-h-[32rem] w-full min-w-0">
        <LogsTable
          logs={logs}
          className="h-full w-full overflow-auto"
          columnResizeStorageKey="clicky-ui-kitchen-logs-table"
        />
      </div>
    </DemoSection>
  );
}
