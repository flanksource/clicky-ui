import { useMemo, useState, type ReactElement, type ReactNode } from "react";
import { MethodBadge } from "../data/MethodBadge";
import type { DomainDefinition, ResolvedOperation } from "./types";

export type RenderLinkArgs = {
  to: string;
  className?: string;
  children: ReactNode;
  title?: string;
  key?: string;
};

// Render-prop form lets callers pass react-router's Link, a plain <a>, or
// any custom navigation component without relying on React type equality
// across nested type installs.
export type RenderLink = (args: RenderLinkArgs) => ReactElement;

export type EndpointListProps = {
  operations: ResolvedOperation[];
  definition: Pick<DomainDefinition, "title" | "emptyTitle" | "emptyDescription">;
  renderLink: RenderLink;
  getCommandHref?: (operationId: string, op: ResolvedOperation) => string;
};

const defaultCommandHref = (operationId: string) => `/commands/${operationId}`;

export function EndpointList({
  operations,
  definition,
  renderLink,
  getCommandHref = defaultCommandHref,
}: EndpointListProps) {
  const [search, setSearch] = useState("");

  const filtered = useMemo(() => {
    if (!search) return operations;
    const q = search.toLowerCase();
    return operations.filter(
      (op) =>
        op.path.toLowerCase().includes(q) ||
        op.operation.summary?.toLowerCase().includes(q) ||
        op.operation.operationId?.toLowerCase().includes(q),
    );
  }, [operations, search]);

  if (operations.length === 0) {
    return (
      <div className="rounded-xl border border-dashed p-8">
        <h2 className="text-lg font-medium">
          {definition.emptyTitle || `No ${definition.title} endpoints found`}
        </h2>
        <p className="mt-2 max-w-2xl text-sm text-muted-foreground">
          {definition.emptyDescription ||
            "This area is reserved in the information architecture, but the current OpenAPI surface does not expose matching operations yet."}
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <input
        placeholder={`Search ${definition.title.toLowerCase()}...`}
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="w-full max-w-lg rounded-lg border bg-background px-3 py-2 text-sm outline-none placeholder:text-muted-foreground focus:ring-2 focus:ring-ring"
      />
      <div className="space-y-2">
        {filtered.map((op) => {
          const operationId = op.operation.operationId ?? `${op.method}:${op.path}`;
          return renderLink({
            key: `${op.method}:${op.path}`,
            to: getCommandHref(operationId, op),
            className:
              "flex items-center gap-3 rounded-xl border bg-card p-3 transition-colors hover:border-emerald-200 hover:bg-emerald-50/50",
            children: (
              <>
                <MethodBadge method={op.method} />
                <code className="text-sm">{op.path}</code>
                {op.operation.summary && (
                  <span className="ml-auto text-xs text-muted-foreground">
                    {op.operation.summary}
                  </span>
                )}
              </>
            ),
          });
        })}
      </div>
    </div>
  );
}
