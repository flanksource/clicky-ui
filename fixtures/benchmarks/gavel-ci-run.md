---
codeBlocks: [bash]
---

# CI test job benchmark

Runs the CI `test` job's gavel invocation as the gavel action does, with the JSON and HTML reports, so the peak memory of the whole job and of gavel's own process (results collection and report writing) can be read from the profile. `GAVEL_BIN` picks the gavel under test, default `gavel`:

```text
GAVEL_BIN=.tmp/gavel-v0.0.59/gavel gavel fixtures --benchmark --profile --max-concurrent 1 fixtures/benchmarks/gavel-ci-run.md
```

### command: gavel action test run

```yaml
timeout: 25m
```

```bash
cd "$(git rev-parse --show-toplevel)"
mkdir -p .tmp/gavel-ci-run
bin="$GAVEL_BIN"
if [ -z "$bin" ]; then bin=gavel; fi
"$bin" test --framework vitest --concurrency 1 --test-timeout 10m --timeout 15m --show-passed --no-progress --no-color --format json=.tmp/gavel-ci-run/gavel-results.json,html=.tmp/gavel-ci-run/gavel-results.html 2> .tmp/gavel-ci-run/gavel.log || true
ls -la .tmp/gavel-ci-run
```
