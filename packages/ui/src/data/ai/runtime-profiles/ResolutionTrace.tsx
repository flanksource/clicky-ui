import { cn } from "../../../lib/utils";
import type {
  RuntimeResolutionLayer,
  RuntimeResolutionLayerSource,
} from "../runtime-profile";

const SOURCE_BADGE: Record<RuntimeResolutionLayerSource, string> = {
  preset: "bg-sky-500/10 text-sky-600 dark:text-sky-300",
  profile: "bg-violet-500/10 text-violet-600 dark:text-violet-300",
  prompt: "bg-muted text-muted-foreground",
  request: "bg-muted text-muted-foreground",
};

export function ResolutionTrace({
  trace,
  className,
}: {
  trace: RuntimeResolutionLayer[];
  className?: string | undefined;
}) {
  if (trace.length === 0) {
    return (
      <p className={cn("text-xs text-muted-foreground", className)}>
        No layers resolved yet.
      </p>
    );
  }
  return (
    <ol aria-label="Resolution order" className={cn("space-y-1 text-sm", className)}>
      {trace.map((layer, index) => (
        <li
          key={layer.id ?? `${layer.source}:${layer.name}`}
          className="flex items-center gap-2 rounded bg-muted/40 px-2 py-1.5"
        >
          <span className="w-5 text-right font-mono text-xs text-muted-foreground">
            {index + 1}
          </span>
          <span className="min-w-0 flex-1 truncate">{layer.name}</span>
          <span
            className={cn(
              "rounded px-1.5 py-0.5 text-[10px] font-semibold uppercase",
              SOURCE_BADGE[layer.source],
            )}
          >
            {layer.source}
          </span>
          <span className="text-xs capitalize text-muted-foreground">
            {layer.scope}
          </span>
        </li>
      ))}
    </ol>
  );
}
