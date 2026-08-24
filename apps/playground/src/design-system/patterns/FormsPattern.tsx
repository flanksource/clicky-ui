import { useState } from "react";
import {
  Button,
  Combobox,
  InputField,
  Panel,
  SegmentedControl,
  Switch,
} from "@flanksource/clicky-ui";
import { UiChevronDown, UiChevronRight, UiCloud, UiDatabase, UiGlobe } from "@flanksource/clicky-ui/icons";

// A form long enough to have an opinion about: required fields first, one
// conditional field that depends on a choice already made, everything optional
// folded away, and the commit action sitting where the reader ends up.

type SourceKind = "kubernetes" | "database" | "http";

const SOURCE_OPTIONS = [
  { id: "kubernetes", label: "Kubernetes", icon: UiCloud },
  { id: "database", label: "Database", icon: UiDatabase },
  { id: "http", label: "HTTP", icon: UiGlobe },
] satisfies Array<{ id: SourceKind; label: string; icon: typeof UiCloud }>;

const SCOPE_FIELD: Record<SourceKind, { label: string; help: string; placeholder?: string }> = {
  kubernetes: {
    label: "Namespace",
    help: "Leave empty to collect from every namespace the service account can read.",
  },
  database: {
    label: "Connection",
    help: "Names a stored connection. Credentials never live in this form.",
  },
  http: {
    label: "Endpoint URL",
    help: "The collector issues a GET and records the response body.",
  },
};

function FieldLabel({ htmlFor, children, required }: { htmlFor: string; children: string; required?: boolean }) {
  return (
    <label htmlFor={htmlFor} className="text-sm font-medium text-foreground">
      {children}
      {required && <span className="text-destructive" aria-hidden> *</span>}
    </label>
  );
}

export function FormsPattern() {
  const [name, setName] = useState("Production health");
  const [source, setSource] = useState<SourceKind>("kubernetes");
  const [scope, setScope] = useState("platform-system");
  const [interval, setInterval] = useState("60");
  const [advanced, setAdvanced] = useState(false);
  const [timeout, setTimeoutValue] = useState("30");
  const [labels, setLabels] = useState<string[]>(["tier=1"]);
  const [verifyTls, setVerifyTls] = useState(true);

  const invalid = name.trim() === "";
  const scopeField = SCOPE_FIELD[source];

  return (
    <Panel title="New collector" padded>
      <form className="max-w-2xl space-y-density-4" onSubmit={(event) => event.preventDefault()}>
        <div data-practice="label" className="space-y-1.5">
          <FieldLabel htmlFor="forms-name" required>Collector name</FieldLabel>
          <InputField
            id="forms-name"
            value={name}
            onChange={setName}
            invalid={invalid}
            {...(invalid ? { "aria-describedby": "forms-name-error" } : {})}
          />
          {invalid && (
            <p id="forms-name-error" role="alert" className="text-xs text-destructive">
              Enter a collector name — it identifies this collector in results and alerts.
            </p>
          )}
        </div>

        <fieldset data-practice="choice" className="space-y-1.5">
          <legend className="text-sm font-medium text-foreground">Source type</legend>
          <SegmentedControl
            value={source}
            options={SOURCE_OPTIONS}
            onChange={setSource}
            aria-label="Source type"
            wrap
          />
          <p className="text-xs text-muted-foreground">
            Three options with real names: visible at once, one click apart, no menu.
          </p>
        </fieldset>

        <div data-practice="conditional" className="space-y-1.5">
          <FieldLabel htmlFor="forms-scope">{scopeField.label}</FieldLabel>
          <InputField id="forms-scope" value={scope} onChange={setScope} />
          <p className="text-xs text-muted-foreground">{scopeField.help}</p>
        </div>

        <div className="space-y-1.5">
          <FieldLabel htmlFor="forms-interval">Interval</FieldLabel>
          <InputField
            id="forms-interval"
            type="number"
            value={interval}
            onChange={setInterval}
            className="max-w-48"
            suffix={<span className="text-xs text-muted-foreground">seconds</span>}
          />
        </div>

        <div data-practice="advanced" className="rounded-lg border border-border">
          <button
            type="button"
            onClick={() => setAdvanced((open) => !open)}
            aria-expanded={advanced}
            className="flex w-full items-center gap-density-2 p-density-3 text-sm font-medium text-foreground"
          >
            {advanced ? <UiChevronDown className="size-4" /> : <UiChevronRight className="size-4" />}
            Advanced
            <span className="ml-auto text-xs font-normal text-muted-foreground">
              Timeout, labels, TLS
            </span>
          </button>
          {advanced && (
            <div className="space-y-density-4 border-t border-border p-density-3">
              <div className="space-y-1.5">
                <FieldLabel htmlFor="forms-timeout">Timeout</FieldLabel>
                <InputField
                  id="forms-timeout"
                  type="number"
                  value={timeout}
                  onChange={setTimeoutValue}
                  className="max-w-48"
                  suffix={<span className="text-xs text-muted-foreground">seconds</span>}
                />
              </div>
              <div className="space-y-1.5">
                <span className="text-sm font-medium text-foreground">Labels</span>
                <Combobox
                  multiple
                  variant="tags"
                  separators={[","]}
                  allowCustomValue
                  value={labels}
                  onChange={setLabels}
                  ariaLabel="Labels"
                  options={[]}
                />
              </div>
              <Switch checked={verifyTls} onChange={setVerifyTls} label="Verify TLS certificates" />
            </div>
          )}
        </div>

        <div data-practice="commit" className="flex justify-end gap-density-2 border-t border-border pt-density-4">
          <Button type="button" variant="ghost">Cancel</Button>
          <Button type="submit" disabled={invalid}>Create collector</Button>
        </div>
      </form>
    </Panel>
  );
}
