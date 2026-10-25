---
codeBlocks: [bash]
---

# Storybook browser test benchmark

Measures wall time and peak memory of the Storybook story tests, which run every story in system Chrome through the Vitest Playwright provider. Peak RSS covers vitest, Playwright and every Chrome process:

```sh
gavel fixtures --benchmark --profile --max-concurrent 1 fixtures/benchmarks/storybook-tests.md
```

### command: default workers

```yaml
timeout: 20m
```

```bash
cd "$(git rev-parse --show-toplevel)/apps/storybook"
mkdir -p ../../.tmp/vitest-pools
pnpm --filter @flanksource/clicky-ui build:icons >/dev/null
pnpm --filter @flanksource/clicky-ui build:storybook-schemas >/dev/null
pnpm exec vitest run --reporter=dot --reporter=json --outputFile.json=../../.tmp/vitest-pools/storybook.json || true
node -e 'const r=require("../../.tmp/vitest-pools/storybook.json");console.log("failed files:",r.numFailedTestSuites,"failed tests:",r.numFailedTests,"total tests:",r.numTotalTests)'
```

### command: 2 workers

Two workers, as on a GitHub runner.

```yaml
timeout: 20m
```

```bash
cd "$(git rev-parse --show-toplevel)/apps/storybook"
mkdir -p ../../.tmp/vitest-pools
pnpm exec vitest run --maxWorkers=2 --reporter=dot --reporter=json --outputFile.json=../../.tmp/vitest-pools/storybook-2.json || true
node -e 'const r=require("../../.tmp/vitest-pools/storybook-2.json");console.log("failed files:",r.numFailedTestSuites,"failed tests:",r.numFailedTests,"total tests:",r.numTotalTests)'
```
