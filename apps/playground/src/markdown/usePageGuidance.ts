import { useCallback, useEffect, useState } from "react";

import { writeClipboard } from "../comments/clipboard";
import type { PageEntry } from "../registry";
import { guidanceToMarkdown } from "./guidance";

export function usePageGuidance(active: PageEntry | undefined, title: string) {
  const [markdown, setMarkdown] = useState<string | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [copyError, setCopyError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    let current = true;
    setMarkdown(null);
    setLoadError(null);
    if (!active) return () => {
      current = false;
    };
    void active.loadGuidance().then(
      (guidance) => {
        if (current) setMarkdown(guidanceToMarkdown(title, guidance));
      },
      (cause: unknown) => {
        if (current) setLoadError(cause instanceof Error ? cause.message : String(cause));
      },
    );
    return () => {
      current = false;
    };
  }, [active, title]);

  const copyPage = useCallback(async () => {
    if (markdown === null) return;
    try {
      await writeClipboard(Promise.resolve(markdown));
      setCopyError(null);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1500);
    } catch (cause) {
      setCopyError(cause instanceof Error ? cause.message : String(cause));
    }
  }, [markdown]);

  return { markdown, loadError, copyError, copied, copyPage };
}
