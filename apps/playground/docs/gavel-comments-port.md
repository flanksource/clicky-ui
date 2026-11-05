# Gavel comments playground port

Port the playground comments surface to Gavel's PostgreSQL comments service while preserving its existing UI and agent API. Existing JSON comments and screenshots remain untouched; data import and xero-cli refactoring are excluded.

The local Gavel launch host supplies workspace scope, local tenant/actor identity, authorization and attachment storage. The Vite adapter projects roots/messages into playground threads and preserves DOM/Markdown locators, captures, ratings, vocabulary definitions, review decisions, prompt provenance and agent hand-off metadata. Gavel owns lifecycle transitions, final human outcomes, versions, events and atomic batches.

Page moves retarget comments within the workspace. Page/folder and reviewable deletion hide the associated aggregates in an atomic batch after reversible source changes; a rejected batch leaves storage unchanged and restores source files. Root deletion retains audit history and makes attachments unavailable to normal reads. Reply edits preserve producing identity, timestamps and structured metadata.

Backend tests run against an isolated commons-db database through the reusable Gavel `comments/testhost`; fixture identity setup is separate from application routes. Tests execute serially with one Vitest worker and one Go package process. Visible interaction is checked in Chrome at 1920x1080 and 2560x1440.

Acceptance:

- New roots, replies, ratings and lifecycle actions use Gavel storage through the existing playground API.
- Screenshot bytes use Gavel attachments; comment writes create no JSON or screenshot files.
- Prompt results and agent hand-offs retain their producing model/session/provenance.
- Page moves and source reviews preserve feedback and roll back source changes on rejected storage operations.
- Stale batches fail atomically; closed outcomes remain separate from Captain chat state.
- Existing data is untouched and xero-cli is unchanged.
- Repository build/lint failures remain visible and are recorded separately from focused validation.

## Implementation status

Implemented in the working tree. Tracked by Gavel TODO `8a857df2-bac3-4a29-89f3-667a39351452`; the canonical [definition of done](gavel-comments-port-checks.md) reports **UNVERIFIED: 5/7 checks passed** on 2026-11-05. No port changes have been committed.

| Verification | Result |
| --- | --- |
| Playground persistence/API, page/folder operations, review decisions and agent hand-off | 118 tests passed, one worker, no file parallelism |
| Prompt findings, queued recovery and agent hand-off | Three focused checks passed |
| Gavel PostgreSQL contract | Nine specs passed; includes stale-batch rollback, reply ownership and attachment visibility |
| Gavel comments core with race detector | 16 specs passed |
| Clicky response schemas | Focused opaque JSON Ginkgo spec and seven existing response-schema tests passed; ordinary byte slices retain their base64 schema |
| Focused source lint | Passed for the port's playground files, Gavel comments/launch/CLI/test host and Clicky RPC |
| Repository `make build` | Passed |
| Gavel `make build` | Exited successfully; its UI declaration step also reported an existing missing `violationIgnoreActions` export |
| Full playground lint | Failed on existing unsafe optional chaining in `src/review/export.test.ts:96` |
| Full playground build | Failed on existing navigation/demo and linked-document type errors; no port plugin diagnostics |

Chrome verification at 1920×1080 and 2560×1440 covered root creation, replies, reload persistence, resolve, human close and reopen. The PNG attachment API round trip passed, including deletion visibility. Repository navigation errors remained visible independently of comments. The temporary smoke thread was removed, the isolated diagnostic test host stopped, and the original auto-run preference restored.

The local playground uses the rebuilt Gavel launch service at `127.0.0.1:9331`, configured only in the ignored local environment file. New comments tables were explicitly provisioned; existing JSON files were neither read nor imported. Published dependency compatibility remains a separate release/pin check; no local dependency override was added.
