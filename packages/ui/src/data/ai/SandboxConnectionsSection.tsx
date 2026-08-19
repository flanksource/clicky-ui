import { useId, useMemo } from "react";

import { Switch } from "../../components/Switch";
import type { SpecRuntimeSandboxCredential } from "./SandboxCreateWizard.model";

export type SandboxConnectionsSectionProps = {
  connections: SpecRuntimeSandboxCredential[];
  selectedIds: string[];
  onToggle: (id: string) => void;
};

export function SandboxConnectionsSection({
  connections,
  selectedIds,
  onToggle,
}: SandboxConnectionsSectionProps) {
  const headingId = useId();
  const groupedConnections = useMemo(() => {
    const groups = new Map<string, SpecRuntimeSandboxCredential[]>();
    for (const connection of connections) {
      const category = connection.category?.trim() || "Other connections";
      groups.set(category, [...(groups.get(category) ?? []), connection]);
    }
    return [...groups.entries()];
  }, [connections]);

  return (
    <section aria-labelledby={headingId} className="space-y-density-4">
      <div>
        <h3 id={headingId} className="text-sm font-semibold">
          Connections
        </h3>
        <p className="mt-1 text-sm text-muted-foreground">
          Choose only the host connections this sandbox needs. The wizard stores
          references; secret values stay with the host.
        </p>
      </div>
      {groupedConnections.length === 0 ? (
        <p className="rounded-md border border-dashed border-border p-density-3 text-sm text-muted-foreground">
          No connections are available to expose.
        </p>
      ) : (
        groupedConnections.map(([category, choices]) => (
          <ConnectionGroup
            key={category}
            category={category}
            connections={choices}
            selectedIds={selectedIds}
            onToggle={onToggle}
          />
        ))
      )}
    </section>
  );
}

function ConnectionGroup({
  category,
  connections,
  selectedIds,
  onToggle,
}: {
  category: string;
  connections: SpecRuntimeSandboxCredential[];
  selectedIds: string[];
  onToggle: (id: string) => void;
}) {
  return (
    <div className="space-y-density-2">
      <h4 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
        {category}
      </h4>
      <div className="grid gap-density-2 md:grid-cols-2">
        {connections.map((connection) => (
          <div
            key={connection.id}
            className="rounded-md border border-border bg-card p-density-3"
          >
            <Switch
              checked={selectedIds.includes(connection.id)}
              disabled={connection.available === false}
              onChange={() => onToggle(connection.id)}
              label={
                <span>
                  <span className="block font-medium">{connection.label}</span>
                  {connection.description && (
                    <span className="block text-xs text-muted-foreground">
                      {connection.description}
                    </span>
                  )}
                </span>
              }
            />
            {connection.available === false &&
              connection.unavailableReason && (
                <p className="mt-density-2 text-xs text-destructive">
                  {connection.unavailableReason}
                </p>
              )}
          </div>
        ))}
      </div>
    </div>
  );
}
