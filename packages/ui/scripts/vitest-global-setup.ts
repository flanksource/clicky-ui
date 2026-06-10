/**
 * Vitest global setup: ensure the generated `src/icons/` tree exists before any
 * test runs.
 *
 * `src/icons/` is gitignored and produced by `scripts/build-icons.ts`. The
 * package's own `test` script chains `build:icons` first, but tools that invoke
 * `vitest` directly (e.g. gavel's auto-discovered runner, or an IDE) skip that
 * step, leaving `src/icons.ts`'s `export * from "./icons/index"` unresolvable.
 * Wiring the generate into vitest itself makes the suite self-sufficient however
 * it is launched. `buildIcons` self-guards on an existence check, so when the
 * icons are already present this returns immediately — a no-op for local/IDE
 * runs where codegen has already happened. Importing the generator in-process
 * (rather than spawning `pnpm`/`tsx`) keeps it independent of what is on PATH.
 */
import { buildIcons } from "./build-icons";

export default async function setup(): Promise<void> {
  await buildIcons();
}
