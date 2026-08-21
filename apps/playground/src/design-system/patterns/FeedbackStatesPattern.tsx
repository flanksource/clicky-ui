import { useState } from "react";
import { Button, Callout, Panel } from "@flanksource/clicky-ui";
import { UiRefresh } from "@flanksource/clicky-ui/icons";

export function FeedbackStatesPattern() {
  const [recovered, setRecovered] = useState(false);

  return (
    <div className="grid gap-density-4 lg:grid-cols-2">
      <Panel title="Loading" padded>
        <div aria-label="Loading configuration checks" className="space-y-density-3 animate-pulse">
          <div className="h-4 w-2/5 rounded bg-muted" />
          <div className="h-10 rounded bg-muted" />
          <div className="h-10 rounded bg-muted" />
        </div>
      </Panel>

      <Panel title="Empty" padded>
        <div className="grid min-h-32 place-items-center text-center">
          <div>
            <p className="text-sm font-medium text-foreground">No checks match these filters</p>
            <p className="mt-1 text-xs text-muted-foreground">Clear filters to return to the complete collection.</p>
            <Button variant="outline" size="sm" className="mt-density-3">Clear filters</Button>
          </div>
        </div>
      </Panel>

      <Panel title="Success" tone="success" padded>
        <Callout variant="tip" title="Configuration saved">
          The next scheduled run will use the updated selector.
        </Callout>
      </Panel>

      <Panel title={recovered ? "Recovered" : "Error with recovery"} tone={recovered ? "success" : "danger"} padded>
        {recovered ? (
          <Callout variant="tip" title="Connection restored">Current results are available again.</Callout>
        ) : (
          <div className="space-y-density-3">
            <Callout variant="caution" title="Results could not be loaded" emphasis>
              The API did not respond. Your filters and selection are preserved.
            </Callout>
            <Button variant="outline" size="sm" onClick={() => setRecovered(true)}>
              <UiRefresh className="size-4" />Retry
            </Button>
          </div>
        )}
      </Panel>
    </div>
  );
}
