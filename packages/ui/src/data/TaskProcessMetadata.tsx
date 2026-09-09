import { formatBytes } from "./diagnostics/utils";
import { JsonView } from "./JsonView";
import { isFlatMetadata, isMetadataLink, metadataEntries } from "./task-metadata";
import type { TaskProcessDetails, TaskResourceLimits } from "./TaskSnapshot";

/**
 * TaskMetadata renders the caller's own context for a process — which run it is
 * working, which model, which phase, which turn. The producer chooses both the
 * keys and the shape, so this reads the shape rather than assuming one: a flat
 * object is a definition list, where a value that points somewhere becomes a
 * link; anything structured keeps its structure in a JSON view rather than being
 * flattened into something that only looks like a label.
 */
export function TaskMetadata({ metadata }: { metadata?: unknown }) {
  const entries = metadataEntries(metadata);
  if (isFlatMetadata(metadata)) {
    if (entries.length === 0) return null;
    return (
      <dl className="flex flex-wrap items-baseline gap-x-4 gap-y-1 text-xs">
        {entries.map(({ key, text }) => (
          <div key={key} className="flex items-baseline gap-1.5">
            <dt className="text-muted-foreground">{key}</dt>
            <dd className="font-medium text-foreground">
              {isMetadataLink(key, text) ? (
                <a href={text} className="text-primary hover:underline">
                  {text}
                </a>
              ) : (
                text
              )}
            </dd>
          </div>
        ))}
      </dl>
    );
  }
  if (metadata === undefined || metadata === null) return null;
  return (
    <div className="overflow-x-auto text-xs">
      <JsonView data={metadata} />
    </div>
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
