import type { VocabularyDeclarationItem } from "@flanksource/clicky-ui/comments";
import { Icon, type StaticIconComponent } from "@flanksource/clicky-ui/data";
import { gitWebLink, type GitTarget } from "@flanksource/clicky-ui/git";
import {
  UiAzureRepos,
  UiCloudUpload,
  UiFile,
  UiFolder,
  UiFolderGit,
  UiFolderGit2,
  UiGitBranch,
  UiGitCommit,
  UiGitMerge,
  UiGitPr,
  UiTag,
} from "@flanksource/clicky-ui/icons";
import { Github } from "@flanksource/icons/mi";

import { GIT_VOCABULARY, type GitObject, type GitObjectItem } from "./_items";

const icons: Record<GitObject, StaticIconComponent> = {
  repository: UiFolderGit2,
  branch: UiGitBranch,
  commit: UiGitCommit,
  worktree: UiFolderGit,
  pullRequest: UiGitPr,
  merge: UiGitMerge,
  upstream: UiCloudUpload,
  tag: UiTag,
  tree: UiFolder,
  blob: UiFile,
};

const providerIcons = {
  github: Github,
  azure_devops: UiAzureRepos,
};

const commit = "a7e6d5c4b3a291807f6e5d4c3b2a19087f6e5d4c";
const targets: Partial<Record<GitObject, GitTarget>> = {
  branch: { ref: "refs/heads/feat/cart-validation" },
  commit: { commit },
  pullRequest: { pullRequest: 412 },
};

function ObjectValue({ item }: { item: GitObjectItem }) {
  const className =
    "block break-words font-mono text-xs leading-4 [overflow-wrap:anywhere]";
  if (item.provider === "git")
    return <span className={className}>{item.value}</span>;
  const web =
    item.provider === "github"
      ? "https://github.com/acme/widgets"
      : "https://dev.azure.com/acme/checkout/_git/widgets";
  if (item.object === "repository")
    return (
      <a href={web} className={className}>
        {item.value}
      </a>
    );
  const target = targets[item.object];
  if (!target) throw new Error(`No hosted Git object target for ${item.id}`);
  return (
    <a
      href={gitWebLink({ provider: item.provider, web }, target)}
      className={className}
    >
      {item.value}
    </a>
  );
}

export default function GitObjectPreview({
  item,
}: {
  item: VocabularyDeclarationItem;
}) {
  const definition = GIT_VOCABULARY.find(
    (candidate) =>
      candidate.id === item.id,
  );
  if (!definition)
    throw new Error(
      `Unknown Git vocabulary object: git:${item.id}`,
    );
  return (
    <div className="flex min-w-0 items-start gap-2">
      <Icon
        icon={icons[definition.object]}
        className="mt-px shrink-0 text-sm text-muted-foreground"
      />
      {definition.provider !== "git" && (
        <Icon
          icon={providerIcons[definition.provider]}
          className="mt-px shrink-0 text-sm"
        />
      )}
      <div className="min-w-0">
        <ObjectValue item={definition} />
        <p className="mt-0.5 break-words text-[11px] leading-snug text-muted-foreground [overflow-wrap:anywhere]">
          {definition.detail}
        </p>
      </div>
    </div>
  );
}
