import { useCallback, useRef, useState } from "react";
import { parseEditableSource } from "../../plugins/editable-source-marker";
import type { VisualEdit, VisualEditCandidate, VisualEditResponse } from "../../plugins/visual-edits-contract";
import { overrideCallSite } from "./react-override";
import { postVisualEdit } from "./visual-edits-api";

export type VisualEditCommit = {
  markerValue: string;
  /** Every DOM instance whose preview should change with the source. */
  nodes: Element[];
  edit: VisualEdit;
  /** The value the preview shows now, restored when the write fails. */
  previous: string;
};

export type VisualEditFailure = {
  title: string;
  error: Error;
  /** Where to open the source, when the server named a location. */
  location: { file: string; line: number } | null;
};

export type SavedVisualEdit = { edit: VisualEdit; file: string; path: string; line: number; hash: string };

type Status = "idle" | "saving" | "ambiguous";

function overrideValue({ edit }: VisualEditCommit): { prop: string; value: string } {
  return edit.kind === "style" ? { prop: edit.prop, value: edit.value } : { prop: edit.prop, value: edit.to };
}

/** One in-flight visual edit at a time; with `live`, the preview changes before the write and reverts if it fails. */
export function useVisualEdits({ page, live }: { page: string; live: boolean }) {
  const [status, setStatus] = useState<Status>("idle");
  const [candidates, setCandidates] = useState<VisualEditCandidate[]>([]);
  const [failure, setFailure] = useState<VisualEditFailure | null>(null);
  const [lastSaved, setLastSaved] = useState<SavedVisualEdit | null>(null);
  const attempt = useRef<VisualEditCommit | null>(null);

  /** Drops the attempt and restores the preview; returns the revert error, if any. */
  const abandon = useCallback((): Error | null => {
    const current = attempt.current;
    attempt.current = null;
    setStatus("idle");
    setCandidates([]);
    if (!live || !current) return null;
    try {
      overrideCallSite(current.nodes, current.markerValue, overrideValue(current).prop, current.previous);
      return null;
    } catch (error) {
      return error as Error;
    }
  }, [live]);

  const fail = useCallback((title: string, error: Error, location: VisualEditFailure["location"]) => {
    const revertError = abandon();
    setFailure({
      title,
      error: revertError ? new Error(`${error.message}; reverting the preview also failed: ${revertError.message}`) : error,
      location,
    });
  }, [abandon]);

  const send = useCallback(async (current: VisualEditCommit, choose?: string) => {
    setStatus("saving");
    setFailure(null);
    let response: VisualEditResponse;
    try {
      response = await postVisualEdit({
        page,
        source: current.markerValue,
        edit: current.edit,
        ...(choose === undefined ? {} : { choose }),
      });
    } catch (error) {
      fail("Edit failed", error as Error, null);
      return;
    }
    switch (response.status) {
      case "applied":
        attempt.current = null;
        setStatus("idle");
        setCandidates([]);
        setLastSaved({ edit: current.edit, file: response.file, path: response.path, line: response.line, hash: response.hash });
        return;
      case "ambiguous":
        setCandidates(response.candidates);
        setStatus("ambiguous");
        return;
      case "stale": {
        const { line } = parseEditableSource(current.markerValue);
        fail("Source changed", new Error(response.error), { file: response.file, line });
        return;
      }
      case "refused":
        fail("Edit refused", new Error(`${response.error} (${response.reason})`), { file: response.file, line: response.line });
        return;
      case "invalid":
        fail("Invalid edit", new Error(response.error), null);
        return;
    }
  }, [fail, page]);

  const commit = useCallback(async (next: VisualEditCommit) => {
    if (attempt.current) throw new Error("a visual edit is already in flight");
    attempt.current = next;
    if (live) {
      try {
        const { prop, value } = overrideValue(next);
        overrideCallSite(next.nodes, next.markerValue, prop, value);
      } catch (error) {
        fail("Live preview failed", error as Error, null);
        return;
      }
    }
    await send(next);
  }, [fail, live, send]);

  const choose = useCallback(async (candidateId: string) => {
    if (!attempt.current || status !== "ambiguous") throw new Error("no ambiguous visual edit is awaiting a choice");
    await send(attempt.current, candidateId);
  }, [send, status]);

  const cancelAmbiguous = useCallback(() => {
    if (!attempt.current || status !== "ambiguous") throw new Error("no ambiguous visual edit is awaiting a choice");
    const revertError = abandon();
    if (revertError) setFailure({ title: "Revert failed", error: revertError, location: null });
  }, [abandon, status]);

  return {
    commit,
    choose,
    cancelAmbiguous,
    dismissFailure: useCallback(() => setFailure(null), []),
    pending: status !== "idle",
    saving: status === "saving",
    candidates,
    failure,
    lastSaved,
  };
}
