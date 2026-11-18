import { useCallback, useEffect, useState } from "react";
import {
  violationIgnoreActions,
  type LintAction,
  type LinterResult,
} from "@flanksource/clicky-ui";
import type { FileFinding } from "@flanksource/clicky-ui/file-findings";
import { documentError, documentJson, GAVEL_ROUTE, jsonBody } from "./api";
import { refreshDocumentProblems } from "./problems";

export function useLintFindings({
  root,
  results,
}: {
  root: string | undefined;
  results: LinterResult[];
}) {
  const [preparationId, setPreparationId] = useState<string>();
  const [filtered, setFiltered] = useState<{
    input: LinterResult[];
    results: LinterResult[];
  }>();
  const [error, setError] = useState<Error>();
  const [status, setStatus] = useState<string>();
  const [busy, setBusy] = useState(false);
  const [version, setVersion] = useState(0);
  useEffect(() => {
    let cancelled = false;
    setPreparationId(undefined);
    if (root)
      documentJson<{ preparationId: string }>(
        `${GAVEL_ROUTE}/api/launch/prepare`,
        jsonBody("POST", { workspace: { cwd: root } }),
      ).then(
        (next) => {
          if (!cancelled) setPreparationId(next.preparationId);
        },
        (cause: unknown) => {
          if (!cancelled) setError(documentError(cause));
        },
      );
    return () => {
      cancelled = true;
    };
  }, [root]);
  useEffect(() => {
    let cancelled = false;
    if (preparationId && results.length) {
      documentJson<LinterResult[]>(
        `${GAVEL_ROUTE}/api/launch/lint/filter`,
        jsonBody("POST", { preparationId, results }),
      ).then(
        (next) => {
          if (!cancelled) {
            setFiltered({ input: results, results: next });
            setError(undefined);
          }
        },
        (cause: unknown) => {
          if (!cancelled) setError(documentError(cause));
        },
      );
    }
    return () => {
      cancelled = true;
    };
  }, [preparationId, results, version]);
  const ignore = useCallback(
    async (action: LintAction) => {
      if (!preparationId || busy) return;
      setBusy(true);
      setError(undefined);
      setStatus(undefined);
      try {
        const { work_dir: _workDir, ...rule } = action.req;
        await documentJson(
          `${GAVEL_ROUTE}/api/launch/lint/ignore`,
          jsonBody("POST", { preparationId, ...rule }),
        );
        await refreshDocumentProblems();
        setVersion((current) => current + 1);
        setStatus("Ignore rule saved to .gavel.yaml");
      } catch (cause) {
        setError(documentError(cause));
      } finally {
        setBusy(false);
      }
    },
    [preparationId, busy],
  );
  const getFindingActions = useCallback(
    (finding: FileFinding) => {
      if (!root || finding.kind !== "lint") return [];
      const file = finding.file.startsWith(`${root}/`)
        ? finding.file.slice(root.length + 1)
        : finding.file;
      return violationIgnoreActions({
        violation: {
          line: finding.line,
          ...(finding.rule ? { rule: { method: finding.rule } } : {}),
        },
        linter: finding.source,
        file,
        workDir: root,
      }).map((action) => ({
        label: action.label,
        title: action.title,
        disabled: busy || !preparationId,
        onSelect: () => void ignore(action),
      }));
    },
    [root, busy, preparationId, ignore],
  );
  return {
    results: filtered?.input === results ? filtered.results : [],
    getFindingActions,
    ignore,
    busy: busy || !preparationId,
    error,
    status,
  };
}
