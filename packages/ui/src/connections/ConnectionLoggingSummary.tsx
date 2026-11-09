import { useState } from "react";
import { Button } from "../components/button";
import { Select } from "../components/select";
import { InputField } from "../components/InputField";
import { DropdownMenu } from "../overlay/DropdownMenu";
import { UiEdit } from "../icons";
import {
  CONNECTION_LOG_LEVELS,
  effectiveConnectionLogLevel,
  type ConnectionLoggingPolicyProps,
} from "../components/ConnectionLoggingPolicy.model";

export function ConnectionLoggingSummary({
  definition,
  value = {},
  onChange,
  readOnly = false,
}: ConnectionLoggingPolicyProps) {
  const [draft, setDraft] = useState(value);
  const threshold = draft["log.slowThreshold"] ?? definition.slowThreshold;
  const validThreshold =
    /^([0-9]+(?:\.[0-9]+)?)(ms|s|m|h)$/.test(threshold) &&
    Number.parseFloat(threshold) > 0;
  const update = (property: string, next: string, defaultValue: string) => {
    setDraft((current) => {
      const updated = { ...current };
      if (next === defaultValue) delete updated[property];
      else updated[property] = next;
      return updated;
    });
  };
  const entries: Array<[string, string]> = [
    ...definition.events.map((event): [string, string] => [
      event.label,
      effectiveConnectionLogLevel(event, value),
    ]),
    [
      definition.thresholdLabel,
      value["log.slowThreshold"] ?? definition.slowThreshold,
    ],
  ];
  const summary = entries.map(([label, level]) => `${label}: ${level}`).join("\n");
  return (
    <section
      aria-label="Connection logging"
      className="flex min-w-0 items-center gap-3 rounded-md border border-border py-1 pl-3 pr-1"
    >
      <h3 className="shrink-0 text-sm font-medium">Logging</h3>
      <dl
        className="flex w-0 min-w-0 flex-1 gap-x-4 overflow-hidden whitespace-nowrap text-xs"
        title={summary}
      >
        {entries.map(([label, level]) => (
          <div key={label} className="flex items-baseline gap-1.5">
            <dt className="text-muted-foreground">{label}</dt>
            <dd className="font-mono">{level}</dd>
          </div>
        ))}
      </dl>
      {!readOnly && (
          <DropdownMenu
            role="dialog"
            label="Edit logging"
            icon={UiEdit}
            hideChevron
            variant="ghost"
            align="right"
            menuLabel="Edit connection logging"
            menuClassName="w-80 max-w-[calc(100vw-2rem)] p-3"
            onOpenChange={(open) => {
              if (open) setDraft({ ...value });
            }}
          >
            {(close) => (
              <div className="space-y-3">
                <h4 className="text-sm font-medium">Edit logging levels</h4>
                <div className="space-y-2">
                  {definition.events.map((event) => (
                    <label
                      key={event.property}
                      className="grid grid-cols-[minmax(0,1fr)_7rem] items-center gap-3 text-xs"
                    >
                      <span>{event.label}</span>
                      <Select
                        aria-label={`${event.label} level`}
                        value={effectiveConnectionLogLevel(event, draft)}
                        options={CONNECTION_LOG_LEVELS.map((level) => ({
                          value: level,
                          label: level,
                        }))}
                        onChange={(e) =>
                          update(event.property, e.target.value, event.default)
                        }
                      />
                    </label>
                  ))}
                  <label className="grid grid-cols-[minmax(0,1fr)_7rem] items-center gap-3 text-xs">
                    <span>{definition.thresholdLabel}</span>
                    <InputField
                      aria-label="Slow threshold"
                      value={threshold}
                      aria-invalid={!validThreshold}
                      onChange={(next) =>
                        update(
                          "log.slowThreshold",
                          next,
                          definition.slowThreshold,
                        )
                      }
                    />
                  </label>
                </div>
                {!validThreshold && (
                  <p role="alert" className="text-xs text-destructive">
                    Use a positive duration such as 250ms or 2s.
                  </p>
                )}
                <div className="flex justify-end gap-2 border-t border-border pt-3">
                  <Button
                    type="button"
                    size="sm"
                    variant="ghost"
                    onClick={close}
                  >
                    Cancel
                  </Button>
                  <Button
                    type="button"
                    size="sm"
                    disabled={!validThreshold}
                    onClick={() => {
                      onChange(draft);
                      close();
                    }}
                  >
                    Apply
                  </Button>
                </div>
              </div>
            )}
          </DropdownMenu>
      )}
    </section>
  );
}
