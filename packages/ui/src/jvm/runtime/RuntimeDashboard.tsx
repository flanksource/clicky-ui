import type { ReactNode } from "react";
import { Button } from "../../components/button";
import { UiRefresh } from "../../icons";
import { capturedAtMs } from "../model/memory";
import type { JvmMetrics } from "../protocol/types";
import { GcSummary } from "./GcSummary";
import { MemoryPools } from "./MemoryPools";
import { PoolMetricsTable } from "./PoolMetricsTable";
import { ProcessTiles } from "./ProcessTiles";
import { RuntimeInfo } from "./RuntimeInfo";

export type RuntimeDashboardProps = {
  metrics: JvmMetrics;
  onRefresh?: () => void;
  refreshing?: boolean;
  className?: string;
};

function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="space-y-2">
      <h3 className="text-sm font-medium">{title}</h3>
      {children}
    </section>
  );
}

/**
 * A snapshot of the JVM's runtime: process tiles, runtime info, garbage
 * collectors, memory pools and server connector / data source pools. The
 * protocol has no history, so nothing here is a trend.
 */
export function RuntimeDashboard({ metrics, onRefresh, refreshing = false, className }: RuntimeDashboardProps) {
  const captured = new Date(capturedAtMs(metrics.capturedAt));
  return (
    <div className={className ?? "space-y-4"}>
      <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
        <span>
          Snapshot captured at <time dateTime={captured.toISOString()}>{captured.toLocaleString()}</time>
        </span>
        {onRefresh ? (
          <Button size="sm" variant="outline" className="ml-auto" loading={refreshing} onClick={onRefresh}>
            <UiRefresh /> Refresh
          </Button>
        ) : null}
      </div>
      <ProcessTiles metrics={metrics} />
      <div className="grid gap-4 lg:grid-cols-2">
        <Section title="Runtime">
          <RuntimeInfo runtime={metrics.runtime} />
        </Section>
        <Section title="Garbage collectors">
          <GcSummary collectors={metrics.garbageCollectors} />
        </Section>
      </div>
      <Section title="Memory pools">
        <MemoryPools memory={metrics.memory} />
      </Section>
      {metrics.connectors.length > 0 ? (
        <Section title="Server connectors">
          <PoolMetricsTable label="Server connectors" pools={metrics.connectors} />
        </Section>
      ) : null}
      {metrics.dataSources.length > 0 ? (
        <Section title="Data sources">
          <PoolMetricsTable label="Data sources" pools={metrics.dataSources} />
        </Section>
      ) : null}
    </div>
  );
}
