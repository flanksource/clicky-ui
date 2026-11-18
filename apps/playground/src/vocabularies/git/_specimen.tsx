import { cn } from "@flanksource/clicky-ui";
import type { VocabularyDeclarationItem } from "@flanksource/clicky-ui/comments";
import { Avatar, Icon } from "@flanksource/clicky-ui/data";
import { gitWebLink, type GitTarget } from "@flanksource/clicky-ui/git";
import { UiAzureRepos } from "@flanksource/clicky-ui/icons";
import { Github } from "@flanksource/icons/mi";
import { Icon as IconifyGlyph, type IconifyIcon } from "@iconify/react/offline";
import bookBookmarkThin from "@iconify-icons/ph/book-bookmark-thin";
import cloudArrowUpThin from "@iconify-icons/ph/cloud-arrow-up-thin";
import fileThin from "@iconify-icons/ph/file-thin";
import folderNotchOpenThin from "@iconify-icons/ph/folder-notch-open-thin";
import folderThin from "@iconify-icons/ph/folder-thin";
import gitBranchThin from "@iconify-icons/ph/git-branch-thin";
import gitCommitThin from "@iconify-icons/ph/git-commit-thin";
import gitMergeThin from "@iconify-icons/ph/git-merge-thin";
import gitPullRequestThin from "@iconify-icons/ph/git-pull-request-thin";
import tagThin from "@iconify-icons/ph/tag-thin";

import { GIT_VOCABULARY, isGitDiffStat, isGitState, type GitObject, type GitObjectItem, type GitStateItem } from "./_items";
import { AheadBehind, DiffStat, GitGlyph } from "./_parts";
import { gitStateToken } from "./_theme";

const icons: Record<GitObject, IconifyIcon> = {
  repository: bookBookmarkThin,
  branch: gitBranchThin,
  commit: gitCommitThin,
  worktree: folderNotchOpenThin,
  pullRequest: gitPullRequestThin,
  merge: gitMergeThin,
  upstream: cloudArrowUpThin,
  tag: tagThin,
  tree: folderThin,
  blob: fileThin,
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

const CHECKOUT_TITLE = {
  root: "Root checkout: the repository's main working tree (owns .git/)",
  linked: "Linked worktree: added with git worktree add (has a .git file)",
};

/** One state style: its glyph (or the reviewer's avatar) beside the example value, diff, divergence and detail. */
function GitStatePreview({ item, inline }: { item: GitStateItem; inline: boolean }) {
  const token = gitStateToken(item.group, item.state);
  const { value, detail, reviewer, diff, divergence, checkout } = item.example;
  return (
    <div className={cn("flex min-w-0 gap-2", inline ? "items-center" : "items-start")}>
      {reviewer ? (
        <Avatar alt={reviewer.name} title={`${reviewer.name} (@${reviewer.login})`} colorKey={reviewer.login} size="md" />
      ) : (
        <GitGlyph token={token} className={cn("text-sm", !inline && "mt-0.5")} />
      )}
      <div className={cn("min-w-0 flex-1", inline && "flex items-center gap-3")}>
        <p className={cn("flex items-center gap-2 font-mono text-xs", inline && "shrink-0")}>
          <span className="min-w-0 break-words [overflow-wrap:anywhere]">
            {reviewer && <GitGlyph token={token} className="mr-1.5 text-xs" />}
            {value}
          </span>
          {checkout && (
            <span
              title={CHECKOUT_TITLE[checkout]}
              className={cn(
                "shrink-0 rounded-sm px-1 font-sans text-[10px] font-medium uppercase tracking-wide",
                checkout === "root" ? "bg-foreground text-background" : "border border-dashed border-border text-muted-foreground",
              )}
            >
              {checkout === "root" ? "Root" : "Linked"}
            </span>
          )}
          {diff && (
            <span className="shrink-0">
              <DiffStat adds={diff.adds} dels={diff.dels} />
            </span>
          )}
        </p>
        <p className={cn("text-[11px] leading-snug text-muted-foreground", inline ? "flex items-center gap-2" : "mt-0.5 break-words [overflow-wrap:anywhere]")}>
          {detail}
        </p>
        {divergence && (
          <div className={cn("flex items-center gap-1.5 text-[11px] text-muted-foreground", inline ? "shrink-0" : "mt-1 flex-wrap")}>
            <AheadBehind ahead={divergence.ahead} behind={divergence.behind} base={divergence.base} />
            {(divergence.ahead > 0 || divergence.behind > 0) && <span>vs {divergence.base}</span>}
          </div>
        )}
      </div>
    </div>
  );
}

export default function GitObjectPreview({
  item,
  inline = false,
}: {
  item: VocabularyDeclarationItem;
  /** Lay a state out on one row, as the worktree states are shown. */
  inline?: boolean;
}) {
  const definition = GIT_VOCABULARY.find(
    (candidate) =>
      candidate.id === item.id,
  );
  if (!definition)
    throw new Error(
      `Unknown Git vocabulary object: git:${item.id}`,
    );
  if (isGitState(definition)) return <GitStatePreview item={definition} inline={inline} />;
  if (isGitDiffStat(definition))
    return (
      <div className="min-w-0">
        <p className="flex items-center gap-2 font-mono text-xs">
          {definition.files !== undefined && (
            <span className="text-[11px] text-muted-foreground">{definition.files} files</span>
          )}
          <DiffStat adds={definition.additions} dels={definition.deletions} />
        </p>
        <p className="mt-0.5 text-[11px] leading-snug text-muted-foreground">
          {definition.detail}
        </p>
      </div>
    );
  return (
    <div className="flex min-w-0 items-start gap-2">
      <span className="relative inline-flex size-8 shrink-0 items-center justify-center">
        <IconifyGlyph
          icon={icons[definition.object]}
          aria-hidden
          className="text-[2rem] text-muted-foreground"
        />
        {definition.provider !== "git" && (
          <span className="absolute -bottom-0.5 -right-0.5 inline-flex rounded-full bg-background p-px">
            <Icon
              icon={providerIcons[definition.provider]}
              className="text-xs"
            />
          </span>
        )}
      </span>
      <div className="min-w-0">
        <ObjectValue item={definition} />
        <p className="mt-0.5 break-words text-[11px] leading-snug text-muted-foreground [overflow-wrap:anywhere]">
          {definition.detail}
        </p>
      </div>
    </div>
  );
}
