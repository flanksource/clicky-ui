import { useState } from "react";
import {
  Button,
  InputField,
  Panel,
  SegmentedControl,
} from "@flanksource/clicky-ui";
import { UiCloud, UiDatabase } from "@flanksource/clicky-ui/icons";

type SourceKind = "kubernetes" | "database";

const SOURCE_OPTIONS = [
  { id: "kubernetes", label: "Kubernetes", icon: UiCloud },
  { id: "database", label: "Database", icon: UiDatabase },
] satisfies Array<{ id: SourceKind; label: string; icon: typeof UiCloud }>;

export function FormsPreviewPattern() {
  const [name, setName] = useState("Production health");
  const [namespace, setNamespace] = useState("platform-system");
  const [source, setSource] = useState<SourceKind>("kubernetes");
  const invalid = name.trim() === "";

  return (
    <div className="grid min-h-[28rem] gap-density-4 lg:grid-cols-[minmax(0,1fr)_minmax(20rem,0.9fr)]">
      <Panel title="Configuration" padded>
        <form className="space-y-density-4" onSubmit={(event) => event.preventDefault()}>
          <div className="space-y-1.5">
            <label htmlFor="pattern-config-name" className="text-sm font-medium text-foreground">
              Configuration name
            </label>
            <InputField
              id="pattern-config-name"
              value={name}
              onChange={setName}
              invalid={invalid}
              {...(invalid ? { "aria-describedby": "pattern-config-name-error" } : {})}
            />
            {invalid && (
              <p id="pattern-config-name-error" role="alert" className="text-xs text-destructive">
                Enter a configuration name.
              </p>
            )}
          </div>

          <fieldset className="space-y-1.5">
            <legend className="text-sm font-medium text-foreground">Source type</legend>
            <SegmentedControl
              value={source}
              options={SOURCE_OPTIONS}
              onChange={setSource}
              aria-label="Source type"
              wrap
            />
          </fieldset>

          <div className="space-y-1.5">
            <label htmlFor="pattern-namespace" className="text-sm font-medium text-foreground">
              Namespace
            </label>
            <InputField id="pattern-namespace" value={namespace} onChange={setNamespace} />
            <p className="text-xs text-muted-foreground">
              Scope the configuration before reviewing its generated selectors.
            </p>
          </div>

          <div className="flex justify-end gap-density-2 border-t border-border pt-density-4">
            <Button type="button" variant="ghost">Cancel</Button>
            <Button type="submit" disabled={invalid}>Save configuration</Button>
          </div>
        </form>
      </Panel>

      <Panel title="Live preview" tone={invalid ? "danger" : "info"} padded>
        <div aria-label="Configuration preview" className="space-y-density-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Name</p>
            <p className="mt-1 text-lg font-semibold text-foreground">{name || "Untitled configuration"}</p>
          </div>
          <dl className="grid grid-cols-[auto_1fr] gap-x-density-4 gap-y-density-2 text-sm">
            <dt className="text-muted-foreground">Source</dt>
            <dd className="font-medium capitalize text-foreground">{source}</dd>
            <dt className="text-muted-foreground">Namespace</dt>
            <dd className="font-mono text-xs text-foreground">{namespace || "all namespaces"}</dd>
          </dl>
          <div className="rounded-md border border-border bg-muted/50 p-density-3 font-mono text-xs leading-5 text-muted-foreground">
            source: {source}<br />
            namespace: {namespace || "*"}
          </div>
        </div>
      </Panel>
    </div>
  );
}
