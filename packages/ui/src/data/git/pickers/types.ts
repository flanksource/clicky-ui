import type { ReactNode } from "react";
import type { FormSize } from "../../../components/json-schema-form-size";

export interface GitPickerPage<T> { items: T[]; nextCursor?: string }
export interface GitPickerLoadRequest { signal: AbortSignal; cursor?: string }
export type GitPickerLoader<T> = (request: GitPickerLoadRequest) => Promise<GitPickerPage<T>>;

export interface GitPickerProps<T> {
  value: string;
  onChange: (value: string, item?: T) => void;
  items?: readonly T[];
  load?: GitPickerLoader<T>;
  scope?: string;
  label?: string;
  help?: string;
  placeholder?: string;
  disabled?: boolean;
  loading?: boolean;
  error?: Error | null;
  onRetry?: () => void;
  size?: FormSize;
  className?: string;
  optionTrailing?: (item: T) => ReactNode;
}

export interface GitConnectionOption { name: string; type: string; url?: string }
export interface GitRepositoryOption { fullName: string; name: string; defaultBranch?: string; private?: boolean; archived?: boolean }
export interface GitBranchOption { name: string; sha: string; author?: string; subject?: string; date?: string }
export interface GitRefOption extends GitBranchOption { kind: "branch" | "tag" }
export interface GitCommitOption { sha: string; subject: string; author?: string; date?: string }
export interface GitPipelineOption { id: string; name: string; path?: string; url?: string; state?: string }
export interface GitPipelineExecutionOption {
  id: string;
  pipeline: string;
  number: string;
  name: string;
  branch: string;
  sha: string;
  status: string;
  result?: string;
  author?: string;
  createdAt: string;
  url?: string;
  attempt?: number;
}

export interface GitSourceValue { connection: string; repo: string; ref: string }
export interface GitFileValue extends GitSourceValue { path: string; sha: string }
export interface GitBrowseRequest {
  connection: string;
  repo?: string;
  ref?: string;
  pipeline?: string;
  branch?: string;
  cursor?: string;
  limit?: number;
  extensions?: readonly string[];
}
export interface GitPickerClient {
  connections: (signal: AbortSignal) => Promise<GitConnectionOption[]>;
  repositories: (request: GitBrowseRequest, signal: AbortSignal) => Promise<GitRepositoryOption[]>;
  refs: (request: GitBrowseRequest, signal: AbortSignal) => Promise<{ branches: GitBranchOption[]; tags: GitBranchOption[] }>;
  files: (request: GitBrowseRequest, signal: AbortSignal) => Promise<{ sha: string; paths: string[] }>;
  commits?: (request: GitBrowseRequest, signal: AbortSignal) => Promise<GitPickerPage<GitCommitOption>>;
  pipelines?: (request: GitBrowseRequest, signal: AbortSignal) => Promise<GitPickerPage<GitPipelineOption>>;
  executions?: (request: GitBrowseRequest, signal: AbortSignal) => Promise<GitPickerPage<GitPipelineExecutionOption>>;
}
