import { Badge } from "@flanksource/clicky-ui";

export function commentBadge(count: number) {
  return count > 0 ? <Badge clickToCopy={false} count={count} size="xxs" tone="info" variant="soft" /> : null;
}
