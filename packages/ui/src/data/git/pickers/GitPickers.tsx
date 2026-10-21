import { UiFile, UiFolderGit, UiGitBranch, UiGitCommit, UiPlayCircle, UiTag, UiWorkflow } from "../../../icons";
import { Avatar } from "../../Avatar";
import type { GitBranchOption, GitCommitOption, GitConnectionOption, GitPickerProps, GitPipelineExecutionOption, GitPipelineOption, GitRefOption, GitRepositoryOption } from "./types";
import { ReferencePicker, type ReferenceChoice } from "./ReferencePicker";

function dateLabel(date?: string): string {
  return date ? new Date(date).toLocaleDateString(undefined, { day: "numeric", month: "short", year: "numeric" }) : "";
}

function branchOption(item: GitBranchOption, prefix: string): ReferenceChoice {
  const value = item.name.startsWith(prefix) ? item.name : `${prefix}${item.name}`;
  return { value, label: item.name.replace(/^refs\/(heads|tags)\//, ""),
    description: [item.author, dateLabel(item.date), item.sha.slice(0, 7), item.subject].filter(Boolean).join(" · "),
    icon: item.author ? <Avatar alt={item.author} size="xs" variant="mono" /> : <UiGitBranch />,
    title: [value, item.sha, item.subject].filter(Boolean).join("\n"),
    ...(item.author ? { author: item.author } : {}), ...(item.date ? { date: dateLabel(item.date) } : {}), ...(item.subject ? { detail: item.subject } : {}) };
}

export function GitConnectionPicker(props: GitPickerProps<GitConnectionOption>) {
  return <ReferencePicker {...props} label={props.label ?? "Git connection"} plural="connections" option={(item) => ({ value: item.name, label: item.name, description: item.type, icon: <UiFolderGit /> })} />;
}

export function GitRepositoryPicker(props: GitPickerProps<GitRepositoryOption>) {
  return <ReferencePicker {...props} label={props.label ?? "Repository"} plural="repositories" option={(item) => ({ value: item.fullName, label: item.fullName,
    description: [item.defaultBranch, item.private ? "private" : "", item.archived ? "archived" : ""].filter(Boolean).join(" · "), icon: <UiFolderGit />, title: item.fullName })} />;
}

export function GitBranchPicker(props: GitPickerProps<GitBranchOption>) {
  return <ReferencePicker {...props} label={props.label ?? "Branch"} plural="branches" option={(item) => branchOption(item, "refs/heads/")} />;
}

export function GitRefPicker(props: GitPickerProps<GitRefOption> & { allowCustomRef?: boolean }) {
  return <ReferencePicker {...props} label={props.label ?? "Git ref"} plural="refs" {...(props.allowCustomRef ? { custom: (value: string) => value.trim() ? { value: value.trim(), label: value.trim(), icon: <UiGitCommit /> } : null } : {})}
    option={(item) => ({ ...branchOption(item, item.kind === "tag" ? "refs/tags/" : "refs/heads/"), group: item.kind === "tag" ? "Tags" : "Branches", ...(item.kind === "tag" ? { icon: <UiTag /> } : {}) })} />;
}

export function GitCommitPicker(props: GitPickerProps<GitCommitOption>) {
  return <ReferencePicker {...props} label={props.label ?? "Commit"} plural="commits" size={props.size ?? "sm"}
    custom={(value) => /^[a-f\d]{40}$/i.test(value.trim()) ? { value: value.trim(), label: value.trim(), selectedLabel: value.trim().slice(0, 7), icon: <UiGitCommit /> } : null}
    option={(item) => ({ value: item.sha, label: item.subject, selectedLabel: item.sha.slice(0, 7),
      description: [item.author, dateLabel(item.date), item.sha.slice(0, 7)].filter(Boolean).join(" · "),
      icon: item.author ? <Avatar alt={item.author} size="xs" variant="mono" /> : <UiGitCommit />, title: `${item.sha}\n${item.subject}`,
      detail: item.subject, ...(item.author ? { author: item.author } : {}), ...(item.date ? { date: dateLabel(item.date) } : {}) })} />;
}

export function GitPipelinePicker(props: GitPickerProps<GitPipelineOption>) {
  return <ReferencePicker {...props} label={props.label ?? "Pipeline"} plural="pipelines" option={(item) => ({ value: item.id, label: item.name,
    description: [item.path, item.state].filter(Boolean).join(" · "), icon: <UiWorkflow />, title: `${item.name}\n${item.path ?? ""}\n${item.id}` })} />;
}

export function GitPipelineExecutionPicker(props: GitPickerProps<GitPipelineExecutionOption>) {
  return <ReferencePicker {...props} label={props.label ?? "Pipeline execution"} plural="pipeline executions" option={(item) => ({ value: item.id,
    label: `#${item.number} ${item.name}`, selectedLabel: `#${item.number}`, group: item.result || item.status,
    description: [item.author, dateLabel(item.createdAt), item.branch, item.sha.slice(0, 7), item.status, item.result].filter(Boolean).join(" · "),
    icon: item.author ? <Avatar alt={item.author} size="xs" variant="mono" /> : <UiPlayCircle />,
    title: `${item.id}\n${item.branch}\n${item.sha}`, detail: `${item.name} · ${item.result || item.status}`,
    ...(item.author ? { author: item.author } : {}), date: dateLabel(item.createdAt) })} />;
}

export interface GitPathOption { path: string; sha: string }
export function GitPathPicker(props: GitPickerProps<GitPathOption>) {
  return <ReferencePicker {...props} label={props.label ?? "Git file"} plural="files" option={(item) => ({ value: item.path, label: item.path, icon: <UiFile />, title: `${item.path}\n${item.sha}` })} />;
}
