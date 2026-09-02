import type { FinancialCategory } from "../_merivio/financial-icons";
import type { ExecutionState } from "../_merivio/category-tokens";

export type { ExecutionState };

export type RuleState = "ready" | "attention" | "inactive";

export type RuleRow = {
  id: string;
  name: string;
  module: string;
  target: "Sub-ledger" | "Journal";
  /** Configuration state: is this rule switched on for the entity. */
  state: RuleState;
  /** Execution state: what the rule is doing right now. */
  execution: ExecutionState;
  lastRun: string;
  executions: number;
  category: FinancialCategory;
  iconToken: `ph:${string}-thin`;
};

export type VariantId =
  | "current-icon"
  | "explicit-command"
  | "command-rail"
  | "history-command"
  | "leading-trigger";

/**
 * `execution` and `lastRun` are kept consistent on purpose: the A–E tables read
 * `lastRun` while the D1–D3 column study reads `execution`, and they render on the
 * same screen. A row that is running must not also claim it last ran two hours ago.
 */
export const RULES: readonly RuleRow[] = [
  {
    id: "ar-counterparty",
    name: "AR sub-ledger by counterparty",
    module: "Trade receivables",
    target: "Sub-ledger",
    state: "ready",
    execution: "stopped",
    lastRun: "11 min ago",
    executions: 24,
    category: "inflow",
    iconToken: "ph:tray-arrow-down-thin",
  },
  {
    id: "fixed-assets",
    name: "Monthly fixed-asset depreciation",
    module: "Fixed assets",
    target: "Journal",
    state: "ready",
    execution: "running",
    lastRun: "Started 2 min ago",
    executions: 8,
    category: "asset",
    iconToken: "ph:trend-down-thin",
  },
  {
    id: "accrual-reversal",
    name: "Reverse prior-period accruals",
    module: "Accruals",
    target: "Journal",
    state: "attention",
    execution: "paused",
    lastRun: "Paused yesterday",
    executions: 12,
    category: "journal",
    iconToken: "ph:arrow-arc-left-thin",
  },
  {
    id: "intercompany",
    name: "Intercompany balance elimination",
    module: "Consolidation",
    target: "Journal",
    state: "inactive",
    execution: "inactive",
    lastRun: "Never run",
    executions: 0,
    category: "rule",
    iconToken: "ph:scales-thin",
  },
];

export const VARIANTS: readonly {
  id: VariantId;
  title: string;
  verdict: string;
}[] = [
  {
    id: "current-icon",
    title: "A · Current icon-only cell",
    verdict:
      "Baseline from /rules. Compact, and its per-row accessible name is genuinely good — but the verb is never visible, so the column has to be learned rather than read.",
  },
  {
    id: "explicit-command",
    title: "B · Explicit command",
    verdict:
      "Recommended. A persistent Run label makes the table self-explanatory and still fits a narrow action column. Needs an explicit per-row accessible name, or four buttons all announce as “Run”.",
  },
  {
    id: "command-rail",
    title: "C · Command rail",
    verdict:
      "Treats the right edge as a consistent launch surface. The tinted rail separates execution from descriptive data, at the cost of a column that reads as decoration until you hover it.",
  },
  {
    id: "history-command",
    title: "D · History plus command",
    verdict:
      "Puts consequence beside intent: the latest result and Run now control share one compact operational cell.",
  },
  {
    id: "leading-trigger",
    title: "E · Leading trigger",
    verdict:
      "Moves the command before the rule name for queue-like workflows where starting work is the table's primary task. Also the only layout that survives a narrow viewport intact.",
  },
];
