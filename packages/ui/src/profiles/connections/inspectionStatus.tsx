import { IconButton } from "../../components/IconButton";
import { UiRefresh } from "../../icons";
import type { Inspection } from "./useInspection";

function metadataAge(ageMs: number): string {
  const minutes = Math.floor(ageMs / 60_000);
  if (minutes < 1) return "just now";
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 48) return `${hours}h ago`;
  return `${Math.floor(hours / 24)}d ago`;
}

export function InspectionStatus({ inspection }: { inspection: Inspection }) {
  const cache = inspection.cache;
  const label = inspection.refreshing
    ? "Refreshing metadata"
    : "Refresh metadata";
  return (
    <div className="flex items-center justify-between gap-2 rounded-md border px-2 py-1 text-xs text-muted-foreground">
      <div className="min-w-0">
        <span>
          {cache
            ? `Metadata updated ${metadataAge(cache.ageMs)}${cache.state === "stale" ? " · stale" : ""}`
            : "Metadata has not been loaded"}
        </span>
        {cache?.lastRefreshError ? (
          <p
            className="truncate text-destructive"
            title={cache.lastRefreshError}
          >
            Refresh failed: {cache.lastRefreshError}
          </p>
        ) : null}
      </div>
      <IconButton
        icon={UiRefresh}
        label={label}
        disabled={inspection.refreshing}
        onClick={inspection.refresh}
      />
    </div>
  );
}
