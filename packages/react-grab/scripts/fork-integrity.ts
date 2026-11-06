import { createHash } from "node:crypto";

export interface ForkFiles {
  upstream: ReadonlyMap<string, string>;
  local: ReadonlyMap<string, string>;
  changes: ReadonlyMap<string, string>;
}

export function verifyForkFiles({ upstream, local, changes }: ForkFiles): number {
  if (!upstream.has("LICENSE") || local.get("LICENSE") !== upstream.get("LICENSE")) {
    throw new Error("LICENSE must match upstream verbatim");
  }
  for (const path of upstream.keys()) {
    if (!local.has(path)) throw new Error(`Missing upstream file: ${path}`);
  }
  for (const [path, source] of local) {
    if (source === upstream.get(path)) continue;
    const digest = createHash("sha256").update(source).digest("hex");
    if (changes.get(path) !== digest) {
      throw new Error(`Undocumented or changed file: ${path}; record the change, reason and SHA256 in FORK.md`);
    }
  }
  return local.size;
}

