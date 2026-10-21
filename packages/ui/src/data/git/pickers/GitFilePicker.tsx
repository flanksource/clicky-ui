import { useMemo } from "react";
import { GitSourcePicker } from "./GitSourcePicker";
import { GitCommitPicker, GitPathPicker, type GitPathOption } from "./GitPickers";
import type { GitCommitOption, GitFileValue, GitPickerClient, GitPickerLoader } from "./types";

export interface GitFilePickerProps {
  client: GitPickerClient;
  value: GitFileValue;
  onChange: (value: GitFileValue) => void;
  accept?: readonly string[];
  label?: string;
  help?: string;
  disabled?: boolean;
}

export function GitFilePicker({ client, value, onChange, accept = [], label = "Git file", help, disabled = false }: GitFilePickerProps) {
  const extensions = accept.join("\u0000");
  const ref = value.sha || value.ref;
  const scope = JSON.stringify([value.connection, value.repo, ref, extensions]);
  const load = useMemo<GitPickerLoader<GitPathOption>>(() => async ({ signal }) => {
    const files = await client.files({ connection: value.connection, ...(value.repo ? { repo: value.repo } : {}), ref,
      ...(extensions ? { extensions: extensions.split("\u0000") } : {}) }, signal);
    if (!/^[a-f\d]{40}$/i.test(files.sha)) throw new Error("Git file discovery returned no valid commit SHA");
    return { items: files.paths.map((path) => ({ path, sha: files.sha })) };
  }, [client, extensions, ref, value.connection, value.repo]);
  const commits = useMemo<GitPickerLoader<GitCommitOption> | undefined>(() => client.commits ? async ({ signal, cursor }) => {
    if (!client.commits) throw new Error("Git commit discovery is unavailable");
    return client.commits({ connection: value.connection, ...(value.repo ? { repo: value.repo } : {}), ref: value.ref, ...(cursor ? { cursor } : {}) }, signal);
  } : undefined, [client, value.connection, value.repo, value.ref]);
  return <div className="min-w-0 space-y-2" data-git-file-picker="">
    <GitSourcePicker client={client} value={value} onChange={(source) => onChange({ ...source, path: "", sha: "" })} disabled={disabled} />
    {commits && <GitCommitPicker value={value.sha} load={commits} scope={JSON.stringify([value.connection, value.repo, value.ref])}
      disabled={disabled || !value.connection || !value.ref} help="Optionally select a specific commit before choosing a file."
      onChange={(sha) => onChange({ ...value, sha, path: "" })} />}
    <GitPathPicker value={value.path} load={load} scope={scope} label={label} {...(help ? { help } : {})}
      disabled={disabled || !value.connection || !value.ref}
      onChange={(path, item) => {
        if (path && !item) throw new Error("Selected Git file has no commit provenance");
        onChange({ ...value, path, sha: item?.sha ?? "" });
      }} />
    {value.sha && <p className="break-all font-mono text-xs text-muted-foreground" title={value.sha}>{value.sha.slice(0, 7)} · {value.path}</p>}
  </div>;
}
