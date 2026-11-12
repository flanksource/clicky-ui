import { createElement } from "react";
import { GitLink, type GitLinkProps } from "@flanksource/clicky-ui/git";

export const pullRequestLink = {
  repository: { provider: "github", web: "https://github.example/acme/rules" },
  target: { pullRequest: 7 },
  rel: "noreferrer",
  children: "Review change",
} satisfies GitLinkProps;

export const fileLink = {
  repository: { provider: "gitlab", web: "https://gitlab.example/acme/rules" },
  target: { commit: "a".repeat(40), file: "rules/Plan A/data.xml" },
  children: "View source",
} satisfies GitLinkProps;

export const links = [createElement(GitLink, pullRequestLink), createElement(GitLink, fileLink)];
