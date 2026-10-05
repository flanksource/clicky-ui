---
cwd: ..
timeout: 15m
---

# UI test cost and export coverage

The assertion mapping, timing commands, prototype inventory, and separate failure diagnoses are recorded in `.tmp/test-cost/report.md`. Timing runs are sequential and are not interpreted as sums of concurrent test durations.

| Name | Command | Exit Code |
| --- | --- | --- |
| Public consumer typecheck | pnpm --filter @flanksource/clicky-ui run check:public-exports | 0 |
| Export removal regression | pnpm --filter @flanksource/clicky-ui exec node scripts/check-public-export-removal.mjs | 0 |
| Retained UI behavior | gavel test vitest --cwd packages/ui --skip-hooks --pre-build=false --concurrency 1 --no-progress --no-color -- src/data/test-runner/TestRunner.test.tsx src/components/picker-stories.test.tsx src/data/ai/ChatWindowManager.test.tsx src/rpc/OperationCommandPage.test.tsx src/components/json-schema-form.schema.test.ts src/data/ai/examples/sessions/complete.test.ts --maxWorkers=1 --no-file-parallelism | 0 |
| Retained prototype contracts | gavel test vitest --cwd apps/playground --skip-hooks --pre-build=false --concurrency 1 --no-progress --no-color -- src/pages/flanksource/merivio/_approval-evidence/scoped.test.tsx src/pages/flanksource/merivio/_approval-evidence/lenses.test.ts src/pages/_run-controls/model.test.ts --maxWorkers=1 --no-file-parallelism | 0 |
| Patch hygiene | git diff --check | 0 |
