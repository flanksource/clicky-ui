import { useEffect, useState } from "react";
import type { BlameRange } from "@flanksource/clicky-ui/file-findings";
import { documentJson, workspaceURL } from "./api";

type Response = {
  revision: string;
  blame: {
    unavailable?: string;
    lines: Array<{
      line: number;
      commit: {
        sha: string;
        author: { name: string };
        date: string;
        subject: string;
      } | null;
    }>;
  };
};
export function useDocumentBlame(
  root: string | undefined,
  path: string,
  revision: string | undefined,
) {
  const [state, setState] = useState<{
    revision: string;
    ranges: BlameRange[];
    note?: string;
  }>();
  useEffect(() => {
    if (!root || !revision) return;
    let cancelled = false;
    void documentJson<Response>(workspaceURL("blame", root, path))
      .then((response) => {
        if (cancelled) return;
        const ranges = response.blame.lines
          .filter((line) => line.commit)
          .map(
            (line): BlameRange => ({
              startLine: line.line,
              lineCount: 1,
              commit: {
                sha: line.commit!.sha,
                author: line.commit!.author.name,
                date: line.commit!.date,
                summary: line.commit!.subject,
              },
            }),
          );
        setState({
          revision: response.revision,
          ranges,
          ...(response.blame.unavailable
            ? { note: response.blame.unavailable }
            : {}),
        });
      })
      .catch((cause: unknown) => {
        if (!cancelled)
          setState({
            revision,
            ranges: [],
            note: `Blame unavailable: ${String(cause)}`,
          });
      });
    return () => {
      cancelled = true;
    };
  }, [root, path, revision]);
  return state?.revision === revision ? state : undefined;
}
