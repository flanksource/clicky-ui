import { cn } from "../../lib/utils";
import { formatDuration } from "../../lib/format";
import { WorkloadCard } from "../WorkloadCard";
import { JvmMetrics, ResourceMetrics } from "./Metrics";
import { validateWorkloadPanel } from "./model";
import type { WorkloadPanelProps } from "./types";

export function WorkloadPanel(props: WorkloadPanelProps) {
  validateWorkloadPanel(props);
  const {
    workload,
    container,
    cpu,
    memory,
    jvm,
    observationWindowMs,
    className,
    headerActions,
  } = props;
  const name = `${workload.name} / ${container}`;
  return (
    <section
      className={cn("@container min-w-0 w-full", className)}
      aria-label={`${name} workload`}
    >
      <WorkloadCard
        workload={{ ...workload, name }}
        metrics={{}}
        size="lg"
        expandable={false}
        headerActions={
          <>
            <span
              className="whitespace-nowrap text-xs text-muted-foreground"
              title="Observation window"
            >
              {formatDuration(observationWindowMs)} window
            </span>
            {headerActions}
          </>
        }
      >
        <div className="space-y-4">
          <ResourceMetrics cpu={cpu} memory={memory} />
          <div className="flex flex-wrap gap-x-4 gap-y-1 text-[11px] text-muted-foreground">
            <span>Avg inside bar</span>
            <span className="text-[var(--clicky-info)]">Request</span>
            <span className="text-[var(--clicky-warning)]">P90</span>
            <span className="text-[var(--clicky-error)]">P95</span>
            <span>Limit</span>
          </div>
          {jvm && (
            <JvmMetrics
              jvm={jvm}
              memory={memory}
              observationWindowMs={observationWindowMs}
            />
          )}
        </div>
      </WorkloadCard>
    </section>
  );
}
