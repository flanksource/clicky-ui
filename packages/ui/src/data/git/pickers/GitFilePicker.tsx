import { useMemo } from "react";
import { GitSourcePicker } from "./GitSourcePicker";
import { GitCommitPicker, GitPathPicker, type GitPathOption } from "./GitPickers";
import type { GitCommitOption, GitFileValue, GitPickerClient, GitPickerLoader, GitPickerProps } from "./types";

export interface GitFilePickerProps {
  client: GitPickerClient;
  value: GitFileValue;
  onChange: (value: GitFileValue) => void;
  accept?: readonly string[];
  label?: string;
  help?: string;
  disabled?: boolean;
  /** `inline` draws repository, ref, commit and file as click-to-edit chips (`acme/rules @ main / rules.xlsx`); help is not drawn. */
  variant?: GitPickerProps<unknown>["variant"];
}

export function GitFilePicker({ client, value, onChange, accept = [], label = "Git file", help, disabled = false, variant }: GitFilePickerProps) {
  const inline = variant === "inline";
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
  return <div className={inline ? "inline-flex min-w-0 max-w-full flex-wrap items-center gap-1.5 text-sm text-muted-foreground" : "min-w-0 space-y-2"} data-git-file-picker={inline ? "inline" : ""}>
    <GitSourcePicker client={client} value={value} onChange={(source) => onChange({ ...source, path: "", sha: "" })} disabled={disabled} {...(variant ? { variant } : {})} />
    {inline && commits && <span aria-hidden="true">at</span>}
    {commits && <GitCommitPicker value={value.sha} load={commits} scope={JSON.stringify([value.connection, value.repo, value.ref])}
      disabled={disabled || !value.connection || !value.ref} {...(variant ? { variant } : {})} {...(inline ? { placeholder: "latest commit" } : { help: "Optionally select a specific commit before choosing a file." })}
      onChange={(sha) => onChange({ ...value, sha, path: "" })} />}
    {inline && <span aria-hidden="true">/</span>}
    <GitPathPicker value={value.path} load={load} scope={scope} label={label} {...(help && !inline ? { help } : {})} {...(variant ? { variant } : {})}
      disabled={disabled || !value.connection || !value.ref}
      onChange={(path, item) => {
        if (path && !item) throw new Error("Selected Git file has no commit provenance");
        onChange({ ...value, path, sha: item?.sha ?? "" });
      }} />
    {value.sha && !inline && <p className="break-all font-mono text-xs text-muted-foreground" title={value.sha}>{value.sha.slice(0, 7)} · {value.path}</p>}
  </div>;
}
