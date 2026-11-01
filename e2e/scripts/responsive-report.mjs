// Summarizes .tmp/responsive/<viewport>/<demo>.json written by e2e/tests/responsive.spec.ts.
// Usage: pnpm --filter e2e report:responsive [--targets]
import { readdirSync, readFileSync, statSync } from "node:fs";
import { join } from "node:path";

const root = new URL("../../.tmp/responsive", import.meta.url).pathname;
const showTargets = process.argv.includes("--targets");
const byDemo = new Map();

for (const viewport of readdirSync(root)) {
  const dir = join(root, viewport);
  if (!statSync(dir).isDirectory()) continue;
  for (const file of readdirSync(dir).filter((f) => f.endsWith(".json"))) {
    const f = JSON.parse(readFileSync(join(dir, file), "utf8"));
    const demo = file.replace(/\.json$/, "");
    const failing = f.pageOverflowPx > 1 || f.escaping.length > 0 || f.scrollingLayout.length > 0;
    if (!failing && !(showTargets && f.smallTargets.length)) continue;
    const entry = byDemo.get(demo) ?? [];
    entry.push({ viewport, ...f });
    byDemo.set(demo, entry);
  }
}

for (const [demo, rows] of [...byDemo].sort()) {
  console.log(`\n## ${demo}`);
  for (const r of rows) {
    console.log(`  @${r.viewport} pageOverflow=${r.pageOverflowPx}`);
    for (const e of r.escaping.slice(0, 4)) console.log(`    escape: ${e}`);
    for (const s of r.scrollingLayout.slice(0, 3)) console.log(`    scroll: ${s}`);
    if (showTargets) console.log(`    smallTargets: ${r.smallTargets.length} e.g. ${r.smallTargets.slice(0, 2).join(" | ")}`);
  }
}
