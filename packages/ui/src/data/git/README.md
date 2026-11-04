# Native Git links

Import report helpers and types from `@flanksource/clicky-ui/git`. This entry point supports server rendering without loading browser-only UI modules. Types are defined in `types.ts`; URL construction is defined in `git-links.ts`.

```tsx
import { GitLink, gitWebLink, type GitWebRepository } from "@flanksource/clicky-ui/git";

const repository: GitWebRepository = {
  provider: "gitlab",
  web: "https://gitlab.example/acme/rules",
};
const commit = "0123456789abcdef0123456789abcdef01234567";

export function Source() {
  return <GitLink repository={repository} target={{ commit, file: "rules/Plan A/data.xml" }}>View source</GitLink>;
}

const reviewURL = gitWebLink(repository, { pullRequest: 7 });
```

`provider` accepts `github`, `gitlab`, or `azure_devops`. `web` is the repository's web URL, without a trailing slash or `.git` suffix. Targets select a full 40-character commit SHA, a file at that commit, a qualified branch/tag ref (`refs/heads/main`, `refs/tags/v1`), or a positive pull request number. File paths are relative to the repository root. Azure links preserve the distinction between branches and tags.

`GitCommitList` and `GitFileList`, exported by the main library, also accept `repository` metadata on each item. File items additionally supply `commit`. An explicit `href` takes precedence over a derived link.

Run native-provider and SSR regressions with `pnpm --filter @flanksource/clicky-ui exec vitest run src/data/git/git-links.test.ts src/data/git/GitLink.test.tsx src/data/git/GitChangeList.test.tsx`.
