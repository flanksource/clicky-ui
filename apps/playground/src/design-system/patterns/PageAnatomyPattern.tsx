import { useState } from "react";
import { Button, InputField, Panel } from "@flanksource/clicky-ui";
import { UiFilter, UiRefresh, UiSearch } from "@flanksource/clicky-ui/icons";

const RESOURCES = ["payments-api", "policy-engine", "evidence-store"];

export function PageAnatomyPattern() {
  const [query, setQuery] = useState("");
  const resources = RESOURCES.filter((name) => name.includes(query.toLowerCase()));

  return (
    <div className="overflow-hidden rounded-xl border border-border bg-muted/30 shadow-sm">
      <div className="flex flex-col gap-density-3 border-b border-border bg-card p-density-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Configuration</p>
          <h2 className="text-xl font-semibold text-foreground">Resources</h2>
          <p className="mt-1 text-sm text-muted-foreground">Inspect health and ownership across environments.</p>
        </div>
        <div className="flex flex-wrap gap-density-2">
          <Button variant="outline"><UiRefresh className="size-4" />Refresh</Button>
          <Button>Add resource</Button>
        </div>
      </div>

      <div className="flex flex-col gap-density-3 border-b border-border bg-card p-density-3 md:flex-row md:items-center">
        <InputField
          value={query}
          onChange={setQuery}
          prefix={<UiSearch className="size-4" />}
          aria-label="Search resources"
          className="md:max-w-sm"
        />
        <Button variant="outline" size="sm"><UiFilter className="size-4" />Environment: Production</Button>
      </div>

      <div className="grid gap-density-3 p-density-4 lg:grid-cols-[minmax(0,1fr)_18rem]">
        <Panel title="Collection" count={resources.length} padded={false}>
          <div className="divide-y divide-border">
            {resources.map((name, index) => (
              <div key={name} className="flex items-center justify-between gap-density-3 p-density-3">
                <div>
                  <p className="text-sm font-medium text-foreground">{name}</p>
                  <p className="text-xs text-muted-foreground">platform / production</p>
                </div>
                <span className={index === 1 ? "size-2 rounded-full bg-amber-500" : "size-2 rounded-full bg-emerald-500"} />
              </div>
            ))}
            {resources.length === 0 && (
              <p className="p-density-4 text-sm text-muted-foreground">No resources match this search.</p>
            )}
          </div>
        </Panel>
        <Panel title="Context" tone="info" padded>
          <p className="text-sm leading-6 text-muted-foreground">
            A stable detail region preserves location while the user explores the collection.
          </p>
        </Panel>
      </div>
    </div>
  );
}
