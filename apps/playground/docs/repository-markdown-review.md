# Reviewing repository Markdown

Run `pnpm run playground:prod` for the compiled playground on port 5275, or `pnpm run dev:playground` for development on port 5274. Choose **Add repository** in the sidebar, browse the enabled directories, select a Git working-tree root, and add it. Expand folders to load their immediate Markdown children. Files stay in their original repositories; no copy into `src/pages` is required. Git worktrees and repositories without commits are supported.

The launch server enables the playground checkout by default. To enable other local parent directories, add a comma-separated `PLAYGROUND_LOCAL_ROOTS=/absolute/parent,/another/parent` to the playground's `.env.local`, then restart it. The picker cannot grant new filesystem access. Symlink targets must also be inside an enabled root.

For an independently managed Gavel server, run this from its storage checkout:

```bash
gavel launch serve --root . --local-root /absolute/parent --file-watch-idle-timeout 30s
```

Set `PLAYGROUND_GAVEL_URL=http://127.0.0.1:9330` in `.env.local` to use it. This feature requires the Gavel workspace API described by `GET /api/launch/openapi`, and the corresponding commons-db Git APIs. Build the sibling changes with `make build`; published installations need a commons-db release and a Gavel dependency update before this feature can run without the local Go workspace.

For local sibling development, run `make build` in the Gavel checkout and use its `.bin/gavel` executable in the server command above. This uses the newly built API without replacing a separately installed Gavel binary.

## Navigation and visibility

Repository and folder entries are persisted in `.playground/repositories.json`. A folder's context menu can refresh it, open a Markdown path explicitly, or save it as another sidebar root with ordered Git-style ignore overrides. Preview matching immediate children before saving overrides. Explicit paths and deep links can open ignored documents.

Click a repository or folder label to list recorded problems from every Markdown descendant, including collapsed subfolders. The expand arrow independently opens its immediate children. The folder Problems view supports table and tree layouts, URL-persisted filters and selection, opening a finding in its document, and the same ignore actions as document review. **AI review…** configures a prompt for the folder; **Run lint…** confirms linters and previews the exact visible descendant files before starting. Conventional folder runs preserve their file scope and replace older per-file lint results, including files that are now clean.

Expanding a folder requests only its immediate children. Reopening it, navigating, focusing the window, saving a document or pressing Refresh invalidates open listings. Expand All operates on loaded nodes. Sidebar folders do not acquire watches and are never polled. Recursive file discovery happens only when preparing an execution; opening the folder Problems view reads recorded results.

## Reviewing a document

Preview renders sanitized Markdown; MDX is displayed without executing its JavaScript. Relative Markdown links open another document in review, and local images use the confined asset API. Source edits the original file. Save uses its loaded content revision; a conflicting save returns HTTP 409 and preserves the draft. Reload disk discards the draft in favor of the latest observed disk contents. Navigation and browser-close guards protect unsaved edits. Problems has URL-persisted severity and rule filters.

Opening a visible document acquires an independent watch lease. The default idle timeout is 30 seconds. Trusted keyboard, pointer, wheel and touch activity renews it; file events and SSE keepalives do not. Navigation, close and hidden tabs release it, and abandoned clients expire. A containing-directory watcher catches atomic saves but filters events to the selected filename and exists only while leases need it. Multiple viewers share physical watches. After expiry the status reads “Live updates paused”; interacting reacquires and reconciles disk state. Clean buffers update automatically. Dirty buffers retain edits and show a conflict.

Comments and deep links use `document:<repository UUID>/<relative path>`, independent of leases and executions. Captures, copied feedback and agent requests name the actual file. Missing files retain comment history. Blame is loaded separately, so untracked files and unborn repositories remain reviewable.

Choose **Run lint…** to confirm which linters to run before starting a new execution. The dialog lists Gavel's built-in linters and commands configured for the file's directory, with Markdownlint and Vale selected initially. Reopening a document recovers its existing execution without starting another run. Findings retain the execution and source revision, and older findings are marked stale while editing. Missing lint executables are reported by name. A finding's action menu can ignore its occurrence, its rule everywhere, or its linter in that file. These actions save `lint.ignore` in the repository's `.gavel.yaml` through Gavel; findings and sidebar counts honor those rules after reload without rewriting execution history.

**Run lint…** also includes a **Prompt linter** picker. Select a saved prompt and choose **Configure prompt…** to set its arguments and runtime before launching it. AI review is explicit. Discovery and execution use the nearest ancestor containing `.captain/prompts`, bounded by the registered repository root; without a local prompt project they use the document's containing directory. File arguments and Browse paths are relative to the prepared project directory. Each form owns its preparation, and changing the file requires reloading that form. Automatic feedback sessions are repository-scoped; explicit Captain targets remain authoritative.

Choose **Run prompt linter…** from a repository or folder's context menu to review its visible Markdown descendants. The prompt dialog previews the exact file list relative to the prepared prompt project, using the nearest saved sidebar folder's ignore overrides. No files are scanned until this action is requested. File additions, removals, edits or ignore-rule changes after preparation require reloading the prompt form. Discovery and execution use the selected folder's nearest ancestor prompt project, or the selected folder when no project is present; each finding becomes a comment on its document and appears in that document's Problems view.

Amber badges show lint problem counts beside repository files and folders. Folder badges include all descendant results, even when collapsed or not yet expanded. Counts combine plain lint with the latest completed review per prompt and file, survive reloads, and refresh when lint finishes, the window regains focus, or Refresh is pressed. A clean rerun replaces that prompt's previous findings; running or failed reviews without results retain previous findings. Comment history is retained independently of the current problem counts.

## API boundaries

| API | Owner | Purpose |
| --- | --- | --- |
| `/api/workspace/directories`, `/repository`, `/entries` | Gavel | Authorized immediate listings and Git visibility |
| `/api/workspace/file`, `/asset`, `/blame` | Gavel | Source revisions, checked saves, confined images and provenance |
| `/api/workspace/watch`, `/watch/{id}`, `/watch/{id}/stream` | Gavel | Acquire, renew, release and stream expiring viewer leases |
| `/api/launch/lint`, `/api/runs/{id}` and its stream/stop routes | Gavel | Persisted, idempotent lint and prompt executions |
| `/api/launch/linters`, `/api/launch/lint/ignore`, `/api/launch/lint/filter` | Gavel | Prepared linter catalog, persisted ignores and filtered findings |
| `/__playground/documents/*` | Playground | Persistent repository/sidebar identities and preferences |
| `/__playground/documents/scope?id=folder:…` | Playground | Exact visible Markdown descendants and their content revision for lint confirmation |
| `/__playground/document-problems` | Playground | Latest plain and prompt lint results keyed by document identity |
| `/__playground/gavel/*` | Playground | Same-origin streaming proxy to the authorized Gavel server |

The approved plan and executable verification fixture are in `docs/plans/repository-markdown-review.md` and `docs/plans/repository-markdown-review.verification.md`, tracked by Gavel TODO `a02701ce`.
