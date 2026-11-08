import { useCallback, useRef, useState } from "react";
import { parseEditableSource } from "../../plugins/editable-source-marker";
import type { VisualEdit, VisualEditCandidate, VisualEditResponse } from "../../plugins/visual-edits-contract";
import { overrideCallSite } from "./react-override";
import { postVisualEdit } from "./visual-edits-api";

type AttributeEdit = Extract<VisualEdit, { kind: "attributes" }>;
type DeleteEdit = Extract<VisualEdit, { kind: "delete" }>;

/** The value an attribute had before an edit; `null` when the element did not carry it. */
export type AttributeSnapshot = Record<string, unknown>;

export type VisualEditCommit = {
  markerValue: string;
  /** Every DOM instance whose preview should change with the source. */
  nodes: Element[];
} & (
  | {
      edit: Exclude<VisualEdit, AttributeEdit | DeleteEdit>;
      /** The value the preview shows now, restored when the write fails. */
      previous: string;
    }
  | {
      edit: AttributeEdit;
      /** Every attribute of `edit.values` as it was, restored when the write fails. */
      previous: AttributeSnapshot;
    }
  | { edit: DeleteEdit; previous?: never }
);

export type VisualEditRefusal = Extract<VisualEditResponse, { status: "refused" }>;

export type VisualEditFailure = {
  title: string;
  error: Error;
  /** Where to open the source, when the server named a location. */
  location: { file: string; line: number } | null;
  /** The server's refusal, when the edit was refused rather than failed. */
  refusal: VisualEditRefusal | null;
};

export type SavedVisualEdit = { edit: VisualEdit; file: string; path: string; line: number; hash: string };

/** How a commit ended; the failure itself is in `failure`, the candidates in `candidates`. */
export type VisualEditOutcome = "applied" | "failed" | "ambiguous";

type Status = "idle" | "saving" | "ambiguous";

/** A missing attribute is previewed (and restored) as `undefined`, which removes the prop. */
function previewProps({ edit }: VisualEditCommit): Record<string, unknown> {
  switch (edit.kind) {
    case "style":
      return { [edit.prop]: edit.value };
    case "text":
      return { [edit.prop]: edit.to };
    case "attributes":
      return Object.fromEntries(Object.entries(edit.values).map(([name, value]) => [name, value ?? undefined]));
    case "delete":
      throw new Error("Deletion is applied to source before reloading the page");
  }
}

function revertProps(commit: VisualEditCommit): Record<string, unknown> {
  const { edit, previous } = commit;
  if (edit.kind === "delete") throw new Error("Deletion has no attribute preview to revert");
  if (typeof previous === "string") {
    return { [edit.prop]: previous };
  }
  if (previous === undefined) throw new Error("An attribute edit requires its previous values");
  return Object.fromEntries(Object.keys(edit.values).map((name) => [name, previous[name] ?? undefined]));
}

/** Sets each prop on the call site of `nodes`; with `undefined` a prop is removed. Returns the failure, if any. */
function overrideProps(nodes: Element[], markerValue: string, props: Record<string, unknown>): Error | null {
  try {
    overrideCallSite(nodes, markerValue, props);
    return null;
  } catch (error) {
    return error as Error;
  }
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
    if (!live || !current || current.edit.kind === "delete") return null;
    return overrideProps(current.nodes, current.markerValue, revertProps(current));
  }, [live]);

  const fail = useCallback((title: string, error: Error, location: VisualEditFailure["location"], refusal: VisualEditRefusal | null = null) => {
    const revertError = abandon();
    setFailure({
      title,
      error: revertError ? new Error(`${error.message}; reverting the preview also failed: ${revertError.message}`) : error,
      location,
      refusal,
    });
  }, [abandon]);

  const send = useCallback(async (current: VisualEditCommit, choose?: string): Promise<VisualEditOutcome> => {
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
      return "failed";
    }
    switch (response.status) {
      case "applied":
        attempt.current = null;
        setStatus("idle");
        setCandidates([]);
        setLastSaved({ edit: current.edit, file: response.file, path: response.path, line: response.line, hash: response.hash });
        return "applied";
      case "ambiguous":
        setCandidates(response.candidates);
        setStatus("ambiguous");
        return "ambiguous";
      case "stale": {
        const { line } = parseEditableSource(current.markerValue);
        fail("Source changed", new Error(response.error), { file: response.file, line });
        return "failed";
      }
      case "refused":
        fail("Edit refused", new Error(`${response.error} (${response.reason})`), { file: response.file, line: response.line }, response);
        return "failed";
      case "invalid":
        fail("Invalid edit", new Error(response.error), null);
        return "failed";
    }
  }, [fail, page]);

  const commit = useCallback(async (next: VisualEditCommit): Promise<VisualEditOutcome> => {
    if (attempt.current) throw new Error("a visual edit is already in flight");
    attempt.current = next;
    if (live && next.edit.kind !== "delete") {
      const previewError = overrideProps(next.nodes, next.markerValue, previewProps(next));
      if (previewError) {
        fail("Live preview failed", previewError, null);
        return "failed";
      }
    }
    return send(next);
  }, [fail, live, send]);

  const choose = useCallback(async (candidateId: string) => {
    if (!attempt.current || status !== "ambiguous") throw new Error("no ambiguous visual edit is awaiting a choice");
    return send(attempt.current, candidateId);
  }, [send, status]);

  const cancelAmbiguous = useCallback(() => {
    if (!attempt.current || status !== "ambiguous") throw new Error("no ambiguous visual edit is awaiting a choice");
    const revertError = abandon();
    if (revertError) setFailure({ title: "Revert failed", error: revertError, location: null, refusal: null });
  }, [abandon, status]);

  /** Previews attribute values (`null` removes one) without writing anything; the caller restores them with `previewAttributes`. */
  const previewAttributes = useCallback((nodes: Element[], markerValue: string, values: Record<string, unknown>): Error | null => {
    if (!live) return new Error("live preview is not available");
    return overrideProps(nodes, markerValue, Object.fromEntries(Object.entries(values).map(([name, value]) => [name, value ?? undefined])));
  }, [live]);

  return {
    commit,
    choose,
    cancelAmbiguous,
    previewAttributes,
    dismissFailure: useCallback(() => setFailure(null), []),
    pending: status !== "idle",
    saving: status === "saving",
    candidates,
    failure,
    lastSaved,
  };
}
