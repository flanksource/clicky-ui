import { useState } from "react";
import { cn } from "../lib/utils";
import { SegmentedControl } from "./SegmentedControl";
import { Select } from "./select";
import {
  CONNECTION_LOG_LEVELS,
  effectiveConnectionLogLevel,
  parseConnectionLoggingThreshold,
  visibleConnectionLogEvents,
  type ConnectionLogLevel,
  type ConnectionLoggingPolicyProps,
  type ConnectionLoggingThreshold,
} from "./ConnectionLoggingPolicy.model";

const LEVEL_OPTIONS = CONNECTION_LOG_LEVELS.map((level) => ({
  value: level,
  label: level === "off" ? "Off" : level[0]?.toUpperCase() + level.slice(1),
}));
const LEVEL_SEGMENTS = LEVEL_OPTIONS.map(({ value, label }) => ({
  id: value,
  label,
}));

const THRESHOLD_PROPERTY = "log.slowThreshold";
type PreviewFormat = "pretty" | "json";

export function ConnectionLoggingPolicy({
  definition,
  value = {},
  onChange,
  readOnly = false,
  className,
}: ConnectionLoggingPolicyProps) {
  const [previewLevel, setPreviewLevel] = useState<ConnectionLogLevel>("debug");
  const [previewFormat, setPreviewFormat] = useState<PreviewFormat>("pretty");
  const threshold = parseConnectionLoggingThreshold(
    value[THRESHOLD_PROPERTY] ?? definition.slowThreshold,
  );
  const visibleEvents = visibleConnectionLogEvents(
    definition,
    value,
    previewLevel,
  );

  const updateOverride = (
    property: string,
    next: string,
    defaultValue: string,
  ) => {
    const updated = { ...value };
    if (next === defaultValue) delete updated[property];
    else updated[property] = next;
    onChange(updated);
  };

  return (
    <section
      className={cn(
        "space-y-density-4 rounded-lg border border-border bg-card p-density-4",
        className,
      )}
    >
      <header className="flex flex-wrap items-start justify-between gap-density-3">
        <div className="space-y-1">
          <h3 className="text-sm font-semibold text-foreground">
            Connection logging
          </h3>
          <p className="max-w-3xl text-xs leading-relaxed text-muted-foreground">
            Errors win over slow operations, then the provider-specific record.
            Payloads are bounded and credentials are sanitized before logging.
          </p>
        </div>
        <span className="font-mono text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
          {definition.family}
        </span>
      </header>

      <div className="grid gap-density-4 xl:grid-cols-[minmax(0,1.2fr)_minmax(22rem,0.8fr)]">
        <div className="space-y-density-3">
          <ThresholdControl
            label={definition.thresholdLabel}
            threshold={threshold}
            disabled={readOnly}
            onChange={(next) =>
              updateOverride(
                THRESHOLD_PROPERTY,
                `${next.amount}${next.unit}`,
                definition.slowThreshold,
              )
            }
          />

          <div className="overflow-hidden rounded-md border border-border">
            {definition.events.map((event) => {
              const level = effectiveConnectionLogLevel(event, value);
              return (
                <div
                  key={event.event}
                  className="grid gap-density-2 border-b border-border px-density-3 py-density-2 last:border-b-0 xl:grid-cols-[minmax(12rem,1fr)_auto] xl:items-center"
                >
                  <div className="min-w-0 space-y-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-sm font-medium text-foreground">
                        {event.label}
                      </span>
                      <span className="font-mono text-[10px] text-muted-foreground">
                        {event.property}
                      </span>
                    </div>
                    <p className="text-xs text-muted-foreground">{event.description}</p>
                    <p className="text-[10px] text-muted-foreground/80">
                      Captures {event.captures.join(", ")}
                    </p>
                  </div>
                  <div className="flex flex-wrap items-center gap-density-2">
                    <SegmentedControl<ConnectionLogLevel>
                      aria-label={`${event.label} level`}
                      value={level}
                      options={LEVEL_SEGMENTS.map((option) => ({
                        ...option,
                        disabled: readOnly,
                      }))}
                      onChange={(next) =>
                        updateOverride(event.property, next, event.default)
                      }
                      size="sm"
                      wrap
                    />
                    <span className="text-[10px] text-muted-foreground">
                      Default {event.default}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <aside className="min-w-0 space-y-density-3 rounded-md border border-border bg-background p-density-3">
          <div className="flex flex-wrap items-end justify-between gap-density-2">
            <div>
              <h4 className="text-sm font-semibold text-foreground">
                What gets logged
              </h4>
              <p className="text-xs text-muted-foreground">
                Cumulative records at the effective logger level.
              </p>
            </div>
            <div className="flex flex-wrap items-end gap-density-2">
              <div className="space-y-1 text-xs font-medium text-muted-foreground">
                Preview format
                <SegmentedControl<PreviewFormat>
                  aria-label="Preview format"
                  value={previewFormat}
                  size="sm"
                  options={[
                    { id: "pretty", label: "Pretty" },
                    { id: "json", label: "JSON" },
                  ]}
                  onChange={setPreviewFormat}
                />
              </div>
              <label className="w-36 space-y-1 text-xs font-medium text-muted-foreground">
                Preview level
                <Select
                  aria-label="Preview logger level"
                  value={previewLevel}
                  options={LEVEL_OPTIONS}
                  onChange={(event) =>
                    setPreviewLevel(event.target.value as ConnectionLogLevel)
                  }
                />
              </label>
            </div>
          </div>

          <div
            data-testid="connection-log-preview"
            className="space-y-density-2"
          >
            {visibleEvents.length === 0 ? (
              <div className="rounded-md border border-dashed border-border p-density-4 text-center text-xs text-muted-foreground">
                No connection records are emitted at this level.
              </div>
            ) : (
              visibleEvents.map((event) => (
                <article
                  key={event.event}
                  data-testid="connection-log-preview-event"
                  className="overflow-hidden rounded-md border border-border"
                >
                  <div className="flex items-center justify-between gap-2 border-b border-border bg-muted/60 px-2.5 py-1.5">
                    <span className="text-xs font-medium text-foreground">
                      {event.label}
                    </span>
                    <span
                      className={cn(
                        "font-mono text-[10px] font-semibold",
                        levelTone(effectiveConnectionLogLevel(event, value)),
                      )}
                    >
                      {effectiveConnectionLogLevel(event, value)}
                    </span>
                  </div>
                  <pre className="overflow-x-auto whitespace-pre-wrap break-words p-2.5 font-mono text-[11px] leading-relaxed text-foreground">
                    {previewFormat === "pretty"
                      ? event.prettyExample
                      : JSON.stringify(event.example, null, 2)}
                  </pre>
                </article>
              ))
            )}
          </div>
        </aside>
      </div>
    </section>
  );
}

function ThresholdControl({
  label,
  threshold,
  disabled,
  onChange,
}: {
  label: string;
  threshold: ConnectionLoggingThreshold;
  disabled: boolean;
  onChange: (next: ConnectionLoggingThreshold) => void;
}) {
  return (
    <div className="flex flex-wrap items-end justify-between gap-density-3 rounded-md border border-border bg-muted/30 p-density-3">
      <div>
        <div className="text-sm font-medium text-foreground">{label}</div>
        <p className="text-xs text-muted-foreground">
          A successful operation at or above this duration logs as slow.
        </p>
      </div>
      <div className="flex w-48 gap-2">
        <input
          type="number"
          min="0.001"
          step="any"
          aria-label="Slow threshold value"
          value={threshold.amount}
          disabled={disabled}
          onChange={(event) => {
            if (Number(event.target.value) > 0)
              onChange({ ...threshold, amount: event.target.value });
          }}
          className="h-control-h min-w-0 flex-1 rounded-md border border-input bg-background px-control-px text-sm text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        />
        <Select
          aria-label="Slow threshold unit"
          value={threshold.unit}
          disabled={disabled}
          className="w-20"
          options={[
            { value: "ms", label: "ms" },
            { value: "s", label: "sec" },
            { value: "m", label: "min" },
            { value: "h", label: "hour" },
          ]}
          onChange={(event) =>
            onChange({
              ...threshold,
              unit: event.target.value as ConnectionLoggingThreshold["unit"],
            })
          }
        />
      </div>
    </div>
  );
}

function levelTone(level: ConnectionLogLevel) {
  switch (level) {
    case "error":
      return "text-destructive";
    case "warn":
      return "text-warning-foreground";
    case "info":
      return "text-foreground";
    case "off":
      return "text-muted-foreground";
    default:
      return "text-primary";
  }
}
