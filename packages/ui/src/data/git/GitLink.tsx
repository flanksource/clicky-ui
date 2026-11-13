import type { AnchorHTMLAttributes } from "react";
import { gitWebLink } from "./git-links";
import type { GitTarget, GitWebRepository } from "./types";

export type GitLinkProps = Omit<
  AnchorHTMLAttributes<HTMLAnchorElement>,
  "href" | "target"
> & {
  repository: GitWebRepository;
  target: GitTarget;
};

export function GitLink({
  repository,
  target,
  children,
  ...props
}: GitLinkProps) {
  return (
    <a {...props} href={gitWebLink(repository, target)}>
      {children}
    </a>
  );
}
