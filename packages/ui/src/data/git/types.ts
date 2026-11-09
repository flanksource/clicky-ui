export type GitProvider = "github" | "gitlab" | "azure_devops";
export type GitWebRepository = { provider: GitProvider; web: string };
export type GitTarget =
  | { commit: string; file?: undefined }
  | { ref: string }
  | { pullRequest: number }
  | { file: string; commit: string };

export type GitDiffPayload = {
  diff: string;
  truncated?: boolean;
  binary?: boolean;
  path?: string;
  commit?: string;
};
export type GitDiffLoader<T> = (item: T) => Promise<GitDiffPayload>;

export type GitCommitItem = {
  id?: string;
  sha: string;
  shortSha?: string;
  title: string;
  body?: string;
  authorName?: string;
  authorLogin?: string;
  authorAvatarUrl?: string;
  committedAt?: string;
  additions?: number;
  deletions?: number;
  changedFiles?: number;
  href?: string;
  repository?: GitWebRepository;
};

export type GitFileChangeStatus =
  | "added"
  | "modified"
  | "deleted"
  | "renamed"
  | "copied"
  | string;

export type GitFileChangeItem = {
  id?: string;
  path: string;
  previousPath?: string;
  status?: GitFileChangeStatus;
  additions?: number;
  deletions?: number;
  href?: string;
  binary?: boolean;
  repository?: GitWebRepository;
  commit?: string;
};
