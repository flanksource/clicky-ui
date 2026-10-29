import { ProgressBar } from "../ProgressBar";
import { formatBytes } from "../../lib/format";
import { cn } from "../../lib/utils";
import { memoryRegions, memorySegments, nativeMemoryRegion } from "./model";
import type {
  WorkloadJvmStatistics,
  WorkloadMemoryPart,
  WorkloadResourceStatistics,
} from "./types";

export interface WorkloadMemoryStackProps {
  label: string;
  memory: WorkloadResourceStatistics;
  jvm: Pick<WorkloadJvmStatistics, "heap" | "regions">;
  part?: WorkloadMemoryPart;
  className?: string;
}

export function WorkloadMemoryStack({
  label,
  memory,
  jvm,
  part = "all",
  className,
}: WorkloadMemoryStackProps) {
  const { segments, usage, scale } = memorySegments({ memory, jvm, part });
  return (
    <div
      className={cn(
        "flex min-w-0 items-center gap-3 py-1 text-xs tabular-nums",
        className,
      )}
    >
      <div className="relative min-w-0 flex-1">
        <ProgressBar
          label={label}
          segments={segments}
          total={scale}
          formatValue={formatBytes}
          height="h-6"
          className="rounded-md"
        />
        <span className="pointer-events-none absolute inset-y-0 left-2 flex items-center font-medium text-white [text-shadow:0_0_2px_rgb(0_0_0/0.45)]">
          {formatBytes(usage)}
        </span>
      </div>
      <span className="shrink-0 text-muted-foreground">
        {formatBytes(scale)}
      </span>
    </div>
  );
}

export function WorkloadMemoryLegend() {
  return (
    <div className="flex flex-wrap gap-x-4 gap-y-2 text-xs text-muted-foreground">
      {[...memoryRegions, nativeMemoryRegion].map(({ label, color }) => (
        <span key={label} className="inline-flex items-center gap-1.5">
          <span
            className="h-2.5 w-2.5 rounded-sm"
            style={{ backgroundColor: color }}
          />
          {label}
        </span>
      ))}
    </div>
  );
}
