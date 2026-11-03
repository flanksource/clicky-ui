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
  return (
    <section
      aria-label="Connection logging"
      className="space-y-2 rounded-md border border-border p-3"
    >
      <div className="flex items-center justify-between gap-3">
        <h3 className="text-sm font-medium">Logging</h3>
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
      </div>
      <dl className="flex flex-wrap gap-x-4 gap-y-1 text-xs">
        {definition.events.map((event) => (
          <div key={event.property} className="flex items-baseline gap-1.5">
            <dt className="text-muted-foreground">{event.label}</dt>
            <dd className="font-mono">
              {effectiveConnectionLogLevel(event, value)}
            </dd>
          </div>
        ))}
        <div className="flex items-baseline gap-1.5">
          <dt className="text-muted-foreground">{definition.thresholdLabel}</dt>
          <dd className="font-mono">
            {value["log.slowThreshold"] ?? definition.slowThreshold}
          </dd>
        </div>
      </dl>
    </section>
  );
}
