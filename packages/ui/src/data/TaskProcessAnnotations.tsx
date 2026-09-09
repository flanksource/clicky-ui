import { formatBytes } from "./diagnostics/utils";
import type { TaskProcessDetails, TaskResourceLimits } from "./TaskSnapshot";

/**
 * Keys whose value is a link rather than a label. A producer that wants a row
 * to link somewhere puts the destination under one of these.
 */
const LINK_KEYS = new Set(["href", "url", "link"]);

function isLink(key: string, value: string): boolean {
  return LINK_KEYS.has(key) || value.startsWith("/") || value.startsWith("https://");
}

/**
 * TaskAnnotations renders the caller's own context for a process — which run it
 * is working, which model, which phase. The keys are the producer's; this
 * component only decides that a value pointing somewhere becomes a link.
 */
export function TaskAnnotations({ annotations }: { annotations?: Record<string, string> }) {
  const entries = Object.entries(annotations ?? {}).filter(([, value]) => value !== "");
  if (entries.length === 0) return null;
  return (
    <dl className="flex flex-wrap items-baseline gap-x-4 gap-y-1 text-xs">
      {entries.map(([key, value]) => (
        <div key={key} className="flex items-baseline gap-1.5">
          <dt className="text-muted-foreground">{key}</dt>
          <dd className="font-medium text-foreground">
            {isLink(key, value) ? (
              <a href={value} className="text-primary hover:underline">
                {value}
              </a>
            ) : (
              value
            )}
          </dd>
        </div>
      ))}
    </dl>
  );
}

function limitEntries(limits: TaskResourceLimits): string[] {
  const parts: string[] = [];
  if (limits.maxRssBytes) parts.push(`max ${formatBytes(limits.maxRssBytes)} RSS`);
  if (limits.maxCpuPercent) parts.push(`max ${limits.maxCpuPercent}% CPU`);
  if (limits.cpuSampleCount) parts.push(`over ${limits.cpuSampleCount} samples`);
  if (limits.interval) parts.push(`every ${limits.interval}`);
  return parts;
}

/**
 * TaskProcessFacts is the line of things that are true about the process but
 * are not resource readings: where it listens, what killed it, what would.
 */
export function TaskProcessFacts({ details }: { details: TaskProcessDetails }) {
  const limits = details.limits ? limitEntries(details.limits) : [];
  const started = details.started ? Date.parse(details.started) : NaN;
  return (
    <>
      {Number.isFinite(started) && started > 0 && (
        <span title={new Date(started).toISOString()}>started {new Date(started).toLocaleTimeString()}</span>
      )}
      {details.ports && details.ports.length > 0 && <span>{details.ports.map((port) => `:${port}`).join(" ")}</span>}
      {details.exitCode !== undefined && <span>exit {details.exitCode}</span>}
      {details.maxRestarts ? <span>max {details.maxRestarts} restarts</span> : null}
      {limits.length > 0 && <span title="Exceeding a limit kills the whole process tree">{limits.join(" · ")}</span>}
    </>
  );
}
