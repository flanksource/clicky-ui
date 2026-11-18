import { useEffect, useState } from "react";

import type { FileBlame } from "../../plugins/blame-server";

/** Same route as the playground-blame middleware; a value import from the plugin would pull node modules into the page. */
export const BLAME_ROUTE = "/__playground/blame";

export type { FileBlame };

/** `git blame` of a workspace file (repository-relative); rejects with git's own error text. */
export async function fetchBlame(path: string): Promise<FileBlame> {
  const response = await fetch(`${BLAME_ROUTE}?${new URLSearchParams({ path })}`);
  if (!(response.headers.get("content-type") ?? "").includes("application/json")) {
    throw new Error("Blame requires a live playground server. Start `pnpm run playground:prod` or `pnpm run dev:playground`.");
  }
  const payload = (await response.json()) as FileBlame | { error: string };
  if (!response.ok || "error" in payload) throw new Error("error" in payload ? payload.error : `GET ${BLAME_ROUTE} failed (${response.status})`);
  return payload;
}

export type BlameState = { status: "loading" } | { status: "ready"; blame: FileBlame } | { status: "error"; error: string };

/**
 * Blames `path` as saved, and again whenever `saved` (the file's saved text)
 * changes; null while there are unsaved edits, since blame then describes
 * other text.
 */
export function useBlame(path: string | null, saved: string | null): BlameState | null {
  const [state, setState] = useState<{ key: string; state: BlameState } | null>(null);
  const key = path !== null && saved !== null ? `${path}\0${saved}` : null;
  useEffect(() => {
    if (!key || !path) return;
    let current = true;
    setState({ key, state: { status: "loading" } });
    fetchBlame(path).then(
      (blame) => current && setState({ key, state: { status: "ready", blame } }),
      (error: unknown) => current && setState({ key, state: { status: "error", error: error instanceof Error ? error.message : String(error) } }),
    );
    return () => {
      current = false;
    };
    // `key` carries `saved`, so a save re-blames without holding the whole text in the deps twice.
  }, [key, path]);
  return state?.key === key ? state.state : null;
}
