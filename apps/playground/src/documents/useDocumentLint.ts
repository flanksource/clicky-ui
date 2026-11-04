import { useCallback, useEffect, useRef, useState } from "react";
import type { LinterResult } from "@flanksource/clicky-ui";
import { documentJson, GAVEL_ROUTE, jsonBody } from "./api";
import { refreshDocumentProblems } from "./problems";

type Run = {
  metadata: { executionId: string; labels: Record<string, string> };
  status: { state: string; running: boolean };
  lint?: LinterResult[];
  error?: string;
};
const admissions = new Map<string, Promise<Run>>();
export function useDocumentLint({
  id,
  root,
  path,
  revision,
}: {
  id: string;
  root: string | undefined;
  path: string;
  revision: string | undefined;
}) {
  const [run, setRun] = useState<Run>();
  const [error, setError] = useState<string | null>(null);
  const [starting, setStarting] = useState(false);
  const stream = useRef<EventSource | undefined>(undefined);
  const scope = useRef("");
  scope.current = `${id}\0${revision}`;
  const watch = useCallback((next: Run) => {
    stream.current?.close();
    setRun(next);
    if (!next.status.running) { void refreshDocumentProblems(); return; }
    const events = new EventSource(
      `${GAVEL_ROUTE}/api/runs/${next.metadata.executionId}/stream`,
    );
    stream.current = events;
    events.onmessage = (event: MessageEvent<string>) => {
      const updated = JSON.parse(event.data) as Run;
      setRun(updated);
      if (!updated.status.running) { events.close(); void refreshDocumentProblems(); }
    };
    events.addEventListener("done", () => events.close());
    events.onerror = () => {
      events.close();
      setError(
        "Lint event stream disconnected. Reopen the document to recover the execution.",
      );
    };
  }, []);
  const launch = useCallback(
    async (reuse: boolean) => {
      if (!root || !revision) return;
      setStarting(true);
      setError(null);
      const key = `${id}\0${revision}`;
      const admit = async () => {
        if (reuse) {
          const existing = await documentJson<{ runs: Run[] }>(
            `${GAVEL_ROUTE}/api/runs?${new URLSearchParams({ "label.page": id, "label.sourceRevision": revision, "label.documentLint": "plain" })}`,
          );
          if (existing.runs[0]) return existing.runs[0];
        }
        const { executionId } = await documentJson<{ executionId: string }>(
          `${GAVEL_ROUTE}/api/launch/lint`,
          {
            ...jsonBody("POST", {
              workspace: { cwd: root },
              config: {
                lint: {
                  files: [path],
                  linters: [
                    {
                      id: "markdown",
                      linter: "markdownlint",
                      options: { fix: false },
                    },
                    { id: "prose", linter: "vale", options: { fix: false } },
                  ],
                },
              },
              labels: {
                page: id,
                sourceRevision: revision,
                documentLint: "plain",
              },
            }),
            headers: {
              "Content-Type": "application/json",
              "Idempotency-Key": crypto.randomUUID(),
            },
          },
        );
        return documentJson<Run>(`${GAVEL_ROUTE}/api/runs/${executionId}`);
      };
      try {
        let pending = reuse ? admissions.get(key) : undefined;
        if (!pending) {
          pending = admit();
          if (reuse) admissions.set(key, pending);
        }
        const next = await pending;
        if (scope.current === key) watch(next);
      } catch (cause) {
        setError(cause instanceof Error ? cause.message : String(cause));
      } finally {
        admissions.delete(key);
        setStarting(false);
      }
    },
    [id, root, path, revision, watch],
  );
  useEffect(() => {
    scope.current = `${id}\0${revision}`;
    void launch(true);
    return () => {
      scope.current = "";
      stream.current?.close();
    };
  }, [launch, id, revision]);
  const failedLinter = run?.lint?.find((result) => result.error);
  return {
    run,
    starting,
    error:
      error ??
      run?.error ??
      (failedLinter ? `${failedLinter.linter}: ${failedLinter.error}` : null),
    results: run?.lint ?? [],
    stale: Boolean(run && run.metadata.labels["sourceRevision"] !== revision),
    relint: () => launch(false),
    stop: async () => {
      if (run) {
        try {
          await documentJson(
            `${GAVEL_ROUTE}/api/runs/${run.metadata.executionId}/stop`,
            { method: "POST" },
          );
        } catch (cause) {
          setError(String(cause));
        }
      }
    },
  };
}
