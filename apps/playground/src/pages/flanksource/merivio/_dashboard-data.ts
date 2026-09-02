export type IntegrationKind = "ledger" | "documents" | "bank-feed";
export type ConnectionLifecycle = "active" | "expired";
export type SyncOutcome = "success" | "error";

export type DashboardIntegration = {
  id: string;
  name: string;
  kind: IntegrationKind;
  purpose: string;
  resource: string;
  lifecycle: ConnectionLifecycle;
  sync: {
    outcome: SyncOutcome;
    label: string;
    detail: string;
  };
};

export type RuleActivation = "active-here" | "out-of-scope";
export type RuleExecution = "ready" | "running" | "failed" | "inactive";

export type DashboardRule = {
  id: string;
  name: string;
  module: string;
  target: string;
  activation: RuleActivation;
  execution: RuleExecution;
  activity: string;
  detail: string;
};

export const ENTITY = {
  name: "Acme South Africa (Pty) Ltd",
  jurisdiction: "ZA",
  currency: "ZAR",
  refreshed: "42s ago",
} as const;

export const INTEGRATIONS: readonly DashboardIntegration[] = [
  {
    id: "xero",
    name: "Xero",
    kind: "ledger",
    purpose: "Primary ledger",
    resource: "Acme South Africa",
    lifecycle: "active",
    sync: {
      outcome: "success",
      label: "Synced 12 min ago",
      detail: "Accounts, transactions, journals and contacts",
    },
  },
  {
    id: "google-drive",
    name: "Google Drive",
    kind: "documents",
    purpose: "Close documents",
    resource: "FY2026 close folder",
    lifecycle: "active",
    sync: {
      outcome: "success",
      label: "Verified 2 hours ago",
      detail: "Statements and supporting schedules",
    },
  },
  {
    id: "wise",
    name: "Wise",
    kind: "bank-feed",
    purpose: "Bank feed",
    resource: "Operating account · GBP",
    lifecycle: "active",
    sync: {
      outcome: "error",
      label: "Sync failed 47 min ago",
      detail: "Authentication succeeded; statement import failed",
    },
  },
];

export const RULES: readonly DashboardRule[] = [
  {
    id: "ar-counterparty",
    name: "AR sub-ledger by counterparty",
    module: "Trade receivables",
    target: "Sub-ledger",
    activation: "active-here",
    execution: "ready",
    activity: "Applied 11 min ago",
    detail: "24 executions",
  },
  {
    id: "fixed-assets",
    name: "Monthly fixed-asset depreciation",
    module: "Fixed assets",
    target: "Journal",
    activation: "active-here",
    execution: "running",
    activity: "Started 2 min ago",
    detail: "8 executions",
  },
  {
    id: "accrual-reversal",
    name: "Reverse prior-period accruals",
    module: "Accruals",
    target: "Journal",
    activation: "active-here",
    execution: "failed",
    activity: "Failed yesterday",
    detail: "12 executions · unmatched reversal account",
  },
  {
    id: "intercompany",
    name: "Intercompany balance elimination",
    module: "Consolidation",
    target: "Journal",
    activation: "out-of-scope",
    execution: "inactive",
    activity: "Never run here",
    detail: "Selected entities only",
  },
];

export const SYNCED_DATA = [
  { label: "Accounts", value: "168", synced: "12m ago" },
  { label: "Transactions", value: "18,426", synced: "12m ago" },
  { label: "Journals", value: "2,845", synced: "16m ago" },
  { label: "Contacts", value: "612", synced: "12m ago" },
] as const;

export const HEALTHY_INTEGRATIONS = INTEGRATIONS.filter(
  (integration) =>
    integration.lifecycle === "active" &&
    integration.sync.outcome === "success",
).length;

export const OPERATIONAL_RULES = RULES.filter(
  (rule) => rule.execution === "ready" || rule.execution === "running",
).length;

export const ATTENTION_COUNT =
  INTEGRATIONS.filter((integration) => integration.sync.outcome === "error")
    .length + RULES.filter((rule) => rule.execution === "failed").length;
