import { useEffect, useRef, useState } from "react";
import { useEventSourceFactory } from "./event-source";
import { subscribeJSON } from "./event-stream";

interface LiveSnapshot<T> {
  url: string;
  data?: T;
  error?: Error | undefined;
  ended?: boolean;
}

/** The latest snapshot for a URL. A suspended subscription retains its last frame. */
export function useLiveSnapshot<T, Change = T>(url: string | null, merge?: (previous: T | undefined, change: Change) => T) {
  const factory = useEventSourceFactory();
  const [snapshot, setSnapshot] = useState<LiveSnapshot<T>>({ url: "" });
  const [attempt, setAttempt] = useState(0);
  const latest = useRef<Pick<LiveSnapshot<T>, "url" | "data">>({ url: "" });
  const mergeRef = useRef(merge);

  useEffect(() => {
    mergeRef.current = merge;
  }, [merge]);

  useEffect(() => {
    if (!url) return;
    const update = (value: Partial<LiveSnapshot<T>>) => setSnapshot(previous => ({ ...(previous.url === url ? previous : { url }), ...value }));
    return subscribeJSON<Change>(factory, url, {
      onOpen: () => update({ error: undefined, ended: false }),
      onData: change => {
        const previous = latest.current.url === url ? latest.current.data : undefined;
        const data = mergeRef.current ? mergeRef.current(previous, change) : change as unknown as T;
        latest.current = { url, data };
        setSnapshot(latest.current);
      },
      onError: (error, terminal) => update({ error, ended: terminal }),
      onEnd: () => update({ error: undefined, ended: true }),
    });
  }, [factory, url, attempt]);

  const value = url === null || snapshot.url === url ? snapshot : undefined;
  return { data: value?.data, error: value?.error, ended: value?.ended ?? false, pending: !!url && value?.data === undefined && !value?.ended, refresh: () => setAttempt(previous => previous + 1) };
}
