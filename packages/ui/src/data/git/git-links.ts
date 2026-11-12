import type { GitWebRepository, GitTarget } from "./types";

function escapePath(path: string) {
  return path.split("/").map(encodeURIComponent).join("/");
}

// A branch or tag from a fully qualified ref; the diff's side grammar always qualifies them.
function refVersion(ref: string) {
  const [, kind, name] = ref.match(/^refs\/(heads|tags)\/(.+)$/) ?? [];
  if (!kind || !name)
    throw new Error(
      `Git ref "${ref}" must be refs/heads/<branch> or refs/tags/<tag>`,
    );
  return { name, kind, azurePrefix: kind === "heads" ? "GB" : "GT" };
}

export function gitWebLink(repo: GitWebRepository, target: GitTarget): string {
  if (/\/$|\.git$/.test(repo.web))
    throw new Error(
      `Repository web URL "${repo.web}" must have no trailing slash or .git suffix`,
    );
  const sub = { github: "", gitlab: "/-", azure_devops: "" }[repo.provider];
  if ("pullRequest" in target) {
    if (!Number.isSafeInteger(target.pullRequest) || target.pullRequest <= 0)
      throw new Error("A pull request link needs a positive integer");
    return `${repo.web}${{ github: "/pull/", gitlab: "/-/merge_requests/", azure_devops: "/pullrequest/" }[repo.provider]}${target.pullRequest}`;
  }
  if ("ref" in target) {
    const version = refVersion(target.ref);
    if (repo.provider === "azure_devops")
      return `${repo.web}?${new URLSearchParams({ version: version.azurePrefix + version.name })}`;
    const tree = `${repo.web}${sub}/tree/${escapePath(version.name)}`;
    return repo.provider === "gitlab"
      ? `${tree}?${new URLSearchParams({ ref_type: version.kind })}`
      : tree;
  }
  if (!/^[0-9a-f]{40}$/i.test(target.commit))
    throw new Error(
      `Commit "${target.commit}" must be a full 40-character SHA to link to it`,
    );
  if (target.file !== undefined) {
    const path = target.file;
    if (
      path.includes("\\") ||
      path.split("/").some((part) => !part || part === "." || part === "..")
    )
      throw new Error("A file link needs a repository-relative path");
    if (repo.provider === "azure_devops")
      return `${repo.web}?${new URLSearchParams({ path: `/${path}`, version: `GC${target.commit}` })}`;
    return `${repo.web}${sub}/blob/${encodeURIComponent(target.commit)}/${escapePath(path)}`;
  }
  return `${repo.web}${sub}/commit/${encodeURIComponent(target.commit)}`;
}

export function shortSha(sha: string) {
  if (!/^[0-9a-f]{7,40}$/i.test(sha))
    throw new Error(`Commit "${sha}" is not a 7–40 character hexadecimal SHA`);
  return sha.slice(0, 7);
}
