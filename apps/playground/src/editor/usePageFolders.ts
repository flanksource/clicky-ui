import { useCallback, useEffect, useState } from "react";

import { PAGES } from "../registry";
import { fetchFolders } from "./page-api";
import { foldersFromSlugs } from "./page-management-model";

export type PageFolders = {
  folders: string[];
  error: string | null;
  add: (folder: string) => void;
  refresh: () => Promise<void>;
};

export function usePageFolders(): PageFolders {
  const [folders, setFolders] = useState(() => foldersFromSlugs(PAGES.map(({ slug }) => slug)));
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

  return { folders, error, add, refresh };
}
