import {
  type BadgeStatus,
  type BadgeTone,
  type StaticIconComponent,
  UiArrowDownRight,
  UiArrowUpRight,
  UiBank,
  UiCalculator,
  UiCalendar,
  UiChartOfAccounts,
  UiCircleX,
  UiClock,
  UiCloudUpload,
  UiCoins,
  UiCurrencyDollar,
  UiFileText,
  UiGavel,
  UiHistory,
  UiHourglass,
  UiLedger,
  UiListChecks,
  UiReceipt,
  UiRefresh,
  UiScale,
  UiSealCheck,
  UiSwap,
  UiTrendDown,
  UiTrendUp,
  UiUserCircle,
  UiWarningTriangle,
} from "@flanksource/clicky-ui";
import type {
  AccountClass,
  Approval,
  ApprovalDirection,
  ApprovalIconKey,
  ApprovalKind,
  ApprovalReadiness,
  CheckTone,
} from "./types";

export const ORG = "85952869-cc41-4754-bc97-96cbac66f83a";
export const ENTITY = "8afe8430-f962-44e5-991e-5f4a15843904";

export const ICONS: Record<ApprovalIconKey, StaticIconComponent> = {
  ap: UiCoins,
  awaiting: UiClock,
  accrual: UiHistory,
  bank: UiBank,
  bank_rule: UiBank,
  bill: UiFileText,
  coa: UiChartOfAccounts,
  contact: UiUserCircle,
  credit: UiArrowUpRight,
  credit_note: UiReceipt,
  currency: UiCurrencyDollar,
  debit: UiArrowDownRight,
  expenses: UiTrendDown,
  fx_rate: UiCurrencyDollar,
  income: UiTrendUp,
  invoice: UiReceipt,
  journal: UiLedger,
  opening: UiCalendar,
  outstanding: UiHourglass,
  overdue: UiWarningTriangle,
  paid: UiSealCheck,
  posting: UiCloudUpload,
  reconcile: UiListChecks,
  reversal: UiCircleX,
  revaluation: UiRefresh,
  rule: UiGavel,
  tax: UiCalculator,
  transfer: UiSwap,
  trial_balance: UiScale,
};

/** Chip tint for each icon slot, reusing the shared Badge tone vocabulary. */
export const ICON_TONES: Record<ApprovalIconKey, BadgeTone> = {
  ap: "warning",
  awaiting: "warning",
  accrual: "neutral",
  bank: "info",
  bank_rule: "info",
  bill: "warning",
  coa: "info",
  contact: "neutral",
  credit: "success",
  credit_note: "danger",
  currency: "success",
  debit: "info",
  expenses: "warning",
  fx_rate: "success",
  income: "success",
  invoice: "success",
  journal: "info",
  opening: "neutral",
  outstanding: "warning",
  overdue: "danger",
  paid: "success",
  posting: "info",
  reconcile: "info",
  reversal: "danger",
  revaluation: "info",
  rule: "info",
  tax: "info",
  transfer: "info",
  trial_balance: "neutral",
};

export const KIND_META: Record<
  ApprovalKind,
  { label: string; icon: ApprovalIconKey }
> = {
  journal: { label: "Journal", icon: "journal" },
  transaction: { label: "Transaction", icon: "invoice" },
  account: { label: "Account", icon: "coa" },
  mapping: { label: "Mapping", icon: "bank_rule" },
  upstream: { label: "Upstream", icon: "posting" },
};

export const DIRECTION_META: Record<
  ApprovalDirection,
  { label: string; icon: StaticIconComponent }
> = {
  inbound: { label: "Xero → ledger", icon: UiArrowDownRight },
  outbound: { label: "Ledger → Xero", icon: UiArrowUpRight },
  internal: { label: "Ledger only", icon: UiSwap },
};

export const CHECK_TONES: Record<CheckTone, BadgeTone> = {
  ok: "success",
  pending: "warning",
  bad: "danger",
};

export const ACCOUNT_CLASS_TONES: Record<AccountClass, BadgeTone> = {
  asset: "info",
  liability: "warning",
  expense: "danger",
  revenue: "success",
  bank: "info",
  sub: "neutral",
};

/**
 * Ledger money formatting: fixed decimals, thousands separators, negatives in
 * accounting parentheses.
 */
export function money(value: number, decimals = 2) {
  const formatted = Math.abs(value).toLocaleString("en-US", {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });
  return value < 0 ? `(${formatted})` : formatted;
}

/** `9h` / `5d` / `26d` as hours, so the Age column sorts oldest-first. */
export function ageHours(age: string) {
  const magnitude = Number.parseInt(age, 10);
  if (Number.isNaN(magnitude)) return 0;
  return age.endsWith("d") ? magnitude * 24 : magnitude;
}

/** Merivio tints rows that have sat in the queue for five days or more. */
export function isStale(age: string) {
  return age.endsWith("d") && Number.parseInt(age, 10) >= 5;
}

export function readinessStatus(readiness: ApprovalReadiness): BadgeStatus {
  if (readiness === "Blocked") return "error";
  if (readiness === "Needs review") return "warning";
  return "success";
}

export function readinessTone(readiness: ApprovalReadiness): BadgeTone {
  if (readiness === "Blocked") return "danger";
  if (readiness === "Needs review") return "warning";
  return "success";
}

/** `za-itr14-tax-position~77f980298144` → `za-itr14-tax-position`. */
export function ruleName(id: string) {
  return id.split("~")[0] ?? id;
}

/** The trailing hash of a rule id, shown as a short reference. */
export function shortId(id: string) {
  return id.split("~")[1] ?? id;
}

/** The decision verb depends on what approving actually does. */
export function approveLabel(approval: Approval) {
  if (approval.kind === "upstream") return "Approve and push";
  if (approval.kind === "account" || approval.kind === "mapping")
    return "Approve and apply";
  return "Approve and post";
}
