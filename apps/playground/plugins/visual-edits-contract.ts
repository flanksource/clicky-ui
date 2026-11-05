/** Wire types of `POST /__playground/visual-edits`, shared by the server and the browser client. Dependency-free. */
export const VISUAL_EDITS_ROUTE = "/__playground/visual-edits";

export type VisualEditStyleProp = "variant" | "role";

export type VisualEdit =
  | { kind: "style"; prop: VisualEditStyleProp; value: string }
  | { kind: "text"; prop: string; from: string; to: string };

export type VisualEditRequest = {
  /** Page slug of the page being viewed. */
  page: string;
  /** The `data-editable-source` marker of the call site. */
  source: string;
  edit: VisualEdit;
  /** A candidate id from a previous `ambiguous` response. */
  choose?: string;
};

export type VisualEditCandidate = {
  id: string;
  /** Relative to `src/pages`. */
  file: string;
  line: number;
  column: number;
  context: string;
};

export type VisualEditResponse =
  | {
      status: "applied";
      /** Relative to `src/pages`. */
      file: string;
      /** Relative to the workspace root. */
      path: string;
      line: number;
      hash: string;
    }
  | { status: "stale"; error: string; file: string }
  | { status: "refused"; error: string; reason: string; file: string; line: number; column: number }
  | { status: "ambiguous"; error: string; candidates: VisualEditCandidate[] }
  | { status: "invalid"; error: string };
