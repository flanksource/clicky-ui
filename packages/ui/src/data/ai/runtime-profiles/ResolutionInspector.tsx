import { useState } from "react";
import { Tabs } from "../../../layout/Tabs";
import { CodeBlock } from "../../CodeBlock";
import type { RuntimeProfileResolveRequest } from "../runtime-profile";
import { ToolSchemaBrowser } from "../ToolSchemaBrowser";
import { ResolutionTrace } from "./ResolutionTrace";
import type { RuntimeProfileResolutionState } from "./types";

type InspectorTab = "settings" | "permissions" | "request";

const TABS: Array<{ id: InspectorTab; label: string }> = [
  { id: "settings", label: "Settings" },
  { id: "permissions", label: "Permissions" },
  { id: "request", label: "Request" },
];

export function ResolutionInspector({
  request,
  state,
}: {
  request: RuntimeProfileResolveRequest;
  state: RuntimeProfileResolutionState;
}) {
  const [tab, setTab] = useState<InspectorTab>("settings");
  return (
    <aside className="min-h-0 min-w-0 rounded-lg border border-border bg-card">
      <div className="flex items-center gap-2 border-b border-border px-3 py-2">
        <h2 className="flex-1 text-sm font-semibold">
          Resolved by runtime server
        </h2>
        <StatusLabel status={state.status} />
      </div>
      <Tabs
        tabs={TABS}
        value={tab}
        onChange={(next) => setTab(next as InspectorTab)}
        className="px-2"
      />
      {state.status === "error" ? (
        <div
          role="alert"
          className="m-4 rounded-md border border-destructive/40 bg-destructive/5 p-3 text-sm text-destructive"
        >
          {state.error}
        </div>
      ) : tab === "request" ? (
        <div className="p-3">
          <CodeBlock
            language="json"
            source={JSON.stringify(request, null, 2)}
            copyable
          />
        </div>
      ) : state.status === "loading" || !state.result ? (
        <p className="p-6 text-sm text-muted-foreground">
          Waiting for an authoritative response.
        </p>
      ) : tab === "permissions" ? (
        <ToolSchemaBrowser
          tools={state.result.tools}
          value={state.result.permissions}
          className="h-[42rem] rounded-none border-0"
        />
      ) : (
        <div className="space-y-4 p-3">
          <div>
            <h3 className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              Effective spec
            </h3>
            <CodeBlock
              language="json"
              source={JSON.stringify(state.result.resolved.spec, null, 2)}
              copyable
            />
          </div>
          <div>
            <h3 className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              Server order
            </h3>
            <ResolutionTrace trace={state.result.resolved.trace} />
          </div>
        </div>
      )}
    </aside>
  );
}

function StatusLabel({
  status,
}: {
  status: RuntimeProfileResolutionState["status"];
}) {
  if (status === "resolved") {
    return (
      <span className="text-xs font-medium text-emerald-600">Resolved</span>
    );
  }
  if (status === "error") {
    return <span className="text-xs font-medium text-destructive">Failed</span>;
  }
  return (
    <span className="text-xs font-medium text-muted-foreground">Resolving…</span>
  );
}
