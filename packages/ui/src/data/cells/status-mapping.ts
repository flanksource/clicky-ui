import type { BadgeStatus } from "../Badge";

const ERROR_TOKENS = new Set([
  "error",
  "err",
  "fatal",
  "critical",
  "crit",
  "panic",
  "failed",
  "fail",
  "down",
  "unhealthy",
]);

const WARN_TOKENS = new Set(["warn", "warning", "degraded", "slow", "stale"]);

const OK_TOKENS = new Set([
  "ok",
  "healthy",
  "success",
  "info",
  "debug",
  "trace",
  "up",
  "running",
  "ready",
]);

export function normalizeStatus(raw: unknown): BadgeStatus | null {
  if (raw == null) return null;

  if (typeof raw === "boolean") return raw ? "success" : "error";

  const token = String(raw).toLowerCase().trim();
  if (!token) return null;

  if (ERROR_TOKENS.has(token)) return "error";
  if (WARN_TOKENS.has(token)) return "warning";
  if (OK_TOKENS.has(token)) return "success";

  return null;
}

export const STATUS_TOKEN_GROUPS = {
  error: ERROR_TOKENS,
  warning: WARN_TOKENS,
  success: OK_TOKENS,
} as const;
