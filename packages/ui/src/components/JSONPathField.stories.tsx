import type { Meta, StoryObj } from "@storybook/react-vite";
import { useState } from "react";
import { JSONPathField } from "./JSONPathField";
import type { JSONPathEvalRequest, JSONPathEvalResult } from "./JSONPathPlayground";
import { literalSegments } from "./jsonPathTree";

const SAMPLE = {
  messages: [
    {
      payload: { text: "Hello from Clicky UI" },
      destination: "DIQueue",
      "tenant-id": 7,
    },
  ],
};

// Shaped to show what the dropdown cannot: a branch past its 12-level cap, an
// array whose interesting element is not [0], and a column carrying a document
// as text.
const DEEP_SAMPLE = {
  id: "req-4711",
  events: [
    { type: "received", at: "2026-08-07T09:00:00Z" },
    { type: "enriched", at: "2026-08-07T09:00:01Z", by: "pipeline" },
    { type: "delivered", at: "2026-08-07T09:00:04Z", attempts: 3 },
  ],
  payload: JSON.stringify({ policy: { number: "P-1000", status: "ACTIVE" }, premium: 421.5 }),
  trace: nest(18, { span: "leaf", duration_ms: 12 }),
};

function nest(depth: number, leaf: unknown): unknown {
  let value = leaf;
  for (let i = 0; i < depth; i += 1) value = { child: value };
  return value;
}

/**
 * Stand-in for the backend evaluator so the preview pane is demonstrable
 * offline. It resolves literal key chains only — the real evaluator runs the
 * same JSONPath library the query engine does, and handles wildcards, descents
 * and filter expressions this cannot.
 */
async function demoEvaluate({ jsonpath, source, row }: JSONPathEvalRequest): Promise<JSONPathEvalResult> {
  const segments = literalSegments(jsonpath);
  if (!segments) {
    return { matches: [], count: 0, error: "This demo evaluator only resolves literal key chains." };
  }
  let value: unknown = row;
  if (source) {
    const encoded = (value as Record<string, unknown>)[source];
    value = typeof encoded === "string" ? JSON.parse(encoded) : encoded;
  }
  for (const segment of segments) {
    if (value === null || typeof value !== "object") return { matches: [], count: 0 };
    value = (value as Record<string | number, unknown>)[segment];
  }
  if (value === undefined) return { matches: [], count: 0 };
  const filterField = [source, ...segments].filter(Boolean).join(".");
  return { matches: [value], count: 1, ...(filterField ? { filterField } : {}) };
}

function JSONPathFieldExample() {
  const [value, setValue] = useState("$.messages[0].payload");
  return (
    <div className="w-96 space-y-density-2">
      <label className="text-sm font-medium" htmlFor="json-path-story">Message body</label>
      <JSONPathField
        id="json-path-story"
        aria-label="Message body"
        json={SAMPLE}
        value={value}
        onChange={setValue}
        inputClassName="font-mono"
      />
      <p className="text-xs text-muted-foreground">Type a JSONPath or browse the uploaded sample.</p>
    </div>
  );
}

function JSONPathPlaygroundExample() {
  const [value, setValue] = useState("$.events[0].type");
  const [source, setSource] = useState<string | undefined>(undefined);
  return (
    <div className="w-96 space-y-density-2">
      <label className="text-sm font-medium" htmlFor="json-path-playground-story">Column value</label>
      <JSONPathField
        id="json-path-playground-story"
        aria-label="Column value"
        json={DEEP_SAMPLE}
        rows={[DEEP_SAMPLE, { ...DEEP_SAMPLE, id: "req-4712", retried: true }]}
        value={value}
        onChange={(next) => {
          setValue(next);
          setSource(undefined);
        }}
        onSelectPath={(next, { root }) => {
          setValue(next);
          setSource(root);
        }}
        evaluate={demoEvaluate}
        inputClassName="font-mono"
      />
      <p className="text-xs text-muted-foreground">
        Open the dropdown, then <strong>Open playground…</strong>: it descends past{" "}
        <code className="font-mono">$.trace</code>&apos;s 18 levels, lists every{" "}
        <code className="font-mono">$.events</code> element, and reads into{" "}
        <code className="font-mono">$.payload</code>, which holds JSON as text.
      </p>
      <p className="text-xs text-muted-foreground">
        source: <code className="font-mono">{source ?? "—"}</code>
      </p>
    </div>
  );
}

const meta = {
  title: "Controls/JSONPathField",
  component: JSONPathField,
  tags: ["autodocs"],
  parameters: {
    docs: {
      description: {
        component:
          "An editable JSONPath input with a tree dropdown generated from a caller-provided JSON sample. Consumers can constrain selectable nodes and project generated paths. The dropdown caps its walk so it opens instantly; its footer opens a playground that browses the document with no limit and previews what the expression selects.",
      },
    },
  },
  render: () => <JSONPathFieldExample />,
} satisfies Meta<typeof JSONPathField>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const Playground: Story = { render: () => <JSONPathPlaygroundExample /> };
