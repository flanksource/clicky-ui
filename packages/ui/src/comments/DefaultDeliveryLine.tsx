import type { CommentDefaultDelivery } from "./comment-types";

/**
 * What a comment that names no `@target` is sent to, and the settings layer
 * whose rule says so. Renders nothing while no rule delivers comments, so a
 * composer can always mount it with `config.defaultDelivery`.
 */
export function DefaultDeliveryLine({ delivery, className }: { delivery: CommentDefaultDelivery | null | undefined; className?: string }) {
  if (!delivery) return null;
  return (
    <p
      data-testid="default-delivery"
      {...(delivery.description ? { title: delivery.description } : {})}
      className={className ?? "text-[11px] leading-4 text-muted-foreground"}
    >
      {`Comments without an @target go to ${delivery.label}${delivery.layer ? ` (rule from ${delivery.layer})` : ""}`}
    </p>
  );
}
