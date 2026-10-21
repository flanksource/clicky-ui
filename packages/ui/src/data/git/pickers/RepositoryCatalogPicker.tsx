import { useMemo, useState, type ReactNode } from "react";
import { UiFolderGit } from "../../../icons";
import { ReferencePicker } from "./ReferencePicker";
import { usePickerItems } from "./use-picker-items";
import type { GitConnectionOption, GitPickerClient, GitPickerLoader, GitRepositoryOption, GitSourceValue } from "./types";

interface CatalogRepository extends GitRepositoryOption { connection: string; pinned: boolean }

interface Props {
  client: GitPickerClient;
  connections: readonly GitConnectionOption[];
  loading: boolean;
  error: Error | null;
  onRetry: () => void;
  value: GitSourceValue;
  onChange: (value: GitSourceValue) => void;
  disabled: boolean;
  compact: boolean;
  optionTrailing?: (value: GitSourceValue) => ReactNode;
}

export function RepositoryCatalogPicker({ client, connections, loading, error, onRetry, value, onChange, disabled, compact, optionTrailing }: Props) {
  const [failures, setFailures] = useState<string[]>([]);
  const load = useMemo<GitPickerLoader<CatalogRepository>>(() => async ({ signal }) => {
    const results = await Promise.allSettled(connections.map(async (connection) => {
      const repositories = await client.repositories({ connection: connection.name }, signal);
      return repositories.map((repository) => ({ ...repository, connection: connection.name, pinned: connection.type === "git" }));
    }));
    const errors: string[] = [];
    const items = results.flatMap((result, index) => {
      if (result.status === "fulfilled") return result.value;
      errors.push(`${connections[index]!.name}: ${result.reason instanceof Error ? result.reason.message : String(result.reason)}`);
      return [];
    });
    if (!signal.aborted) setFailures(errors);
    return { items };
  }, [client, connections]);
  const repositories = usePickerItems({ load, scope: JSON.stringify(connections), disabled: connections.length === 0 });
  const selected = (item: CatalogRepository): GitSourceValue => ({ connection: item.connection, repo: item.pinned ? "" : item.fullName, ref: "" });
  return <ReferencePicker label="Repository" plural="repositories" items={repositories.items}
    value={value.repo ? `${value.connection}/${value.repo}` : value.connection}
    loading={loading || repositories.loading} error={error ?? repositories.error ?? (failures.length ? new Error(failures.join("; ")) : null)}
    onRetry={error ? onRetry : repositories.retry} disabled={disabled}
    {...(compact ? { size: "sm", className: "w-64 max-w-full" } : {})}
    {...(optionTrailing ? { optionTrailing: (item: CatalogRepository) => optionTrailing(selected(item)) } : {})}
    option={(item) => ({ value: item.pinned ? item.connection : `${item.connection}/${item.fullName}`, label: item.fullName,
      group: item.connection, icon: <UiFolderGit />, description: [item.defaultBranch, item.private ? "private" : "", item.archived ? "archived" : ""].filter(Boolean).join(" · "), title: `${item.connection}/${item.fullName}` })}
    onChange={(_key, item) => {
      if (!item) return onChange({ connection: "", repo: "", ref: "" });
      const branch = item.defaultBranch;
      onChange({ ...selected(item), ref: branch ? (branch.startsWith("refs/") ? branch : `refs/heads/${branch}`) : "" });
    }} />;
}
