import { createHash } from "node:crypto";
import { readFileSync, readdirSync, writeFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const read = (path: string) => readFileSync(resolve(root, path), "utf8");
const descriptions = new Map<string, [string, string]>([
  [".gitignore", ["Exclude build, dependency and test-runner artifacts", "Keep generated files out of the fork inventory"]],
  ["tsconfig.json", ["Retain upstream compiler options; include fork build/check tools instead of removed vite/e2e configs", "Type-check only shipped source and supported tooling"]],
  ["tsdown.config.ts", ["Port vite.config.ts module pack to tsdown; ESM only; bundle Solid, externalize bippy; emit into Clicky UI's dist/react-grab; version from UPSTREAM; production defines and optional source locations/maps", "Ship the picker as Clicky UI subpaths without a package manifest; preserve upstream Solid/CSS transforms without CLI, IIFE, demo or coverage builds"]],
  ["scripts/build.ts", ["Clear dist/react-grab, build Tailwind CSS, convert rem to px, then run tsdown; copy CSS, license, notice, fork log, UPSTREAM and the Solid MIT license into dist/react-grab", "CSS must exist before the upstream CSS-text plugin embeds it; tsdown does not remove stale chunks"]],
  ["scripts/css-rem-to-px.ts", ["Resolve the generated CSS from the script's location instead of the working directory", "The Clicky UI build runs from packages/ui"]],
  ["vitest.config.ts", ["Named node unit-test project rooted at the fork, with Solid browser resolution", "Run as a Clicky UI vitest project; upstream browser-free tests need the client reactive runtime their cleanup tests exercise"]],
  ["scripts/fork-check.ts", ["Read pinned UPSTREAM; clone or reuse upstream under the repository .tmp; verify attribution, verbatim license, file inventory and documented hashes", "Detect undocumented source drift and missing imports"]],
  ["scripts/fork-integrity.ts", ["Compare imported and local content against documented SHA256 changes", "Test provenance verification without network or git mocks"]],
  ["tests/fork-integrity.test.ts", ["Add provenance regression cases", "Reject missing, undocumented and stale changes and all license modifications"]],
  ["src/core/index.tsx", ["Dispatch toolbar Style through the registered action instead of bypassing plugins; export the built-in commentPlugin and the data-grab context helpers; pass plugin toolbarButtons to the renderer", "Host SVG and Facet editors must receive toolbar and context-menu selections consistently; hosts driving a page's own instance must restore its comment plugin without importing the self-initialising main entry"]],
  ["src/types.ts", ["Add ToolbarButton and a toolbarButtons field on Plugin, PluginConfig and the renderer props", "Let plugins add standalone icon buttons to the toolbar, not only context-menu actions"]],
  ["src/index.ts", ["Export the ToolbarButton type and the data-grab context helpers", "Hosts type the toolbar buttons they register and can read page-supplied context"]],
  ["src/core/context.ts", ["Append page and element data-grab attributes to stack, clipboard and reference context", "Carry context a page supplies through every captured element description"]],
  ["src/utils/injected-context.ts", ["Read data-grab-* attributes from html, body and the selected element's ancestors (crossing open shadow roots) and format them as Markdown", "Let pages attach literal context without mixing in siblings or executing values"]],
  ["tests/injected-context.test.ts", ["Cover data-grab page and ancestor capture, literal formatting, shadow roots and capture-time values", "Guard the page-supplied context contract"]],
  ["src/core/plugin-registry.ts", ["Aggregate and validate plugin toolbarButtons in the registry store (non-empty id/label, SVG icon, unique ids)", "Buttons are removed with their plugin on unregister or dispose, and a bad registration fails loudly"]],
  ["src/components/renderer.tsx", ["Pass the registry's toolbarButtons to the Toolbar", "Render plugin-provided toolbar buttons"]],
  ["src/components/toolbar/index.tsx", ["Render plugin toolbarButtons after the built-in Style button with the same button, tooltip and pressed styling", "Generic, keyboard-accessible plugin buttons with the label as tooltip and accessible name"]],
  ["tests/toolbar-buttons.test.ts", ["Cover plugin toolbar button collection, removal, replacement and validation", "Guard the toolbar button registry contract"]],
  ["src/core/run-element-action.ts", ["Resolve and execute a registered element action for both toolbar dispatch paths", "Honor the host Style action while preserving the default CSS editor"]],
  ["tests/run-element-action.test.ts", ["Exercise default and host Style dispatch plus missing and disabled actions", "Prevent toolbar dispatch from bypassing the host editor"]],
  ["src/components/overlay-canvas.tsx", ["Size the overlay canvas from the scrolling element via getLayoutViewportSize instead of documentElement", "In quirks-mode (doctype-less) pages documentElement.clientHeight is the whole document height; the fixed canvas exceeded Chrome's canvas limit and painted the page blank"]],
  ["src/utils/get-layout-viewport-size.ts", ["Read the layout viewport from document.scrollingElement, falling back to documentElement", "Correct viewport size in both standards and quirks mode"]],
  ["tests/get-layout-viewport-size.test.ts", ["Cover layout viewport sizing in quirks and standards mode", "Guard against a document-sized overlay canvas on doctype-less pages"]],
  ["UPSTREAM", ["Record repository, release tag and full commit", "Machine-readable provenance"]],
  ["NOTICE.md", ["Add upstream and bundled dependency attribution", "Preserve license and fork provenance in published package"]],
  ["hack/import-upstream.ts", ["Import selected upstream git objects and add attribution; port test imports to vitest", "Auditable initial import that refuses to overwrite edited files"]],
  ["hack/record-fork.ts", ["Generate explicit per-file change descriptions and SHA256 manifest", "Review changes before manually recording updated content; never invoked by verification"]],
  ["hack/smoke-build.ts", ["Import built ESM entry points from Clicky UI's dist/react-grab; inspect declarations, CSS, dependency boundaries (bippy external, Solid bundled, no React or Preact Signals) and shipped licenses", "Verify published artifacts with the native module loader after building"]],
]);

function paths(directory = ""): string[] {
  return readdirSync(resolve(root, directory), { withFileTypes: true }).flatMap((entry) => {
    if (["node_modules", "dist", ".gavel", ".vitest", ".tmp", ".DS_Store", "FORK.md", "LICENSE"].includes(entry.name)) return [];
    const path = directory ? `${directory}/${entry.name}` : entry.name;
    return entry.isDirectory() ? paths(path) : [path];
  });
}

const rows = paths().sort().map((path) => {
  const text = read(path);
  let description = descriptions.get(path);
  if (!description && path.startsWith("tests/")) description = ["Add provenance header; replace vite-plus/test with vitest", "Port upstream unit tests to installed test runner"];
  if (!description && text.split("\n")[0]?.includes("Derived from react-grab")) description = ["Add provenance header only; retain upstream content verbatim", "Identify upstream path and MIT copyright on each imported file"];
  if (!description) throw new Error(`Describe the local change before recording: ${path}`);
  return `| \`${path}\` | \`${createHash("sha256").update(text).digest("hex")}\` | ${description[0]} | ${description[1]} |`;
});
writeFileSync(resolve(root, "FORK.md"), [
  "# react-grab local changes", "",
  "Upstream: https://github.com/aidenybai/react-grab, tag `react-grab@0.1.50`, commit `332732ab11f8aed6e588424bac9a0b226aef0ded`. MIT, Copyright (c) 2025 Aiden Bai.", "",
  "`LICENSE` is unchanged, byte for byte. All 256 upstream source files are retained. The CLI (`bin/`, `@react-grab/cli`), e2e/performance harnesses (including `tests/perf-instrumentation.test.ts`), demo builds, Playwright coverage builds, and IIFE/CJS packs are excluded. The 26 browser-free upstream unit-test files are ported to Vitest. Upstream source headers are retained; intentional body changes are enumerated below.", "",
  "The fork lives in `packages/ui/react-grab` and ships in `@flanksource/clicky-ui` through the `react-grab`, `react-grab/core`, `react-grab/primitives` and `react-grab/styles.css` subpaths. It has no package manifest. The picker renders with Solid, as upstream does; Solid is bundled, including its browser renderer, with its MIT license copied into dist. Because the picker is not React, it never registers a renderer with the page's React DevTools hook. bippy is an external published dependency of Clicky UI (catalog-pinned to 0.6.1), whereas upstream alwaysBundle bundled both bippy and Solid.", "",
  "Run `pnpm --filter @flanksource/clicky-ui build:react-grab`, `check:react-grab` and `check:react-grab-fork`. Focused tests run through `gavel test --framework vitest -- --config react-grab/vitest.config.ts` from `packages/ui`. After building, `pnpm --filter @flanksource/clicky-ui exec tsx react-grab/hack/smoke-build.ts` verifies native ESM imports and the shipped artifacts. The retained upstream README describes upstream usage.", "",
  "Every changed or added file is listed below. SHA256 pins the documented local content, so further edits to an already listed file still fail the fork check. After reviewing an intentional local change, update its description in `hack/record-fork.ts` and run `pnpm --filter @flanksource/clicky-ui exec tsx react-grab/hack/record-fork.ts`; review the generated diff. This command is never run automatically by the build or checker. FORK.md itself is this local change log.", "",
  "| File | SHA256 | Change | Reason |", "| --- | --- | --- | --- |", ...rows, "",
].join("\n"));
