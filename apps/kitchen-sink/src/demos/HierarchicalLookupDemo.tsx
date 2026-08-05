import { useState } from "react";
import {
  JsonSchemaForm,
  type JsonSchemaObject,
  type LookupFetcher,
} from "@flanksource/clicky-ui";
import { DemoSection } from "./Section";

const OPTIONS = [
  "http",
  "jms",
  "jms.all",
  "jms.incoming",
  "jms.incoming.disbursements",
  "logs.api",
  "logs.cycle",
  "remote-debugger.jdbc",
];

const lookupFetcher: LookupFetcher = async ({ query }) =>
  OPTIONS.filter((name) => name.toLowerCase().includes(query.toLowerCase())).map(
    (name) => ({ value: name, label: name }),
  );

const SCHEMA: JsonSchemaObject = {
  type: "object",
  properties: {
    destination: {
      type: "string",
      title: "Destination",
      description: "A single selection closes the tree.",
      "x-clicky-lookup": {
        url: "/api/v1/profiles",
        filter: "profile",
        hierarchy: { delimiters: "./" },
      },
    },
    imports: {
      type: "array",
      title: "Imports",
      description: "Multiple selections remain visible as removable chips.",
      items: { type: "string" },
      "x-clicky-lookup": {
        url: "/api/v1/profiles",
        filter: "profile",
        multi: true,
        hierarchy: { delimiters: "./" },
      },
    },
  },
};

export function HierarchicalLookupDemo() {
  const [value, setValue] = useState<Record<string, unknown>>({ imports: ["jms"] });
  return (
    <DemoSection
      id="hierarchical-lookup"
      title="Hierarchical lookup"
      description="x-clicky-lookup options encoded with path delimiters become a browsable tree while preserving their original committed values."
    >
      <div className="grid gap-density-4 lg:grid-cols-[minmax(0,1fr)_minmax(18rem,0.7fr)]">
        <JsonSchemaForm
          schema={SCHEMA}
          value={value}
          onChange={setValue}
          lookupFetcher={lookupFetcher}
          showPreferencesMenu={false}
          idPrefix="hierarchical-lookup-demo"
        />
        <pre className="overflow-auto rounded-md border border-border bg-muted/30 p-density-3 text-xs">
          {JSON.stringify(value, null, 2)}
        </pre>
      </div>
    </DemoSection>
  );
}
