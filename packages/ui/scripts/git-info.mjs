import { execSync } from "node:child_process";

function git(args, fallback) {
  try {
    return execSync(`git ${args}`, { encoding: "utf8", stdio: ["ignore", "pipe", "ignore"] }).trim();
  } catch {
    return fallback;
  }
}

/**
 * Capture git/build metadata at the moment the library is built.
 * Returns plain JSON-serialisable values suitable for Vite `define`.
 */
export function gitInfo() {
  const commit = git("rev-parse --short HEAD", "");
  const tag = git("describe --tags --abbrev=0", "");
  const dirty = git("status --porcelain", "").length > 0;
  return {
    commit,
    tag,
    dirty,
    date: new Date().toISOString(),
  };
}
