# Comment vocabularies are pages

Type `@` in a comment or reply to choose a vocabulary type and item. Enter or Tab inserts an atomic chip; hover or keyboard focus shows a larger image. Stored Markdown remains `[Decision](/?vocabulary=shapes%3Ashape%2Fdecision)`. The reference route shows the image, label, stable id, description, instructions and source references. **Open in vocabulary page** opens the page and scrolls to its preview marker.

## Declare a vocabulary

A normal TSX page exports a default React component, optional `meta`, and a static declaration:

```tsx
import { VocabularyPreview, type VocabularyDeclaration } from "@flanksource/clicky-ui/comments";

export const vocabulary = {
  alias: "shapes",
  instructions: "Read shapes:shape/key as a shape variant. Open the item's source references. An explicit request selects that variant; a reference identifying an existing element describes its current shape.",
  items: [{ type: "shape", id: "shape/decision", label: "Decision", description: "A decision with separately labelled outcomes.", references: ["examples/vocabularies/shapes/index.tsx"] }],
} satisfies VocabularyDeclaration;

export const meta = { title: "Shapes vocabulary", description: "Decision shapes for diagrams." };

export default function Shapes() {
  return <VocabularyPreview id="shape/decision"><svg width="180" height="90" viewBox="0 0 180 90"><path d="M90 5 170 45 90 85 10 45Z" fill="none" stroke="currentColor" /></svg></VocabularyPreview>;
}
```

`alias` is the stable namespace used by saved comments, independent of the directory name. It must match `[a-z][a-z0-9-]*`; duplicates across pages fail with both paths. Items omit `catalog`: the server fills it from the alias. Each item has non-empty `type`, `id`, `label`, `description` and `references`; extra JSON metadata is retained. Every declared id must have exactly one `VocabularyPreview`, and every marker must declare an item. The marker also sets `data-comment-anchor="vocabulary:<id>"`, making it a comment and scroll target. Missing, extra or duplicate markers are visible preview failures.

`instructions` is required Markdown for an LLM reading a comment. Explain the vocabulary, its `alias:type/key` references, which sources to open, and how an explicit variant request differs from identifying a current presentation. Copied feedback, dashboard copy and agent delivery include instructions once per alias before the referenced definitions. Unknown aliases fail explicitly. Page Markdown and Copy page include the instructions and full item list.

The declaration is read statically without running the page. Put imported item data in relative local modules. The old `catalog.ts` and `Preview.tsx` discovery and component-preview contract have been removed.

## Discovery and navigation

Vocabulary declarations are discovered in normal `src/pages/**` pages and in configured vocabulary roots. The built-in root is `src/vocabularies`; `PLAYGROUND_VOCABULARY_DIRS` adds comma-separated absolute directories. Root pages are `*.tsx` or `*/index.tsx`; helpers prefixed `_` or `.`, tests, stories, `node_modules` and `dist` are excluded. Root vocabulary pages appear under **Vocabularies** as `vocabularies/<alias>`; declarations in `src/pages` keep their normal slug.

Facet, Git and the local gitignored Brand page live here. The runnable Shapes example lives in `examples/vocabularies/shapes/index.tsx`. To include it, from `apps/playground`:

```bash
PLAYGROUND_VOCABULARY_DIRS="$PWD/examples/vocabularies" pnpm run dev
```

The same setting works with `pnpm run playground:prod`. `GET /__playground/vocabularies` returns `revision`, `catalogs` and `items`; each catalog supplies `alias`, `slug`, `file`, a versioned `page` URL, `instructions` and `previewRevision`. Preview revisions hash the page's import graph and managed library versions. The shell refreshes the snapshot every five seconds while visible and on focus. Changes need no shell rebuild.

## Preview generation and cache

Previews are WebP images, generated on demand once per alias with concurrent requests sharing the run. In browser mode, an off-screen 1280×800 `PageFrame` loads the vocabulary using the same project, runtime profile, dependencies, local overrides and lock resolution as the visible page. Once ready, the frame captures its own markers through `capture-vocabulary`. Its styles stay in that frame; it never replaces the active browser session. The frame is unmounted after capture.

In development mode, the shell imports the snapshot's page URL and mounts its default component off-screen within the shell's theme and density providers. It waits for fonts, Facet diagram/arrow readiness and DOM quiescence, then captures the marked blocks. Capture waits for images to decode, caps preview width at 640 pixels and preserves aspect ratio. The temporary page unmounts afterwards. Development generation uses the host document's CSS; browser mode provides page style isolation.

Only `previews.ts` reads or writes `clicky-playground.vocabulary-previews.<alias>`. Its value is `{previewRevision, images: { [id]: {image, width, height} }}`. A revision change replaces the entire alias entry. A storage read, write, removal or quota error appears as **Preview cache unavailable: &lt;reason&gt;** in the status menu; generated images remain available in memory for the session. The cache is an optimization, and storage failures do not hide generation failures.

Open the playground status menu to inspect vocabulary counts and errors. **Regenerate previews** clears an alias's cache and captures it again. Image slots show **Generating preview…** until ready, or the generation failure. Loading errors disable new vocabulary selections while retaining pages and drafts. Saved references whose live item was removed still retain their stored definitions and explicitly report that the live preview is unavailable.

## OIPA vocabulary ownership

The `oipa` page belongs to oipa-cli at `packages/oipa-kit/examples/vocabularies/oipa/index.tsx`. Configure `PLAYGROUND_VOCABULARY_DIRS` to that checkout's `packages/oipa-kit/examples/vocabularies` directory. Rendering variants come from `oipa/data/styles.ts`, and the kit's entity, element, transport, field-type, verification and state glyph tables come from `oipa/data/glyphs.ts`. Its page renders the kit's own specimens and styles. The alias and stable ids keep existing references resolvable. No OIPA-specific renderer lives in this shell.

## Focused verification

From the repository root:

```bash
gavel test --work-dir ./apps/playground --framework vitest --recursive=false -- src/vocabularies examples/vocabularies/shapes/index.test.tsx src/comments/markdown.test.ts src/markdown/guidance.test.ts
pnpm --filter playground exec tsc -p tsconfig.json --noEmit
```

Live checks cover both development and browser mode: open the vocabulary page, reference route, picker and chips; confirm image previews, cache reuse, regeneration and anchor scrolling. Use the local Facet sources required by the current specimens; a portable runtime also needs those exports in its managed Facet build.
