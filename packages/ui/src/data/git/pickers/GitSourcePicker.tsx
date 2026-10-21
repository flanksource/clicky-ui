import { useMemo, type ReactNode } from "react";
import { cn } from "../../../lib/utils";
import { GitConnectionPicker, GitRefPicker, GitRepositoryPicker } from "./GitPickers";
import { usePickerItems } from "./use-picker-items";
import type { GitPickerClient, GitPickerLoader, GitConnectionOption, GitRefOption, GitRepositoryOption, GitSourceValue } from "./types";

export interface GitSourcePickerProps {
  client: GitPickerClient;
  value: GitSourceValue;
  onChange: (value: GitSourceValue) => void;
  layout?: "stacked" | "row";
  leading?: ReactNode;
  optionTrailing?: (value: GitSourceValue) => ReactNode;
  disabled?: boolean;
}

export function GitSourcePicker({ client, value, onChange, layout = "stacked", leading, optionTrailing, disabled = false }: GitSourcePickerProps) {
  const connectionLoader = useMemo<GitPickerLoader<GitConnectionOption>>(() => async ({ signal }) => ({ items: await client.connections(signal) }), [client]);
  const connections = usePickerItems({ load: connectionLoader });
  const connection = connections.items.find((item) => item.name === value.connection);
  const pinned = connection?.type === "git";
  const repo = pinned ? "" : value.repo;
  const scope = JSON.stringify([value.connection, repo]);
  const repositoryLoader = useMemo<GitPickerLoader<GitRepositoryOption>>(() => async ({ signal }) => ({ items: await client.repositories({ connection: value.connection }, signal) }), [client, value.connection]);
  const refLoader = useMemo<GitPickerLoader<GitRefOption>>(() => async ({ signal }) => {
    const refs = await client.refs({ connection: value.connection, ...(repo ? { repo } : {}) }, signal);
    return { items: [...refs.branches.map((item) => ({ ...item, kind: "branch" as const })), ...refs.tags.map((item) => ({ ...item, kind: "tag" as const }))] };
  }, [client, repo, value.connection]);
  const row = layout === "row";
  return <div className={cn(row ? "flex flex-wrap items-start gap-2" : "space-y-2")} data-git-source-picker={layout}>
    {leading}
    <GitConnectionPicker items={connections.items} value={value.connection} onChange={(name) => onChange({ connection: name, repo: "", ref: "" })}
      loading={connections.loading} error={connections.error} onRetry={connections.retry} disabled={disabled} {...(row ? { size: "sm", className: "w-56" } : {})}
      {...(optionTrailing ? { optionTrailing: (item: GitConnectionOption) => optionTrailing({ connection: item.name, repo: "", ref: "" }) } : {})} />
    {value.connection && !connections.loading && !connection && !connections.error && <p role="alert" className="text-xs text-destructive">Connection {value.connection} is not in the connection catalog.</p>}
    {connection && !pinned && <GitRepositoryPicker load={repositoryLoader} scope={value.connection} value={value.repo} disabled={disabled}
      onChange={(next, item) => onChange({ connection: value.connection, repo: next, ref: item?.defaultBranch ? (item.defaultBranch.startsWith("refs/") ? item.defaultBranch : `refs/heads/${item.defaultBranch}`) : "" })}
      {...(row ? { size: "sm", className: "w-56" } : {})}
      {...(optionTrailing ? { optionTrailing: (item: GitRepositoryOption) => optionTrailing({ connection: value.connection, repo: item.fullName, ref: "" }) } : {})} />}
    {connection && (pinned || repo) && <GitRefPicker load={refLoader} scope={scope} value={value.ref} disabled={disabled} allowCustomRef
      placeholder="Branch, tag or full SHA…" onChange={(ref) => onChange({ connection: value.connection, repo, ref })}
      {...(row ? { size: "sm", className: "w-56" } : {})}
      {...(optionTrailing ? { optionTrailing: (item: GitRefOption) => optionTrailing({ connection: value.connection, repo, ref: `${item.kind === "tag" ? "refs/tags/" : "refs/heads/"}${item.name}` }) } : {})} />}
  </div>;
}
