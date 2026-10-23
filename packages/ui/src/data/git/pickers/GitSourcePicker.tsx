import { useMemo, type ReactNode } from "react";
import { cn } from "../../../lib/utils";
import { GitRefPicker } from "./GitPickers";
import { RepositoryCatalogPicker } from "./RepositoryCatalogPicker";
import { usePickerItems } from "./use-picker-items";
import type { GitPickerClient, GitPickerLoader, GitConnectionOption, GitRefOption, GitSourceValue } from "./types";

export interface GitSourcePickerProps {
  client: GitPickerClient;
  value: GitSourceValue;
  onChange: (value: GitSourceValue) => void;
  layout?: "stacked" | "row";
  leading?: ReactNode;
  optionTrailing?: (value: GitSourceValue) => ReactNode;
  disabled?: boolean;
  branchesOnly?: boolean;
}

export function GitSourcePicker({ client, value, onChange, layout = "stacked", leading, optionTrailing, disabled = false, branchesOnly = false }: GitSourcePickerProps) {
  const connectionLoader = useMemo<GitPickerLoader<GitConnectionOption>>(() => async ({ signal }) => ({ items: await client.connections(signal) }), [client]);
  const connections = usePickerItems({ load: connectionLoader });
  const connection = connections.items.find((item) => item.name === value.connection);
  const pinned = connection?.type === "git";
  const repo = pinned ? "" : value.repo;
  const scope = JSON.stringify([value.connection, repo]);
  const refLoader = useMemo<GitPickerLoader<GitRefOption>>(() => async ({ signal }) => {
    const refs = await client.refs({ connection: value.connection, ...(repo ? { repo } : {}) }, signal);
    return { items: [...refs.branches.map((item) => ({ ...item, kind: "branch" as const })), ...(branchesOnly ? [] : refs.tags.map((item) => ({ ...item, kind: "tag" as const })))] };
  }, [branchesOnly, client, repo, value.connection]);
  const row = layout === "row";
  return <div className={cn(row ? "flex flex-wrap items-start gap-2" : "space-y-2")} data-git-source-picker={layout}>
    {leading}
    <RepositoryCatalogPicker client={client} connections={connections.items} value={value} onChange={onChange}
      loading={connections.loading} error={connections.error} onRetry={connections.retry} disabled={disabled} compact={row}
      {...(optionTrailing ? { optionTrailing } : {})} />
    {value.connection && !connections.loading && !connection && !connections.error && <p role="alert" className="text-xs text-destructive">Connection {value.connection} is not in the connection catalog.</p>}
    {connection && (pinned || repo) && <GitRefPicker load={refLoader} scope={scope} value={value.ref} disabled={disabled} allowCustomRef={!branchesOnly}
      label={branchesOnly ? "Target branch" : "Git ref"} placeholder={branchesOnly ? "Select a target branch…" : "Branch, tag or full SHA…"} onChange={(ref) => onChange({ connection: value.connection, repo, ref })}
      {...(row ? { size: "sm", className: "w-56" } : {})}
      {...(optionTrailing ? { optionTrailing: (item: GitRefOption) => optionTrailing({ connection: value.connection, repo, ref: `${item.kind === "tag" ? "refs/tags/" : "refs/heads/"}${item.name}` }) } : {})} />}
  </div>;
}
