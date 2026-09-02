import { useCallback, useEffect, useState } from "react";

import { pages } from "../registry";
import { fetchFolders } from "./page-api";
import { foldersFromSlugs } from "./page-management-model";

export type PageFolders = {
  folders: string[];
  error: string | null;
  add: (folder: string) => void;
  remove: (folder: string) => void;
  refresh: () => Promise<void>;
};

export function usePageFolders(): PageFolders {
  const [folders, setFolders] = useState(() => foldersFromSlugs(pages().map(({ slug }) => slug)));
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    if (!import.meta.env.DEV) return;
    try {
      setFolders(await fetchFolders());
      setError(null);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : String(cause));
    }
  }, []);

  useEffect(() => void refresh(), [refresh]);

  const add = useCallback((folder: string) => {
    setFolders((current) => [...new Set([...current, folder])].sort());
  }, []);

  // Deleting a folder takes its subfolders with it, so the list has to drop
  // the whole subtree rather than just the folder that was named.
  const remove = useCallback((folder: string) => {
    setFolders((current) =>
      current.filter(
        (candidate) =>
          candidate !== folder && !candidate.startsWith(`${folder}/`),
      ),
    );
  }, []);

  return { folders, error, add, remove, refresh };
}
