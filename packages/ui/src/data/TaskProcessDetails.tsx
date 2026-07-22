import { UiActivity, UiDatabase, UiFile } from "../icons";
import { TimeseriesGauge } from "./TimeseriesGauge";
import { DiagnosticsTree } from "./diagnostics/DiagnosticsTree";
import { formatBytes } from "./diagnostics/utils";
import { buildTaskProcessForest } from "./task-process-details";
import type { TaskProcessDetails } from "./TaskSnapshot";

export function TaskProcessDetailsView({
  details,
  metricsBaseUrl,
}: {
  details: TaskProcessDetails;
  metricsBaseUrl?: string;
}) {
  const forest = buildTaskProcessForest(details.tree ?? []);
  const metricBase = metricsBaseUrl ?? "/api/v1/tasks/metrics/";
  const restartLabel = `${details.restarts} ${details.restarts === 1 ? "restart" : "restarts"}`;

  return (
    <section className="mb-3 space-y-3 rounded-md border bg-muted/20 p-3">
      <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted-foreground">
        <span className="font-mono text-foreground">pid {details.pid ?? "—"}</span>
        <span>{details.status}</span>
        <span>{details.latest.cpuPercent.toFixed(1)}% CPU</span>
        <span>{formatBytes(details.latest.rssBytes)} RSS</span>
        <span>{formatBytes(details.latest.vmsBytes)} VMS</span>
        <span>{details.latest.openFiles >= 0 ? `${details.latest.openFiles} files` : "files unavailable"}</span>
        <span>{restartLabel}</span>
        <span>{details.restartPolicy}</span>
        <span>
          Peak {details.peak.cpuPercent.toFixed(1)}% CPU · {formatBytes(details.peak.rssBytes)} RSS · {formatBytes(details.peak.vmsBytes)} VMS · {details.peak.openFiles >= 0 ? `${details.peak.openFiles} files` : "files unavailable"}
        </span>
      </div>

      {Object.keys(details.metrics).length > 0 && (
        <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 xl:grid-cols-4">
          {details.metrics.cpu && (
            <TimeseriesGauge
              baseUrl={metricBase}
              value={{ id: encodeURIComponent(details.metrics.cpu) }}
              title="CPU"
              icon={UiActivity}
              unit="percent"
              variant="cell"
              range="15m"
              refreshMs={2000}
            />
          )}
          {details.metrics.rss && (
            <TimeseriesGauge
              baseUrl={metricBase}
              value={{ id: encodeURIComponent(details.metrics.rss) }}
              title="RSS"
              icon={UiDatabase}
              unit="bytes"
              variant="cell"
              range="15m"
              refreshMs={2000}
            />
          )}
          {details.metrics.vms && (
            <TimeseriesGauge
              baseUrl={metricBase}
              value={{ id: encodeURIComponent(details.metrics.vms) }}
              title="VMS"
              icon={UiDatabase}
              unit="bytes"
              variant="cell"
              range="15m"
              refreshMs={2000}
            />
          )}
          {details.metrics.openFiles && (
            <TimeseriesGauge
              baseUrl={metricBase}
              value={{ id: encodeURIComponent(details.metrics.openFiles) }}
              title="Open files"
              icon={UiFile}
              unit="short"
              variant="cell"
              range="15m"
              refreshMs={2000}
            />
          )}
        </div>
      )}

      {forest.length > 0 && (
        <div className="space-y-1">
          <div className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
            Process tree
          </div>
          <div className="overflow-hidden rounded-md border bg-background">
            {forest.map((root) => (
              <DiagnosticsTree key={root.pid} root={root} expandAll onSelect={() => {}} />
            ))}
          </div>
        </div>
      )}
    </section>
  );
}
