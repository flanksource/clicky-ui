---
name: clicky-ui-playground
description: Create and iterate on Clicky UI playground pages, inspect live layouts, and address anchored playground feedback. Use for TSX prototypes in apps/playground or feedback from a running Clicky UI playground.
---

# Clicky UI playground

Use the playground for local UI studies and feedback-driven iteration. Keep the task attached to the requested page, reference URL, or comment thread. A prototype does not authorize changes to the product it illustrates.

## Find the workspace and runtime

Locate the `flanksource/clicky-ui` checkout and read its `AGENTS.md`. The playground lives at `apps/playground`; it consumes live shared library source from `packages/ui/src`. When working from another repository, locate the existing sibling checkout rather than creating a second playground app.

Use the supplied playground URL and origin when available. The default local origin is `http://localhost:5274`. Check whether it is already running before starting `pnpm run dev:playground` from the checkout root. Install workspace dependencies with `pnpm install` only if missing. Preserve existing pages, feedback, and unrelated changes.

Read `apps/playground/README.md` for detailed editing and feedback contracts, and `.agents/skills/clicky-ui/SKILL.md` for shared component conventions when available.

## Create or change a page

Pages are discovered from `apps/playground/src/pages/**/*.tsx`; no registry edit is needed. Use lowercase kebab-case filenames and folders. `src/pages/team/summary.tsx` maps to `/?page=team%2Fsummary`. Files or folders prefixed with `_` and `*.test.tsx` / `*.stories.tsx` are excluded.

Export a React component as default and optional literal `meta` for its title and description:

```tsx
import { Button } from "@flanksource/clicky-ui";

export const meta = {
  title: "Team summary",
  description: "A layout study for reviewing team activity",
};

export default function TeamSummary() {
  return (
    <section className="space-y-4">
      <p className="text-sm text-muted-foreground">Recent team activity</p>
      <Button onClick={() => window.alert("Preview action")}>Review activity</Button>
    </section>
  );
}
```

Inspect nearby pages and shared component source before composing the study. Reuse Clicky UI components, theme tokens, density utilities, and generated offline `Ui*` icons from `@flanksource/clicky-ui/icons`. The playground already supplies the app shell, theme, routing, and feedback provider. Use small, readable fixtures and meaningful interactions; match the supplied reference's content and hierarchy.

Scratch pages are normally gitignored. Check `git check-ignore -v <page-path>` before deciding whether an artifact should be tracked; do not force-add a local study without a request. Put reusable UI fixes in the owning `packages/ui/src` component when the task includes changing shared behavior.

The toolbar's **Edit** action opens source beside the preview. Save with the button or Command+S before renaming or moving a page. Filesystem actions require the dev server. Reload after source changes: the current Vite configuration disables browser HMR, so an already-open page may be stale.

## Verify the rendered result

Open the exact `?page=` route with `agent-browser`. Use its Chrome engine for screenshots, layout measurements, and responsive verification. Inspect desktop and compact widths, light/dark when relevant, and the controls changed by the task. Check DOM and computed styles when the browser differs from the intended layout.

Run `pnpm --filter playground lint` and `pnpm --filter playground build` from the checkout root. For shared-library changes, also follow the repository's package checks. Do not add automated tests for scratch playground pages; use live browser verification plus lint/build. Report unrelated dirty-worktree failures separately from focused validation. Return the page URL and source path with what was verified.

## Work from feedback

**Copy feedback** produces Markdown containing the page, thread, captured source/component/HTML context, optional screenshot, and reply/resolve URLs. **Copy page** copies a page's design guidance; it is separate from copying playground operating instructions. Use captured context to locate the actual source, then inspect the live page before changing it.

Discover the running API at `GET /__playground/comments/schema`. Read unresolved feedback with `GET /__playground/comments?page=<URL-encoded-slug>&unresolved=true`; omit `page` only when asked to review all pages. Inspect the full thread, replies, and any captured screenshot. Use the supplied origin rather than assuming localhost when working with copied feedback.

When asked to implement feedback, make and verify the scoped change, reply at `POST /__playground/comments/{id}/replies` with a JSON body such as `{"body":"Updated the summary spacing and checked desktop and compact layouts.","author":{"name":"Coding agent","kind":"agent"}}`, then resolve at `POST /__playground/comments/{id}/resolve`. Use HTTP clients that fail on error responses and check mutation results. Resolving means the work is ready for review. Closing, reopening, and review approval belong to the human; do not impersonate a user or delete feedback to mark it done. Review-only requests stay read-only.

When posting a comment or review produced by another agent (for example a review delegated through `captain prompt`, Codex or Gemini), attribute it to that agent and name yourself in `via`: set `author.name` to the agent or model that wrote the text, `author.kind` to `agent`, `author.via` to the agent posting it, `author.sessionId` to the producing run's session ID, and `author.cost` to that run's AI response cost in USD, for example `{"name":"gpt-6.1-sol","kind":"agent","via":"Claude","sessionId":"019a3f2e-…","cost":0.42}`. Take the session ID and cost from the run's own output; omit a field only when the runtime does not report it, and never estimate it. Post the other agent's findings as written, separate from your own commentary.

For external pages captured through **Bookmarklet**, the page key is `external:<uuid>`, not a TSX slug. Follow the stored original URL and captured source context; do not invent a local page path. The playground must remain reachable for the feedback API. See its README for external-page and local-file preview limitations.
