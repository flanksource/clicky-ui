import { Badge } from "@flanksource/clicky-ui";
import { UiWarningTriangle } from "@flanksource/clicky-ui/icons";

/** Repository rows when lint counts could not be loaded: the count is unknown, not zero. */
export function problemsUnavailableBadge(error: string) {
  const label = `Lint problems unavailable: ${error}`;
  return (
    <span title={label} aria-label={label} role="img" className="inline-flex text-amber-600">
      <UiWarningTriangle className="size-3.5" />
    </span>
  );
}

export function commentBadge(count: number) {
  return count > 0 ? <Badge clickToCopy={false} count={count} size="xxs" tone="info" variant="soft" /> : null;
}

/** Repository lint violations, summed on folders. */
export function problemBadge(count: number | undefined) {
  if (!count) return null;
  const label = `${count} lint problem${count === 1 ? "" : "s"}`;
  return (
    <span title={label} aria-label={label}>
      <Badge clickToCopy={false} count={count} size="xxs" tone="warning" variant="soft" />
    </span>
  );
}
