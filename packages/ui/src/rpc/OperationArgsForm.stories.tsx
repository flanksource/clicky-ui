import type { Meta, StoryObj } from "@storybook/react-vite";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useState } from "react";
import { OperationArgsForm, type OperationArgs } from "./OperationArgsForm";
import type { OpenAPISpec, ResolvedOperation } from "./types";
import type { OperationsApiClient } from "./useOperations";

const catchUp: ResolvedOperation = {
  path: "/cycle/catch-up",
  method: "post",
  operation: {
    operationId: "cycleCatchUp",
    summary: "Cycle catch-up",
    parameters: [
      { name: "company", in: "query", required: true, schema: { type: "string" } },
      { name: "mode", in: "query", schema: { type: "string", enum: ["preview", "apply"] } },
      { name: "dry-run", in: "query", schema: { type: "boolean", default: false } },
      { name: "max-date-steps", in: "query", schema: { type: "integer", default: "30" } },
    ],
    "x-clicky": { verb: "action", scope: "collection", supportsLookup: true },
  },
};

const noInput: ResolvedOperation = {
  path: "/sql/defrag/rebuild-all-indexes",
  method: "post",
  operation: { operationId: "rebuildIndexes", summary: "Rebuild all indexes" },
};

const client: OperationsApiClient = {
  async getOpenAPISpec(): Promise<OpenAPISpec> {
    return { openapi: "3.0.0", info: { title: "Story", version: "1" }, paths: {} };
  },
  async executeCommand() {
    throw new Error("OperationArgsForm story does not execute operations");
  },
  async lookupFilters() {
    return {
      filters: {
        company: {
          label: "Company",
          options: {
            "acme-regional": { kind: "text", text: "Acme Regional" },
            "acme-holdings": { kind: "text", text: "Acme Holdings" },
          },
        },
      },
    };
  },
};

function ArgsStory({
  operation,
  stored,
}: {
  operation: ResolvedOperation;
  stored: OperationArgs;
}) {
  const [queryClient] = useState(
    () => new QueryClient({ defaultOptions: { queries: { retry: false } } }),
  );
  const [args, setArgs] = useState(stored);
  const [valid, setValid] = useState(true);
  return (
    <QueryClientProvider client={queryClient}>
      <div className="mx-auto max-w-2xl space-y-4 p-6">
        <OperationArgsForm
          client={client}
          operation={operation}
          args={stored}
          onChange={setArgs}
          onValidityChange={setValid}
        />
        <pre className="rounded-md border bg-muted/30 p-3 text-xs">
          {JSON.stringify({ valid, args }, null, 2)}
        </pre>
      </div>
    </QueryClientProvider>
  );
}

const meta = {
  title: "RPC/OperationArgsForm",
  component: OperationArgsForm,
  render: () => <ArgsStory operation={catchUp} stored={{}} />,
} satisfies Meta<typeof OperationArgsForm>;

export default meta;
type Story = StoryObj<typeof meta>;

// A required company lookup is empty, so the form reports itself invalid.
export const RequiredLookupMissing: Story = {};

// Args saved by an older form (a boolean and a number) load into the controls.
export const StoredArgs: Story = {
  render: () => (
    <ArgsStory
      operation={catchUp}
      stored={{ company: "acme-regional", "dry-run": true, "max-date-steps": 5 }}
    />
  ),
};

export const NoInput: Story = {
  render: () => <ArgsStory operation={noInput} stored={{}} />,
};
