---
codeBlocks: [bash]
---

# Vitest pool benchmark for packages/ui

Measures wall time and peak memory of the packages/ui unit suite under each Vitest pool, so the default pool is chosen from numbers. Run it one variant at a time, or the variants share the machine and skew each other:

```sh
gavel fixtures --benchmark --profile --max-concurrent 1 fixtures/benchmarks/vitest-pools.md
```

`--profile` sums RSS over each command's whole process tree, so forks workers are counted. Every variant writes Vitest's JSON report to `.tmp/vitest-pools/<variant>.json`, and prints the failed-file count, so a variant that cannot run the whole suite still reports its cost.

### command: configured

The pools `packages/ui/vite.config.ts` sets per project.

```yaml
timeout: 15m
```

```bash
cd "$(git rev-parse --show-toplevel)/packages/ui"
mkdir -p ../../.tmp/vitest-pools
pnpm exec vitest run --reporter=dot --reporter=json --outputFile.json=../../.tmp/vitest-pools/configured.json || true
node -e 'const r=require("../../.tmp/vitest-pools/configured.json");console.log("failed files:",r.numFailedTestSuites,"failed tests:",r.numFailedTests,"total tests:",r.numTotalTests)'
```

### command: forks

```yaml
timeout: 15m
```

```bash
cd "$(git rev-parse --show-toplevel)/packages/ui"
mkdir -p ../../.tmp/vitest-pools
pnpm exec vitest run --pool=forks --reporter=dot --reporter=json --outputFile.json=../../.tmp/vitest-pools/forks.json || true
node -e 'const r=require("../../.tmp/vitest-pools/forks.json");console.log("failed files:",r.numFailedTestSuites,"failed tests:",r.numFailedTests,"total tests:",r.numTotalTests)'
```

### command: forks 2 workers

Two workers, as on a 2-vCPU GitHub runner.

```yaml
timeout: 15m
```

```bash
cd "$(git rev-parse --show-toplevel)/packages/ui"
mkdir -p ../../.tmp/vitest-pools
pnpm exec vitest run --pool=forks --maxWorkers=2 --reporter=dot --reporter=json --outputFile.json=../../.tmp/vitest-pools/forks-2.json || true
node -e 'const r=require("../../.tmp/vitest-pools/forks-2.json");console.log("failed files:",r.numFailedTestSuites,"failed tests:",r.numFailedTests,"total tests:",r.numTotalTests)'
```

### command: threads

```yaml
timeout: 15m
```

```bash
cd "$(git rev-parse --show-toplevel)/packages/ui"
mkdir -p ../../.tmp/vitest-pools
pnpm exec vitest run --pool=threads --reporter=dot --reporter=json --outputFile.json=../../.tmp/vitest-pools/threads.json || true
node -e 'const r=require("../../.tmp/vitest-pools/threads.json");console.log("failed files:",r.numFailedTestSuites,"failed tests:",r.numFailedTests,"total tests:",r.numTotalTests)'
```

### command: vmThreads

```yaml
timeout: 15m
```

```bash
cd "$(git rev-parse --show-toplevel)/packages/ui"
mkdir -p ../../.tmp/vitest-pools
pnpm exec vitest run --pool=vmThreads --reporter=dot --reporter=json --outputFile.json=../../.tmp/vitest-pools/vmthreads.json || true
node -e 'const r=require("../../.tmp/vitest-pools/vmthreads.json");console.log("failed files:",r.numFailedTestSuites,"failed tests:",r.numFailedTests,"total tests:",r.numTotalTests)'
```

### command: vmThreads 1GB limit

A vm worker keeps every test file's context until it reaches `vmMemoryLimit` and is recycled.

```yaml
timeout: 15m
```

```bash
cd "$(git rev-parse --show-toplevel)/packages/ui"
mkdir -p ../../.tmp/vitest-pools
pnpm exec vitest run --pool=vmThreads --vmMemoryLimit=1GB --reporter=dot --reporter=json --outputFile.json=../../.tmp/vitest-pools/vmthreads-1gb.json || true
node -e 'const r=require("../../.tmp/vitest-pools/vmthreads-1gb.json");console.log("failed files:",r.numFailedTestSuites,"failed tests:",r.numFailedTests,"total tests:",r.numTotalTests)'
```

### command: vmThreads 2 workers

```yaml
timeout: 15m
```

```bash
cd "$(git rev-parse --show-toplevel)/packages/ui"
mkdir -p ../../.tmp/vitest-pools
pnpm exec vitest run --pool=vmThreads --maxWorkers=2 --reporter=dot --reporter=json --outputFile.json=../../.tmp/vitest-pools/vmthreads-2.json || true
node -e 'const r=require("../../.tmp/vitest-pools/vmthreads-2.json");console.log("failed files:",r.numFailedTestSuites,"failed tests:",r.numFailedTests,"total tests:",r.numTotalTests)'
```

### command: vmThreads 2 workers 1GB limit

```yaml
timeout: 15m
```

```bash
cd "$(git rev-parse --show-toplevel)/packages/ui"
mkdir -p ../../.tmp/vitest-pools
pnpm exec vitest run --pool=vmThreads --maxWorkers=2 --vmMemoryLimit=1GB --reporter=dot --reporter=json --outputFile.json=../../.tmp/vitest-pools/vmthreads-2-1gb.json || true
node -e 'const r=require("../../.tmp/vitest-pools/vmthreads-2-1gb.json");console.log("failed files:",r.numFailedTestSuites,"failed tests:",r.numFailedTests,"total tests:",r.numTotalTests)'
```

### command: CI test job

What the CI `test` job runs: all four vitest packages, including the storybook browser tests on system Chrome.

```yaml
timeout: 20m
```

```bash
cd "$(git rev-parse --show-toplevel)"
mkdir -p .tmp/vitest-pools
gavel test --framework vitest --concurrency 1 --test-timeout 10m --timeout 15m --format json > .tmp/vitest-pools/ci.json || true
```
