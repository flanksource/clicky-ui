import { useState } from "react";
import { JSONPathField } from "@flanksource/clicky-ui";

const SAMPLE = {
  messages: [
    {
      payload: { text: "Hello from the kitchen sink" },
      destination: "DIQueue",
      "tenant-id": 7,
    },
  ],
};

export function JSONPathFieldDemo() {
  const [value, setValue] = useState("$.messages[0].payload");
  return (
    <div className="max-w-xl space-y-3">
      <div>
        <h2 className="text-lg font-semibold">JSONPathField</h2>
        <p className="text-sm text-muted-foreground">Edit a path directly or select it from a JSON sample.</p>
      </div>
      <JSONPathField
        aria-label="Message body"
        json={SAMPLE}
        value={value}
        onChange={setValue}
        inputClassName="font-mono"
      />
      <pre className="rounded-md border border-border bg-muted/30 p-3 text-xs">{value}</pre>
    </div>
  );
}
