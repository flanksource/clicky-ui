/**
 * Shape of a change-control approval queue. Ported from the Merivio design
 * artifact: a ledger change (journal / transaction / account / mapping /
 * upstream write) that a rule proposed and an operator must decide on.
 */

export type ApprovalKind =
  | "journal"
  | "transaction"
  | "account"
  | "mapping"
  | "upstream";

export type ApprovalDirection = "inbound" | "outbound" | "internal";

export type ApprovalState = "proposed" | "approved" | "rejected";

export type ApprovalReadiness =
  | "Ready"
  | "Needs review"
  | "Blocked"
  | "Posted"
  | "Closed";

/** Semantic icon slots the fixtures reference; resolved to `Ui*` in `meta.ts`. */
export type ApprovalIconKey =
  | "ap"
  | "awaiting"
  | "accrual"
  | "bank"
  | "bank_rule"
  | "bill"
  | "coa"
  | "contact"
  | "credit"
  | "credit_note"
  | "currency"
  | "debit"
  | "expenses"
  | "fx_rate"
  | "income"
  | "invoice"
  | "journal"
  | "opening"
  | "outstanding"
  | "overdue"
  | "paid"
  | "posting"
  | "reconcile"
  | "reversal"
  | "revaluation"
  | "rule"
  | "tax"
  | "transfer"
  | "trial_balance";

export type CheckTone = "ok" | "pending" | "bad";

export type ApprovalCheck = {
  tone: CheckTone;
  icon: ApprovalIconKey;
  title: string;
  detail: string;
};

export type ApprovalEvent = {
  icon: ApprovalIconKey;
  who: string;
  what: string;
  at: string;
};

/** Ledger account class, driving the account tag colour. */
export type AccountClass =
  | "asset"
  | "liability"
  | "expense"
  | "revenue"
  | "bank"
  | "sub";

export type JournalLine = {
  code: string;
  name: string;
  cls: AccountClass;
  icon: ApprovalIconKey;
  dir: "debit" | "credit";
  desc: string;
  net: number;
  tax: number;
  gross: number;
};

export type JournalChange = {
  name: string;
  date: string;
  status: string;
  debit: number;
  credit: number;
  lines: JournalLine[];
};

export type TransactionLine = {
  code: string;
  name: string;
  cls: AccountClass;
  icon: ApprovalIconKey;
  desc: string;
  qty: number;
  unit: number;
  net: number;
  tax: number;
  gross: number;
};

export type TransactionChange = {
  docType: string;
  number: string;
  contact: string;
  contactRef: string;
  date: string;
  due: string;
  status: string;
  terms: string;
  lines: TransactionLine[];
  totals: { net: number; tax: number; gross: number };
};

export type AccountChange = {
  op: "create";
  code: string;
  name: string;
  cls: AccountClass;
  type: string;
  taxRate: string;
  parent: string;
  currency: string;
  description: string;
  flags: Array<[string, string]>;
  usedBy: Array<{ rule: string; what: string }>;
};

export type MappingChange = {
  source: string;
  reason: string;
  rows: Array<{
    external: string;
    from: { code: string; name: string };
    to: { code: string; name: string };
    txns: number;
  }>;
};

export type UpstreamChange = {
  system: string;
  endpoint: string;
  tenant: string;
  mode: string;
  docs: Array<{
    ref: string;
    narr: string;
    amount: number;
    status: "ready" | "waiting";
  }>;
  more: number;
  retries: number;
  lastAttempt: string;
};

/** A row in the "live state" comparison — numeric or textual on both sides. */
export type LiveStateRow = {
  code: string;
  name: string;
  cls: AccountClass;
  now?: number;
  after?: number;
  nowText?: string;
  afterText?: string;
};

export type LiveState = {
  note: string;
  cols: [string, string, string];
  rows: LiveStateRow[];
};

type ApprovalBase = {
  id: string;
  icon: ApprovalIconKey;
  direction: ApprovalDirection;
  title: string;
  subtitle: string;
  /** `null` for changes with no monetary value (chart / mapping edits). */
  amount: number | null;
  currency: string;
  state: ApprovalState;
  readiness: ApprovalReadiness;
  policy: string;
  module: string;
  ruleId: string;
  ruleVersion: number;
  targetType: string;
  targetId: string;
  period: string;
  connector: string;
  idempotency: string;
  sourceRecords: string[];
  requestedBy: string;
  created: string;
  /** Human age as shown in the queue, e.g. `9h`, `5d`. */
  age: string;
  resolvedBy?: string;
  resolvedAt?: string;
  live?: LiveState;
  checks: ApprovalCheck[];
  timeline: ApprovalEvent[];
  payloads: Record<string, string>;
};

/** The `kind` discriminates which preview renders `change`. */
export type Approval = ApprovalBase &
  (
    | { kind: "journal"; change: JournalChange }
    | { kind: "transaction"; change: TransactionChange }
    | { kind: "account"; change: AccountChange }
    | { kind: "mapping"; change: MappingChange }
    | { kind: "upstream"; change: UpstreamChange }
  );
