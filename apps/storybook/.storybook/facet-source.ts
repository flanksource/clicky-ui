import { existsSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { loadEnv } from "vite";

// WORKAROUND(unreleased-facet): the facet diagram stories need
// DiagramStyleProvider/density/placement, which @flanksource/facet 0.1.74 lacks.
// Set STORYBOOK_FACET_SRC=/abs/facet/src/components in the gitignored
// apps/storybook/.env.local to serve a local facet checkout; without it the
// published package is used.
// Correct fix: release facet with the style API, bump the catalog, delete this file.
// Ref: discussed with user 2026-11-03
const appRoot = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const configured = loadEnv("development", appRoot, "STORYBOOK_FACET_").STORYBOOK_FACET_SRC;
if (configured !== undefined && !existsSync(resolve(configured, "index.tsx"))) {
  throw new Error(`STORYBOOK_FACET_SRC: "${configured}" has no index.tsx`);
}

/** Absolute path of the local facet `src/components`, when one is configured. */
export const facetSrc: string | undefined = configured;
