import { useCallback, useEffect, useRef, useState } from "react";
import type { LinterResult } from "@flanksource/clicky-ui";
import { documentError, documentJson, GAVEL_ROUTE, jsonBody } from "./api";
import { refreshDocumentProblems } from "./problems";
import type { FolderLintScope } from "./types";

type Run = {
  metadata: { executionId: string; labels: Record<string, string> };
  status: { state: string; running: boolean };
  lint?: LinterResult[];
  error?: string;
};
const admissions = new Map<string, Promise<Run | undefined>>();
export function useDocumentLint({
  id,
  root,
  path,
  revision,
  prepare,
}: {
  id: string;
  root: string | undefined;
  path: string;
  revision: string | undefined;
  prepare?: () => Promise<FolderLintScope>;
}) {
  const [run, setRun] = useState<Run>();
  const [error, setError] = useState<Error | string | null>(null);
  const [starting, setStarting] = useState(false);
  const stream = useRef<EventSource | undefined>(undefined);
  const scope = useRef("");
  scope.current = `${id}\0${revision}`;
  const watch = useCallback((next: Run) => {
    stream.current?.close();
    setRun(next);
    if (!next.status.running) {
      void refreshDocumentProblems();
      return;
    }
    const events = new EventSource(
      `${GAVEL_ROUTE}/api/runs/${next.metadata.executionId}/stream`,
    );
    stream.current = events;
    events.onmessage = (event: MessageEvent<string>) => {
      const updated = JSON.parse(event.data) as Run;
      setRun(updated);
      if (!updated.status.running) {
        events.close();
        void refreshDocumentProblems();
      }
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
    async ({
      reuse,
      linters = [],
      expectedScope,
    }: {
      reuse: boolean;
      linters?: string[];
      expectedScope?: FolderLintScope;
    }) => {
      if (!root || (!revision && !prepare)) return;
      setStarting(true);
      setError(null);
      const key = `${id}\0${revision}`;
      const admit = async () => {
        if (reuse) {
          const existing = await documentJson<{ runs: Run[] }>(
            `${GAVEL_ROUTE}/api/runs?${new URLSearchParams({ "label.page": id, ...(revision ? { "label.sourceRevision": revision } : {}), "label.documentLint": "plain" })}`,
          );
          return existing.runs[0];
        }
        if (!linters.length) throw new Error("Choose at least one linter");
        const prepared = await prepare?.();
        if (expectedScope && expectedScope.revision !== prepared?.revision)
          throw new Error(
            "Folder contents changed; reopen the lint dialog before running",
          );
        const currentRevision = prepared?.revision ?? revision;
        if (!currentRevision)
          throw new Error("Lint requires a source revision");
        const { executionId } = await documentJson<{ executionId: string }>(
          `${GAVEL_ROUTE}/api/launch/lint`,
          {
            ...jsonBody("POST", {
              workspace: { cwd: root },
              config: {
                lint: {
                  files: prepared?.files ?? [path],
                  linters: linters.map((linter) => ({
                    id: linter,
                    linter,
                    options: { fix: false },
                  })),
                },
              },
              labels: {
                page: id,
                sourceRevision: currentRevision,
                ...(prepared ? { files: JSON.stringify(prepared.files) } : {}),
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
        if (next && scope.current === key) watch(next);
      } catch (cause) {
        setError(documentError(cause));
        if (!reuse) throw cause;
      } finally {
        admissions.delete(key);
        setStarting(false);
      }
    },
    [id, root, path, revision, prepare, watch],
  );
  useEffect(() => {
    scope.current = `${id}\0${revision}`;
    void launch({ reuse: true });
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
    stale: Boolean(
      revision && run && run.metadata.labels["sourceRevision"] !== revision,
    ),
    relint: (linters: string[], expectedScope?: FolderLintScope) =>
      launch({
        reuse: false,
        linters,
        ...(expectedScope ? { expectedScope } : {}),
      }),
    stop: async () => {
      if (run) {
        try {
          await documentJson(
            `${GAVEL_ROUTE}/api/runs/${run.metadata.executionId}/stop`,
            { method: "POST" },
          );
        } catch (cause) {
          setError(documentError(cause));
        }
      }
    },
  };
}
