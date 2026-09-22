import { parseGoDurationMs } from "../../lib/duration";

export type RuntimeBarBudget ={ cost?: number; timeout?: string };

export const TIMEOUT_PRESETS = ["5m", "15m", "30m", "1h", "2h"] as const;
export const COST_PRESETS = [0.5, 1, 2, 5, 10] as const;

// Captain parses timeouts with Go's time.ParseDuration.
export function parseTimeout(text: string): string | undefined {
  const trimmed = text.trim();
  return parseGoDurationMs(trimmed) === null ? undefined : trimmed;
}

export function parseCost(text: string): number | undefined {
  const trimmed = text.trim();
  if (!trimmed) return undefined;
  const cost = Number(trimmed);
  return Number.isFinite(cost) && cost > 0 ? cost : undefined;
}

export function formatCost(cost: number | undefined): string | undefined {
  return cost === undefined ? undefined : `$${cost.toFixed(2)}`;
}

/** Sets or clears one budget limit, dropping the budget once it is empty. */
export function withBudgetLimit<T extends { budget?: RuntimeBarBudget }>(
  value: T,
  key: keyof RuntimeBarBudget,
  next: string | number | undefined,
): T {
  const budget: Record<string, unknown> = { ...value.budget };
  if (next === undefined) delete budget[key];
  else budget[key] = next;
  const updated = { ...value };
  if (Object.keys(budget).length > 0) updated.budget = budget as RuntimeBarBudget;
  else delete updated.budget;
  return updated;
}
