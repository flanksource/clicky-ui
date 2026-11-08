---
title: FileFindingsView extensions
description: The seams a host uses to customize the findings tree, add actions and tabs, wire comments with assignment, and show folders.
---

`FileFindingsView` (from `@flanksource/clicky-ui/file-findings`) lists every file with lint violations or failed tests as a tree beside the open node. It stays domain-agnostic: everything app-specific is passed in as functions, slots and menu items. It is fully controlled, so a host can keep the open node, line, view and filters in its URL.

Try every seam together in the **Git/FileFindingsView → Hosted** story.

## Selection: files and folders

| Prop | Type | Behavior |
| --- | --- | --- |
| `selected` | `FileTreeSelection \| null` | The open node: `{ kind: "file" \| "folder", ref: FileRef }`. A folder's `ref.file` is its path under its work dir, `""` for a work dir's root. |
| `onSelect` | `(selection) => void` | Called when a file or folder row is picked. Use `sameSelection(a, b)` to compare selections. |
| `view` / `onViewChange` | `FileReviewView` | One value shared by every node. A node that lacks the view shows its first tab: Preview for markdown, Source for code, Problems for a folder. Keep any id the URL carries; do not coerce it to a built-in. |

A folder shows a **Problems** tab: every finding beneath it, grouped by file. Picking a group header opens that file; a problem's "Open in file" opens it at the problem's line. It loads no files, so it shows no source context.

## Files without findings

| Prop | Type | Behavior |
| --- | --- | --- |
| `files` | `readonly FileRef[]` | Files to list in the tree besides those with findings. A listed file with no findings shows a zero count and opens like any other, through `loadFile`, instead of the "has no findings in this run" placeholder. |

`groupFindingsByFile(findings, files = [])` builds the same tree for hosts that render their own.

## Editable files

| Prop | Type | Behavior |
| --- | --- | --- |
| `onSourceChange` | `(file: FileRef, source: string) => void` | Makes the open file editable: **Source** becomes a Monaco editor (the host renders a `MonacoProvider` from `@flanksource/clicky-ui/monaco`), and every edit is reported here. |

Each edit also replaces the text the view loaded, so Preview, Problems and host tabs show the draft straight away, before the host has saved it. Reopening a file calls `loadFile` again, so the host should return its draft there. A raster image is never editable.

An editable file's header gets an **Edit / Review** toggle (Edit by default):

- **Edit** is the Monaco editor with the findings as squiggles and gutter dots. With patch comments (below) the gutter also marks the line range of each thread, a selection offers **Comment on selection**, and the threads list beside the editor.
- **Review** is the read-only listing: syntax-coloured lines, findings and comment threads under their lines, text selectable to comment on. Turning on **Blame** also shows this listing.

Host tabs get the same seam: `render({ path, source, findings, onSourceChange })`. `onSourceChange` is present exactly when the file is editable, and replaces the whole text, so a Rich text or Form tab edits the same draft the Source editor does.

## Images

| Prop | Type | Behavior |
| --- | --- | --- |
| `fileUrl` | `(file: FileRef) => string` | The URL that serves a file's raw bytes. Without it, images are treated like any other file. |

With `fileUrl`:

- An image file (png, jpg, jpeg, gif, webp, svg, avif, bmp, ico) opens as an image. A raster image has only a **Preview** tab and is never passed to `loadFile`; an `svg` also has a **Source** tab, loaded through `loadFile` as text.
- A relative image in a markdown file (`![](img/a.png)`) resolves against the markdown file's directory, in the same work dir, and loads from `fileUrl` of that file. Absolute (`https:`, `data:`, `/path`) images are left as authored. A `..` that climbs out of the work dir is not clamped, so the server must reject it.
- The tree shows an image icon for image files.

```tsx
<FileFindingsView
  {...props}
  fileUrl={(file) => `/api/file?work_dir=${encodeURIComponent(file.workDir ?? "")}&path=${encodeURIComponent(file.file)}`}
/>
```

Keep `fileUrl` referentially stable: the markdown preview re-renders when it changes. `relativeUrlPath(url)` and `isImagePath(path)` are exported from `@flanksource/clicky-ui/file-findings` for hosts that resolve relative image URLs themselves, e.g. through `DocumentEditor`'s `resolveImageUrl`. `ImagePreview` (from `@flanksource/clicky-ui/data`) renders one image for hosts that show image files outside this view.

Try it in the **Git/FileFindingsView → ImageFile** story.

## Tree rows

| Prop | Type | Behavior |
| --- | --- | --- |
| `treeNode.icon` | `(ctx) => ReactNode` | Replaces the folder/file icon. |
| `treeNode.name` | `(ctx) => ReactNode` | Replaces the name. Filtering still matches `node.name`. |
| `treeNode.badges` | `(ctx) => ReactNode` | Replaces the right-hand per-severity counts. |
| `treeActions` | `ReactNode` | Host controls in the tree toolbar, e.g. an auto-assign switch. |

Each slot gets `{ node, selected, default }`. `default` is what the row renders without the slot, so a slot can wrap it instead of rebuilding it:

```tsx
treeNode={{
  badges: ({ node, default: counts }) => (
    <span className="flex items-center gap-2">
      {assignedCount(node.findings) > 0 && <span>{assignedCount(node.findings)} assigned</span>}
      {counts}
    </span>
  ),
}}
```

## Actions

| Prop | Type | Where it shows |
| --- | --- | --- |
| `getFileActions` | `(file: FileRef) => DropdownMenuItem[]` | A kebab menu on the file's tree row and in the open file's header. |
| `getFolderActions` | `(folder: FileRef) => DropdownMenuItem[]` | A kebab menu on the folder's tree row and in the open folder's header. |
| `getFindingActions` | `(finding: FileFinding) => DropdownMenuItem[]` | Each finding's menu in Problems, Source, Preview and a folder's Problems. A finding carries its own `file` and `workDir`. |
| `fileToolbar` | `(file: FileRef) => ReactNode` | The open file's toolbar, e.g. save or re-lint buttons. |

Opening a row's kebab never selects or collapses the row. Return an empty array when no actions apply, and the menu is hidden.

## Comments, assignment and auto-assign

```tsx
comments={(file) => ({
  items: threadsFor(file),
  callbacks: { onCreate, onReply, onAssign },
  config: { statuses, assignees: [{ id: "claude", name: "Claude", kind: "agent" }] },
  createActions: [{ id: "plain", label: "Post comment" }, { id: "run", label: "Post & run agent" }],
  extraAssignItems: (comment) => [{ label: "Run agent", onSelect: () => runAgent(comment) }],
  renderRootDetails: (comment) => <AgentRunStatus comment={comment} />,
})}
```

| Field | Behavior |
| --- | --- |
| `comments(file)` | People's threads on one file. The host scopes them, because anchors do not name a file. |
| `createActions` | Post variants in every composer; the chosen id reaches `callbacks.onCreate(input, actionId)`. |
| `extraAssignItems` | Entries appended to each people's thread's "Assign…" submenu. |
| `renderRootDetails` | Content under each people's root comment, e.g. an agent run's progress. |
| `config.assignees` | With `callbacks.onCreate`, every finding gains **Assign…**. Picking someone posts the finding as a thread on its text (`s:` in code, a quote in markdown), with `CommentCreateInput.assignee` set. |

### Anchoring and targets

`comments(file)` also decides how a comment finds its place in the file:

```tsx
comments={(file) => ({
  items: threadsFor(file),
  callbacks: { onCreate, onReply },
  anchoring: "patch",
  targets: { element: true, document: true, screenshot: true },
})}
```

| Field | Default | Behavior |
| --- | --- | --- |
| `anchoring` | `"quote"` | How a text selection is anchored. `"quote"` keeps the selected words: `q:` in a Markdown Preview, `s:` in Source. `"patch"` keeps the selected **source lines** with three lines of context either side, like a git hunk: `r:` + the JSON of a `PatchAnchor` `{ version, startLine, endLine, before, lines, after }`. |
| `targets.element` | off | Adds **Comment on element** to the header's Comment menu (Markdown files). Pick an element in Preview; the thread is anchored on its locators: `e:` + the JSON of a `CommentLocator[]`. It shows as a box on that element in Preview. |
| `targets.document` | off | Adds **Comment on file**: a thread on the whole file, anchored on `DOCUMENT_ANCHOR` (a comment with no anchor counts too). |
| `targets.screenshot` | off | Adds a **Post with screenshot** variant to the composer, where the browser can capture a tab. The capture of the anchored region (the picked element, the covered blocks in Preview, else the pane) arrives as `CommentCreateInput.screenshot`, a `CommentScreenshotCapture`: `{ status: "captured", dataUrl }` or `{ status: "unavailable", reason: "unsupported" \| "cancelled" \| "failed" }`. The variant's id, `screenshot`, is reserved and never reaches `onCreate`; a host `createActions` entry with that id throws. |

**Patch anchors.** A selection in Preview covers the source lines of the rendered blocks it touches (a paragraph, a whole list or table: the blocks `Markdown` stamps with `data-source-start`/`data-source-end`); a selection in Source or in the editor covers its own lines. Threads show under the last line of their lines in Source, as a gutter marker in the editor, and as a highlight on the covering blocks in Preview.

An `r:` thread follows its lines as the text changes. The client matches exactly as the server does (`ResolvePatch` in gavel's `comments` package): the whole hunk (context included, whitespace-sensitive) must appear in the current text, at the recorded position first, otherwise at the one place it occurs. There is no fuzzy fallback:

| Match | When | Shown |
| --- | --- | --- |
| `matched` | The hunk appears at its recorded position, or exactly once elsewhere. | On its lines, labelled with the current ones. |
| `ambiguous` | It appears more than once, and not at the recorded position. | In the **File comments** list, "Ambiguous · Lines 5–7". |
| `outdated` | It no longer appears, or the anchor is malformed. | In the **File comments** list, "Outdated · Lines 5–7". |

An edit inside a thread's three context lines therefore outdates it; an edit anywhere farther away does not. Comments on the whole file, `e:` threads whose element is gone ("Element not found") and outdated or ambiguous `r:` threads are listed above the document in **File comments**, never hidden.

Hosts map anchors to and from their own selectors with pure functions exported from `@flanksource/clicky-ui/file-findings` (and `/comments`): `capturePatch(source, startLine, endLine)`, `patchAnchor(patch)`, `parsePatchAnchor(anchor)`, `isPatchAnchor(anchor)`, `matchPatch(source, patch)` (returns `{ state: "matched", startLine, endLine } \| { state: "ambiguous" } \| { state: "outdated" }`), `describePatch(patch)`, and `elementAnchor(locators)`, `parseElementAnchor(anchor)`, `isElementAnchor(anchor)`.

**Auto-assign is host policy.** In the playground, "Auto-run new comments" is a host setting, and its server's `onCreated` hook hands each new human root to an agent session. Do the same here: decide in `onCreate` (or server-side) whether a new thread gets an assignee, and put the toggle in `treeActions` or `fileToolbar`. `FileFindingsView` ships no auto-assign logic.

## Tabs

| Prop | Type | Behavior |
| --- | --- | --- |
| `fileTabs` | `(file: FileRef) => FileReviewTab[]` | Tabs after Preview, Source and Problems. `render({ path, source, findings, onSourceChange? })` fills the review pane; `onSourceChange` is set when the file is editable. |
| `folderTabs` | `(folder: FileRef) => FolderTab[]` | Tabs after a folder's Problems. `render({ folder, findings })` fills the pane. |

A tab is `{ id, label, icon?, count?, render }`. A host tab id that collides with `preview`, `source` or `problems` throws, and so does a `FileReview` `view` that names no tab.
