// Pure token/cost string formatters, shared by the context meter (chat layer)
// and the session cost helpers (ai layer). Kept in lib so both can import them
// without crossing the chat↛ai boundary.

/** Compact token count: "" for 0, "1.2M", "12k", or the raw number. */
export function compactTokens(value?: number): string {
  if (!value) return "";
  if (value >= 1_000_000) return `${(value / 1_000_000).toFixed(1)}M`;
  if (value >= 1_000) return `${Math.round(value / 1_000)}k`;
  return String(value);
}

/** USD cost with sub-cent precision for tiny amounts: "$0.0042" or "$0.12". */
export function formatCost(value: number): string {
  return value < 0.01 ? `$${value.toFixed(4)}` : `$${value.toFixed(2)}`;
}
