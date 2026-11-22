import { useEffect, useState } from "react";
import { appendTailRows } from "../../hooks/tail-buffer";
import { orderTraceFeed, traceFeedKey, type TraceFeedFollowOptions, type TraceFeedPage, type TraceFeedRequest, type TraceFeedSource } from "./trace-feed";

const emptyPage: TraceFeedPage = { rows: [], nextCursor: "" };

interface TraceFeedSnapshot {
  page: TraceFeedPage;
  request: TraceFeedRequest;
  revision: number;
  loadPage: TraceFeedSource["loadPage"];
}

function subscribeTraceFeed(follow: NonNullable<TraceFeedSource["follow"]>, options: TraceFeedFollowOptions): () => void {
  let closed = false;
  const unsubscribe = follow({
    kind: options.kind,
    resume: options.resume,
    onRecord: record => { if (!closed) options.onRecord(record); },
    onError: error => { if (!closed) options.onError(error); },
    onOpen: () => { if (!closed) options.onOpen(); },
    onEnd: () => { if (!closed) options.onEnd(); },
  });
  return () => {
    closed = true;
    unsubscribe();
  };
}

export function useTraceFeed(request: TraceFeedRequest, { loadPage, follow }: TraceFeedSource) {
  const [snapshot, setSnapshot] = useState<TraceFeedSnapshot>();
  const [error, setError] = useState<Error>();
  const [paused, setPaused] = useState(false);
  const [ended, setEnded] = useState(false);
  const [revision, setRevision] = useState(0);

  useEffect(() => {
    const controller = new AbortController();
    setError(undefined);
    loadPage(request, controller.signal).then(page => {
      if (!controller.signal.aborted) setSnapshot({ page, request, revision, loadPage });
    }).catch((failure: unknown) => {
      if (!controller.signal.aborted) setError(failure instanceof Error ? failure : new Error(String(failure)));
    });
    return () => controller.abort();
  }, [request, loadPage, revision]);

  const seeded = snapshot?.request === request && snapshot.revision === revision && snapshot.loadPage === loadPage;
  const activeFollow = seeded && !paused && !request.cursor && !ended ? follow : undefined;
  const resume = snapshot?.page.resume;
  useEffect(() => {
    if (!activeFollow) return;
    if (typeof resume !== "string" || resume.length === 0) {
      setError(new Error("Trace feed page is missing a resume token"));
      return;
    }
    return subscribeTraceFeed(activeFollow, {
      kind: request.kind,
      resume,
      onRecord: record => setSnapshot(previous => previous && ({
        ...previous,
        page: { ...previous.page, rows: appendTailRows(previous.page.rows, [record], {
          limit: 100, key: traceFeedKey, order: rows => orderTraceFeed(rows, request.sort),
        }).rows },
      })),
      onError: setError,
      onOpen: () => setError(undefined),
      onEnd: () => setEnded(true),
    });
  }, [activeFollow, request, resume]);

  return {
    page: snapshot?.page ?? emptyPage,
    error, paused, ended,
    togglePaused: () => setPaused(value => !value),
    resetEnded: () => setEnded(false),
    refresh: () => setRevision(value => value + 1),
  };
}
