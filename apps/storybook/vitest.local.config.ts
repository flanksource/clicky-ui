import { mergeConfig } from "vitest/config";
import base from "./vitest.config";

// Local-only: node_modules is symlinked outside the worktree, so Vite must be allowed to serve it.
export default mergeConfig(base, {
  server: { fs: { strict: false } },
});
