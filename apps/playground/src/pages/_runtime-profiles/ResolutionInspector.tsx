import { useState } from "react";
import { CodeBlock } from "@flanksource/clicky-ui";
import { ToolSchemaBrowser } from "@flanksource/clicky-ui/ai";
import type { RuntimeProfileResolveRequest } from "./contract";
import type { RuntimeProfileResolutionState } from "./use-resolution";

export function ResolutionInspector({
  request,
  state,
}: {
  request: RuntimeProfileResolveRequest;
  state: RuntimeProfileResolutionState;
}) {
  const [tab, setTab] = useState<"settings" | "permissions" | "request">(
    "settings",
  );
  return (
    <aside className="min-h-0 min-w-0 rounded-lg border border-border bg-card">
      <div className="flex items-center gap-2 border-b border-border px-3 py-2">
        <h2 className="flex-1 text-sm font-semibold">
          Resolved by runtime server
        </h2>
        <span
          className={
            state.status === "resolved"
              ? "text-xs font-medium text-emerald-600"
              : state.status === "error"
                ? "text-xs font-medium text-destructive"
                : "text-xs font-medium text-muted-foreground"
          }
        >
          {state.status === "resolved"
            ? "Resolved"
            : state.status === "error"
              ? "Failed"
              : "Resolving…"}
        </span>
      </div>
      <div className="flex gap-1 border-b border-border p-2">
        {(["settings", "permissions", "request"] as const).map((item) => (
          <button
            key={item}
            type="button"
            aria-pressed={tab === item}
            onClick={() => setTab(item)}
            className={
              tab === item
                ? "rounded-md bg-accent px-3 py-1.5 text-xs font-medium capitalize"
                : "rounded-md px-3 py-1.5 text-xs capitalize text-muted-foreground hover:bg-accent/50"
            }
          >
            {item}
          </button>
        ))}
      </div>
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
            <ol className="space-y-1 text-sm">
              {state.result.resolved.trace.map((layer, index) => (
                <li
                  key={layer.id}
                  className="flex items-center gap-2 rounded bg-muted/40 px-2 py-1.5"
                >
                  <span className="w-5 text-right font-mono text-xs text-muted-foreground">
                    {index + 1}
                  </span>
                  <span className="min-w-0 flex-1 truncate">{layer.name}</span>
                  <span
                    className={
                      layer.source === "profile"
                        ? "rounded bg-violet-500/10 px-1.5 py-0.5 text-[10px] font-semibold uppercase text-violet-600 dark:text-violet-300"
                        : "rounded bg-sky-500/10 px-1.5 py-0.5 text-[10px] font-semibold uppercase text-sky-600 dark:text-sky-300"
                    }
                  >
                    {layer.source}
                  </span>
                  <span className="text-xs capitalize text-muted-foreground">
                    {layer.scope}
                  </span>
                </li>
              ))}
            </ol>
          </div>
        </div>
      )}
    </aside>
  );
}
