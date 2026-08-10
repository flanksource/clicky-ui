import { useState } from "react";
import { JSONPathField, literalSegments } from "@flanksource/clicky-ui";
import type { JSONPathEvalRequest, JSONPathEvalResult } from "@flanksource/clicky-ui";

function nest(depth: number, leaf: unknown): unknown {
  let value = leaf;
  for (let i = 0; i < depth; i += 1) value = { child: value };
  return value;
}

// Shaped to show what the inline dropdown cannot reach: a branch past its
// 12-level cap, an array whose interesting element is not [0], and a column
// carrying a whole document as text.
const SAMPLE = {
  id: "req-4711",
  messages: [
    { payload: { text: "Hello from the kitchen sink" }, destination: "DIQueue", "tenant-id": 7 },
    { payload: { text: "Second message" }, destination: "DLQ", "tenant-id": 9 },
  ],
  policy: JSON.stringify({ number: "P-1000", status: "ACTIVE", premium: 421.5 }),
  trace: nest(18, { span: "leaf", duration_ms: 12 }),
};

const SECOND_ROW = { ...SAMPLE, id: "req-4712", retried: true };

/**
 * Stand-in for the backend evaluator so the preview pane works offline. It
 * resolves literal key chains only; the real one runs the same JSONPath library
 * the query engine does and handles wildcards, descents and filter expressions.
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

export function JSONPathFieldDemo() {
  const [value, setValue] = useState("$.messages[0].payload");
  const [source, setSource] = useState<string | undefined>(undefined);
  return (
    <div className="max-w-xl space-y-3">
      <div>
        <h2 className="text-lg font-semibold">JSONPathField</h2>
        <p className="text-sm text-muted-foreground">
          Edit a path directly, browse it from a JSON sample, or open the playground for the parts the
          dropdown stops short of.
        </p>
      </div>
      <JSONPathField
        aria-label="Message body"
        json={SAMPLE}
        rows={[SAMPLE, SECOND_ROW]}
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
        In the playground: <code className="font-mono">$.trace</code> goes 18 levels deep,{" "}
        <code className="font-mono">$.messages</code> lists both elements, and{" "}
        <code className="font-mono">$.policy</code> opens as the document it encodes.
      </p>
      <pre className="rounded-md border border-border bg-muted/30 p-3 text-xs">
        {JSON.stringify({ jsonpath: value, source: source ?? null }, null, 2)}
      </pre>
    </div>
  );
}
