---
cwd: $GIT_ROOT_DIR
---

# Playground comments port checks

| Name | Command | Exit Code |
|---|---|---|
| Comments PostgreSQL contract | gavel test --work-dir ../gavel ./comments/postgres --framework ginkgo --concurrency 1 -- -p=1 -run '^TestPostgres$' | 0 |
| Playground persistence and API | gavel test --work-dir ./apps/playground --framework vitest --recursive=false --concurrency 1 -- plugins/comments-store.test.ts plugins/comments-server.test.ts plugins/vocabularies.test.ts plugins/page-management-store.test.ts plugins/reviewable-store.test.ts plugins/repository-folder.test.ts plugins/agent-runs-server.test.ts --maxWorkers=1 --no-file-parallelism | 0 |
| Prompt findings persistence | gavel test --work-dir ./apps/playground --framework vitest --recursive=false --concurrency 1 -- plugins/prompt-runs-server.test.ts --testNamePattern 'runs the prompt one-shot' --maxWorkers=1 --no-file-parallelism | 0 |
| Prompt recovery persistence | gavel test --work-dir ./apps/playground --framework vitest --recursive=false --concurrency 1 -- plugins/prompt-runs-server.test.ts --testNamePattern 'recovers a durably queued association' --maxWorkers=1 --no-file-parallelism | 0 |
| Prompt agent hand-off | gavel test --work-dir ./apps/playground --framework vitest --recursive=false --concurrency 1 -- plugins/prompt-runs-server.test.ts --testNamePattern 'hands the result to the agent session' --maxWorkers=1 --no-file-parallelism | 0 |
| Playground lint | pnpm --filter playground lint | 0 |
| Playground build | pnpm --filter playground build | 0 |

Set `COMMONS_DB_URL` to an isolated local test pool before running this fixture. Every row runs serially. The complete lint/build gates remain required even when unrelated working-tree failures prevent them passing.
