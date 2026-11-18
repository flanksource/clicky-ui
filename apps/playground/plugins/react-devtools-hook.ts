import { readFileSync } from "node:fs";
import { createRequire } from "node:module";
import { dirname, resolve } from "node:path";
import type { Plugin } from "vite";

/** bippy's classic-script installer for the React DevTools global hook (it patches a hook that already exists, so callers decide whether to run it). */
export function reactDevtoolsHookScript(root: string): string {
  const bippy = dirname(createRequire(resolve(root, "package.json")).resolve("bippy/package.json"));
  return readFileSync(resolve(bippy, "dist/install-hook-only.iife.js"), "utf8");
}

/**
 * Installs the React DevTools hook with a classic `<head>` script. It runs before every module script,
 * so react-dom registers its renderer however the shell is bundled; an `import` at the top of main.tsx
 * loses that race in the compiled shell, where react-dom is a shared chunk evaluated first.
 */
// WORKAROUND(live-visual-edit-preview): register react-dom with a DevTools hook before it loads so overrideProps is reachable without Fast Refresh.
// Correct fix: enable Fast Refresh/HMR for page modules so written source re-renders itself.
// Ref: discussed with user 2026-11-04
export function playgroundReactDevtoolsHook({ root }: { root: string }): Plugin {
  const script = reactDevtoolsHookScript(root);
  return {
    name: "playground-react-devtools-hook",
    transformIndexHtml: () => [{ tag: "script", children: script, injectTo: "head-prepend" }],
  };
}
