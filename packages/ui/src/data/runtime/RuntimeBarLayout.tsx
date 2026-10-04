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
        className="inline-flex h-control-h max-w-full items-stretch overflow-hidden rounded-md border border-input bg-background"
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
            className="pointer-events-none invisible absolute left-0 top-0 flex w-max items-stretch"
          >
            <RuntimeBarIdentity {...identity} measure />
            {supplied.map((field) => (
              <div
                key={field.id}
                className="flex h-control-h items-center gap-1.5 border-l border-border px-density-2"
              >
                <RuntimeSegmentCaption>{field.caption}</RuntimeSegmentCaption>
              </div>
            ))}
            <div className="flex h-control-h items-center border-l border-border px-density-2">
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
