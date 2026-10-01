import { UiDotsVertical } from "../../icons";
import { cn } from "../../lib/utils";
import { Icon } from "../Icon";
import {
  RuntimeBarActions,
  type RuntimeBarActionsProps,
} from "./RuntimeBarActions";
import {
  RuntimeBarIdentity,
  type RuntimeBarIdentityProps,
} from "./RuntimeBarIdentity";
import { RuntimeSegmentCaption } from "./RuntimeBarSegment";
import { useRuntimeBarOverflow } from "./use-runtime-bar-overflow";

export function RuntimeBarLayout({
  identity,
  actions,
  ariaLabel,
  className,
}: {
  identity: RuntimeBarIdentityProps;
  actions: RuntimeBarActionsProps;
  ariaLabel: string;
  className?: string | undefined;
}) {
  const { containerRef, measurementRef, visibleCount } =
    useRuntimeBarOverflow();
  const supplied = actions.fields?.filter((field) => field.isSet) ?? [];
  const hasMenu = Boolean(actions.fields?.length || actions.menu?.length);
  return (
    <div
      ref={containerRef}
      className={cn("relative w-full min-w-0", className)}
    >
      <div
        role="group"
        aria-label={ariaLabel}
        data-runtime-bar-variant={identity.variant}
        className={cn(
          "inline-flex h-control-h max-w-full items-stretch",
          identity.variant === "combo"
            ? "gap-1"
            : "overflow-hidden rounded-md border border-input bg-background",
        )}
      >
        <RuntimeBarIdentity {...identity} />
        <RuntimeBarActions {...actions} visibleCount={visibleCount} />
      </div>
      {hasMenu && (
        <div
          className="pointer-events-none absolute inset-0 overflow-hidden"
          aria-hidden="true"
        >
          <div
            ref={measurementRef}
            className={cn(
              "pointer-events-none invisible absolute left-0 top-0 flex w-max items-stretch",
              identity.variant === "combo" && "gap-1",
            )}
          >
            <RuntimeBarIdentity {...identity} measure />
            {supplied.map((field) => (
              <div
                key={field.id}
                className={cn(
                  "flex h-control-h items-center gap-1.5 px-density-2",
                  identity.variant === "combo"
                    ? "rounded-md border border-input"
                    : "border-l border-border",
                )}
              >
                <RuntimeSegmentCaption>{field.caption}</RuntimeSegmentCaption>
              </div>
            ))}
            <div
              className={cn(
                "flex h-control-h items-center px-density-2",
                identity.variant === "combo"
                  ? "rounded-md border border-input"
                  : "border-l border-border",
              )}
            >
              <Icon
                icon={UiDotsVertical}
                className="size-4 shrink-0 text-muted-foreground"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
